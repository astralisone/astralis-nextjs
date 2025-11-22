# Deploy to Production

Build the project locally and deploy to the production server at astralisone.com.

## Steps to execute:

1. **Build locally** - Run `npm run build` in the project directory
2. **Sync build files** - Rsync the `.next` folder to the server:
   ```bash
   rsync -avz --delete \
     -e "ssh -i ~/.ssh/id_ed25519" \
     /Users/gregorystarr/projects/astralis-nextjs/.next/ \
     root@137.184.31.207:/home/deploy/astralis-nextjs/.next/
   ```
3. **Restart PM2** - SSH to server and restart the application:
   ```bash
   ssh -i ~/.ssh/id_ed25519 root@137.184.31.207 "cd /home/deploy/astralis-nextjs && pm2 restart all --update-env"
   ```
4. **Verify deployment** - Check the PM2 logs to confirm successful startup:
   ```bash
   ssh -i ~/.ssh/id_ed25519 root@137.184.31.207 "pm2 logs --lines 10 --nostream"
   ```

## Server Details:
- **Host**: 137.184.31.207
- **Path**: /home/deploy/astralis-nextjs
- **SSH Key**: ~/.ssh/id_ed25519
- **User**: root

## Notes:
- Building on the server often fails due to memory constraints, so we build locally and rsync
- The server runs on DigitalOcean with limited RAM
- PM2 manages the Next.js process
