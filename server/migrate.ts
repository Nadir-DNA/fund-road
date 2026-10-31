import { readFile } from "node:fs/promises";
import { auth } from "./auth.ts";
import { db } from "./db.ts";
await (await auth.$context).runMigrations();
await db.query(
  await readFile(new URL("./schema.sql", import.meta.url), "utf8"),
);
console.log("Schémas authentification et Fund Road prêts");
await db.end();
