import { WebWorkerMLCEngineHandler } from "./webllm.js";
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => handler.onmessage(msg);
