# Nexora PostgreSQL on Neon

Project: `square-grass-63437288` (`nexora`). Branch: `production`,
`br-silent-glade-b9ifi122`. Region: AWS Frankfurt. Existing Free plan.

The dashboard is Python on Render. GitHub Pages remains the public website.
Neon supplies durable PostgreSQL; `neon deploy` does not publish the website or
deploy the Python backend.

1. In Neon, open **Connect to branch**, select the pooled PostgreSQL connection.
2. Enter the connection string only in Render Environment as `DATABASE_URL`.
   Keep the provider's TLS parameters. Never put this value in Git or chat.
3. Save and deploy with `NEXORA_READONLY=1`. Startup creates the three dashboard
   tables idempotently. A failed connection fails startup with a redacted error.
4. After successful startup, set `NEXORA_READONLY=0` and deploy. Only authorized
   Discord administrators can save drafts. Saving a draft does not execute
   Discord changes.
5. Save a test draft, reload it, deploy again and verify the revision survives.
   For isolated concurrent-writer verification, set `NEXORA_TEST_DATABASE_URL`
   in a trusted local process and run `tests.test_dashboard_postgres`. The test
   writes only a random `integration-*` namespace and never deletes records.

Local Neon CLI 8.3.5 is installed in the Codex workspace. Browser CLI consent
is separate from Console sign-in and expires after 60 seconds. `neon.ts` uses
`defineConfig({})`, without enabling Neon Auth, Data API or Functions. The
existing Discord OAuth flow remains in use. CLI project linking/deployment is
pending authentication; no account permissions have been granted by the agent.

Profile artwork: animated GIF and static PNG, two mod colors and gold on a dark
background. A reduced-motion preference selects the static dashboard banner.
Discord's bot activity remains `mastering NEXORA`; bot activities do not support
custom rich-presence images/buttons. The actual dashboard link is in `/status`.
Uploading the artwork to the bot's Discord profile remains unverified.
