#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const SOURCE_DIRS = {
  skill: "skills",
  command: "commands",
  agent: "agents",
  workflow: "workflows",
};

const ALLOWED_REFS = {
  skill: [],
  command: ["skill"],
  agent: ["skill", "command"],
  workflow: ["skill", "command", "agent"],
};

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  const fmBlock = match[1];

  for (const line of fmBlock.split("\n")) {
    const ci = line.indexOf(":");
    if (ci === -1) continue;
    const key = line.slice(0, ci).trim();
    const value = line.slice(ci + 1).trim();
    if (["layer", "name", "version", "description"].includes(key)) {
      fm[key] = value;
    }
  }

  fm.uses = [];
  if (fmBlock.match(/^uses:/m)) {
    const usesMatch = fmBlock.match(/^uses:\n((?:\s+-\s+.*\n?)*)/m);
    if (usesMatch) {
      fm.uses = usesMatch[1].split("\n").map(l => l.replace(/^\s+-\s+/, "").trim()).filter(Boolean);
    }
  }

  fm.external = [];
  const extIdx = fmBlock.indexOf("external:");
  if (extIdx !== -1) {
    const extLines = fmBlock.slice(extIdx + "external:".length).split("\n");
    let current = null;
    for (const line of extLines) {
      if (/^\S/.test(line) && line.trim() !== "") break;
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("- ")) {
        if (current) fm.external.push(current);
        current = {};
        const first = trimmed.slice(2);
        const ci = first.indexOf(":");
        if (ci !== -1) {
          const k = first.slice(0, ci).trim();
          let v = first.slice(ci + 1).trim();
          if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
          current[k] = v;
        }
      } else if (current) {
        const ci = trimmed.indexOf(":");
        if (ci !== -1) {
          const k = trimmed.slice(0, ci).trim();
          let v = trimmed.slice(ci + 1).trim();
          if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
          current[k] = v;
        }
      }
    }
    if (current) fm.external.push(current);
  }

  return fm;
}

function satisfies(version, range) {
  if (range === "*") return true;
  const [major, minor, patch] = version.split(".").map(Number);
  const rv = range.replace(/^[\^~]/, "");
  const [rM, rm, rp] = rv.split(".").map(Number);
  const p = range[0];
  if (p === "^") {
    if (rM === 0 && rm === 0) return major === 0 && minor === 0 && patch >= rp;
    if (rM === 0) return major === 0 && minor === rm && patch >= rp;
    return major === rM && (minor > rm || (minor === rm && patch >= rp));
  }
  if (p === "~") return major === rM && minor === rm && patch >= rp;
  return version === range;
}

function findSkillEntries(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const skillMd = path.join(fullPath, "SKILL.md");
      if (fs.existsSync(skillMd)) {
        results.push(skillMd);
      } else {
        results.push(...findSkillEntries(fullPath));
      }
    }
  }
  return results;
}

function buildName(layer, relPath) {
  const segments = relPath.split(/[\\/]/).filter(Boolean);
  return `${layer}-${segments.join("-")}`;
}

function main() {
  const errors = [];
  const warnings = [];
  const allFiles = new Map();

  for (const [layer, dir] of Object.entries(SOURCE_DIRS)) {
    const dirPath = path.join(ROOT, dir);
    const files = findSkillEntries(dirPath);

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, "utf-8");
      const fm = parseFrontmatter(content);
      const rel = path.relative(ROOT, filePath);
      const skillDir = path.dirname(filePath);
      const relFromLayer = path.relative(dirPath, skillDir);
      const dirName = path.basename(skillDir);

      if (!fm) { errors.push(`${rel}: missing frontmatter`); continue; }
      if (!fm.layer) errors.push(`${rel}: missing 'layer'`);
      if (!fm.name) errors.push(`${rel}: missing 'name'`);
      if (!fm.version) errors.push(`${rel}: missing 'version'`);
      if (!fm.description) warnings.push(`${rel}: missing 'description'`);

      // layer must match directory
      if (fm.layer && fm.layer !== layer) {
        errors.push(`${rel}: layer '${fm.layer}' does not match directory '${dir}' (expected '${layer}')`);
      }

      // directory name must match frontmatter name
      if (fm.name && fm.name !== dirName) {
        errors.push(`${rel}: directory name '${dirName}' does not match frontmatter name '${fm.name}'`);
      }

      // Check build name uniqueness
      const bName = buildName(layer, relFromLayer);

      // Validate external
      for (const ext of fm.external) {
        if (!ext.type) { errors.push(`${rel}: external entry missing 'type'`); continue; }
        if (ext.type === "library" && !ext.name) errors.push(`${rel}: external library missing 'name'`);
        else if (ext.type === "url" && !ext.href) errors.push(`${rel}: external url missing 'href'`);
        else if (!["library", "url"].includes(ext.type)) errors.push(`${rel}: external type '${ext.type}' invalid`);
      }

      if (fm.name && fm.version) {
        allFiles.set(`${layer}/${fm.name}`, {
          version: fm.version, layer, path: rel,
          uses: fm.uses, buildName: bName,
        });
      }
    }
  }

  // Check build name uniqueness
  const buildNames = new Map();
  for (const [id, file] of allFiles) {
    if (buildNames.has(file.buildName)) {
      errors.push(`${file.path}: build name '${file.buildName}' conflicts with ${buildNames.get(file.buildName)}`);
    }
    buildNames.set(file.buildName, file.path);
  }

  // Validate dependencies
  for (const [id, file] of allFiles) {
    for (const use of file.uses) {
      const match = use.match(/^(\w+)\/(.+?)(?:@(.+))?$/);
      if (!match) { errors.push(`${file.path}: invalid uses reference '${use}'`); continue; }
      const [, refLayer, refName, range] = match;

      const allowed = ALLOWED_REFS[file.layer] || [];
      if (!allowed.includes(refLayer)) {
        errors.push(`${file.path}: '${file.layer}' cannot reference '${refLayer}' (allowed: ${allowed.join(", ") || "none"})`);
      }

      const targetId = `${refLayer}/${refName}`;
      const target = allFiles.get(targetId);
      if (!target) { errors.push(`${file.path}: references '${targetId}' which does not exist`); continue; }

      if ((range || "*") !== "*" && !satisfies(target.version, range)) {
        errors.push(`${file.path}: requires '${use}' but found version ${target.version} (incompatible)`);
      }
    }
  }

  // Report
  console.log(`\n📋 subagents validate: ${allFiles.size} files scanned\n`);
  if (warnings.length > 0) {
    console.log(`⚠ ${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  - ${w}`);
    console.log();
  }
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} error(s):`);
    for (const e of errors) console.log(`  - ${e}`);
    console.log();
    process.exit(1);
  }
  console.log("✅ All checks passed\n");
}

main();
