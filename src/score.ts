import type { PullRequest, Issue, PRStats, IssueStats, RepoStats } from './types'

const MAX_REPOS = 4
const MIN_OWN_STARS = 500

function isRelevant(owner: string, stars: number, username: string): boolean {
  return owner !== username || stars >= MIN_OWN_STARS
}

export function calculateReputation(prs: PullRequest[], username: string): number {
  const external = prs.filter(pr => isRelevant(pr.repository.owner.login, pr.repository.stargazerCount, username))
  if (external.length === 0) return 0

  const totalStars = external.reduce((sum, pr) => sum + pr.repository.stargazerCount, 0)
  if (totalStars === 0) return 0

  const mergedStars = external
    .filter(pr => pr.merged)
    .reduce((sum, pr) => sum + pr.repository.stargazerCount, 0)

  return Math.round((mergedStars / totalStars) * 100)
}

export function calculateStats(
  prs: PullRequest[],
  issues: Issue[],
  username: string,
  currentRepo: string | null
): { pullRequests: PRStats, issues: IssueStats } {
  const externalPRs = prs.filter(pr => isRelevant(pr.repository.owner.login, pr.repository.stargazerCount, username))
  const externalIssues = issues.filter(i => isRelevant(i.repository.owner.login, i.repository.stargazerCount, username))

  // Group PRs by repo
  const prsByRepo = new Map<string, { prs: PullRequest[], stars: number }>()
  for (const pr of externalPRs) {
    const repo = pr.repository.nameWithOwner
    if (!prsByRepo.has(repo)) {
      prsByRepo.set(repo, { prs: [], stars: pr.repository.stargazerCount })
    }
    prsByRepo.get(repo)!.prs.push(pr)
  }

  // Group issues by repo
  const issuesByRepo = new Map<string, { issues: Issue[], stars: number }>()
  for (const issue of externalIssues) {
    const repo = issue.repository.nameWithOwner
    if (!issuesByRepo.has(repo)) {
      issuesByRepo.set(repo, { issues: [], stars: issue.repository.stargazerCount })
    }
    issuesByRepo.get(repo)!.issues.push(issue)
  }

  // Build PR repo stats, sorted by opened count (current repo first if exists)
  let prRepoStats: RepoStats[] = Array.from(prsByRepo.entries())
    .map(([repo, { prs, stars }]) => ({
      name: repo,
      stars,
      opened: prs.length,
      merged: prs.filter(pr => pr.merged).length
    }))
    .sort((a, b) => {
      if (currentRepo) {
        if (a.name === currentRepo) return -1
        if (b.name === currentRepo) return 1
      }
      return b.opened - a.opened
    })
    .slice(0, MAX_REPOS)

  // Build issue repo stats, sorted by opened count (current repo first if exists)
  let issueRepoStats: RepoStats[] = Array.from(issuesByRepo.entries())
    .map(([repo, { issues, stars }]) => ({
      name: repo,
      stars,
      opened: issues.length,
      closed: issues.filter(i => i.state === 'CLOSED').length
    }))
    .sort((a, b) => {
      if (currentRepo) {
        if (a.name === currentRepo) return -1
        if (b.name === currentRepo) return 1
      }
      return b.opened - a.opened
    })
    .slice(0, MAX_REPOS)

  return {
    pullRequests: {
      opened: externalPRs.length,
      merged: externalPRs.filter(pr => pr.merged).length,
      repositories: prRepoStats
    },
    issues: {
      opened: externalIssues.length,
      closed: externalIssues.filter(i => i.state === 'CLOSED').length,
      repositories: issueRepoStats
    }
  }
}
