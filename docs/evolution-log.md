# Evolution Log

This document tracks structural changes, architectural decisions, and the reasoning behind them. It serves as a historical record of how and why the repository evolved.

## Format

Each entry should include:
- **Date**: When the change was made
- **Change**: What was changed
- **Reasoning**: Why the change was made
- **Impact**: How it affects usage or maintenance

---

## 2025-01-15: Initial Repository Structure

**Change**: Created foundational structure with three agent categories

**Structure**:
```
zerovoids-subagents/
├── agents/
│   ├── core/          # Created
│   ├── specialized/   # Created
│   └── meta/         # Created
├── bin/
├── docs/
├── profiles/
└── examples/
```

**Reasoning**:
- **core/**: Need category for universally useful agents
- **specialized/**: Anticipate framework-specific agents
- **meta/**: Self-management principle - repository manages itself
- **Three categories**: Simple enough to start, flexible for growth

**Impact**:
- Clear mental model for contributors
- Easy navigation
- Room for growth without premature complexity

---

## 2025-01-15: Agent Template Design

**Change**: Created comprehensive `_template.md` with extensive structure

**Key Sections**:
- Frontmatter with metadata
- Clear role definition
- Specific trigger conditions
- Responsibilities (primary/secondary)
- Approach & best practices
- Concrete examples
- Explicit limitations
- Related agents

**Reasoning**:
- **Consistency**: All agents follow same structure
- **Discoverability**: Description is the interface
- **Quality**: Forces thorough thinking
- **Maintenance**: Examples serve as documentation and tests

**Impact**:
- Higher quality agents from the start
- Easier for contributors to create good agents
- Self-documenting system

---

## 2025-01-15: Bash Scripts with No Extensions

**Change**: Scripts in `bin/` have no file extensions (e.g., `setup` not `setup.sh`)

**Reasoning**:
- Unix convention for executables
- Cleaner command invocation: `./bin/setup` vs `./bin/setup.sh`
- Implementation detail hidden (could be bash, python, etc.)
- Feels more professional and polished

**Impact**:
- Requires `chmod +x bin/*` after clone
- More consistent with system commands
- Better developer experience

---

## 2025-01-15: Profiles as JSON

**Change**: Agent combinations stored as JSON files in `profiles/`

**Format**:
```json
{
  "name": "profile-name",
  "description": "...",
  "agents": {
    "core": ["agent1", "agent2"],
    "specialized": ["agent3"]
  }
}
```

**Reasoning**:
- **Machine-readable**: Easy to parse and validate
- **Extensible**: Can add settings, metadata
- **Standard**: JSON is universal
- **Simple**: No custom format needed

**Impact**:
- Easy to create preset combinations
- Scriptable profile management
- Clear structure for contributors

---

## 2025-01-15: First Core Agent - code-reviewer

**Change**: Created first production agent in `core/`

**Rationale for "core" placement**:
- Works with any language/framework
- Universally useful
- No special dependencies
- Demonstrates template usage

**Impact**:
- Provides concrete example for contributors
- Immediately useful for any project
- Sets quality bar for future agents

---

## 2025-01-15: First Meta Agent - zerovoids-repo-manager

**Change**: Created self-management agent in `meta/`

**Capabilities**:
- Validate agent structure
- Generate documentation
- Maintain quality standards
- Guide evolution

**Reasoning**:
- **Self-hosting principle**: Use our own tools
- **Quality assurance**: Automated checks
- **Documentation**: Auto-generation
- **Philosophy**: Repository manages itself

**Impact**:
- Can use Claude Code to maintain this repository
- Sets precedent for automation
- Demonstrates meta-level thinking

---

## Future Entries

As the repository evolves, document:
- New categories added (and why)
- Structural refactorings
- Major agent additions
- Breaking changes
- Pattern discoveries
- Architecture pivots

---

**Note**: This log is not for minor changes (typos, small fixes) but for structural and architectural decisions that affect how the repository works.
