# gh-vet

GitHub CLI extension for checking a contributor's open source merge rate before reviewing their PR.

## Install

```bash
gh extension install vimtor/gh-vet
```

## Usage

```bash
gh vet <username>                  # Check user's merge rate
gh vet                             # In PR branch, check PR author
gh vet <username> --json           # JSON output
gh vet <username> --issues         # Include issues
gh vet <username> --repo org/name  # Highlight specific repo
```

## Example

<img src="https://github.com/user-attachments/assets/25571a51-152c-4516-a6dd-3da73b97da26" alt="example output" width="70%" height="auto">

## Motivation

Many open source maintainers are complaining about the influx of low-quality PRs from external contributors due to the rise of agentic coding:

- [tldraw closing pull requests from external contributors](https://x.com/tldraw/status/2011911073834672138)
- [this tweet from @NathanFlurry](https://x.com/NathanFlurry/status/2018934424218587209)

## License

[MIT](LICENSE)
