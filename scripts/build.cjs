#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

// Source layer → output target
const LAYER_OUTPUT = {
  skill: "skills",    // → dist/skills/
  command: "skills",  // → dist/skills/
  agent: "agents",    // → dist/agents/
  workflow: "agents", // → dist/agents/
};

const SOURCE_DIRS = {
  skill: "skills",
  command: "commands",
  agent: "agents",
  workflow: "workflows",
};

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split("\n")) {
    const ci = line.indexOf(":");
    if (ci === -1) continue;
    const key = line.slice(0, ci).trim();
    const value = line.slice(ci + 1).trim();
    if (["name", "layer", "version", "description"].includes(key)) {
      fm[key] = value;
    }
  }
  return fm;
}

function updateFrontmatterName(content, newName) {
  return content.replace(/^(name:\s*).+$/m, `$1${newName}`);
}

function findSkillEntries(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Check if this directory contains a SKILL.md (directory-based skill)
      const skillMd = path.join(fullPath, "SKILL.md");
      if (fs.existsSync(skillMd)) {
        // Collect companion files (non-SKILL.md files in same directory)
        const companions = [];
        const dirEntries = fs.readdirSync(fullPath, { withFileTypes: true });
        for (const de of dirEntries) {
          if (de.isFile() && de.name !== "SKILL.md") {
            companions.push(path.join(fullPath, de.name));
          }
        }
        results.push({ skillMd, companions });
      } else {
        // Recurse into subdirectory
        results.push(...findSkillEntries(fullPath));
      }
    }
  }
  return results;
}

function buildName(layer, relPath) {
  // relPath: "convention/commit-message" → segments: ["convention", "commit-message"]
  const segments = relPath.split(/[\\/]/).filter(Boolean);
  return `${layer}-${segments.join("-")}`;
}

function main() {
  // Clean dist
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
  fs.mkdirSync(path.join(DIST, "skills"), { recursive: true });
  fs.mkdirSync(path.join(DIST, "agents"), { recursive: true });

  const built = [];
  const names = new Set();

  for (const [layer, sourceDir] of Object.entries(SOURCE_DIRS)) {
    const dirPath = path.join(ROOT, sourceDir);
    const entries = findSkillEntries(dirPath);

    for (const { skillMd, companions } of entries) {
      const content = fs.readFileSync(skillMd, "utf-8");
      const fm = parseFrontmatter(content);
      if (!fm) {
        console.log(`  ⚠ ${path.relative(ROOT, skillMd)}: no frontmatter, skipped`);
        continue;
      }

      // relPath is the directory path relative to source dir
      const skillDir = path.dirname(skillMd);
      const relPath = path.relative(dirPath, skillDir);
      const outName = buildName(layer, relPath);

      if (names.has(outName)) {
        console.error(`  ❌ Duplicate build name: ${outName}`);
        process.exit(1);
      }
      names.add(outName);

      const outputDir = LAYER_OUTPUT[layer];
      const updatedContent = updateFrontmatterName(content, outName);

      if (outputDir === "skills") {
        // Skills output: dist/skills/{outName}/SKILL.md + companions
        const outDir = path.join(DIST, "skills", outName);
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, "SKILL.md"), updatedContent);

        // Copy companion files
        for (const comp of companions) {
          const compName = path.basename(comp);
          fs.copyFileSync(comp, path.join(outDir, compName));
        }
      } else {
        // Agents output: dist/agents/{outName}.md
        fs.writeFileSync(path.join(DIST, "agents", `${outName}.md`), updatedContent);
        if (companions.length > 0) {
          console.log(`  ⚠ ${path.relative(ROOT, skillMd)}: agent/workflow companion files are not supported, ignored`);
        }
      }

      built.push({
        source: path.relative(ROOT, skillMd),
        buildName: outName,
        target: outputDir === "skills"
          ? `dist/skills/${outName}/SKILL.md`
          : `dist/agents/${outName}.md`,
        companions: companions.map(c => path.basename(c)),
      });
    }
  }

  // Copy plugin.json
  const pluginSrc = path.join(ROOT, ".claude-plugin", "plugin.json");
  if (fs.existsSync(pluginSrc)) {
    const pluginDist = path.join(DIST, ".claude-plugin");
    fs.mkdirSync(pluginDist, { recursive: true });
    fs.copyFileSync(pluginSrc, path.join(pluginDist, "plugin.json"));
  }

  // Report
  console.log(`\n🔨 subagents build: ${built.length} files\n`);
  for (const b of built) {
    console.log(`  ${b.source}`);
    console.log(`    → ${b.target} (name: ${b.buildName})`);
    if (b.companions.length > 0) {
      console.log(`    + ${b.companions.join(", ")}`);
    }
    console.log();
  }
  console.log("✅ Build complete\n");
}

main();
