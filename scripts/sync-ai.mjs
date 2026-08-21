#!/usr/bin/env node
/**
 * know_ai 内容同步脚本
 *
 * 从 know_ai 仓库（GitHub）把最新正文复制进 src/content/ai/，供 build 时通过 Vite `?raw` 打包。
 * 用法：npm run sync:ai
 *
 * 源解析顺序：
 *   1. 环境变量 KNOW_AI_PATH（显式本地路径）
 *   2. 项目内镜像 know_ai/（已 gitignore），首次 clone、之后 git pull
 *   3. 兄弟目录 ../know_ai（GitHub 不可达时回退到本地工作副本）
 *
 * 纯 Node + git，可被 CI / GitHub Action 直接调用。
 */
import { execSync } from 'node:child_process';
import {
  cpSync,
  rmSync,
  mkdirSync,
  existsSync,
  statSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REPO_URL = 'https://github.com/oldman1969/know_ai';
const MIRROR = join(ROOT, 'know_ai');
const SIBLING = resolve(ROOT, '..', 'know_ai');
const DST = join(ROOT, 'src', 'content', 'ai');
// 快照放 node_modules/.cache（已被 .gitignore），用于报告相对上次的新增/删除
const SNAPSHOT = join(ROOT, 'node_modules', '.cache', 'ai-sync-snapshot.json');

// 复制规则：src 相对 know_ai → dst 相对 src/content/ai
const RULES = [
  { src: 'ai_theory/notes', dst: 'notes' },
  { src: 'ai_theory/deep-dives', dst: 'deep-dives' },
  { src: 'learn_agent', dst: 'agent' },
  { src: 'references', dst: 'references' },
  { src: 'ai_theory/code', dst: 'code' },
  { src: 'multimodal', dst: 'multimodal' },
];

// 排除项：README、全文提取、PDF 不打包
const EXCLUDE = new Set(['README.md', 'full.txt', 'udl_full.txt']);

function isKept(name) {
  if (EXCLUDE.has(name)) return false;
  if (name.endsWith('.pdf') || name.endsWith('.txt')) return false;
  return name.endsWith('.md') || name.endsWith('.m');
}

function collectFiles(dir, prefix = '') {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(p).isDirectory()) {
      out.push(...collectFiles(p, rel));
    } else if (isKept(name)) {
      out.push(rel);
    }
  }
  return out;
}

/** 保证项目内存在 know_ai 镜像：没有则 clone，有则 pull 最新。失败抛错。 */
function ensureMirror() {
  if (existsSync(join(MIRROR, '.git'))) {
    console.log('🔄 拉取 know_ai 最新提交（git pull）…');
    execSync('git pull --ff-only --quiet', { cwd: MIRROR, stdio: 'inherit' });
    return;
  }
  console.log(`📥 首次克隆 know_ai（${REPO_URL}）→ know_ai/`);
  execSync(`git clone "${REPO_URL}" "${MIRROR}"`, { stdio: 'inherit' });
}

/** 源路径：KNOW_AI_PATH > 项目内 GitHub 镜像 > 兄弟目录本地副本 */
function resolveSource() {
  if (process.env.KNOW_AI_PATH) return resolve(process.env.KNOW_AI_PATH);

  try {
    ensureMirror();
    return MIRROR;
  } catch (e) {
    console.warn(`⚠️  GitHub 不可达：${e.message?.trim()}`);
  }

  if (existsSync(join(SIBLING, '.git'))) {
    console.warn(`⚠️  回退到本地副本：${SIBLING}`);
    return SIBLING;
  }

  console.error('❌ 无法获取 know_ai 源：GitHub 不可达，且无本地副本。');
  console.error('   可选：设 KNOW_AI_PATH 指向本地 know_ai 仓库。');
  process.exit(1);
}

function main() {
  const SRC = resolveSource();
  if (!existsSync(SRC)) {
    console.error(`❌ 源目录不存在：${SRC}`);
    process.exit(1);
  }

  const oldSnapshot = existsSync(SNAPSHOT)
    ? JSON.parse(readFileSync(SNAPSHOT, 'utf8'))
    : { files: [] };
  const oldSet = new Set(oldSnapshot.files ?? []);

  let mdCount = 0;
  let mCount = 0;

  for (const rule of RULES) {
    const src = join(SRC, rule.src);
    const dst = join(DST, rule.dst);
    if (!existsSync(src)) {
      console.warn(`⚠️  跳过（源不存在）：${rule.src}`);
      continue;
    }
    rmSync(dst, { recursive: true, force: true });
    mkdirSync(dst, { recursive: true });
    cpSync(src, dst, {
      recursive: true,
      filter: (s) => statSync(s).isDirectory() || isKept(basename(s)),
    });
    for (const rel of collectFiles(dst)) {
      if (rel.endsWith('.m')) mCount++;
      else mdCount++;
    }
  }

  const newFiles = RULES.flatMap((r) => collectFiles(join(DST, r.dst), r.dst));
  const newSet = new Set(newFiles);
  const added = newFiles.filter((f) => !oldSet.has(f));
  const removed = [...oldSet].filter((f) => !newSet.has(f));

  mkdirSync(dirname(SNAPSHOT), { recursive: true });
  writeFileSync(SNAPSHOT, JSON.stringify({ files: newFiles }, null, 2));

  console.log(`✅ 同步完成：${mdCount} 篇 .md，${mCount} 个 .m`);
  if (added.length) {
    console.log(`\n新增 ${added.length} 个文件：`);
    added.forEach((f) => console.log(`  + ${f}`));
    console.log('  ↳ 新文章会自动派生标题(H1)与摘要(首段)，如需精修，在 src/content/ai/overrides.ts 加一行。');
  }
  if (removed.length) {
    console.log(`\n删除 ${removed.length} 个文件：`);
    removed.forEach((f) => console.log(`  - ${f}`));
  }
  if (!added.length && !removed.length) {
    console.log('  内容无变化。');
  }
}

main();
