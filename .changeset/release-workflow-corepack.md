---
---

CI: Pin Yarn via Corepack in the release/deploy workflows so `yarn install --immutable` no longer fails when a newer Yarn changes the lockfile metadata. No user-facing change, so this changeset intentionally bumps nothing.
