# Deploying API Monitor (free tier)

This deploys across five free services instead of one VPS, since the stack
(API server + background consumer + Postgres + MongoDB + RabbitMQ) doesn't
fit a single static/serverless host. Follow the steps in order — later
steps need connection strings from earlier ones.

## 1. MongoDB Atlas (users, clients, API keys, raw hit events)

1. Create a free account at mongodb.com/cloud/atlas, create a free **M0**
   cluster.
2. Database Access → add a user with a password (save it).
3. Network Access → allow access from anywhere (`0.0.0.0/0`) — fine for a
   demo project.
4. Get the connection string ("Connect" → "Drivers"). It looks like:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/`
   This is your `MONGO_URI`.

## 2. Neon (aggregated metrics — Postgres)

1. Create a free project at neon.tech.
2. Open the SQL editor in Neon's console and run the contents of
   [`server/scripts/init-postgres.sql`](server/scripts/init-postgres.sql)
   — Neon doesn't auto-run init scripts the way the local Docker Postgres
   container does, so this has to be done manually, once.
3. From the connection details, note: host, database name, user, password
   (these map to `PG_HOST`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD`; Neon's
   default port is `5432`).

## 3. CloudAMQP (RabbitMQ)

1. Create a free "Little Lemur" instance at cloudamqp.com.
2. Copy the AMQP URL from the instance details page — this is your
   `RABBITMQ_URL` (already in the `amqp://user:pass@host/vhost` form the
   app expects).

## 4. Render (API server + consumer)

1. Push this repo to GitHub if it isn't already.
2. In Render, "New" → "Blueprint", point it at the repo. It will read
   [`render.yaml`](render.yaml) at the repo root and propose two services:
   `api-monitoring-api` and `api-monitoring-consumer`.
3. Render will prompt for the env vars marked `sync: false` in
   `render.yaml`. Fill in for **both** services: `MONGO_URI`, `PG_HOST`,
   `PG_DATABASE`, `PG_USER`, `PG_PASSWORD`, `RABBITMQ_URL`.
4. For `api-monitoring-api` only, also set:
   - `JWT_SECRET` — generate a real one, e.g. run
     `openssl rand -base64 48` locally and paste the output. Do not reuse
     the placeholder value that's in the code as a fallback.
   - `CORS_ORIGIN` — leave as `http://localhost:5173` for now; you'll come
     back and set this to your real Vercel URL in step 6.
5. Deploy. Both services are free-tier "Web Services" — they spin down
   after ~15 minutes of no traffic and take 30–60s to wake back up on the
   next request. Expected and fine for a resume demo; just know that the
   first load after idling will be slow.
6. Once `api-monitoring-api` is live, note its public URL
   (`https://api-monitoring-api-xxxx.onrender.com`).

## 5. Create your super_admin account

The very first call to `/api/auth/onboard-super-admin` creates the one
admin account and then permanently disables itself — the frontend has no
UI for this by design (see the backend's `onboardSuperAdmin` flow).
Run this once, from your own machine, against the live API:

```bash
curl -X POST https://api-monitoring-api-xxxx.onrender.com/api/auth/onboard-super-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"YOUR_USERNAME","email":"you@example.com","password":"a-strong-password"}'
```

## 6. Vercel (frontend)

1. Import the repo into Vercel. Set **Root Directory** to `dashboard` —
   this is a monorepo, Vercel needs to know the frontend isn't at the
   repo root.
2. Framework preset: Vite (auto-detected).
3. Add an environment variable:
   `VITE_API_BASE_URL = https://api-monitoring-api-xxxx.onrender.com/api`
4. Deploy. Note the resulting Vercel URL.

## 7. Close the loop: point CORS at the real frontend URL

Go back to Render → `api-monitoring-api` → Environment, set
`CORS_ORIGIN` to your actual Vercel URL (e.g.
`https://your-app.vercel.app`, no trailing slash), and redeploy. This is
the step that actually matters for security — leaving it as `*` or
reflecting any origin (which is what the code did before this pass) would
let any website make authenticated requests using a logged-in visitor's
cookies.

## Notes on what "free" actually gets you here

- Every free web service (Render) spins down when idle — expect a cold
  start on the first hit after a while. Not worth paying to avoid this
  for a resume project.
- Neon and Atlas free tiers don't expire on a timer (unlike Render's own
  free Postgres, which does after 90 days — that's why Neon is used
  instead).
- CloudAMQP's free tier caps message throughput and connections, far
  above what a demo needs.
