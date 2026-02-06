import { $ } from 'bun'
import type { Context, PullRequest, Issue } from './types'

const RANGES = 4

function dateRanges(count: number): string[] {
  const now = new Date()
  const year = now.getFullYear()
  const ranges: string[] = []
  for (let i = 0; i < count - 1; i++) {
    const y = year - i
    ranges.push(`created:${y}-01-01..${y}-12-31`)
  }
  ranges.push(`created:<${year - count + 2}-01-01`)
  return ranges
}

export async function getContext(): Promise<Context> {
  try {
    const result = await $`gh pr view --json author,headRepository`.json()
    return {
      prAuthor: result.author?.login ?? null,
      currentRepo: result.headRepository?.nameWithOwner ?? null
    }
  } catch {
    try {
      const repo = await $`gh repo view --json nameWithOwner`.json()
      return { prAuthor: null, currentRepo: repo.nameWithOwner }
    } catch {
      return { prAuthor: null, currentRepo: null }
    }
  }
}

export async function validateUser(login: string): Promise<boolean> {
  try {
    await $`gh api users/${login}`.quiet()
    return true
  } catch {
    return false
  }
}

export async function fetchPRs(username: string): Promise<PullRequest[]> {
  const query = `query($q: String!) {
    search(query: $q, type: ISSUE, first: 100) {
      edges { node { __typename ... on PullRequest {
        number state merged additions deletions createdAt
        repository { nameWithOwner owner { login } stargazerCount isPrivate }
      }}}
    }
  }`

  const base = `author:${username} is:pr -is:draft`
  const pages = await Promise.all(
    dateRanges(RANGES).map(range =>
      $`gh api graphql -f query=${query} -f q=${base + ' ' + range}`.json()
    )
  )

  return pages.flatMap((data: any) =>
    data.data.search.edges
      .map((e: any) => e.node)
      .filter((n: any) => n.__typename === 'PullRequest' && !n.repository.isPrivate)
  )
}

export async function fetchIssues(username: string): Promise<Issue[]> {
  const query = `query($q: String!) {
    search(query: $q, type: ISSUE, first: 100) {
      edges { node { __typename ... on Issue {
        number state createdAt
        repository { nameWithOwner owner { login } stargazerCount isPrivate }
      }}}
    }
  }`

  const base = `author:${username} is:issue`
  const pages = await Promise.all(
    dateRanges(RANGES).map(range =>
      $`gh api graphql -f query=${query} -f q=${base + ' ' + range}`.json()
    )
  )

  return pages.flatMap((data: any) =>
    data.data.search.edges
      .map((e: any) => e.node)
      .filter((n: any) => n.__typename === 'Issue' && !n.repository.isPrivate)
  )
}
