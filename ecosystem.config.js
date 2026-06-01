module.exports = {
  apps: [
    {
      name: 'nodeblink-next',
      cwd: './',
      script: 'npm',
      args: 'run start:next',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
