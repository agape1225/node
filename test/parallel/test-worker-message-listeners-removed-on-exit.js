'use strict';

// Regression test for https://github.com/nodejs/node/issues/65782
//
// On worker exit, the internal cleanup removes the `message` listeners but
// used the wrong event name (`messageerrors`) for the error listeners, so
// `messageerror` listeners were still attached while `exit` listeners ran.

require('../common');
const assert = require('node:assert');
const { Worker } = require('node:worker_threads');

function check(name, code, terminate) {
  const worker = new Worker(code, { eval: true });

  worker.on('message', () => {});
  worker.on('messageerror', () => {});

  assert.strictEqual(worker.listenerCount('message'), 1);
  assert.strictEqual(worker.listenerCount('messageerror'), 1);

  worker.on('exit', () => {
    assert.strictEqual(
      worker.listenerCount('message'), 0, `${name}: message listeners remain`);
    assert.strictEqual(
      worker.listenerCount('messageerror'), 0,
      `${name}: messageerror listeners remain`);
  });

  if (terminate) {
    worker.on('online', () => worker.terminate());
  }
}

check('normal exit', '', false);
check('terminated', 'setInterval(() => {}, 100);', true);
