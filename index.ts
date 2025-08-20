import { spawn, type ChildProcessByStdio } from "child_process";
import type Stream from "stream";

const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

type Message = "Ready!" | `PID:${number}`;

interface AgentConfig {
  name: string;
  color: string;
  runCmd: string[];
}

interface Agent {
  name: string;
  color: string;
  runCmd: string[];
  child: ChildProcessByStdio<Stream.Writable, Stream.Readable, null>;
  status: "waiting" | "active" | "dead";
}

const agentsConfig: AgentConfig[] = [
  // Node agents
  { name: "NodeAlpha", color: "\x1b[32m", runCmd: ["node", "deathmatch.ts"] },
  { name: "NodeBeta", color: "\x1b[36m", runCmd: ["node", "deathmatch.ts"] },
  { name: "NodeGamma", color: "\x1b[33m", runCmd: ["node", "deathmatch.ts"] },
  { name: "NodeDelta", color: "\x1b[35m", runCmd: ["node", "deathmatch.ts"] },
  { name: "NodeEpsilon", color: "\x1b[31m", runCmd: ["node", "deathmatch.ts"] },

  // Bun agents
  {
    name: "BunAlpha",
    color: "\x1b[38;2;249;241;225m",
    runCmd: ["bun", "deathmatch.ts"],
  },
  {
    name: "BunBeta",
    color: "\x1b[38;2;200;200;255m",
    runCmd: ["bun", "deathmatch.ts"],
  },
  {
    name: "BunGamma",
    color: "\x1b[38;2;255;200;200m",
    runCmd: ["bun", "deathmatch.ts"],
  },
  {
    name: "BunDelta",
    color: "\x1b[38;2;200;255;200m",
    runCmd: ["bun", "deathmatch.ts"],
  },
  {
    name: "BunEpsilon",
    color: "\x1b[38;2;255;255;200m",
    runCmd: ["bun", "deathmatch.ts"],
  },
];

function logServer(msg: string, ...logs: any[]) {
  console.log(`${DIM}[Server] ${msg}${RESET}`, ...logs);
}

function logAgent(agent: Agent, msg: string) {
  console.log(`${agent.color}[${agent.name}] ${msg}${RESET}`);
}

function launchAgent(cfg: AgentConfig): Agent | null {
  const [command, ...args] = cfg.runCmd;
  const child = spawn(command, args, { stdio: ["pipe", "pipe", "inherit"] });
  if (!child.pid) {
    logServer(`Unable to launch ${cfg.name}`);
    return null;
  }
  child.stdout.setEncoding("utf8");

  const agent: Agent = { ...cfg, child, status: "waiting" };
  logServer(`${cfg.name} launched successfully (PID=${child.pid})`);
  return agent;
}

function setupAgent(agent: Agent, agents: Agent[]) {
  let buffer = "";

  agent.child.stdout.on("data", (chunk: string) => {
    buffer += chunk;
    let index: number;
    while ((index = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 1);
      if (!line) continue;

      if (line.startsWith("MESSAGE:")) {
        const msg = line.slice("MESSAGE:".length).trim() as Message;
        handleMessage(agent, msg, agents);
      } else {
        logAgent(agent, line);
      }
    }
  });

  agent.child.on("exit", (code, signal) => {
    logServer(`${agent.name} exited (code=${code}, signal=${signal})`);
    agent.status = "dead";
    handleDeath(agent, agents);
  });
}

function handleMessage(agent: Agent, msg: Message, agents: Agent[]) {
  if (msg === "Ready!") {
    agent.status = "active";
    const activeAgents = agents.filter((a) => a.status === "active");
    if (activeAgents.length === agents.length) {
      logServer("All agents ready, unleashing...");
      activeAgents.forEach((a) => a.child.stdin.write("Begin!\n"));
    }
  }
  if (msg.startsWith("PID:")) {
    const pid = +msg.slice(4);
    const targetAgent = agents.find((agent) => {
      return agent.child.pid === pid && agent.status === "active";
    });
    if (targetAgent) {
      logServer(`${agent.name} sited ${targetAgent.name}`);
      agent.child.stdin.write(`Opp:${pid}:${targetAgent.name}\n`);
    }
  }
}

function handleDeath(agent: Agent, agents: Agent[]) {
  const alive = agents.filter((a) => a.status === "active");
  if (alive.length === 1) {
    const winner = alive[0];
    winner.child.kill();
    logServer(`${winner.name} wins!`);
    process.exit(0);
  }
}

// ---- MAIN ----
function main() {
  logServer(`Launching ${agentsConfig.length} agents...`);
  const agents: Agent[] = [];

  for (const cfg of agentsConfig) {
    const agent = launchAgent(cfg);
    if (!agent) continue;
    setupAgent(agent, agents);
    agents.push(agent);
  }
}

main();
