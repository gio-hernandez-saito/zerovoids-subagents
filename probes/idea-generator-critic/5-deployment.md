# Deployment

> Defines how to run the probe and automate idea generation

---

## 🎯 Overview

This document covers:

- Local development and testing
- GitHub Actions automation
- Repository structure
- Output management

---

## 📁 Repository Structure

### Idea Bank Repository

```
zerovoids-cosmos/
├── .github/
│   └── workflows/
│       └── weekly-idea.yml
├── ideas/
│   ├── 0001-metroidvania-code-explorer.md
│   ├── 0002-baseball-pitch-analyzer.md
│   └── 0003-webgpu-particle-simulator.md
├── archive/
│   └── failed/
│       └── 0004-generic-todo-app.md
├── stats/
│   ├── monthly-2026-01.json
│   └── all-time.json
└── README.md
```

### Directory Purposes

| Directory         | Purpose      | Contents                                  |
|-------------------|--------------|-------------------------------------------|
| `ideas/`          | Passed ideas | Ideas that met criteria, index-named      |
| `archive/failed/` | Failed ideas | Ideas that couldn't pass after refinement |
| `stats/`          | Analytics    | Monthly and cumulative statistics         |

### File Naming Convention

```
{NNNN}-{slug}.md
```

Where NNNN is the global sequential index across all ideas, zero-padded to 4 digits.

Examples:
- `0001-metroidvania-code-explorer.md`
- `0002-baseball-pitch-analyzer.md`
- `0003-webgpu-particle-simulator.md`
- `0042-urban-traffic-flow-visualizer.md`

### Index Management

The probe tracks the current highest index in `stats/all-time.json` under the `last_index` field. Each new idea (pass or fail) increments this counter, so indices are never reused.

---

## 🖥️ Local Development

### Prerequisites

- Node.js 20+
- pnpm
- Anthropic API key

### Setup

```bash
# Clone cosmos repo
git clone https://github.com/zerovoids/zerovoids-cosmos.git
cd zerovoids-cosmos

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
```

### Manual Execution

```bash
# Run idea generator probe
pnpm run probe:idea-generator-critic

# With options
pnpm run probe:idea-generator-critic --output ./output/
pnpm run probe:idea-generator-critic --dry-run
pnpm run probe:idea-generator-critic --verbose
pnpm run probe:idea-generator-critic --ideas-dir ./ideas/
```

### `--ideas-dir` Option

The `--ideas-dir` flag points the probe to the directory containing existing ideas. The probe scans this directory to:

- Build the bank state (titles, tags, categories)
- Detect overused concepts
- Calculate category distribution
- Score distinctness accurately

```bash
# Default: scans ./ideas/ relative to CWD
pnpm run probe:idea-generator-critic

# Custom ideas directory
pnpm run probe:idea-generator-critic --ideas-dir /path/to/idea-bank/ideas/

# When running from cosmos repo pointing to separate idea-bank
pnpm run probe:idea-generator-critic --ideas-dir ../zerovoids-cosmos/ideas/
```

### Testing

```bash
# Test evaluation logic
pnpm test probes/idea-generator-critic

# Test with mock data
pnpm test:mock probes/idea-generator-critic
```

---

## ⚙️ GitHub Actions

### Workflow File

