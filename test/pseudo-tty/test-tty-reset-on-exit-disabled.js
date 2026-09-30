'use strict';
require('../common');
const child_process = require('child_process');

// Tests that --no-tty-reset-on-exit stops Node.js from clobbering a TTY mode
// change made by another program that shares the same controlling terminal
// (e.g. a pager like `less`) after Node.js captured its own startup snapshot
// of that terminal's mode.
// Refs: https://github.com/nodejs/node/issues/41143

// Simulate a pager that has already put the terminal in -echo mode by the
// time Node.js starts (and therefore captures -echo as "the" original mode).
child_process.spawnSync('stty', ['-echo'], { stdio: 'inherit' });

// Node.js stays alive long enough for the `stty echo` below to run while
// it is still running, matching the real race: the pager exits and restores
// the terminal before Node.js does.
const proc = child_process.spawn(process.execPath, [
  '--no-tty-reset-on-exit',
  '-e', 'setTimeout(() => {}, 300)',
], { stdio: 'inherit' });

setTimeout(() => {
  // Simulate the pager exiting cleanly and restoring the terminal while
  // Node.js is still running.
  child_process.spawnSync('stty', ['echo'], { stdio: 'inherit' });
}, 100);

proc.on('exit', () => {
  const { stdout } = child_process.spawnSync('stty', {
    stdio: ['inherit', 'pipe', 'inherit'],
    encoding: 'utf8',
  });

  // With --no-tty-reset-on-exit, Node.js must not have touched the
  // terminal on its way out, so it should still read back as +echo.
  if (stdout.match(/-echo\b/)) {
    console.log(stdout);
  }
});
