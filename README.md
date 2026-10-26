# Labella Studio

## Local development

```bash
npm install
npm run dev
```

## Docker

Build and run the production image:

```bash
docker compose up --build
```

Open http://localhost:8080.

The image uses a Node 22 build stage and serves the Vite output with nginx. The SPA fallback in `nginx.conf` keeps direct routes working after refresh.
