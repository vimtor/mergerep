# CLAUDE.md

CLI tool showing GitHub user's open source contribution merge rate. Uses `gh` CLI for all GitHub API calls.

## Architecture

**Modules:**
- `src/index.ts` - CLI entry, commander setup, orchestrates flow
- `src/github.ts` - All `gh` CLI calls (context detection, user validation, PR/issue fetching via GraphQL)
- `src/score.ts` - Score calculation (weighted by lines × stars) and stats aggregation
- `src/output.ts` - Colored text and JSON formatting
- `src/types.ts` - TypeScript interfaces

**Key behaviors:**
- Excludes user's own repos from all calculations
- Score = sum(merged PR stars) / sum(total PR stars) × 100 (star-weighted merge rate)
- Context detection: tries `gh pr view` first, falls back to `gh repo view`
- JSON mode disables spinner for clean output


## Commands

```bash
bun test                    # run all tests
bun test src/score.test.ts  # run single test file
bun src/index.ts <username> # run CLI
```
