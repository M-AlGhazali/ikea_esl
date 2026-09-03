/**
 * Build for GitHub Pages and publish dist/ to the gh-pages branch.
 *
 * Uses a throwaway worktree rather than switching branches, so an in-progress
 * working tree on main is never touched. No extra dependencies.
 */
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BRANCH = 'gh-pages'

// Only npx needs a shell on Windows (it is a .cmd). Running git through a shell
// would re-split arguments, which mangles any message containing spaces.
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { stdio: 'inherit', ...opts })

const runShell = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { stdio: 'inherit', shell: true, ...opts })

const capture = (args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()

// 1. Build with the sub-path base that Pages serves from.
runShell('npx', ['vite', 'build'], { env: { ...process.env, GITHUB_PAGES: '1' } })

// Pages runs Jekyll by default, which drops paths starting with an underscore.
writeFileSync('dist/.nojekyll', '')

// 2. Stage the build in a detached worktree on gh-pages.
const worktree = mkdtempSync(join(tmpdir(), 'ghpages-'))

let startPoint = 'HEAD'
try {
  capture(['rev-parse', '--verify', `refs/remotes/origin/${BRANCH}`])
  startPoint = `origin/${BRANCH}`
} catch {
  // branch does not exist yet; first deploy starts from HEAD
}

run('git', ['worktree', 'add', '--detach', worktree, startPoint])

try {
  for (const entry of readdirSync(worktree)) {
    if (entry !== '.git') rmSync(join(worktree, entry), { recursive: true, force: true })
  }
  cpSync('dist', worktree, { recursive: true })

  run('git', ['add', '-A'], { cwd: worktree })

  const dirty = capture(['-C', worktree, 'status', '--porcelain'])
  if (!dirty) {
    console.log('\ngh-pages is already up to date.')
  } else {
    run('git', ['commit', '-m', `Deploy ${new Date().toISOString()}`], { cwd: worktree })
    run('git', ['push', '--force', 'origin', `HEAD:refs/heads/${BRANCH}`], { cwd: worktree })
    console.log(`\nPublished to ${BRANCH}.`)
  }
} finally {
  run('git', ['worktree', 'remove', '--force', worktree])
}
