module.exports = {
  apps: [
    {
      name: "getyourphysio-api",
      script: "server/server.mjs",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      time: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
