# Private Link Dashboard

Dark glass-style personal website dashboard built with React + Vite.

## Access Model (No Firebase)

- The app is protected by a username/password screen.
- Credentials are validated on server-side API routes.
- On valid login, user is redirected to the main dashboard.
- On invalid login, it shows: `Authorized personal only.`
- A secure `HttpOnly` cookie session is used after login.

## Required Environment Variables

Create `.env` (or set in Vercel):

```bash
ACCESS_USERNAME=your_username
ACCESS_PASSWORD=your_password
SESSION_SECRET=long_random_secret
```

## Local Run

```bash
npm install
vercel dev
```

## Build

```bash
npm run build
npm run preview
```

## Vercel Deployment

1. Push to GitHub.
2. Import project in [Vercel](https://vercel.com/new).
3. Framework: **Vite**.
4. Add environment variables in Vercel Project Settings:
   - `ACCESS_USERNAME`
   - `ACCESS_PASSWORD`
   - `SESSION_SECRET`
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy.

## Important Security Note

Credentials are not exposed to browser code in this setup, because validation happens server-side.
For extra hardening, you can also enable Vercel deployment/password protection.

## Current App Highlights

- Add links using only **name + URL**
- No tags/categories UI
- Smart thumbnail fit without distortion
- Drag handle for reorder
- Delete/Open working reliably
- Dark glass UI only
