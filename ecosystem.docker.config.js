module.exports = {
  apps: [
    {
      name: 'docker-compose-manager',
      script: 'docker',
      args: 'compose up',
      cwd: __dirname,
      autorestart: false,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: './pm2-docker-out.log',
      error_file: './pm2-docker-error.log',
    },
  ],
};
