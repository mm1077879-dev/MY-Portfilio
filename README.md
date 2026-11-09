# Mahim Dev — Full-Stack Developer Portfolio & Dynamic CMS

A production-ready full-stack developer portfolio and Content Management System (CMS) engineered with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

Every public page (`Home`, `About`, `Services`, `Projects`, `Project Case Study`, and `Contact`) is dynamically hydrated from MongoDB and managed through a protected `/admin` CMS dashboard with JWT + HttpOnly cookie authentication, Zod schema validation, role-protected REST APIs, inquiry management, and analytics tracking.

---

## 1. Architecture Overview

```text
├── public/                       # Static favicon & public uploads fallback
├── server/
│   └── src/
│       ├── app.ts                # Express app factory, security headers, API v1 & SPA mount
│       ├── config/
│       │   ├── database.ts       # Persistent MongoDB Atlas connection
│       │   └── env.ts            # Typed environment configuration & status flags
│       ├── controllers/          # Modular REST controllers (Auth, Projects, Services, About, CMS, Messages, Analytics, Upload)
│       ├── middleware/           # JWT/Cookie auth guard, Helmet, CORS, Rate Limiters, Multer upload, Central Error Handler
│       ├── models/               # Mongoose schemas with indexes, including persistent Admin Notifications
│       ├── routes/
│       │   └── v1.ts             # Versioned /api/v1/* REST router
│       ├── scripts/
│       │   ├── createAdmin.ts    # CLI utility to provision or update Admin credentials
│       │   └── seed.ts           # Deterministic MongoDB seed script
│       ├── services/
│       │   ├── emailService.ts   # Optional Nodemailer SMTP notification & reply service
│   ├── notificationService.ts # Persistent admin events and authenticated SSE fanout
│       │   └── seedService.ts    # Idempotent portfolio content seeder
│       ├── utils/                # AppError & XSS/input sanitization helpers
│       └── validations/          # Server-side Zod schemas & unit tests
├── src/
│   ├── assets/images/            # High-resolution local portfolio & project showcase assets
│   ├── components/common/        # Shared UI, including the admin notification center
│   ├── context/                  # AuthContext, SiteContext (dynamic CMS + SEO sync), ToastContext
│   ├── layouts/                  # PublicLayout (glassmorphic navbar/footer) & AdminLayout (collapsible CMS sidebar)
│   ├── pages/
│   │   ├── Home/                 # Hero, Featured Projects, Solutions Showcase, Why Work With Me, Stats + Testimonial, Contact CTA
│   │   ├── About/                # Bio, Story, Capabilities, Categorized Skills, Career Timeline
│   │   ├── Services/             # Service Grid, Detail Modal, 4-Step Workflow, Pricing Packages, FAQ Accordion
│   │   ├── Projects/             # Search + Category Filter Grid & Slug-based Case Study Detail Page
│   │   ├── Contact/              # Validated Inquiry Form, Direct Channels, Socials, Availability Card
│   │   └── admin/                # Login, Overview, Notifications, Messages, CMS collections, settings, Analytics, Admin Profile
│   ├── services/api.ts           # Axios client with credentials & Bearer token fallback
│   ├── types/portfolio.ts        # Shared TypeScript interfaces
│   ├── utils/                    # Pure filtering/sorting/validation logic & unit tests
│   └── validations/              # Client-side Zod + React Hook Form schemas
└── server.ts                     # Unified Express + Vite dev middleware / production static server on port 3000
```

---

## 2. Quick Installation & Run Commands

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and configure secrets
cp .env.example .env

# 3. Start full-stack development server (Express API + Vite SPA on http://localhost:3000)
npm run dev
```

### Production Build & Execution

```bash
# Type-check with TypeScript
npm run lint

# Build optimized Vite production frontend into dist/
npm run build

