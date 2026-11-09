import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { Admin } from '../models';
import { env } from '../config/env';

function parseCliArgs(argv: string[]) {
  const flags: Record<string, string> = {};
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx).trim();
        const val = arg.slice(eqIdx + 1).trim();
        flags[key] = val;
      } else {
        const key = arg.slice(2).trim();
        const nextVal = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : '';
        flags[key] = nextVal.trim();
      }
    } else {
      positional.push(arg);
    }
  }

  return {
    email: flags.email || positional[0] || env.INITIAL_ADMIN_EMAIL,
    password: flags.password || positional[1] || env.INITIAL_ADMIN_PASSWORD,
    name: flags.name || positional[2] || env.INITIAL_ADMIN_NAME,
    role: (flags.role as 'superadmin' | 'admin' | 'editor') || 'superadmin',
  };
}

async function createOrUpdateAdmin() {
  const { email, password, name, role } = parseCliArgs(process.argv.slice(2));
  const allowedRoles = ['superadmin', 'admin', 'editor'];

  if (
    !email ||
    !email.includes('@') ||
    !password ||
    password.length < 8 ||
    !allowedRoles.includes(role)
  ) {
    console.error(
      'Usage: npm run create-admin -- --email="admin@yourdomain.com" --password="StrongPassword123" --name="Mahim Dev" [--role=superadmin]'
    );
    process.exit(1);
  }

  try {
    await connectDatabase();
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await Admin.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        passwordChangedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`[Admin] Provisioned ${admin.role} account: ${admin.email}`);
  } catch (err) {
    console.error('[Admin] Error creating admin account:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

createOrUpdateAdmin();
