import pc from 'picocolors'
import type { ContributionData } from './types'

function colorRate(rate: number): string {
  if (rate >= 70) return pc.green(`${rate}%`)
  if (rate >= 40) return pc.yellow(`${rate}%`)
  return pc.red(`${rate}%`)
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function formatPretty(data: ContributionData, currentRepo: string | null): string {
  const { username, pullRequests, issues, reputation, since } = data
  const mergeRate = pullRequests.opened > 0 ? Math.round((pullRequests.merged / pullRequests.opened) * 100) : 0
  const closeRate = issues && issues.opened > 0 ? Math.round((issues.closed / issues.opened) * 100) : 0

  let output = `${pc.bold(pc.cyan(username))}${since ? pc.dim(` (from ${formatDate(since)})`) : ''}

${pc.bold('Reputation:')} ${colorRate(reputation)} ${pc.dim(`(% of merged stars)`)}

${pc.bold('Pull Requests:')}
${pullRequests.merged} merged ${pullRequests.opened} opened ${colorRate(mergeRate)}`

  for (const repo of pullRequests.repositories) {
    const rate = repo.opened > 0 ? Math.round((repo.merged! / repo.opened) * 100) : 0
    const repoName = repo.name === currentRepo ? pc.cyan(repo.name) : pc.dim(repo.name)
    output += `\n${repoName} ${repo.merged}/${repo.opened} ${colorRate(rate)}`
  }

  if (issues && issues.opened > 0) {
    output += `

${pc.bold('Issues:')}
${issues.closed} closed ${issues.opened} opened ${colorRate(closeRate)}`

    for (const repo of issues.repositories) {
      const rate = repo.opened > 0 ? Math.round((repo.closed! / repo.opened) * 100) : 0
      const repoName = repo.name === currentRepo ? pc.cyan(repo.name) : pc.dim(repo.name)
      output += `\n${repoName} ${repo.closed}/${repo.opened} ${colorRate(rate)}`
    }
  }

  return output
}

export function formatJSON(data: ContributionData): string {
  return JSON.stringify(data, null, 2)
}
