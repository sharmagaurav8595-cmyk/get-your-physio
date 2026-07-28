# GetYourPhysio AWS deployment

Production layout:

- Frontend: `https://getyourphysio.in` on Vercel
- Backend: `https://api.getyourphysio.in` on an AWS EC2 instance
- Database and PDF storage: MongoDB Atlas
- Browser API requests: `https://getyourphysio.in/api/*`, proxied by Vercel to AWS

## Required production environment variables

Create `.env` in the repository root on the EC2 instance. Never commit it.

```env
NODE_ENV=production
API_PORT=8787

MONGODB_URI=mongodb+srv://USERNAME:URL_ENCODED_PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=getyourphysio

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youraccount@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM=GetYourPhysio.in <youraccount@gmail.com>
```

For SMTP port `587`, use `SMTP_SECURE=false`. For port `465`, use
`SMTP_SECURE=true`. SMTP is required when `NODE_ENV=production`; without it,
OTP requests fail safely.

## Runtime

Use Node.js 22. Install dependencies and start the API with PM2:

```bash
npm ci
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd
```

Run the command printed by `pm2 startup systemd`, then run `pm2 save` again.

## Nginx

Copy `deploy/nginx/getyourphysio-api.conf` to:

```text
/etc/nginx/sites-available/getyourphysio-api
```

Enable it, validate Nginx, and reload:

```bash
sudo ln -s /etc/nginx/sites-available/getyourphysio-api /etc/nginx/sites-enabled/getyourphysio-api
sudo nginx -t
sudo systemctl reload nginx
```

After the `api.getyourphysio.in` DNS record points to the EC2 Elastic IP:

```bash
sudo certbot --nginx -d api.getyourphysio.in
sudo certbot renew --dry-run
```

## Health checks

Test each layer in this order:

```bash
curl http://127.0.0.1:8787/api/health
curl https://api.getyourphysio.in/api/health
curl https://getyourphysio.in/api/health
```

All three requests should return JSON containing `"ok": true`.

## Updates

```bash
cd /var/www/get-your-physio
git pull --ff-only origin main
npm ci
pm2 restart ecosystem.config.cjs --update-env
pm2 status
```
