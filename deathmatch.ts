import { execSync } from "child_process";

const name = process.argv[2];
const color = process.argv[3] || "\x1b[0m"; // ANSI color code passed from server

// Helper to log messages in color
function logAgent(msg: string) {
  console.log(`${color}[${name}] ${msg}\x1b[0m`);
}

// Activated
logAgent("Activated");

// Execution loop to simulate work and keep agent alive
const timer = setInterval(() => {
  logAgent("Running tasks...");
}, 5000); // log every 5s

// Handle pause from server
const SIGTSTPHandler = () => {
  execSync("sleep 1");
  logAgent("Paused by server");
  process.off("SIGTSTP", SIGTSTPHandler);
  process.kill(process.pid, "SIGTSTP");
};
process.on("SIGTSTP", SIGTSTPHandler);

// Handle resume from server
process.on("SIGCONT", () => {
  logAgent("Resumed");

  // Perform a sleepable syscall immediately to yield CPU
  // Option 1: Blocking sleep using execSync
  execSync("sleep 1"); // sleep 100ms

  setTimeout(() => {
    logAgent("Resuming main tasks...");

    // Get PID and full command line
    const output = execSync("ps -eo pid,args").toString(); // args = full command with arguments
    const lines = output.split("\n").slice(1); // skip header
    const processes = lines
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const spaceIndex = line.indexOf(" ");
        const pid = line.slice(0, spaceIndex);
        const cmd = line.slice(spaceIndex + 1);
        return { pid, cmd };
      })
      .filter(({ cmd }) => cmd.includes("deathmatch.ts"));
    console.log(processes);
  });
});

// Optional graceful exit
process.on("exit", () => {
  logAgent("Exited");
});
