import { createServer, Socket } from "net";
import { spawn, execSync } from "child_process";
import { mkdirSync } from "fs";

const PORT = 8080;
const MAX_CLIENTS = 7;

interface Agent {
  name: string;
  source_file: string;
  binary_path: string;
  compile_cmd?: string;
  run_cmd: string[];
  pid?: number;
  status: "dead" | "alive";
  socket?: Socket;
}

const agents: Agent[] = [
  {
    name: "C",
    source_file: "deathmatch.c",
    binary_path: ".bin/deathmatch_c",
    compile_cmd: "gcc deathmatch.c -o .bin/deathmatch_c",
    run_cmd: [".bin/deathmatch_c", PORT.toString()],
    status: "alive",
  },
  {
    name: "Perl",
    source_file: "deathmatch.pl",
    binary_path: "deathmatch.pl",
    run_cmd: ["perl", "deathmatch.pl", PORT.toString()],
    status: "alive",
  },
  {
    name: "C++",
    source_file: "deathmatch.cpp",
    binary_path: ".bin/deathmatch_cpp",
    compile_cmd: "g++ deathmatch.cpp -o .bin/deathmatch_cpp",
    run_cmd: [".bin/deathmatch_cpp", PORT.toString()],
    status: "alive",
  },
  {
    name: "Rust",
    source_file: "deathmatch.rs",
    binary_path: ".bin/deathmatch_rs",
    compile_cmd: "rustc deathmatch.rs -o .bin/deathmatch_rs",
    run_cmd: [".bin/deathmatch_rs", PORT.toString()],
    status: "alive",
  },
  {
    name: "Java",
    source_file: "deathmatch.java",
    binary_path: ".bin/deathmatch.class",
    compile_cmd: "javac -d .bin deathmatch.java",
    run_cmd: ["java", "-cp", ".bin", "deathmatch", PORT.toString()],
    status: "alive",
  },
  {
    name: "Python",
    source_file: "deathmatch.py",
    binary_path: "deathmatch.py",
    run_cmd: ["python3", "deathmatch.py", PORT.toString()],
    status: "alive",
  },
  {
    name: "TypeScript",
    source_file: "deathmatch.ts",
    binary_path: "deathmatch.ts",
    run_cmd: ["bun", "deathmatch.ts", PORT.toString()],
    status: "alive",
  },
];

let alive_agents_count = MAX_CLIENTS;

function compileAgents() {
  console.log("[Server] Compiling agents...");
  try {
    mkdirSync(".bin", { recursive: true });
    for (const agent of agents) {
      if (agent.compile_cmd) {
        console.log(`[Server] Compiling ${agent.name}...`);
        execSync(agent.compile_cmd);
      }
    }
    console.log("[Server] Compilation finished.");
  } catch (error) {
    console.error("[Server] Failed to compile agents:", error);
    process.exit(1);
  }
}

function launchAgents() {
  console.log("[Server] Launching agents...");
  for (const agent of agents) {
    const [command, ...args] = agent.run_cmd;
    const child = spawn(command, args, { stdio: "inherit" });
    agent.pid = child.pid;
    console.log(`[Server] Launched ${agent.name} with PID ${agent.pid}`);
  }
}

const server = createServer((socket) => {
  console.log("[Server] Agent connected.");

  const agent = agents.find((a) => !a.socket);
  if (agent) {
    agent.socket = socket;
    process.kill(agent.pid!, "SIGSTOP");
    console.log(`[Server] Stopped agent ${agent.name} (PID ${agent.pid})`);
  }

  if (agents.every((a) => a.socket)) {
    console.log("[Server] All agents connected. Starting the deathmatch.");
    for (const agent of agents) {
      agent.socket!.write("START");
    }
  }

  socket.on("data", (data) => {
    const message = data.toString().trim();
    const [command, pidStr] = message.split(" ");
    const pid = parseInt(pidStr);

    if (command === "IS_ALIVE") {
      const targetAgent = agents.find((a) => a.pid === pid);
      if (targetAgent && targetAgent.status === "alive") {
        socket.write("YES");
      } else {
        socket.write("NO");
      }
    } else if (command === "KILLED") {
      const killedAgent = agents.find((a) => a.pid === pid);
      if (killedAgent && killedAgent.status === "alive") {
        killedAgent.status = "dead";
        alive_agents_count--;
        console.log(
          `[Server] Agent ${killedAgent.name} (PID ${pid}) was killed. ${alive_agents_count} agents remaining.`
        );
      }
    }
  });

  socket.on("close", () => {
    const agent = agents.find((a) => a.socket === socket);
    if (agent) {
      console.log(`[Server] Agent ${agent.name} disconnected.`);
      agent.socket = undefined;
    }
  });

  socket.on("error", (err) => {
    console.error("[Server] Socket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
  compileAgents();
  launchAgents();
  console.log("[Server] Waiting for agents to connect...");
});

function checkWinner() {
  if (alive_agents_count <= 1) {
    const winner = agents.find((a) => a.status === "alive");
    if (winner) {
      console.log(`
[Server] The winner is ${winner.name} (PID ${winner.pid})!`);
    } else {
      console.log("[Server] No winner, all agents are dead.");
    }

    for (const agent of agents) {
      if (agent.pid) {
        try {
          process.kill(agent.pid, "SIGKILL");
        } catch (e) {
          // Ignore errors if process is already dead
        }
      }
    }
    server.close();
    process.exit();
  }
}

setInterval(checkWinner, 1000);
