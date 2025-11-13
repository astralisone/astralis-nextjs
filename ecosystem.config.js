/**
 * PM2 Ecosystem Configuration
 *
 * This file configures PM2 process management for both:
 * - Express Backend (Port 3000)
 * - Next.js Frontend (Port 3001)
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart all
 *   pm2 stop all
 *   pm2 logs
 */

module.exports = {
  apps: [
    {
      // Express Backend API
      name: 'astralis-backend',
      cwd: '/home/deploy/projects/astralis-agency-server',
      script: 'dist/index.js', // or 'src/index.js' if not using TypeScript build
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/deploy/logs/backend-error.log',
      out_file: '/home/deploy/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      // Auto-restart if backend crashes
      min_uptime: '10s',
      max_restarts: 10,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      // Next.js Frontend (pre-built locally, deployed via rsync)
      name: 'astralis-frontend',
      cwd: '/home/deploy/projects/astralis-nextjs',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        // Ensure Next.js uses the pre-built .next folder
        NEXT_TELEMETRY_DISABLED: 1
      },
      error_file: '/home/deploy/logs/frontend-error.log',
      out_file: '/home/deploy/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '800M',  // Reduced since no build on server
      watch: false,
      // Auto-restart if frontend crashes
      min_uptime: '10s',
      max_restarts: 10,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ],

  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-droplet-ip',
      ref: 'origin/main',
      repo: 'git@github.com:YOUR_USERNAME/astralis-nextjs.git',
      path: '/home/deploy/projects/astralis-nextjs',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
