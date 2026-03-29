# Deploying Captable.inc with Coolify on Hostinger VPS

## Overview

This guide walks through deploying the self-hosted Captable.inc application using:
- **Hostinger VPS** as the server
- **Coolify** as the deployment platform (open-source Vercel/Heroku alternative)
- **Docker Compose** for container orchestration
- **GitHub** for source control and auto-deploy

---

## Step 1: Purchase and Access Hostinger VPS

1. Go to [hostinger.com/vps-hosting](https://www.hostinger.com/vps-hosting)
2. Choose a plan:
   - **Minimum**: KVM 2 (2 vCPU, 8 GB RAM, 100 GB NVMe) — ~$10/mo
   - **Recommended**: KVM 4 (4 vCPU, 16 GB RAM, 200 GB NVMe) — ~$16/mo
3. Select **Ubuntu 22.04** or **Ubuntu 24.04** as the OS
4. Set a strong root password
5. Once provisioned, note your **server IP address**

## Step 2: Install Coolify on the VPS

SSH into your server:

```bash
ssh root@YOUR_SERVER_IP
```

Install Coolify (one command):

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

This installs Docker, Docker Compose, and Coolify automatically.

Once complete, access Coolify at:
```
http://YOUR_SERVER_IP:8000
```

Create your admin account on first visit.

## Step 3: Connect GitHub to Coolify

1. In Coolify dashboard, go to **Sources** → **Add New Source**
2. Select **GitHub**
3. You'll be prompted to create a **GitHub App** — follow the wizard
4. Authorize the app for the **captable-inc** organization
5. Grant access to the **captable** repository

## Step 4: Set Up the Project in Coolify

1. Go to **Projects** → **Add New Project**
2. Name it: `Captable`
3. Inside the project, click **Add New Resource**
4. Select **Docker Compose**
5. Choose your GitHub source → select `captable-inc/captable` repo
6. Set the **Docker Compose file** path to: `docker-compose.prod.yml`
7. Set the **branch** to: `main`

## Step 5: Configure Environment Variables

In Coolify's resource settings, go to the **Environment Variables** tab and add all variables from `.env.production.example`:

### Required Variables

| Variable | Example Value |
|----------|---------------|
| `NODE_ENV` | `production` |
| `NEXTAUTH_URL` | `https://app.captable.inc` |
| `NEXT_PUBLIC_BASE_URL` | `https://app.captable.inc` |
| `NEXTAUTH_SECRET` | (run `openssl rand -base64 32`) |
| `POSTGRES_USER` | `captable` |
| `POSTGRES_PASSWORD` | (strong random password) |
| `POSTGRES_DB` | `captable` |
| `DATABASE_URL` | `postgres://captable:PASSWORD@pg:5432/captable` |
| `EMAIL_FROM` | `noreply@captable.inc` |
| `EMAIL_SERVER` | `smtp://user:pass@smtp.provider.com:587` |
| `UPLOAD_ENDPOINT` | `http://minio:9000` |
| `NEXT_PUBLIC_UPLOAD_DOMAIN` | `https://files.captable.inc` |
| `UPLOAD_REGION` | `us-east-1` |
| `UPLOAD_ACCESS_KEY_ID` | (generate strong key) |
| `UPLOAD_SECRET_ACCESS_KEY` | (generate strong secret) |
| `UPLOAD_BUCKET_PUBLIC` | `captable-public-bucket` |
| `UPLOAD_BUCKET_PRIVATE` | `captable-private-bucket` |

## Step 6: Configure Domain & SSL

1. In Coolify resource settings, go to the **Domain** section
2. Add your domain: `app.captable.inc`
3. Coolify handles **Let's Encrypt SSL** automatically
4. Point your DNS:
   - Add an **A record**: `app.captable.inc` → `YOUR_SERVER_IP`
   - If using MinIO publicly: `files.captable.inc` → `YOUR_SERVER_IP`

## Step 7: Deploy

1. Click **Deploy** in Coolify
2. Coolify will:
   - Pull the repo from GitHub
   - Run `docker-compose.prod.yml`
   - Start all services (app, postgres, minio)
   - Set up SSL via Let's Encrypt
3. After deployment, run database migrations:
   - Go to Coolify **Terminal** for the app container
   - Run: `npx prisma migrate deploy`

## Step 8: Verify

- App: `https://app.captable.inc`
- Create your first account and company
- MinIO console (internal): `http://YOUR_SERVER_IP:9001`

## Auto-Deploy from GitHub

Coolify supports **auto-deploy on push**:
1. In the resource settings, enable **Auto Deploy**
2. Every push to `main` will trigger a new deployment
3. You can also set it to deploy only on tags/releases

## Updating

To pull upstream changes from the original `captableinc/captable` repo:

```bash
# Add upstream remote (one time)
git remote add upstream https://github.com/captableinc/captable.git

# Fetch and merge updates
git fetch upstream
git merge upstream/main

# Push to your fork (triggers auto-deploy)
git push origin main
```

## Backup

### Database
```bash
# From the VPS
docker exec captable-db pg_dump -U captable captable > backup_$(date +%Y%m%d).sql
```

### MinIO Files
```bash
# MinIO data is in the Docker volume
docker run --rm -v captable-prod_minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio_backup_$(date +%Y%m%d).tar.gz /data
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| App won't start | Check logs: Coolify dashboard → Logs tab |
| Database connection error | Verify `DATABASE_URL` uses `pg` as hostname (Docker network name) |
| File uploads failing | Ensure MinIO buckets exist and CORS is configured |
| SSL not working | Verify DNS A record points to server IP, wait for propagation |
| Out of memory | Upgrade VPS plan or add swap space |
