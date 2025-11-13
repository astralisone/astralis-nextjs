/**
 * PM2 Production Configuration for Digital Ocean Droplet
 *
 * Deployment Structure:
 * - Frontend: /home/deploy/astralis-nextjs (GitHub: astralisone/astralis-nextjs, main branch, commit c602db9)
 * - Backend: /home/deploy/astralis-server (GitHub: astralisone/astralis-agency-server, feature/nextjs-migration, commit e3958d7)
 *
 * Deployment Method: Git-based (git pull + build on server)
 *
 * Usage:
 *   pm2 start /root/ecosystem.config.cjs --env production
 *   pm2 restart all
 *   pm2 stop all
 *   pm2 logs
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      // Express Backend API Server
      name: 'astralis-server',
      script: 'dist/index.js',
      cwd: '/home/deploy/astralis-server/server',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/astralis-server-error.log',
      out_file: '/var/log/pm2/astralis-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      // Next.js Frontend Server
      name: 'astralis-frontend',
      cwd: '/home/deploy/astralis-nextjs',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_TELEMETRY_DISABLED: 1
      },
      error_file: '/var/log/pm2/astralis-frontend-error.log',
      out_file: '/var/log/pm2/astralis-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1.5G',
      watch: false,
      min_uptime: '10s',
      max_restarts: 10,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
