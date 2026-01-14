# Commit Message Guidelines

## Quick Reference

### Format
```
prefix: title

- detail 1
- detail 2
```

### Allowed Prefixes
- `feat` - New feature or agent
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code restructuring
- `chore` - Maintenance
- `revert` - Revert commit

### Examples

✅ **Good**
```
feat: add debugger agent

- Add systematic debugging approach
- Include error pattern recognition
- Add troubleshooting examples
```

❌ **Bad**
```
feat:add agent (no space after colon)
Add agent (no prefix)
feat: add agent
details here (second line not empty)
```

## Testing Your Commit Message

The git hook will validate automatically when you commit. To test manually:

```bash
git commit -m "feat: test commit

- Test detail 1
- Test detail 2"
```

If validation fails, you'll see a helpful error message.

## Why This Format?

- **Consistency**: Easy to scan commit history
- **Clarity**: Purpose is immediately clear
- **Automation**: Can generate changelogs
- **Standards**: Follows conventional commits loosely

---
**Last Updated**: 2026-01-14
