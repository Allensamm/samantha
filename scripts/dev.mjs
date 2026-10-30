import { spawnSync, spawn } from "node:child_process";
import { watch } from "node:fs";
const build = () => {
  const result = spawnSync(process.execPath, ["scripts/build.mjs"], {
    stdio: "inherit",
  });
  return result.status === 0;
};
if (!build()) process.exit(1);
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  stdio: "inherit",
});
let timer;
for (const dir of ["src", "content", "public"])
  watch(dir, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 150);
  });
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.kill(signal);
    process.exit(0);
  });
server.on("exit", (code) => process.exit(code || 0));
console.log(
  "Watching src, content, and public. Refresh your browser after edits.",
);
