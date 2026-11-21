# CaffnCode Mail // webmail

Webmail client for `email.caffncode.com`.

### Architecture
- **Authentication:** Supabase Auth (SSO across CaffnCode ecosystem)
- **Backend:** Vercel Serverless Functions (`/api/*`)
- **Email Platform:** Lark Suite Open Platform Mail REST API (Multi-tenant, OAuth2 / Tenant Access Token)
- **Aesthetic:** Dark Roast Retro Terminal Espresso (Outfit & Space Mono fonts)

### Environment Variables (configured in Vercel)
- `SUPABASE_URL`: Supabase project endpoint
- `SUPABASE_ANON_KEY`: Supabase anon/public key
- `LARK_APP_ID`: Lark Custom App ID
- `LARK_APP_SECRET`: Lark Custom App Secret

<!-- trigger deploy -->
<!-- redeploy -->
