import { createServer } from "net";
import { spawn } from "child_process";

const PORT = 8080;

interface Agent {
  name: string;
  color: string; // ANSI color code
  run_cmd: string[];
  pid?: number;
  status: "dead" | "alive";
}

// ANSI dim code for server logs
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const agents: Agent[] = [
  {
    name: "Node",
    color: "\x1b[32m", // green
    run_cmd: ["node", "deathmatch.ts", "Node", "\x1b[32m", PORT.toString()],
    status: "alive",
  },
  {
    name: "Bun",
    color: "\x1b[33m", // amber
    run_cmd: ["bun", "deathmatch.ts", "Bun", "\x1b[33m", PORT.toString()],
    status: "alive",
  },
];

// Helper for dimmed server logs
function logServer(msg: string) {
  console.log(`${DIM}[Server] ${msg}${RESET}`);
}

function launchAgents() {
  logServer(`Launching all agents (${agents.length} total)...`);
  for (const agent of agents) {
    const [command, ...args] = agent.run_cmd;
    const child = spawn(command, args, { stdio: "inherit" });

    if (!child.pid) {
      logServer(`Failed to launch ${agent.name}`);
      continue;
    }

    agent.pid = child.pid;
    logServer(`${agent.name} launched successfully (PID=${agent.pid})`);

    child.on("exit", (code, signal) => {
      logServer(`${agent.name} exited (code=${code}, signal=${signal})`);
      agent.status = "dead";
    });

    // Pause each agent after a short delay
    setTimeout(() => {
      child.kill("SIGTSTP");
      logServer(`Pausing ${agent.name}`);
    }, 500); // 0.5s to allow agent to log activation
  }
}

function executeAgents() {
  // Resume agents staggered for predictable order
  agents.forEach((agent, idx) => {
    setTimeout(() => {
      if (!agent.pid) return;
      process.kill(agent.pid, "SIGCONT");
      logServer(`Resuming ${agent.name}`);
    }, idx * 500); // 0.5s apart
  });
}

const server = createServer(() => {
  logServer("New agent connected");
});

server.listen(PORT, () => {
  logServer(`Listening for agent connections on port ${PORT}`);
  launchAgents();
  // Resume agents after 2s total
  setTimeout(() => {
    executeAgents();
  }, 2000);
});
