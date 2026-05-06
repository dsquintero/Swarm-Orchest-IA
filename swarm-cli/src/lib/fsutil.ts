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

// Shared stdin line reader — buffers data across sequential calls
let _stdinBuffer = '';
let _stdinPending: ((line: string) => void)[] = [];
let _stdinReady = false;

function _initStdin() {
  if (_stdinReady) return;
  _stdinReady = true;
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk: string) => {
    _stdinBuffer += chunk;
    _tryFlush();
  });
  process.stdin.on('end', () => {
    if (_stdinBuffer.trim() && _stdinPending.length > 0) {
      const resolve = _stdinPending.shift()!;
      resolve(_stdinBuffer.trim());
      _stdinBuffer = '';
    }
  });
}

function _tryFlush() {
  while (_stdinBuffer.includes('\n') && _stdinPending.length > 0) {
    const idx = _stdinBuffer.indexOf('\n');
    const line = _stdinBuffer.slice(0, idx).trim();
    _stdinBuffer = _stdinBuffer.slice(idx + 1);
    const resolve = _stdinPending.shift()!;
    resolve(line);
  }
}

function _readLine(): Promise<string> {
  _initStdin();
  return new Promise((resolve) => {
    if (_stdinBuffer.includes('\n')) {
      const idx = _stdinBuffer.indexOf('\n');
      const line = _stdinBuffer.slice(0, idx).trim();
      _stdinBuffer = _stdinBuffer.slice(idx + 1);
      resolve(line);
    } else {
      _stdinPending.push(resolve);
    }
  });
}

export function askYesNo(question: string, defaultValue: boolean = false): Promise<boolean> {
  const prompt = defaultValue ? ' [Y/n]: ' : ' [y/N]: ';
  process.stdout.write(question + prompt);
  return _readLine().then((answer) => {
    if (answer === '') return defaultValue;
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
  });
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
  return fs.existsSync(path.join(projectDir, '.swarm.yaml'));
}

export function askChoice(question: string, options: string[], defaultIndex: number = 0): Promise<number> {
  process.stdout.write(question + '\n');
  options.forEach((opt, i) => process.stdout.write(`  ${i + 1}) ${opt}\n`));
  process.stdout.write(`\nChoose [${defaultIndex + 1}]: `);
  return _readLine().then((answer) => {
    const num = parseInt(answer, 10);
    if (isNaN(num) || num < 1 || num > options.length) return defaultIndex;
    return num - 1;
  });
}