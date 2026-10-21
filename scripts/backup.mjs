import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import {
  mkdir,
  readFile,
  writeFile,
  mkdtemp,
  rm,
  open,
  cp,
} from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { spawn } from "node:child_process";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { tmpdir } from "node:os";
const docker = process.env.DOCKER_BIN || "docker";
function command(name, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(name, args, {
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });
    child.stdout.resume();
    const err = [];
    child.stderr.on("data", (x) => err.push(x));
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve(child)
        : reject(
            new Error(
              `${name} a échoué (${code}): ${Buffer.concat(err).toString().slice(0, 500)}`,
            ),
          ),
    );
  });
}
const keyPath = path.resolve(
  process.env.BACKUP_KEY_FILE || ".local/backup.key",
);
const mode = process.argv[2] || "create";
if (mode === "create") {
  await mkdir(path.dirname(keyPath), { recursive: true, mode: 0o700 });
  try {
    await writeFile(keyPath, randomBytes(32), { flag: "wx", mode: 0o600 });
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
  const key = await readFile(keyPath);
  if (key.length !== 32) throw new Error("Clé de sauvegarde invalide");
  const dir = await mkdtemp(path.join(tmpdir(), "fundroad-backup-"));
  try {
    const dumpPath = path.join(dir, "database.dump");
    const output = createWriteStream(dumpPath, { mode: 0o600 });
    const child = spawn(
      docker,
      [
        "compose",
        "--env-file",
        ".env.local",
        "-p",
        "fundroad-v2",
        "exec",
        "-T",
        "db",
        "pg_dump",
        "-U",
        "fundroad",
        "-d",
        "fundroad",
        "-Fc",
      ],
      { stdio: ["ignore", "pipe", "inherit"] },
    );
    const exited = new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("exit", (c) =>
        c === 0 ? resolve() : reject(new Error("Échec pg_dump")),
      );
    });
    await Promise.all([pipeline(child.stdout, output), exited]);
    await cp(
      path.resolve(process.env.DATA_DIR || ".local/documents"),
      path.join(dir, "documents"),
      { recursive: true },
    );
    await writeFile(
      path.join(dir, "manifest.json"),
      JSON.stringify({
        format: 1,
        createdAt: new Date().toISOString(),
        database: "fundroad",
        note: "Copie locale cohérente si les écritures sont arrêtées pendant la sauvegarde.",
      }),
    );
    const tar = path.join(dir, "archive.tar");
    await command("tar", [
      "-cf",
      tar,
      "-C",
      dir,
      "database.dump",
      "documents",
      "manifest.json",
    ]);
    const nonce = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", key, nonce);
    const destination = path.resolve(
      process.argv[3] || `.local/backups/fundroad-${Date.now()}.frbackup`,
    );
    await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
    const out = createWriteStream(destination, { flags: "wx", mode: 0o600 });
    out.write(Buffer.concat([Buffer.from("FRBACK01"), nonce]));
    await pipeline(createReadStream(tar), cipher, out);
    const append = createWriteStream(destination, { flags: "a" });
    append.end(cipher.getAuthTag());
    await new Promise((r, j) => {
      append.on("finish", r);
      append.on("error", j);
    });
    console.log(
      `Sauvegarde chiffrée : ${destination}\nConservez la clé séparément : ${keyPath}`,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
} else if (mode === "verify" || mode === "restore-test") {
  const file = process.argv[3];
  if (!file) throw new Error("Usage : backup.mjs verify fichier.frbackup");
  const handle = await open(file, "r");
  const size = (await handle.stat()).size;
  const header = Buffer.alloc(20),
    tag = Buffer.alloc(16);
  try {
    if (size < 36) throw new Error("Archive tronquée");
    await handle.read(header, 0, 20, 0);
    await handle.read(tag, 0, 16, size - 16);
  } finally {
    await handle.close();
  }
  if (header.subarray(0, 8).toString() !== "FRBACK01")
    throw new Error("Format inconnu");
  const key = await readFile(keyPath),
    decipher = createDecipheriv("aes-256-gcm", key, header.subarray(8));
  decipher.setAuthTag(tag);
  const dir = await mkdtemp(path.join(tmpdir(), "fundroad-verify-"));
  try {
    const archive = path.join(dir, "backup.tar");
    await pipeline(
      createReadStream(file, { start: 20, end: size - 17 }),
      decipher,
      createWriteStream(archive, { mode: 0o600 }),
    );
    await command("tar", ["-tf", archive]);
    if (mode === "restore-test") {
      await command("tar", [
        "-xf",
        archive,
        "-C",
        dir,
        "database.dump",
        "manifest.json",
      ]);
      const database = "fundroad_restore_" + randomBytes(6).toString("hex");
      const prefix = [
        "compose",
        "--env-file",
        ".env.local",
        "-p",
        "fundroad-v2",
        "exec",
        "-T",
        "db",
      ];
      await command(docker, [
        ...prefix,
        "createdb",
        "-U",
        "fundroad",
        "-T",
        "template0",
        database,
      ]);
      try {
        const child = spawn(
          docker,
          [
            ...prefix,
            "pg_restore",
            "-U",
            "fundroad",
            "-d",
            database,
            "--exit-on-error",
            "--no-owner",
          ],
          { stdio: ["pipe", "ignore", "inherit"] },
        );
        const ended = new Promise((resolve, reject) => {
          child.on("error", reject);
          child.on("exit", (code) =>
            code === 0
              ? resolve()
              : reject(new Error("Restauration de test échouée")),
          );
        });
        await Promise.all([
          pipeline(
            createReadStream(path.join(dir, "database.dump")),
            child.stdin,
          ),
          ended,
        ]);
        await command(docker, [
          ...prefix,
          "psql",
          "-U",
          "fundroad",
          "-d",
          database,
          "-v",
          "ON_ERROR_STOP=1",
          "-c",
          'SELECT count(*) FROM dossiers; SELECT count(*) FROM documents; SELECT count(*) FROM "user";',
        ]);
        console.log(
          "Restauration PostgreSQL vérifiée dans une base temporaire isolée. La base active n’a pas été modifiée.",
        );
      } finally {
        await command(docker, [
          ...prefix,
          "dropdb",
          "-U",
          "fundroad",
          database,
        ]);
      }
    } else
      console.log(
        "Intégrité cryptographique et archive vérifiées. Utilisez restore-test pour vérifier PostgreSQL.",
      );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
} else throw new Error("Mode create ou verify requis");
