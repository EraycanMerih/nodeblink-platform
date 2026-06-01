module.exports = {
  apps: [
    {
      name: "nodeblink",
      cwd: "./",
      script: "npm",
      args: "run start:next",
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
