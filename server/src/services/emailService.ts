import nodemailer from 'nodemailer';
import { env, getSmtpConfigIssues, isSmtpConfigured } from '../config/env';

export interface EmailSendResult {
  sent: boolean;
  message: string;
}

interface ContactMessageEmailInput {
  messageId: string;
  fullName: string;
  email: string;
  service: string;
  subject: string;
  message: string;
  createdAt: Date;
}

function createSmtpTransporter() {
  return nodemailer.createTransport({
    host: env.EMAIL_SERVICE_HOST,
    port: env.EMAIL_SERVICE_PORT,
    secure: env.EMAIL_SERVICE_PORT === 465,
    requireTLS: env.EMAIL_SERVICE_PORT === 587,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    tls: { minVersion: 'TLSv1.2' },
    auth: {
      user: env.EMAIL_SERVICE_USER,
      pass: env.EMAIL_SERVICE_PASSWORD,
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildContactMessageEmail(
  input: Omit<ContactMessageEmailInput, 'messageId'>
): {
  subject: string;
  text: string;
  html: string;
} {
  const name = escapeHtml(input.fullName);
  const email = escapeHtml(input.email);
  const service = escapeHtml(input.service);
  const subject = escapeHtml(input.subject);
  const message = escapeHtml(input.message);
  const submittedAt = input.createdAt.toISOString();

  return {
    subject: 'New Contact Form Message - Mahim Dev',
    text: [
      'New Contact Form Message - Mahim Dev',
      '',
      'A visitor submitted a message through the website Contact Form.',
      `Name: ${input.fullName}`,
      `Email: ${input.email}`,
      `Service: ${input.service}`,
      `Subject: ${input.subject}`,
      `Submitted at (UTC): ${submittedAt}`,
      '',
      'Message:',
      input.message,
    ].join('\n'),
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New Contact Form Message</title>
  </head>
  <body style="margin:0;padding:24px;background:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <main style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e3e8f0;border-radius:12px;overflow:hidden;">
      <header style="padding:24px;background:#090e2c;color:#ffffff;">
        <p style="margin:0 0 8px;color:#00d9ff;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Mahim Dev</p>
        <h1 style="margin:0;font-size:22px;line-height:1.35;">New Contact Form Message</h1>
      </header>
      <section style="padding:24px;">
        <p style="margin:0 0 20px;line-height:1.6;">A visitor submitted a message through the website Contact Form.</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;">
          <tr><th align="left" style="width:120px;padding:8px 12px 8px 0;color:#526078;vertical-align:top;">Name</th><td style="padding:8px 0;">${name}</td></tr>
          <tr><th align="left" style="padding:8px 12px 8px 0;color:#526078;vertical-align:top;">Email</th><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#1769aa;">${email}</a></td></tr>
          <tr><th align="left" style="padding:8px 12px 8px 0;color:#526078;vertical-align:top;">Service</th><td style="padding:8px 0;">${service}</td></tr>
          <tr><th align="left" style="padding:8px 12px 8px 0;color:#526078;vertical-align:top;">Subject</th><td style="padding:8px 0;">${subject}</td></tr>
          <tr><th align="left" style="padding:8px 12px 8px 0;color:#526078;vertical-align:top;">Submitted (UTC)</th><td style="padding:8px 0;">${submittedAt}</td></tr>
        </table>
        <h2 style="margin:24px 0 8px;font-size:16px;">Message</h2>
        <div style="padding:16px;background:#f3f5f9;border-radius:8px;line-height:1.65;white-space:pre-wrap;overflow-wrap:anywhere;">${message}</div>
      </section>
    </main>
  </body>
</html>`,
  };
}

function logSmtpFailure(messageId: string, error: unknown): void {
  const details =
    typeof error === 'object' && error !== null
      ? (error as { code?: unknown; responseCode?: unknown; command?: unknown })
      : {};
  const code = typeof details.code === 'string' ? details.code : undefined;
  const responseCode =
    typeof details.responseCode === 'number' ? details.responseCode : undefined;
  const command = typeof details.command === 'string' ? details.command : undefined;
  const authenticationFailure =
    code === 'EAUTH' || [530, 534, 535].includes(responseCode || 0);
  const connectionFailure =
    ['ECONNECTION', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ESOCKET', 'ENOTFOUND'].includes(
      code || ''
    );
  const failureType = authenticationFailure
    ? 'authentication failure'
    : connectionFailure
      ? 'connection failure'
      : 'message delivery failure';

  console.error(`[Email] Contact notification ${failureType}.`, {
    messageId,
    code,
    responseCode,
    command,
  });
}

export async function sendContactMessageNotification(
  input: ContactMessageEmailInput
): Promise<void> {
  const configIssues = getSmtpConfigIssues();
  if (configIssues.length > 0) {
    console.error('[Email] Contact notification skipped: SMTP configuration is invalid.', {
      messageId: input.messageId,
      configIssues,
    });
    return;
  }

  try {
    const email = buildContactMessageEmail(input);
    const result = await createSmtpTransporter().sendMail({
      from: `"Mahim Dev" <${env.EMAIL_FROM_ADDRESS}>`,
      to: env.EMAIL_FROM_ADDRESS,
      replyTo: input.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    if (result.rejected.length > 0 || result.accepted.length === 0) {
      console.error('[Email] SMTP did not accept the contact notification recipient.', {
        messageId: input.messageId,
        acceptedRecipientCount: result.accepted.length,
        rejectedRecipientCount: result.rejected.length,
      });
      return;
    }

    console.info('[Email] Contact notification accepted by SMTP.', {
      messageId: input.messageId,
      acceptedRecipientCount: result.accepted.length,
    });
  } catch (error) {
    logSmtpFailure(input.messageId, error);
  }
}

export async function sendAdminReplyEmail(params: {
  to: string;
  subject: string;
  replyBody: string;
  recipientName: string;
}): Promise<EmailSendResult> {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      message:
        'SMTP service is not configured (EMAIL_SERVICE_HOST / USER / PASSWORD missing). Reply was saved in MongoDB inbox without sending an external email.',
    };
  }

  try {
    await createSmtpTransporter().sendMail({
      from: `"Mahim Dev" <${env.EMAIL_FROM_ADDRESS}>`,
      to: params.to,
      subject: params.subject.startsWith('Re:') ? params.subject : `Re: ${params.subject}`,
      text: `Hi ${params.recipientName},\n\n${params.replyBody}\n\nBest regards,\nMahim Dev`,
    });

    return {
      sent: true,
      message: `Email reply delivered to ${params.to} via configured SMTP transport.`,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'SMTP transport error';
    return {
      sent: false,
      message: `Reply saved to database, but SMTP delivery failed: ${reason}`,
    };
  }
}

export async function sendEmailIfConfigured(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<EmailSendResult> {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      message: 'SMTP service is not configured. Email notification was skipped.',
    };
  }

  try {
    await createSmtpTransporter().sendMail({
      from: `"Mahim Dev" <${env.EMAIL_FROM_ADDRESS}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    return {
      sent: true,
      message: `Email delivered to ${params.to}.`,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'SMTP delivery error';
    return {
      sent: false,
      message: `SMTP delivery failed: ${reason}`,
    };
  }
}
