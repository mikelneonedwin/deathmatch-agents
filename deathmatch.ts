import { execSync } from "child_process";
import { sleepMain, yieldMain } from "./node-yield/index.ts";
import { setPriority } from "os";

const name = process.argv[2];
const color = process.argv[3] || "\x1b[0m"; // ANSI color code passed from server

process.stdin.setEncoding("utf8");
setPriority(process.pid, 19);

// Helper to log messages in color
function logAgent(msg: string) {
  console.log(`${color}[${name}] ${msg}\x1b[0m`);
}

function sendMsg(msg: string) {
  logAgent(`MESSAGE:${msg}`);
}

// Activated
logAgent("Activated");

// Execution loop to simulate work and keep agent alive
const timer = setInterval(() => {
  // logAgent("Running tasks...");
}, 5000); // log every 5s

process.stdin.on("data", (data) => {
  // NOTE PROCESS START SIGNAL
  // sleepMain(Math.round(Math.random() * 2000))
  yieldMain()
  logAgent("CPU Burst Activated");
  // yieldMain();
  sleepMain(Math.round(Math.random() * 2000))
  logAgent("Hunting opponents...");
});

// NOTE SEND READY SIGNAL TO SERVER
sendMsg("Ready!");

// const output = execSync("ps -eo pid,args").toString(); // args = full command with arguments
// const lines = output.split("\n").slice(1); // skip header
// const processes = lines
//   .map((line) => line.trim())
//   .filter(Boolean)
//   .map((line) => {
//     const spaceIndex = line.indexOf(" ");
//     const pid = line.slice(0, spaceIndex);
//     const cmd = line.slice(spaceIndex + 1);
//     return { pid, cmd };
//   })
//   .filter(({ cmd }) => cmd.includes("deathmatch.ts"));

process.on("exit", () => {
  logAgent("Exited");
});
