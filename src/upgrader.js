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

const log = (proc, name) => {
  proc.stdout.on('data', data => {
    console.log(`🍅 ${data}`)
  })
  proc.stderr.on('data', data => {
    console.error(`🍅 ${data}`)
  })
  proc.on('exit', code => {
    const emoji = code > 0 ? '❓' : '✨'
    const outcome = code > 0 ? 'failed' : 'succeeded'
    console.log(`${emoji} ${name} process ${outcome} at ${getTime()}\n`)
  })
}

module.exports = async function () {
  const [, , branch = 'main'] = process.argv

  const delNodeModules = [spawnSync('rm', ['-rf', './node_modules']), 'Step 1/6 - Delete node_modules']
  const delLockFile = [spawnSync('rm', ['./package-lock.json']), 'Step 2/6 - Delete lockfile']
  const upgradeDeps = [spawnSync('ncu', ['-u']), 'Step 3/6 - Upgrade dependencies']
  const installDeps = [spawnSync('npm', ['install']), 'Step 4/6 - Create new lockfile']
  const makeCommit = [spawnSync('git', ['commit', '-m', `"upgrade deps & lockfile"`]), 'Step 5/6 - Make a commit']
  const pushCommit = [spawnSync('git', ['push', 'origin', branch]), 'Step 6/6 - Push a commit'];

  [
    delNodeModules,
    delLockFile,
    upgradeDeps,
    installDeps,
    makeCommit,
    pushCommit,
  ].forEach(process => {
    log(process[0], process[1])
  })
}
