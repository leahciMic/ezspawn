var debug = require('debug')('ezspawn:debug');
var warn = require('debug')('ezspawn:warn');
var cliCommandParser = require('cli-command-parser');
var bluebird = require('bluebird');
var child_process = require('child_process');

var ezspawn = function(cmd, timeout) {
  debug('Execute: ' + cmd);

  if (typeof timeout === 'undefined') {
    timeout = 60000; // 60 seconds
  }

  var proc = ezspawn.spawn(cmd);

  debug('Waiting for ' + cmd + ' to finish');
  var stdoutBuffer = '';
  var stderrBuffer = '';

  proc.stdout.on('data', function(data) {
    debug('stdout: ' + data);
    stdoutBuffer += data;
  });

  proc.stderr.on('data', function(data) {
    warn('stderr: ' + data);
    stderrBuffer += data;
  });

  var promise = new bluebird.Promise(function(resolve, reject) {
    proc.on('error', reject);
    proc.on('close', function(exitCode) {
      debug(cmd + ' completed with exit code: ' + exitCode);

      var result = {
        code: exitCode,
        stdout: stdoutBuffer,
        stderr: stderrBuffer
      };

      if (exitCode === 0) {
        return resolve(result);
      }

      return reject(result);
    });
  });

  if (timeout > 0 && timeout !== Infinity) {
    promise = promise.timeout(timeout)
      .catch(function(e) {
        proc.kill();
        debug(cmd + ' timed out after ' + timeout + 'ms');
        throw e;
      });
  }

  return promise;
};

ezspawn.spawn = function(cmd) {
  var args = cliCommandParser(cmd);
  var exe = args.shift();

  return child_process.spawn(exe, args);
};

module.exports = ezspawn;
