import { execFile } from "node:child_process";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getDocsPageLastModified(
  slug: string[] | undefined,
): Promise<Date | undefined> {
  const docsRoot = await findDocsRoot();
  if (docsRoot === undefined) return undefined;

  const filePath = await findDocsPageFile(docsRoot, slug);
  if (filePath === undefined) return undefined;

  return (await getGitLastModified(filePath, docsRoot)) ?? getFileModified(filePath);
}

async function findDocsRoot(): Promise<string | undefined> {
  const candidates = [
    path.join(process.cwd(), "content", "docs"),
    path.join(process.cwd(), "apps", "docs", "content", "docs"),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next possible workspace cwd.
    }
  }

  return undefined;
}

async function findDocsPageFile(
  docsRoot: string,
  slug: string[] | undefined,
): Promise<string | undefined> {
  const segments = slug ?? [];
  const candidates =
    segments.length === 0
      ? [path.join(docsRoot, "index.mdx")]
      : [
          path.join(docsRoot, ...segments) + ".mdx",
          path.join(docsRoot, ...segments, "index.mdx"),
        ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the route-index fallback.
    }
  }

  return undefined;
}

async function getGitLastModified(
  filePath: string,
  cwd: string,
): Promise<Date | undefined> {
  try {
    const { stdout: root } = await execFileAsync("git", [
      "-C",
      cwd,
      "rev-parse",
      "--show-toplevel",
    ]);
    const gitRoot = root.trim();
    const relativePath = path.relative(gitRoot, filePath);
    const { stdout } = await execFileAsync("git", [
      "-C",
      gitRoot,
      "log",
      "-1",
      "--format=%cI",
      "--",
      relativePath,
    ]);
    const value = stdout.trim();
    if (value.length === 0) return undefined;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

async function getFileModified(filePath: string): Promise<Date | undefined> {
  try {
    return (await stat(filePath)).mtime;
  } catch {
    return undefined;
  }
}
