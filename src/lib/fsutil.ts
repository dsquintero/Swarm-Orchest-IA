import * as fs from 'fs';
import * as path from 'path';

export function createSymlink(target: string, link: string): void {
  fs.mkdirSync(path.dirname(link), { recursive: true });
  if (fs.existsSync(link)) {
    try {
      const stat = fs.lstatSync(link);
      if (stat.isSymbolicLink() || stat.isFile()) {
        fs.unlinkSync(link);
      } else if (stat.isDirectory()) {
        fs.rmSync(link, { recursive: true });
      }
    } catch {
      fs.rmSync(link, { recursive: true, force: true });
    }
  }
  fs.symlinkSync(target, link);
}

export function copyFile(src: string, dst: string): void {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, fs.readFileSync(src));
}

export function copyDir(src: string, dst: string): void {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const dstPath = path.join(dst, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      copyFile(srcPath, dstPath);
    }
  }
}

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function resolveProjectDir(projectPath?: string): string {
  const dir = projectPath ? path.resolve(projectPath) : process.cwd();
  if (!fs.existsSync(dir)) {
    throw new Error(`Directory does not exist: ${dir}`);
  }
  if (!fs.statSync(dir).isDirectory()) {
    throw new Error(`Not a directory: ${dir}`);
  }
  return dir;
}

export function isInitialized(projectDir: string): boolean {
  return fs.existsSync(path.join(projectDir, '.soia', 'config.yaml'));
}