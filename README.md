# zerovoids-subagents

> Transforming shattered fragments into a cosmos

A curated collection of [Claude Code](https://docs.anthropic.com/en/docs/claude-code) subagents for modern development workflows.

## Philosophy

This repository embodies the philosophy of **turning scattered experiences and fragmented knowledge into a cohesive, reusable system**. Each subagent represents a crystallized pattern, ready to be deployed across projects.

## What are Subagents?

Subagents are specialized AI assistants in Claude Code that handle specific types of tasks. Each runs in its own context with:
- Custom system prompts
- Specific tool access
- Independent permissions
- Focused expertise

When Claude Code encounters a matching task, it delegates to the appropriate subagent automatically.

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/gio-hernandez-saito/zerovoids-subagents.git
cd zerovoids-subagents

# Install dependencies (sets up git hooks)
npm install

# Link to your project
./bin/setup /path/to/your/project

# Or install globally
./bin/setup --global
```

### Usage

Once installed, Claude Code will automatically use these agents when appropriate:

```bash
cd your-project
claude "review my recent changes"        # Uses code-reviewer agent
claude "debug this error"                # Uses debugger agent
claude "optimize this component"         # Uses appropriate specialized agent
```

You can also explicitly request specific agents:

```bash
claude "use the react-expert agent to refactor this component"
```

## Repository Structure

```
zerovoids-subagents/
├── agents/              # Agent definitions
│   ├── core/           # Framework-agnostic agents
│   ├── specialized/    # Domain-specific agents
│   └── meta/          # Repository management agents
├── bin/               # Utility scripts
├── profiles/          # Agent combination presets
├── docs/             # Documentation
└── examples/         # Usage examples
```

## Available Agents

> See [agents/README.md](agents/README.md) for the complete catalog

### Core Agents
- **code-reviewer**: Comprehensive code review with best practices
- **debugger**: Systematic debugging and error investigation
- **documentation-writer**: Clear, comprehensive documentation

### Specialized Agents
- Coming soon...

### Meta Agents
- **repo-manager**: Manages this repository's structure and quality

## Creating New Agents

```bash
# Use the scaffolding script
./bin/add-agent my-agent-name core

# Or manually copy the template
cp agents/_template.md agents/core/my-agent.md
# Edit the file with your agent definition
```

See [docs/writing-agents.md](docs/writing-agents.md) for detailed guidance.

## Profiles

Profiles are pre-configured combinations of agents for specific workflows:

```bash
# Use a profile for a new project
./bin/setup /path/to/project --profile frontend-full

# Available profiles
ls profiles/
```

## Documentation

- [Architecture & Design Philosophy](docs/architecture.md)
- [Writing Effective Agents](docs/writing-agents.md)
- [Automation & Tools](docs/automation.md)
- [Evolution Log](docs/evolution-log.md)

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © [zerovoids](https://github.com/gio-hernandez-saito)

## About

Created and maintained by [@zerovoids](https://github.com/gio-hernandez-saito) as part of a systematic approach to AI-assisted development.

**Philosophy**: Every fragment of experience, when properly structured, becomes a reusable asset. This repository is both a tool and a demonstration of that principle.

---

⭐ If you find this useful, consider starring the repo!
