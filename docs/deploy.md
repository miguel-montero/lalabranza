# Deploying La Labranza to HostGator

## One-time setup

1. In cPanel, create a MySQL database and user (Databases → MySQL Database
   Wizard). Note the database name, username, and password — cPanel
   prefixes them with your account name (e.g. `youracct_lalabranza`).
2. Via phpMyAdmin (cPanel → phpMyAdmin), paste the contents of
   `backend/migrations/001_schema.sql` into the SQL tab and execute, then
   do the same for `backend/migrations/002_seed.sql`. Edit the seed file's
   placeholder address/phone before executing if real content is ready.
3. Generate a real admin password hash:
   `php -r "echo password_hash('YOUR_REAL_PASSWORD', PASSWORD_DEFAULT);"`
   and update the `admin_users` row with it via phpMyAdmin.
4. Create `backend/config.php` on the server (copy `backend/config.example.php`
   and fill in the real cPanel database host/name/user/password). This
   file is gitignored — it only ever exists on the server, never in the
   repo.

## Every deploy

1. Locally: drop real source photos into `frontend/images-src/`, then run
   `cd frontend && npm run build` (this runs `optimize-images` via the
   `prebuild` script automatically, then produces `frontend/out/`).
2. Upload the *contents* of `frontend/out/` to the HostGator account's web
   root (e.g. `public_html/`) via SFTP or cPanel File Manager.
3. Upload `backend/webdb/`, `backend/src/`, `backend/vendor/`, and
   `backend/config.php` to `public_html/webdb/`, `public_html/src/`, etc.
   — i.e. preserve the same relative layout so `require __DIR__ .
   '/../vendor/autoload.php'` in each endpoint still resolves correctly.
   Do **not** upload `backend/config.example.php`, `backend/tests/`, or
   `backend/migrations/` to production — they're development-only.
4. Confirm PHP's session save path is writable on the host (HostGator's
   default shared-hosting PHP config normally handles this without
   changes — only revisit if `admin_login.php` fails to persist a
   session).
5. Smoke-test in a browser: load `/en`, submit a test reservation on
   `/en/reservations`, then log into `/admin/login` and confirm it
   appears in `/admin/reservations`.
