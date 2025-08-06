module.exports = {
  apps: [
    {
      name: 'aqdm',
      script: 'npm run start',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      output: 'logs/out.log',
      error: 'logs/error.log',
    },
  ],
};
