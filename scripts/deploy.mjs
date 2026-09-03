/**
 * Build for GitHub Pages and publish dist/ to the gh-pages branch.
 *
 * Uses a throwaway worktree rather than switching branches, so an in-progress
 * working tree on main is never touched. Cross-platform: no shell env-var
 * prefixes, no extra dependencies.
 */
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BRANCH = 'gh-pages'
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...opts })

const capture = (cmd, args) =>
  execFileSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32' }).trim()

// 1. Build with the sub-path base that Pages serves from.
run('npx', ['vite', 'build'], { env: { ...process.env, GITHUB_PAGES: '1' } })

// Pages runs Jekyll by default, which drops files and folders starting with an
// underscore. This opts out.
writeFileSync('dist/.nojekyll', '')

// 2. Stage the build in a detached worktree on gh-pages.
const worktree = mkdtempSync(join(tmpdir(), 'ghpages-'))
const branchExists = (() => {
  try {
    capture('git', ['rev-parse', '--verify', BRANCH])
    return true
  } catch {
    return false
  }
})()

run('git', ['worktree', 'add', '--detach', worktree, branchExists ? BRANCH : 'HEAD'])

try {
  for (const entry of readdirSync(worktree)) {
    if (entry !== '.git') rmSync(join(worktree, entry), { recursive: true, force: true })
  }
  cpSync('dist', worktree, { recursive: true })

  run('git', ['add', '-A'], { cwd: worktree })
  const dirty = capture('git', ['-C', worktree, 'status', '--porcelain'])
  if (!dirty) {
    console.log('gh-pages is already up to date.')
  } else {
    run('git', ['commit', '-m', `Deploy ${new Date().toISOString()}`], { cwd: worktree })
    run('git', ['push', '--force', 'origin', `HEAD:refs/heads/${BRANCH}`], { cwd: worktree })
    console.log(`\nPublished to ${BRANCH}.`)
  }
} finally {
  run('git', ['worktree', 'remove', '--force', worktree])
}
