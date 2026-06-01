module.exports = {
  apps: [
    {
      name: "nodeblink-next",
      cwd: "./",
      script: "npm",
      args: "run start:next",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
    {
      name: "nodeblink-api",
      cwd: "./",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: "8080",
      },
    },
  ],
};
