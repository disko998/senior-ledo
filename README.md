# Senior Leado

Astro site with server-side contact form (SMTP). This guide covers local development and deploying on a VPS with **Docker** or **PM2**.

## Project structure

```text
/
├── public/           # Static assets
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   └── api/      # Contact form API
│   └── styles/
├── Dockerfile
├── docker-compose.yml
├── start.sh          # Docker: clean build + start
└── stop.sh           # Docker: stop
```

## Commands (local)

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`     |
| `pnpm build`           | Build production site to `./dist/`               |
| `pnpm preview`         | Preview production build locally                 |

## Environment variables

Copy `.env.example` to `.env` and set your SMTP values (used by the contact form and by both Docker and PM2):

```bash
cp .env.example .env
# Edit .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO
```

---

## Deploying on a VPS

### Option 1: Docker

Runs the app in a container. No Node/pnpm on the server beyond Docker.

1. **On the VPS**, install Docker and Docker Compose.

2. **Clone the repo** and add your env file:
   ```bash
   git clone <your-repo-url> senior-ledo && cd senior-ledo
   cp .env.example .env
   # Edit .env with your SMTP and any other vars
   ```

3. **Build and start** (clean build, then run in background):
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   Or manually:
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

4. **Stop:**
   ```bash
   ./stop.sh
   # or: docker compose down
   ```

5. **Port:** The app listens on **4321**. Put Nginx (or another reverse proxy) in front and proxy to `http://127.0.0.1:4321`; handle HTTPS and the public port (e.g. 80/443) there.

---

### Option 2: PM2

Runs the built Node server under PM2 (process manager, auto-restart, logs). You build on the VPS and run `node ./dist/server/entry.mjs`.

1. **On the VPS**, install Node.js (v18+), pnpm, and PM2:
   ```bash
   npm install -g pnpm pm2
   ```

2. **Clone, install, build, and configure env:**
   ```bash
   git clone <your-repo-url> senior-ledo && cd senior-ledo
   pnpm install
   pnpm build
   cp .env.example .env
   # Edit .env with your SMTP and any other vars
   ```

3. **Start with PM2** (load env from `.env`, listen on 4321):
   ```bash
   HOST=0.0.0.0 PORT=4321 pm2 start dist/server/entry.mjs --name senior-ledo --env
   ```
   Or use an ecosystem file so you don’t rely on shell env. Create `ecosystem.config.cjs`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'senior-ledo',
       script: 'dist/server/entry.mjs',
       cwd: __dirname,
       env: {
         HOST: '0.0.0.0',
         PORT: 4321
       },
       env_file: '.env'
     }]
   };
   ```
   Then:
   ```bash
   pm2 start ecosystem.config.cjs
   ```
   (If your PM2 version doesn’t support `env_file`, run `pm2 start ecosystem.config.cjs` and set vars in `env` or use `dotenv` in the script.)

4. **Useful PM2 commands:**
   ```bash
   pm2 status
   pm2 logs senior-ledo
   pm2 restart senior-ledo
   pm2 stop senior-ledo
   ```

5. **Port:** App listens on **4321**. Use Nginx (or similar) as reverse proxy to `http://127.0.0.1:4321` and terminate HTTPS.

---

## Learn more

- [Astro docs](https://docs.astro.build)
- [@astrojs/node (standalone)](https://docs.astro.build/en/guides/integrations-guide/node/)
