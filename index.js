var debug = require('debug')('ezspawn:debug');
var warn = require('debug')('ezspawn:warn');
var cliCommandParser = require('cli-command-parser');
var bluebird = require('bluebird');

module.exports = function(cmd, waitForProcess, timeout) {
  debug('Execute: ' + cmd);

  if (typeof waitForProcess === 'undefined') {
    waitForProcess = true;
  }

  if (typeof timeout === 'undefined') {
    timeout = 60000; // 60 seconds
  }

  var args = cliCommandParser(cmd);
  var exe = args.shift();

  var proc = spawn(exe, args);

  if (waitForProcess) {
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

    if (timeout > 0) {
      promise = promise.timeout(timeout)
        .catch(function(e) {
          proc.kill();
        });
    }
  }

  return new bluebird.resolve(proc);
};
