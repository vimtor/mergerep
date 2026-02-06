<div align='center'>
    <br/>
    <br/>
    <h3>mergerep</h3>
    <p>CLI for open-source contribution stats</p>
    <br/>
    <br/>
</div>

Prevent LLM slop PRs Shows how often a user's PRs get merged into open source repos, weighted by repo stars.

## Install

```bash
bun install -g mergerep
```

Requires [Bun](https://bun.sh/) and [GitHub CLI](https://cli.github.com/) authenticated: `gh auth login`

## Usage

```bash
mergerep <username>              # Check user's merge rate
mergerep                         # In PR branch, check PR author
mergerep <username> --json       # JSON output
mergerep <username> --issues     # Include issues
mergerep <username> --repo org/name  # Highlight specific repo
```

## Example

```bash
mergerep rauchg
```

```
rauchg (from Dec 2010)

Reputation: 70% (% of merged stars)

Pull Requests:
142 merged 186 opened 76%
rauchg/blog 32/44 73%
vercel/hyper 12/13 92%
vercel/ncc 12/12 100%
vercel/vercel 11/12 92%
```

## License

[MIT](LICENSE)
