# MUBAREK TECHNOLOGY SOLUTION

Digital presence platform. Create a public mini website, then put the stable URL on an NFC card or QR code.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express, MongoDB, Mongoose
- Media: Cloudinary (server-side only)

The backend serves the API and the website on **one port**.

## Run locally

1. Copy the env file once:

```bash
cp .env.example .env
```

2. Start MongoDB if it is not already running.

3. Install and start everything from the backend:

```bash
cd backend
npm install
npm run dev
```

Open [http://localhost:4000](http://localhost:4000).

That single command starts the API, uploads, and the website.

First-time frontend install (only once):

```bash
cd frontend
npm install
```

## Production

```bash
npm run start
```

This builds the frontend, then serves the full app from the backend port.

## Flow

Sign in → create a profile type → add information → choose a template → publish → create NFC / QR cards that store only `/p/:publicId`.

Public profiles live at `/p/:publicId`.

## Branding

Company identity is stored in MongoDB as `ApplicationBranding` and managed at `/admin/settings/branding`. The official source logo is kept at `frontend/public/branding/mubarek-logo-source.png`.

## Adding a profile type later

Create it in **Profile Types**. Built-in types also live in `shared/profileTypes.ts` for default sections and templates.

## Adding a template later

Add a component under `frontend/src/components/templates/` and register it in `registry.tsx` plus `TEMPLATE_REGISTRY`.


  pull server 
cd /var/www/html/NFC
npm run deploy
pm2 reload ecosystem.config.js --update-env