const port = process.env.NODEBLINK_PORT || process.env.PORT || "3001";

module.exports = {
  apps: [
    {
      name: "nodeblink",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${port}`,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 5,
      min_uptime: "10s",
      env_production: {
        NODE_ENV: "production",
        PORT: port,
        NODEBLINK_PORT: port,
      },
    },
  ],
};
