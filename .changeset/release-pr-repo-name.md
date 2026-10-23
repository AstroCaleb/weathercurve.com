---
'weather-curve': patch
---

CI: The Prepare Release workflow now looks up and closes old release PRs in this repository. Its find and close steps still pointed at the archived private repository the code was migrated from, so the lookup always came back empty, the old release PR stayed open, and creating the new release PR could fail because one already existed for the release branch.
