import fs from "fs";
import path from "path";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);

type JsonPrimitive = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonPrimitive;
}
interface JsonArray extends Array<JsonPrimitive> {}

/**
 * Simple in-process mutex per file path using Promise queueing.
 * Note: this does not coordinate across multiple Node processes. For that, use OS-level file locks.
 */
const fileLocks: Map<string, Promise<void>> = new Map();

async function withFileLock<T>(
  filePath: string,
  fn: () => Promise<T>,
): Promise<T> {
  const prev = fileLocks.get(filePath) ?? Promise.resolve();
  let release: () => void;
  const next = new Promise<void>((res) => {
    release = res;
  });
  fileLocks.set(
    filePath,
    prev.then(() => next),
  );
  try {
    await prev;
    return await fn();
  } finally {
    // release
    release!();
    // cleanup if this is the last queued
    const current = fileLocks.get(filePath);
    if (current === next) fileLocks.delete(filePath);
  }
}

function ensureDirExists(dir: string) {
  return mkdir(dir, { recursive: true }).catch((err: any) => {
    if (err && err.code !== "EEXIST") throw err;
  });
}

export class JsonRepository<T extends JsonPrimitive | JsonObject | JsonArray> {
  private filePath: string;
  private tempSuffix = ".tmp";

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
  }

  private async ensureFile(initial: T) {
    const dir = path.dirname(this.filePath);
    await ensureDirExists(dir);
    try {
      await readFile(this.filePath, { encoding: "utf8" });
    } catch (err: any) {
      if (err && (err.code === "ENOENT" || err.code === "EISDIR")) {
        // create file with initial value
        await writeFile(this.filePath, JSON.stringify(initial, null, 2), {
          encoding: "utf8",
        });
      } else {
        throw err;
      }
    }
  }

  async read(): Promise<T> {
    return withFileLock(this.filePath, async () => {
      await this.ensureFile([] as unknown as T);
      const raw = await readFile(this.filePath, { encoding: "utf8" });
      return JSON.parse(raw) as T;
    });
  }

  async write(data: T): Promise<void> {
    return withFileLock(this.filePath, async () => {
      const tempPath = this.filePath + this.tempSuffix;
      // write to temp file first
      await writeFile(tempPath, JSON.stringify(data, null, 2), {
        encoding: "utf8",
      });
      // then rename (atomic on most OSes)
      await rename(tempPath, this.filePath);
    });
  }

  /**
   * Convenience: read-modify-write with a mutator that receives the current data.
   */
  async update(mutator: (current: T) => T | Promise<T>): Promise<void> {
    return withFileLock(this.filePath, async () => {
      await this.ensureFile([] as unknown as T);
      const raw = await readFile(this.filePath, { encoding: "utf8" });
      const current = JSON.parse(raw) as T;
      const next = await mutator(current);
      const tempPath = this.filePath + this.tempSuffix;
      await writeFile(tempPath, JSON.stringify(next, null, 2), {
        encoding: "utf8",
      });
      await rename(tempPath, this.filePath);
    });
  }
}

export default JsonRepository;
