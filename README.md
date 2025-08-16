# Deathmatch Agents

**Deathmatch Agents** is a framework for orchestrating processes written in any programming language. Agents compete in a controlled environment, pausing, resuming, and interacting according to server-coordinated rules. The goal: determine which language can outlast all others.

Currently, TypeScript/Node.js is used for prototyping, but the system is designed to support **agents in any language**, making it a flexible platform for cross-language competition.

---

## **Purpose**

The project allows you to:

- Launch and coordinate multiple agent processes in any language.
- Pause (`SIGTSTP`) and resume (`SIGCONT`) agent processes from a central server.
- Observe process behavior and CPU allocation in real-time.
- Track agent processes and command-line arguments using `ps`.
- Maintain readable and colored console logs for both the server and agents.

**Core Concept:**

> Agents compete in a deathmatch under server orchestration. Once the rules and mechanics are solid, agents in any language can participate, testing strategy, execution, and resilience.

---

## **Requirements**

- **Node.js** (v18+) — used to run the server and prototype agents.
- **Bun** (v1+) — used for Bun-based agents in the current prototype.
- Both must be installed and available in your system `PATH`.

---

## **Project Structure**

```text
.
├── central.ts      # Server orchestrating agents
├── deathmatch.ts   # Agent process code
└── README.md       # Project documentation
```

- **central.ts**: Launches agents, sends pause/resume signals, and logs server events.
- **deathmatch.ts**: Simulates a long-running agent, handles signals, logs tasks, and performs CPU-yielding operations.

---

## **Features**

- Centralized server to manage all agents.
- Agents respond to OS signals (`SIGTSTP`, `SIGCONT`) with custom handlers.
- Colored logging for clear differentiation of agents.
- Optional sleepable syscalls to yield CPU when resuming.
- Process introspection using `ps` for PID and command-line arguments.
- Designed to **support multi-language deathmatches**, letting agents compete under server orchestration.

---

## **Getting Started**

1. Clone the repository:

```bash
git clone https://github.com/mikelneonedwin/deathmatch-agents
cd deathmatch-agents
```

2. Install dependencies (Node.js / Bun):

```bash
npm install
# or
bun install
```

3. Launch the server:

```bash
bun central.ts
# or
node central.ts
```

- The server will launch all agents, manage execution via signals, and track their progress in real time.

---

## **Logging & Output**

- Server logs are **dimmed** for clarity: `[Server] ...`
- Agent logs are **colored** according to their assigned ANSI codes: `[Bun] ...`, `[Node] ...`
- Agents log activation, pauses, resumes, and periodic task execution.
- Agents can perform **sleepable syscalls** to yield CPU immediately upon resuming.
- The framework can display **all active agents**, including PID and full startup command.

---

## **Use Cases**

- Experimenting with **cross-language process orchestration**.
- Demonstrating **cooperative vs preemptive multitasking**.
- Observing **real-time CPU scheduling and process behavior**.
- Prototyping multi-language “deathmatch” competitions.
