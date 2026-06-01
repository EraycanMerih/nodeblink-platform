module.exports = {
  apps: [
    {
      name: "nodeblink-next",
      cwd: "./",
      script: "npm",
      args: "run start:next",
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
    {
      name: "nodeblink-api",
      cwd: "./",
      script: "server.js",
      env_production: {
        NODE_ENV: "production",
        PORT: "8080",
      },
    },
  ],
};