```yaml
# .github/workflows/weekly-idea.yml

name: Weekly Idea Generation

on:
  schedule:
    # Run at 9 AM KST (0 AM UTC) every Monday
    - cron: '0 0 * * 1'
  workflow_dispatch:
    # Allow manual trigger
    inputs:
      force_publish:
        description: 'Publish even if score below threshold'
        required: false
        default: 'false'
        type: boolean

env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

jobs:
  generate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout cosmos repo (idea bank + probe)
        uses: actions/checkout@v4
        with:
          repository: zerovoids/zerovoids-cosmos
          path: cosmos
          token: ${{ secrets.IDEA_BANK_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: |
          cd cosmos
          pnpm install

      - name: Generate idea
        id: generate
        run: |
          cd cosmos
          RESULT=$(pnpm run probe:idea-generator-critic --json --ideas-dir ./ideas/)
          echo "result=$RESULT" >> $GITHUB_OUTPUT

      - name: Process result
        run: |
          cd cosmos

          # Parse result
          STATUS=$(echo '${{ steps.generate.outputs.result }}' | jq -r '.status')
          SCORE=$(echo '${{ steps.generate.outputs.result }}' | jq -r '.score')
          FILENAME=$(echo '${{ steps.generate.outputs.result }}' | jq -r '.filename')
          INDEX=$(echo '${{ steps.generate.outputs.result }}' | jq -r '.index')

          # Route based on status
          if [ "$STATUS" = "pass" ]; then
            mkdir -p "ideas"
            cp "output/$FILENAME" "ideas/"
            echo "Idea passed with score $SCORE (index $INDEX)"
          else
            mkdir -p "archive/failed"
            cp "output/$FILENAME" "archive/failed/"
            echo "Idea failed with score $SCORE (index $INDEX)"
          fi

      - name: Update stats
        run: |
          cd cosmos
          node scripts/update-stats.js

      - name: Commit and push
        run: |
          cd cosmos
          git config user.name "Idea Generator Bot"
          git config user.email "bot@zerovoids.dev"
          git add .
          git diff --staged --quiet || git commit -m "feat: weekly idea $(date +%Y-%m-%d)"
          git push
```

### Required Secrets

| Secret              | Purpose                       |
|---------------------|-------------------------------|
| `ANTHROPIC_API_KEY` | API access for Claude         |
| `IDEA_BANK_TOKEN`   | Push access to cosmos repo    |

### Setting Up Secrets

1. Go to repository Settings → Secrets and variables → Actions
2. Add `ANTHROPIC_API_KEY` with your Anthropic API key
3. Create a Personal Access Token with `repo` scope
4. Add `IDEA_BANK_TOKEN` with the PAT

---

## 📊 Stats Generation

### Monthly Stats

```json
{
  "month": "2026-01",
  "generated": 4,
  "passed": 3,
  "failed": 1,
  "pass_rate": 0.75,
  "avg_score": 7.4,
  "avg_iterations": 1.3,
  "avg_distinctness": 8.2,
  "by_category": {
    "experimental": 1,
    "developer-tool": 1,
    "visualization": 1,
    "automation": 1
  },
  "top_scores": [
    { "title": "Metroidvania Code Explorer", "score": 8.9, "index": "0001" },
    { "title": "Baseball Analytics Dashboard", "score": 8.2, "index": "0002" }
  ]
}
```

### All-Time Stats

```json
{
  "last_index": 42,
  "total_generated": 42,
  "total_passed": 31,
  "total_failed": 11,
  "overall_pass_rate": 0.74,
  "overall_avg_score": 7.5,
  "overall_avg_distinctness": 8.0,
  "category_distribution": {
    "experimental": 8,
    "developer-tool": 7,
    "visualization": 6,
    "automation": 5,
    "utility": 3,
    "gaming": 2
  },
  "monthly_trend": [
    { "month": "2026-01", "passed": 3, "avg_score": 7.2 },
    { "month": "2026-02", "passed": 4, "avg_score": 7.6 }
  ],
  "best_ideas": [
    { "title": "...", "score": 9.2, "index": "0007" }
  ]
}
```

### Stats Update Script

