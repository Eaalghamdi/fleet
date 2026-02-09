---
name: push
description: Commit relevant changes with appropriate messages and push to repository
disable-model-invocation: true
---

Commit and push changes to the repository:

1. Run `git status` to see what files have changed
2. Stage relevant changes with `git add <files>`
3. Create a clear, descriptive commit message explaining what changed and why
4. Push the changes to the repository
5. Do NOT include author attribution (no Co-Authored-By line)

Follow conventional commit format: type(scope): description
Examples:
- feat(auth): add login validation
- fix(ui): correct button alignment
- docs: update README
