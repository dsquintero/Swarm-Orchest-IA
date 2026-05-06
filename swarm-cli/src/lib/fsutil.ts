import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

export function createSymlink(target: string, link: string): void {
  fs.mkdirSync(path.dirname(link), { recursive: true });
  if (fs.existsSync(link)) fs.unlinkSync(link);
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

export function askYesNo(question: string, defaultValue: boolean = false): Promise<boolean> {
  const prompt = defaultValue ? ' [Y/n]: ' : ' [y/N]: ';
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question + prompt, (answer: string) => {
      rl.close();
      const lower = answer.trim().toLowerCase();
      if (lower === '') resolve(defaultValue);
      resolve(lower === 'y' || lower === 'yes');
    });
  });
}

export function askChoice(question: string, options: string[], defaultIndex: number = 0): Promise<number> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    console.log(question);
    options.forEach((opt, i) => console.log(`  ${i + 1}) ${opt}`));
    rl.question(`\nChoose [${defaultIndex + 1}]: `, (answer: string) => {
      rl.close();
      const num = parseInt(answer.trim(), 10);
      if (isNaN(num) || num < 1 || num > options.length) resolve(defaultIndex);
      resolve(num - 1);
    });
  });
}