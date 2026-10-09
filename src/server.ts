 import { loadEnvFile } from "node:process";
import { buildApp } from "./app.js";

loadEnvFile();

const PORT = Number(process.env.PORT ?? 3000);

const app = buildApp();

try {
  await app.listen({ port: PORT });
  console.log(`השרת רץ על http://localhost:${PORT}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}