import "dotenv/config";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let appHandler: any;

try {
  const server = require("../dist/server.cjs");
  appHandler = server.default || server;
} catch (err) {
  console.error("Failed to load dist/server.cjs:", err);
  const serverModule = require("../app");
  appHandler = serverModule.default || serverModule;
}

export default appHandler;

