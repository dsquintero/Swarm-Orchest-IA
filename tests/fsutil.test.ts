import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  ensureDir,
  copyFile,
  copyDir,
  resolveProjectDir,
  isInitialized,
} from '../src/lib/fsutil';

let tmp: string;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'soia-fsutil-'));
});

afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('ensureDir', () => {
  it('creates nested directories', () => {
    const dir = path.join(tmp, 'a', 'b', 'c');
    ensureDir(dir);
    expect(fs.statSync(dir).isDirectory()).toBe(true);
  });
});

describe('copyFile', () => {
  it('copies content and creates the parent directory', () => {
    const src = path.join(tmp, 'src.txt');
    const dst = path.join(tmp, 'out', 'dst.txt');
    fs.writeFileSync(src, 'hello');
    copyFile(src, dst);
    expect(fs.readFileSync(dst, 'utf-8')).toBe('hello');
  });
});

describe('copyDir', () => {
  it('recursively copies a directory tree', () => {
    const src = path.join(tmp, 'src');
    fs.mkdirSync(path.join(src, 'sub'), { recursive: true });
    fs.writeFileSync(path.join(src, 'a.txt'), 'A');
    fs.writeFileSync(path.join(src, 'sub', 'b.txt'), 'B');

    const dst = path.join(tmp, 'dst');
    copyDir(src, dst);

    expect(fs.readFileSync(path.join(dst, 'a.txt'), 'utf-8')).toBe('A');
    expect(fs.readFileSync(path.join(dst, 'sub', 'b.txt'), 'utf-8')).toBe('B');
  });
});

describe('resolveProjectDir', () => {
  it('resolves an existing directory to an absolute path', () => {
    expect(resolveProjectDir(tmp)).toBe(path.resolve(tmp));
  });

  it('defaults to cwd when no path is given', () => {
    expect(resolveProjectDir()).toBe(process.cwd());
  });

  it('throws when the directory does not exist', () => {
    expect(() => resolveProjectDir(path.join(tmp, 'missing'))).toThrow(/does not exist/);
  });

  it('throws when the path is a file, not a directory', () => {
    const file = path.join(tmp, 'file.txt');
    fs.writeFileSync(file, 'x');
    expect(() => resolveProjectDir(file)).toThrow(/Not a directory/);
  });
});

describe('isInitialized', () => {
  it('is false without .soia/config.yaml', () => {
    expect(isInitialized(tmp)).toBe(false);
  });

  it('is true once .soia/config.yaml exists', () => {
    fs.mkdirSync(path.join(tmp, '.soia'), { recursive: true });
    fs.writeFileSync(path.join(tmp, '.soia', 'config.yaml'), 'mode: local');
    expect(isInitialized(tmp)).toBe(true);
  });
});