```javascript
// scripts/update-stats.js

const fs = require('fs');
const path = require('path');

function updateStats() {
  const ideasDir = path.join(__dirname, '../ideas');
  const statsDir = path.join(__dirname, '../stats');

  // Gather all ideas
  const ideas = gatherIdeas(ideasDir);

  // Calculate monthly stats
  const monthlyStats = calculateMonthlyStats(ideas);

  // Calculate all-time stats
  const allTimeStats = calculateAllTimeStats(ideas);

  // Track last index for ID assignment
  allTimeStats.last_index = Math.max(...ideas.map(i => parseInt(i.id.replace('idea-', ''))));

  // Write stats files
  for (const [month, stats] of Object.entries(monthlyStats)) {
    fs.writeFileSync(
      path.join(statsDir, `monthly-${month}.json`),
      JSON.stringify(stats, null, 2)
    );
  }

  fs.writeFileSync(
    path.join(statsDir, 'all-time.json'),
    JSON.stringify(allTimeStats, null, 2)
  );
}

updateStats();
```

---

## 🔔 Notifications (Optional)

### Discord Webhook

```yaml
# Add to workflow after commit step

- name: Notify Discord
  if: success()
  run: |
    STATUS=$(echo '${{ steps.generate.outputs.result }}' | jq -r '.status')
    TITLE=$(echo '${{ steps.generate.outputs.result }}' | jq -r '.title')
    SCORE=$(echo '${{ steps.generate.outputs.result }}' | jq -r '.score')
    INDEX=$(echo '${{ steps.generate.outputs.result }}' | jq -r '.index')

    if [ "$STATUS" = "pass" ]; then
      EMOJI="✅"
      COLOR="3066993"
    else
      EMOJI="❌"
      COLOR="15158332"
    fi

    curl -H "Content-Type: application/json" \
      -d "{\"embeds\": [{\"title\": \"$EMOJI Weekly Idea #$INDEX: $TITLE\", \"description\": \"Score: $SCORE\", \"color\": $COLOR}]}" \
      ${{ secrets.DISCORD_WEBHOOK }}
```

### Slack Notification

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Weekly idea generated: ${{ steps.generate.outputs.result }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🛠️ Maintenance

### Manual Operations

```bash
# Regenerate all stats
pnpm run stats:rebuild

# Validate all idea files
pnpm run validate:ideas

# Clean up malformed files
pnpm run cleanup

# Check category distribution
pnpm run stats:categories
```

### Troubleshooting

| Issue                      | Cause               | Solution                          |
|----------------------------|---------------------|-----------------------------------|
| Workflow not triggering    | Cron syntax         | Check timezone (UTC)              |
| API rate limit             | Too many requests   | Add delay between calls           |
| Push failed                | Token expired       | Regenerate PAT                    |
| Low quality output         | Context missing     | Check 0-context.md is loaded      |
| Duplicate ideas generated  | ideas-dir not set   | Pass --ideas-dir to probe         |
| Index collision            | Stats out of sync   | Run pnpm run stats:rebuild        |

### Monitoring

- Check Actions tab for workflow runs (weekly)
- Review generated ideas after each run
- Monitor API usage in Anthropic console
- Track pass rate trends in stats
- Review category distribution monthly to ensure diversity

---

## 🚀 Deployment Checklist

### Initial Setup

- [ ] Create `zerovoids-cosmos` repository
- [ ] Set up directory structure (`ideas/`, `archive/failed/`, `stats/`)
- [ ] Add workflow file at `.github/workflows/weekly-idea.yml`
- [ ] Configure secrets (`ANTHROPIC_API_KEY`, `IDEA_BANK_TOKEN`)
- [ ] Initialize `stats/all-time.json` with `last_index: 0`
- [ ] Test manual trigger with `--dry-run`
- [ ] Verify cron schedule (Monday 9 AM KST)

### Ongoing

- [ ] Monitor weekly runs
- [ ] Review generated ideas weekly
- [ ] Adjust thresholds if needed
- [ ] Update context as interests change
- [ ] Check category balance monthly (no category > 25%)

---

## 🔗 Related Documents

- `agent.md`: The actual probe implementation
- `0-context.md`: Context loaded during generation (includes diversity rules)
- `3-evaluation-criteria.md`: Scoring that determines pass/fail
- `4-refinement-protocol.md`: How failed ideas are refined

---

**Last Updated**: 2026-03-23
