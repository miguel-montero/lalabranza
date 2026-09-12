# Deploying La Labranza to HostGator

## One-time setup

1. Locally, from `backend/`, run
   `composer install --no-dev --optimize-autoloader`. This generates
   `backend/vendor/` (it's gitignored and does not exist in a fresh
   clone) — that directory is what gets uploaded to the server in step 3
   of "Every deploy" below.
2. Confirm the HostGator account's PHP version is set to **8.1 or
   higher** (cPanel → MultiPHP Manager, or your host's equivalent)
   *before* anything else. `backend/composer.json` requires `>=8.1`, and
   Composer's platform check will hard-fail if the account is still on an
   older default PHP version.
3. In cPanel, create a MySQL database and user (Databases → MySQL Database
   Wizard). Note the database name, username, and password — cPanel
   prefixes them with your account name (e.g. `youracct_lalabranza`).
4. Via phpMyAdmin (cPanel → phpMyAdmin), paste the contents of
   `backend/migrations/001_schema.sql` into the SQL tab and execute, then
   do the same for `backend/migrations/002_seed.sql`. Edit the seed file's
   placeholder address/phone before executing if real content is ready.
5. Generate a real admin password hash:
   `php -r "echo password_hash('YOUR_REAL_PASSWORD', PASSWORD_DEFAULT);"`
   and update the `admin_users` row with it via phpMyAdmin.
6. Create `backend/config.php` on the server (copy `backend/config.example.php`
   and fill in the real cPanel database host/name/user/password). This
   file is gitignored — it only ever exists on the server, never in the
   repo.

### Credential safety: `config.php` lives inside the web root

Per the layout in "Every deploy" below, `backend/config.php` ends up at
`public_html/config.php` — inside the web root. If PHP handling on the
host is ever misconfigured (wrong handler for `.php`, PHP disabled after
an account change, etc.), this file could be served as plain text and
leak database credentials.

**This is already handled automatically** — `frontend/public/.htaccess`
includes a `<Files "config.php"> Require all denied </Files>` rule
alongside the apex-redirect rule, and (like that redirect) ships with
every deploy via `frontend/out/.htaccess` since Next's static export
copies `public/` verbatim. No manual per-server `.htaccess` edit is
needed, and none should be added directly on the server — anything
hand-edited into `public_html/.htaccess` there would be silently
overwritten the next time `frontend/out/`'s contents are uploaded. If you
need additional server-side rules, add them to `frontend/public/.htaccess`
in the repo instead, so they're version-controlled and survive deploys.

For extra defense in depth beyond the `.htaccess` rule, or on a host where
you don't trust `.htaccess` enforcement, there's a higher-effort option:

- **Move non-`webdb` backend files above the web root.**
  Upload `backend/src/`, `backend/config.php`, and `backend/vendor/` one
  level above `public_html/` (a directory not served over HTTP at all),
  and adjust the `require __DIR__ . '/../vendor/autoload.php'`-style
  paths in each `webdb/*.php` endpoint accordingly. This is the more
  robust fix but requires care, since the existing endpoint code assumes
  the specific relative layout described below — it is documented here as
  a future option, not something this fix wave restructures in the repo.

### Production error display

Set `display_errors = Off` in production (cPanel → "Select PHP Version" →
Options screen, or a `.htaccess`/`php.ini` override) so an uncaught error
never leaks stack traces or internal details to a visitor's browser. The
`webdb/*.php` endpoints already catch unexpected exceptions and respond
with a generic 500, but `display_errors = On` at the PHP level can still
leak details from errors PHP itself raises outside that try/catch (e.g. a
fatal parse error).

## Every deploy

1. Locally: drop real source photos into `frontend/images-src/`, then run
   `cd frontend && npm run build` (this runs `optimize-images` via the
   `prebuild` script automatically, then produces `frontend/out/`).
2. Upload the *contents* of `frontend/out/` to the HostGator account's web
   root (e.g. `public_html/`) via SFTP or cPanel File Manager. This
   includes `frontend/public/.htaccess`, which Next's static export
   copies verbatim into `frontend/out/.htaccess`. It does two things at
   the server level (Apache): 302-redirects the apex `/` to `/en/` (so
   visitors and crawlers get a real redirect instead of only the
   client-side JS-only redirect `frontend/app/page.tsx` produces under
   static export), and denies direct HTTP access to `config.php` (see
   "Credential safety" above). No build config change is needed for
   either; both ship automatically as part of `frontend/out/`.
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

## Pre-launch content checklist

Do not consider the site launched until every item below is checked:

- [ ] `frontend/content/restaurant.ts`'s bracketed placeholders (address,
      phone, map coordinates) have been replaced with real values for both
      locales.
- [ ] Real photos have been dropped into `frontend/images-src/` and the
      `optimize-images` script has actually been run (it runs
      automatically as part of `npm run build`'s `prebuild` step, but
      confirm the output exists in `frontend/public/images/`). Note the
      `.jpg` → `.webp` filename mismatch called out in Task 26's own
      notes: the optimizer outputs `.webp` files, so the `src` paths for
      real photos in `frontend/content/restaurant.ts` need to be updated
      to match the actual `.webp` output filenames — they will not match
      by default if you just swap in new source images under their
      original `.jpg`/`.png` names.
- [ ] The seeded admin password (`changeme123`) has been changed via the
      `password_hash` step above, and the new password has been verified
      to actually work by logging into `/admin/login` on the live site —
      not just assumed from having run the SQL update.
- [ ] `backend/src/Session.php`'s `session_set_cookie_params()` call has
      `'secure' => true` added once the site is actually served over
      HTTPS (it's deliberately left off in the repo since local dev runs
      over plain HTTP, where a `secure` cookie would never be sent at
      all — see the `TODO` comment in that file).
