import { describe, test, expect } from 'bun:test'
import { calculateReputation, calculateStats } from './score'
import type { PullRequest, Issue } from './types'

const mockPRs: PullRequest[] = [
  { number: 1, state: 'MERGED', merged: true, additions: 100, deletions: 10, createdAt: '2024-01-01T00:00:00Z',
    repository: { nameWithOwner: 'other/repo', owner: { login: 'other' }, stargazerCount: 1000, isPrivate: false }},
  { number: 2, state: 'OPEN', merged: false, additions: 50, deletions: 5, createdAt: '2024-02-01T00:00:00Z',
    repository: { nameWithOwner: 'other/repo', owner: { login: 'other' }, stargazerCount: 1000, isPrivate: false }},
  { number: 3, state: 'MERGED', merged: true, additions: 20, deletions: 2, createdAt: '2024-03-01T00:00:00Z',
    repository: { nameWithOwner: 'testuser/own', owner: { login: 'testuser' }, stargazerCount: 10, isPrivate: false }},
  { number: 4, state: 'MERGED', merged: true, additions: 30, deletions: 3, createdAt: '2024-04-01T00:00:00Z',
    repository: { nameWithOwner: 'another/lib', owner: { login: 'another' }, stargazerCount: 500, isPrivate: false }},
]

const mockIssues: Issue[] = [
  { number: 1, state: 'CLOSED', createdAt: '2024-01-15T00:00:00Z',
    repository: { nameWithOwner: 'other/repo', owner: { login: 'other' }, stargazerCount: 1000, isPrivate: false }},
  { number: 2, state: 'OPEN', createdAt: '2024-02-15T00:00:00Z',
    repository: { nameWithOwner: 'other/repo', owner: { login: 'other' }, stargazerCount: 1000, isPrivate: false }},
  { number: 3, state: 'CLOSED', createdAt: '2024-03-15T00:00:00Z',
    repository: { nameWithOwner: 'another/lib', owner: { login: 'another' }, stargazerCount: 500, isPrivate: false }},
]

describe('calculateReputation', () => {
  test('excludes own repos and weights by stars', () => {
    const reputation = calculateReputation(mockPRs, 'testuser')
    // 3 external PRs: 2 merged (1000+500 stars) / total (2500 stars) = 60%
    expect(reputation).toBe(60)
  })

  test('returns 0 for no external PRs', () => {
    const ownPRs = mockPRs.filter(pr => pr.repository.owner.login === 'testuser')
    expect(calculateReputation(ownPRs, 'testuser')).toBe(0)
  })
})

describe('calculateStats', () => {
  test('calculates PR stats correctly', () => {
    const stats = calculateStats(mockPRs, mockIssues, 'testuser', null)
    expect(stats.pullRequests.opened).toBe(3)
    expect(stats.pullRequests.merged).toBe(2)
  })

  test('groups PRs by repo sorted by opened count', () => {
    const stats = calculateStats(mockPRs, mockIssues, 'testuser', null)
    expect(stats.pullRequests.repositories.length).toBe(2)
    expect(stats.pullRequests.repositories[0]!.name).toBe('other/repo')
    expect(stats.pullRequests.repositories[0]!.opened).toBe(2)
    expect(stats.pullRequests.repositories[1]!.name).toBe('another/lib')
  })

  test('puts currentRepo first in byRepo list', () => {
    const stats = calculateStats(mockPRs, mockIssues, 'testuser', 'another/lib')
    expect(stats.pullRequests.repositories[0]!.name).toBe('another/lib')
    expect(stats.pullRequests.repositories[1]!.name).toBe('other/repo')
  })

  test('calculates issue stats', () => {
    const stats = calculateStats(mockPRs, mockIssues, 'testuser', null)
    expect(stats.issues.opened).toBe(3)
    expect(stats.issues.closed).toBe(2)
  })

  test('groups issues by repo sorted by opened count', () => {
    const stats = calculateStats(mockPRs, mockIssues, 'testuser', null)
    expect(stats.issues.repositories.length).toBe(2)
    expect(stats.issues.repositories[0]!.name).toBe('other/repo')
  })

  test('limits to 4 repos max', () => {
    const manyPRs: PullRequest[] = []
    for (let i = 0; i < 10; i++) {
      manyPRs.push({
        number: i, state: 'MERGED', merged: true, additions: 10, deletions: 1, createdAt: '2024-01-01T00:00:00Z',
        repository: { nameWithOwner: `org/repo${i}`, owner: { login: 'org' }, stargazerCount: i, isPrivate: false }
      })
    }
    const stats = calculateStats(manyPRs, [], 'testuser', null)
    expect(stats.pullRequests.repositories.length).toBe(4)
  })
})
