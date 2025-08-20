import { execSync } from "child_process";
import { setPriority } from "os";
import { sleepMain } from "./node-yield/index.ts";

process.stdin.setEncoding("utf8");
process.stdin.resume();
setPriority(process.pid, 19);

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap arr[i] and arr[j]
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helpers
function log(msg: string) {
  process.stdout.write(`${msg}\n`);
}
function sendMsg(msg: string) {
  process.stdout.write(`MESSAGE:${msg}\n`);
}

function sleepRandom(maxMs = 1000) {
  const ms = Math.ceil(Math.random() * maxMs);
  sleepMain(ms);
}

// Initial logs
log("Activated");
sendMsg("Ready!");

let inputBuffer = "";

// Process a single line of input
function processLine(line: string) {
  line = line.trim();
  if (!line) return;

  if (line === "Begin!") {
    log("Unleashed!");
    sleepRandom();
    startBattleLoop();
  }

  if (line.startsWith("Opp:")) {
    const [, oppPid, oppName] = line.split(":");
    try {
      process.kill(+oppPid);
      log(`Eliminated ${oppName}`);
    } catch {
      log(`Failed to kill ${oppName} (PID: ${oppPid})`);
    }
  }
}

// Handle incoming stdin data (Node may chunk, Bun may deliver all at once)
process.stdin.on("data", (chunk: string) => {
  inputBuffer += chunk;

  let newlineIndex: number;
  while ((newlineIndex = inputBuffer.indexOf("\n")) >= 0) {
    const line = inputBuffer.slice(0, newlineIndex);
    inputBuffer = inputBuffer.slice(newlineIndex + 1);
    processLine(line);
  }
});

function startBattleLoop() {
  log("Hunting opponents...");

  const processesResult = execSync("ps -eo pid").toString();
  const pids = processesResult
    .split("\n")
    .slice(1) // skip header
    .map((line) => +line.trim())
    .filter((pid) => !Number.isNaN(pid) && pid !== process.pid);

  log(`Found ${pids.length} processes`);
  sleepRandom();
  log("Contacting server...");
  requestPidInfo(pids);
}

function requestPidInfo(pids: number[]) {
  for (const pid of shuffleArray(pids)) {
    sendMsg(`PID:${pid}`);
    sleepRandom(50);
  }
}
