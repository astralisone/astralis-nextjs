module.exports = {
  apps: [
    {
      name: 'docker-compose-manager',
      script: 'docker',
      args: 'compose up --build',
      cwd: __dirname,
      autorestart: false, // Set to false to prevent unexpected restarts
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: './pm2-docker-out.log',
      error_file: './pm2-docker-error.log',
    },
  ],
};
