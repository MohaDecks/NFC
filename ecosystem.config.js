const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const backendDir = path.join(rootDir, "backend");
const logsDir = path.join(rootDir, "logs");

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;

  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const fileEnv = {
  ...loadEnvFile(path.join(rootDir, ".env")),
  ...loadEnvFile(path.join(backendDir, ".env")),
};

const publicUrl = process.env.PUBLIC_URL || fileEnv.APP_URL || "https://mubarektech.deknest.com";
const port = String(process.env.PORT || fileEnv.PORT || 4001);

module.exports = {
  apps: [
    {
      name: "mubarektech",
      cwd: backendDir,
      script: "./src/index.ts",
      interpreter: path.join(backendDir, "node_modules/.bin/tsx"),
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      time: true,
      max_restarts: 20,
      min_uptime: "5s",
      restart_delay: 2000,
      max_memory_restart: "400M",
      error_file: path.join(logsDir, "app-error.log"),
      out_file: path.join(logsDir, "app-out.log"),
      merge_logs: true,
      env: {
        ...fileEnv,
        NODE_ENV: "production",
        PORT: port,
        APP_URL: publicUrl,
      },
    },
  ],
};
