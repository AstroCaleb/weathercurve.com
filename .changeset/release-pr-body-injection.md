---
'weather-curve': patch
---

CI: The Prepare Release workflow now passes the version and changelog text to the release PR step as environment variables and writes the PR body with printf and a body file. Before, GitHub pasted the changelog into the shell script, so backticks or command substitutions in changeset text ran in CI with the PR token available, and backticked commit hashes in changelog links came out empty.
