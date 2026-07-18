import { spawn } from "node:child_process";
import { resolve } from "node:path";

const children = [
  spawn(process.execPath, ["server/server.mjs"], { stdio: "inherit", env: process.env }),
  spawn(process.execPath, [resolve("node_modules/vite/bin/vite.js")], { stdio: "inherit", env: process.env }),
];

let stopping = false;
const stop = (exitCode = 0) => {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill());
  process.exit(exitCode);
};

children.forEach((child) => {
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code || 0);
  });
});

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
