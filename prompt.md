**Task:** Build a complete “language deathmatch” system on Linux. The system includes a central server and seven agent programs. Deliver **all source code files** in one response. Follow these requirements exactly.

**1. Central Server**

- **Language:** C
- **Responsibilities:**

  1. Compile C, C++, Rust, and Java agents and place compiled binaries in a `.bin/` folder in the project root. Create `.bin` if it doesn’t exist.
  2. Launch all agents with `SIGSTOP` immediately after starting.
  3. Track PIDs, language names, and alive status for all agents.
  4. Provide a TCP interface for agents to query whether a PID belongs to a game agent.
  5. Receive kill reports from agents and mark the respective agent as dead.
  6. Resume all agents with `SIGCONT` once all agents are connected.
  7. When only one agent is alive, terminate it with `SIGTERM` and announce it as the winner.

- **Constraints:** Use only built-in C/POSIX functions; no external libraries.

**2. Agents**

- **Languages:** C, C++, Rust, Python, TypeScript (Bun), Java, Perl
- **Responsibilities for each agent:**

  1. Connect to the central server via TCP.
  2. Scan `/proc` periodically for all PIDs, skip own PID.
  3. Query the server if a PID belongs to a live agent.
  4. If yes, send `SIGKILL` to that PID.
  5. Report kills back to the server.
  6. Log every action:

     - `[<LanguageName>] Starting agent with PID <pid>` on start
     - `[<LanguageName>] Killed <TargetLang>` whenever a kill occurs

- **Constraints:** Use only built-in libraries/functions for each language. Rust may use `libc` for signals; no external crates.
- **File naming convention:** `deathmatch.c`, `deathmatch.cpp`, `deathmatch.rs`, `deathmatch.py`, `deathmatch.ts`, `deathmatch.java`, `deathmatch.pl`.

**3. Project Structure**

- `.bin/` contains all compiled binaries. Interpreted agents remain in the root folder.
- `.gitignore` includes `.bin/`.
- No additional scripts should be required; running `./server` should automatically compile, launch, pause, resume, and manage all agents.

**4. Execution Behavior**

- Start server with `./server`.
- Server compiles agents into `.bin/` if needed.
- Server launches all agents paused.
- Agents connect to server; once all are connected, server resumes execution.
- Agents perform kill logic as described.
- Server tracks kills and announces winner.
- Console output should include all agent logs and final winner announcement.

**5. Constraints:**

- Linux environment
- No external libraries for any language except Rust can use `libc`.
- Only use built-in networking, file, and process control features.
- All signals, concurrency, and networking must be handled safely.
- Compiled binaries must go into `.bin/`, interpreted scripts remain in root folder.

**Output:** Provide **all source code files** (server + seven agents), ready-to-run, fully functional. Include `.gitignore` file. Ensure `.bin/` folder is referenced properly and created automatically. Do not skip any agent or feature.
