module.exports = {
  apps: [
    {
      name: "nodeblink",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "5s",
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
