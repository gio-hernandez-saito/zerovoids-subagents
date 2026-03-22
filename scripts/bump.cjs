#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIRS = { skill: "skills", command: "commands", agent: "agents", workflow: "workflows" };

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split("\n")) {
    const ci = line.indexOf(":");
    if (ci === -1) continue;
    const k = line.slice(0, ci).trim(), v = line.slice(ci + 1).trim();
    if (["layer", "name", "version", "description"].includes(k)) fm[k] = v;
  }
  fm.uses = [];
  if (match[1].match(/^uses:/m)) {
    const m = match[1].match(/^uses:\n((?:\s+-\s+.*\n?)*)/m);
    if (m) fm.uses = m[1].split("\n").map(l => l.replace(/^\s+-\s+/, "").trim()).filter(Boolean);
  }
  return fm;
}

function bumpVersion(v, t) {
  const [M, m, p] = v.split(".").map(Number);
  if (t === "major") return `${M + 1}.0.0`;
  if (t === "minor") return `${M}.${m + 1}.0`;
  return `${M}.${m}.${p + 1}`;
}

function satisfies(ver, range) {
  if (range === "*") return true;
  const [M, m, p] = ver.split(".").map(Number);
  const rv = range.replace(/^[\^~]/, "");
  const [rM, rm, rp] = rv.split(".").map(Number);
  const px = range[0];
  if (px === "^") {
    if (rM === 0 && rm === 0) return M === 0 && m === 0 && p >= rp;
    if (rM === 0) return M === 0 && m === rm && p >= rp;
    return M === rM && (m > rm || (m === rm && p >= rp));
  }
  if (px === "~") return M === rM && m === rm && p >= rp;
  return ver === range;
}

function findMdFiles(dir) {
  const r = [];
  if (!fs.existsSync(dir)) return r;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) r.push(...findMdFiles(f));
    else if (e.name.endsWith(".md")) r.push(f);
  }
  return r;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("\nUsage: node scripts/bump.js <layer/name> <patch|minor|major>");
    console.log("Example: node scripts/bump.js skill/commit-format major\n");
    process.exit(1);
  }
  const [target, type] = args;
  if (!["patch", "minor", "major"].includes(type)) { console.error(`\n❌ Invalid: ${type}\n`); process.exit(1); }
  const si = target.indexOf("/");
  if (si === -1) { console.error(`\n❌ Format: layer/name\n`); process.exit(1); }
  const tLayer = target.slice(0, si), tName = target.slice(si + 1);

  // Find all files
  const allFiles = [];
  for (const [layer, dir] of Object.entries(SOURCE_DIRS)) {
    for (const fp of findMdFiles(path.join(ROOT, dir))) {
      const c = fs.readFileSync(fp, "utf-8");
      const fm = parseFrontmatter(c);
      if (fm) allFiles.push({ path: fp, content: c, fm, layer });
    }
  }

  // Find target
  const tf = allFiles.find(f => f.fm.name === tName && f.fm.layer === tLayer);
  if (!tf) { console.error(`\n❌ Not found: ${target}\n`); process.exit(1); }

  const oldV = tf.fm.version, newV = bumpVersion(oldV, type);
  fs.writeFileSync(tf.path, tf.content.replace(`version: ${oldV}`, `version: ${newV}`));
  console.log(`\n✓ ${path.relative(ROOT, tf.path)}: ${oldV} → ${newV}\n`);

  // Find dependents
  const deps = [];
  for (const f of allFiles) {
    if (f.path === tf.path) continue;
    for (const use of f.fm.uses) {
      const m = use.match(/^(\w+)\/(.+?)(?:@(.+))?$/);
      if (!m) continue;
      if (m[1] === tLayer && m[2] === tName) {
        deps.push({ path: path.relative(ROOT, f.path), use, range: m[3] || "*", compatible: satisfies(newV, m[3] || "*") });
      }
    }
  }

  if (!deps.length) { console.log("ℹ 참조하는 파일 없음\n"); return; }
  const ok = deps.filter(d => d.compatible), ng = deps.filter(d => !d.compatible);
  if (ok.length) { console.log("✓ 호환:"); ok.forEach(d => console.log(`  ${d.path} (${d.use})`)); console.log(); }
  if (ng.length) {
    console.log("⚠ 호환 깨짐 (확인 필요):");
    ng.forEach(d => { console.log(`  ${d.path}`); console.log(`    ${d.use} → INCOMPATIBLE with ${newV}`); });
    console.log();
  }
}

main();
