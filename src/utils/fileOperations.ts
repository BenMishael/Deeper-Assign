/**
 * File operations utilities
 */

import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Create a backup of a file before modifying it
 */
export async function createBackup(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      const backupPath = `${filePath}.backup`;
      const content = await fs.readFile(filePath, "utf-8");
      await fs.writeFile(backupPath, content, "utf-8");
      console.log(`✅ Backup created: ${path.basename(backupPath)}`);
    }
  } catch (error) {
    console.warn("⚠️  Failed to create backup:", error);
    // Don't throw - backup failure shouldn't prevent save
  }
}

/**
 * Read and parse JSON file safely
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Write JSON file with formatting
 */
export async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await fs.writeFile(
    filePath,
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

