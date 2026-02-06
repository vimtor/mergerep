#!/usr/bin/env bun
import { program } from 'commander'
import ora from 'ora'
import pc from 'picocolors'
import { getContext, validateUser, fetchPRs, fetchIssues } from './github'
import { calculateReputation, calculateStats } from './score'
import { formatPretty, formatJSON } from './output'
import type { ContributionData } from './types'

program
  .name('mergerep')
  .description('GitHub contribution merge rate')
  .argument('[username]', 'GitHub username (defaults to current PR author)')
  .option('--json', 'Output as JSON')
  .option('--repo <repo>', 'Repository to highlight (owner/name)')
  .option('--issues', 'Include issues in output')
  .action(async (username?: string, opts?: { json?: boolean, repo?: string, issues?: boolean }) => {
    const jsonMode = opts?.json
    const s = jsonMode ? null : ora('Fetching contribution history...').start()

    const ctx = await getContext()
    const currentRepo = opts?.repo ?? ctx.currentRepo ?? null

    if (!username) {
      if (!ctx.prAuthor) {
        if (s) s.fail('Not in a PR context. Provide a username.')
        else console.error('Not in a PR context. Provide a username.')
        process.exit(1)
      }
      username = ctx.prAuthor
    }

    if (!(await validateUser(username))) {
      if (s) s.fail(`User "${username}" not found`)
      else console.error(`User "${username}" not found`)
      process.exit(1)
    }

    const showIssues = opts?.issues
    const [prs, issues] = await Promise.all([
      fetchPRs(username),
      showIssues ? fetchIssues(username) : Promise.resolve([])
    ])

    if (s) {
      s.stopAndPersist({ symbol: '', text: '' })
    }

    const reputation = calculateReputation(prs, username)
    const stats = calculateStats(prs, issues, username, currentRepo)

    // Find oldest date
    const allDates = [
      ...prs.map(pr => pr.createdAt),
      ...issues.map(i => i.createdAt)
    ].filter(Boolean)
    const since = allDates.length > 0
      ? allDates.sort()[0] ?? null
      : null

    const data: ContributionData = {
      username,
      reputation,
      since,
      pullRequests: stats.pullRequests,
      ...(showIssues ? { issues: stats.issues } : {}),
    }

    console.log(jsonMode ? formatJSON(data) : formatPretty(data, currentRepo))
  })

program.parse()
