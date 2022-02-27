#!/usr/bin/env node
const { spawnSync } = require('child_process')

process.setUncaughtExceptionCaptureCallback(error => {
  console.error('Something went wrong upgrading project.', error)
  process.exit(1)
})

const getTime = (date = new Date()) => {
  return date.toLocaleString('en-US', {
    hour12: true,
    day: '2-digit',
    month: 'long',
    weekday: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const log = operation => {
  const process = operation[0]
  const step = operation[1]
  console.log(`✨ ${step}\n`, process.stdout)
  process.stderr && console.log(`🍅 ${step}\n`, process.stderr)
}

const spawnOptions = {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'pipe',
  encoding: 'utf-8'
}

module.exports = async function () {
  const [, , branch = 'main'] = process.argv

  const delNodeModules = [
    spawnSync('rm', ['-rf', './node_modules'], spawnOptions),
    'Step 1/6 - Delete node_modules',
  ]
  log(delNodeModules)
  const delLockFile = [
    spawnSync('rm', ['./package-lock.json'], spawnOptions),
    'Step 2/6 - Delete lockfile',
  ]
  log(delLockFile)
  const upgradeDeps = [
    spawnSync('ncu', ['-u'], spawnOptions),
    'Step 3/6 - Upgrade dependencies',
  ]
  log(upgradeDeps)
  const installDeps = [
    spawnSync('npm', ['install'], spawnOptions),
    'Step 4/6 - Create new lockfile',
  ]
  log(installDeps)
  const stageChanges = [
    spawnSync('git', ['add', '.'], spawnOptions),
    'Step 5/6 - Stage changes',
  ]
  log(stageChanges)
  const makeCommit = [
    spawnSync('git', ['commit', '-m', `"upgrade deps & lockfile"`], spawnOptions),
    'Step 6/6 - Make a commit',
  ]
  log(makeCommit)
  const pushCommit = [
    spawnSync('git', ['push', 'origin', branch], spawnOptions),
    'Step 7/6 - Push a commit',
  ]
  log(pushCommit)

  console.log(`Done on ${getTime()}`)
  process.exit(0)
}
