module.exports = {
  apps: [
    {
      name: 'astralis',
      script: 'npm',
      args: 'run start',
      cwd: '/home/deploy/astralis-nextjs',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/astralis-error.log',
      out_file: '/var/log/pm2/astralis-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'astralis-worker',
      script: 'npm',
      args: 'run worker',
      cwd: '/home/deploy/astralis-nextjs',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/pm2/astralis-worker-error.log',
      out_file: '/var/log/pm2/astralis-worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    }
  ]
};
