/**
 * PM2 Production Configuration for Astralis
 *
 * This manages both backend and frontend services
 */

module.exports = {
  apps: [
    {
      // Express Backend API (built version, no tsx memory leak)
      name: 'astralis-server',
      script: 'dist/index.js',
      cwd: '/root/projects/astralis-server/server',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true
    },
    {
      // Next.js Frontend (pre-built, deployed from local)
      name: 'astralis-frontend',
      cwd: '/root/projects/astralis-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_TELEMETRY_DISABLED: 1
      },
      error_file: '/root/logs/frontend-error.log',
      out_file: '/root/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '800M',
      watch: false,
      min_uptime: '10s',
      max_restarts: 10,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