# Start production server on PORT (default 3000)
npm start
```

### Automated Unit & Integration Tests

```bash
npm test
```

---

## 3. Environment Configuration (`.env`)

Copy `.env.example` to `.env` and configure the variables below:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `PORT` | Optional | Server port (defaults to `3000`) |
| `NODE_ENV` | Optional | `development` or `production` |
| `CLIENT_URL` / `ALLOWED_ORIGINS` | Optional | Trusted origin(s) for credentialed CORS requests |
| `MONGODB_URI` | Required | MongoDB Atlas connection string (`mongodb+srv://...mongodb.net/...` or an Atlas replica-set seed-list URI using `mongodb://` and `*.mongodb.net` hosts). Configure it for both local development and production; startup rejects non-Atlas/local URIs and never falls back to another database. |
| `JWT_SECRET` | Production | Strong 32+ character secret used to sign admin JWT tokens |
| `JWT_EXPIRES_IN` | Optional | Token lifetime (default `7d`) |
| `INITIAL_ADMIN_EMAIL` / `ADMIN_EMAIL` | Required to start the server | Initial administrator email; `INITIAL_ADMIN_EMAIL` takes precedence. Legacy `ADMIN_EMAIL` is supported as a fallback. |
| `INITIAL_ADMIN_PASSWORD` / `ADMIN_PASSWORD` | Required to start the server | Initial administrator password; `INITIAL_ADMIN_PASSWORD` takes precedence. Legacy `ADMIN_PASSWORD` is supported as a fallback. |
| `INITIAL_ADMIN_NAME` | Optional | Seeded admin display name (`Mahim Dev`) |
| `ALLOWED_ORIGINS` | Optional | Comma-separated trusted frontend origins when the frontend and API are hosted on different origins. |
| `EMAIL_SERVICE_HOST`, `EMAIL_SERVICE_PORT`, `EMAIL_SERVICE_USER`, `EMAIL_SERVICE_PASSWORD`, `EMAIL_FROM_ADDRESS` (or `SMTP_*` aliases) | Optional | Enables contact-form notifications, newsletter messages, and outbound email replies. Contact notifications are sent to `EMAIL_FROM_ADDRESS`. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Optional | Optional Cloudinary signed upload integration; falls back cleanly to local Multer storage + MongoDB `MediaAsset` persistence |

For Gmail SMTP, use `smtp.gmail.com`, port `587` (STARTTLS), and a Google App Password for `EMAIL_SERVICE_PASSWORD`; a normal Google account password is not supported. `EMAIL_SERVICE_USER` and `EMAIL_FROM_ADDRESS` should be the same Gmail/Google Workspace mailbox, or a sender alias authorized in that account. Configure these values in the server's environment, not the frontend. In production, set them in the hosting platform's server-side environment-variable settings and restart or redeploy the server; a local `.env` file does not configure a hosted deployment. SMTP failures are logged without exposing credentials, while the saved inquiry and its existing admin notification remain available.

---

## 4. MongoDB & MongoDB Atlas Setup

### MongoDB Atlas (Required)
1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with `readWrite` access and allow your server IP under **Network Access**.
3. Set `MONGODB_URI` in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mahim_portfolio?retryWrites=true&w=majority
   ```
   Atlas replica-set seed-list URIs using `mongodb://` are also accepted. URL-encode any reserved characters in the username or password.
4. Seed initial portfolio content:
   ```bash
   npm run seed
   ```

Configure the same secret as `MONGODB_URI` in your production hosting provider's environment settings; `.env.example` does not configure hosted environments. Existing data from an earlier in-memory database is not transferred automatically. Export/import any data that must be retained using a separate, reviewed migration procedure; do not use the seed script's `--reset` option against an existing database.

The API integration tests use an isolated MongoDB Memory Server instance. It is a development dependency for tests only and is not used by application startup.

---

## 5. Admin Account Creation & Management

The server requires both initial-admin credentials at startup. The seed process creates the designated initial administrator once, then synchronizes its email and bcrypt password hash from the backend environment on every restart. The designated account is tracked separately from other administrators; unrelated admin accounts are not modified. Keep the environment credentials in backend deployment settings only, never in Vite/frontend variables.

