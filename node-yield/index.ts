import { createRequire } from "module";
const require = createRequire(import.meta.url);

export const { sleepMain, yieldMain } =
  require("./build/Release/yield_main.node") as {
    sleepMain: (milliseconds: number) => void;
    yieldMain: () => void;
  };
