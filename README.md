# ezspawn [![Build Status](https://travis-ci.org/leahciMic/ezspawn.svg?branch=master)](https://travis-ci.org/leahciMic/ezspawn)

Spawn a process with ease.

## Install

```sh
npm install --save ezspawn
```

## Usage

```js
var ezspawn = require('ezspawn');

ezspawn('ls -lh').then(function(output) {
  console.log(output);
});
```

## API

`ezspawn.spawn(cmd)`

Spawn a process and return the child_process object.

`ezspawn(cmd, timeout=60000)`

Runs `cmd`, and returns a promise with the results.

### `cmd`

The command you wish to execute. It uses
[cli-command-parser](https://www.npmjs.com/package/cli-command-parser) to parse
the string into a suitable format for `child_process#spawn`.

### `waitForProcess`

When true, ezspawn will capture stdout, stderr and wait for the process to
terminate. The returned promise will be resolved to an object containing the
following:

```js
{
  code: exitCode,
  stdout: stdoutBuffer,
  stderr: stderrBuffer
};
```

When false, the promise will be resolved with the return value of
`child_process#spawn`.

Default: `true`

### `timeout`

Specifies how long we should wait for the process in milliseconds before timing
out.

Default: 60 seconds
