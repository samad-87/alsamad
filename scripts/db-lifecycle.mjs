import { spawnSync } from "node:child_process";

const action = process.argv[2];
if (!new Set(["up", "down"]).has(action)) {
  throw new Error("Usage: db-lifecycle.mjs <up|down>");
}

const probe = spawnSync("docker", ["compose", "version"], { stdio: "ignore" });
if (probe.error?.code === "ENOENT") {
  throw new Error("Docker is required for the local PostgreSQL lifecycle.");
}
if (probe.status !== 0) throw new Error("Docker Compose is unavailable.");

const args = ["compose", "-f", "docker-compose.db.yml"];
args.push(...(action === "up" ? ["up", "-d", "--wait"] : ["down"]));
const result = spawnSync("docker", args, { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);