On the first startup after upgrading, an existing account with the configured initial email is adopted as the designated account. If the initial email was already changed before this upgrade and the existing initial account now has a different email, identify that account and set its MongoDB `isInitialAdmin` field to `true` once; this explicit migration avoids guessing and changing an unrelated administrator.

To provision or rotate an administrator account manually against your configured `MONGODB_URI`:

```bash
npm run create-admin -- --email="admin@yourdomain.com" --password="StrongPassword@2026" --name="Mahim"
```

You can also update your name, avatar, email, and password directly inside `/admin/profile` after signing in.

---

## 6. Versioned REST API Overview (`/api/v1`)

- **System & SEO**: `GET /api/v1/health`, `GET /robots.txt`, `GET /sitemap.xml`
- **Authentication**: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/session`, `GET /api/v1/auth/me`, `PUT /api/v1/auth/me`, `PUT /api/v1/auth/change-password`. Authentication is maintained in an HttpOnly cookie; the JWT is not returned to frontend JavaScript.
- **Projects**: `GET /api/v1/projects`, `PUT /api/v1/projects/reorder`, `GET /api/v1/projects/:id`, `POST /api/v1/projects`, `PUT /api/v1/projects/:id`, `DELETE /api/v1/projects/:id`
- **Services**: `GET /api/v1/services`, `GET /api/v1/services/:id`, `POST /api/v1/services`, `PUT /api/v1/services/:id`, `DELETE /api/v1/services/:id`
- **About & Timeline**: `GET /api/v1/about`, `GET /api/v1/about/cv-download`, `PUT /api/v1/about`, `POST /api/v1/about/timeline`, `PUT /api/v1/about/timeline/:id`, `DELETE /api/v1/about/timeline/:id`
- **CMS Collections**: `/api/v1/skills`, `/api/v1/testimonials`, `/api/v1/pricing`, `/api/v1/faq`, `/api/v1/settings`
- **Contact & Inquiries**: `POST /api/v1/messages` (rate-limited + honeypot protected), `GET /api/v1/messages`, `GET /api/v1/messages/:id`, `PUT /api/v1/messages/:id`, `DELETE /api/v1/messages/:id`
- **Admin Notifications** (admin-authenticated): `GET /api/v1/notifications` (paginated), `GET /api/v1/notifications/unread-count`, `PATCH /api/v1/notifications/:id/read`, `PATCH /api/v1/notifications/read-all`, `DELETE /api/v1/notifications/:id`, and `GET /api/v1/notifications/stream` (Server-Sent Events). Contact inquiries and new newsletter subscriptions create idempotent, persistent notifications; MongoDB remains the source of truth.
- **Analytics & Media**: `POST /api/v1/analytics/track`, `GET /api/v1/analytics/overview`, `GET /api/v1/analytics/visitors`, `GET /api/v1/analytics/pages`, `GET /api/v1/upload`, `POST /api/v1/upload`, `DELETE /api/v1/upload/:id`

The notification stream is delivered in-process over authenticated SSE connections. Notifications persist in MongoDB and are re-fetched after reconnects; deployments with multiple independently running server instances need shared pub/sub (or equivalent routing) for immediate cross-instance SSE delivery.

---

## 7. Troubleshooting

- **Port 3000 already in use**: Stop any existing process bound to port `3000` or change `PORT` in `.env` for standalone deployments.
- **Admin session expires or returns `401`**: Verify `JWT_SECRET` has not changed between restarts and cookies are enabled in your browser.
- **Email reply saves in database without sending an email**: This is expected when `EMAIL_SERVICE_HOST` / `EMAIL_SERVICE_USER` / `EMAIL_SERVICE_PASSWORD` (or `SMTP_*`) are not set in `.env`. Configure SMTP credentials to enable live email delivery alongside database persistence.
