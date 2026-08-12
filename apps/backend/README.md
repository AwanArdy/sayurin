```txt
npm install
npm run dev
```

> **Sebelum `npm run dev`**: salin `.dev.vars.example` → `.dev.vars` dan isi `JWT_SECRET`
> dengan nilai acak (contoh: `openssl rand -base64 48`). Tanpa `JWT_SECRET`, endpoint
> login & semua route yang dilindungi auth akan gagal.

```txt
npm run deploy
```

Untuk production, set secret wajib sebelum deploy:
```txt
npx wrangler secret put JWT_SECRET
```
Opsional, batasi origin CORS (default: localhost dev):
```txt
npx wrangler secret put CORS_ORIGIN   # mis. https://app.sayurin.com
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
