import { createServer } from "net";
import { spawn, type ChildProcessByStdio } from "child_process";
import type Stream from "stream";

const PORT = 8080;

interface Agent {
  name: string;
  color: string; // ANSI color code
  run_cmd: string[];
  pid?: number;
  status: "dead" | "alive";
  child?: ChildProcessByStdio<Stream.Writable, Stream.Readable, null>;
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
    color: "\x1b[38;2;249;241;225m", // #f9f1e1
    run_cmd: [
      "bun",
      "deathmatch.ts",
      "Bun",
      "\x1b[38;2;249;241;225m",
      PORT.toString(),
    ],
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
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "inherit"], // stdin → write, stdout → read, stderr → inherit
    });

    if (!child.pid) {
      logServer(`Failed to launch ${agent.name}`);
      continue;
    }

    agent.pid = child.pid;
    agent.child = child;
    logServer(`${agent.name} launched successfully (PID=${agent.pid})`);

    child.stdout.setEncoding("utf8");
    child.on("exit", (code, signal) => {
      logServer(`${agent.name} exited (code=${code}, signal=${signal})`);
      agent.status = "dead";
    });
    child.stdout.on("data", (data) => {
      if (typeof data !== "string") return;
      else if (!data.includes("MESSAGE:")) {
        return console.log(data.slice(0, data.length - 1));
      } else {
        logServer(
          `Signal from ${agent.name} - ${data.match(/(?<=MESSAGE:).*/)?.[0]}`
        );
      }

      // TODO RESPOND TO SIGNALS
    });

    // TODO LOG REGULAR SIGNALS FROM THE CHILD THAT ARE NOT MESSAGES
    // NOTE AWAIT READY SIGNAL FROM CHILD
    // NOTE SEND START SIGNAL TO CHILD
    // child.stdin?.write("START!\n");

    // child.send("START SIGNAL");

    // // Pause each agent after a short delay
    // setTimeout(() => {
    //   logServer(`Pausing ${agent.name}`);
    //   child.kill("SIGTSTP");
    // }, 500); // 0.5s to allow agent to log activation
  }
}

function executeAgents() {
  // Resume agents staggered for predictable order
  agents.forEach((agent, idx) => {
    setTimeout(() => {
      if (!agent.pid) return;
      logServer(`Resuming ${agent.name}`);
      agent.child?.stdin.write("Begin!\n");
      // process.kill(agent.pid, "SIGCONT");
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
