var child_process = require('child_process');
var ezspawn = require('../index.js');
var defer = require('lodash.defer');

describe('ezspawn', function() {
  var mockProcess = jasmine.createSpyObj('mock process', ['on', 'kill']);
  var exitStatus = 0;

  mockProcess.stderr = jasmine.createSpyObj('mock stderr', ['on']);
  mockProcess.stdout = jasmine.createSpyObj('mock stdout', ['on']);

  mockProcess.stderr.on.and.callFake(function(w, cb) {
    if (w === 'data') {
      defer(cb.bind(undefined, 'foobar-stderr'));
    }
  });

  mockProcess.stdout.on.and.callFake(function(w, cb) {
    if (w === 'data') {
      defer(cb.bind(undefined, 'foobar-stdout'));
    }
  });

  mockProcess.on.and.callFake(function(w, cb) {
    if (w === 'close') {
      defer(cb.bind(undefined, exitStatus));
    }
  });

  beforeEach(function() {
    spyOn(child_process, 'spawn').and.returnValue(mockProcess);
  });

  it('should spawn a process', function() {
    ezspawn('ls -lh');
    expect(child_process.spawn).toHaveBeenCalledWith('ls', ['-lh']);
  });

  it('should read from stdout and stderr', function() {
    expect(mockProcess.stdout.on).toHaveBeenCalledWith('data', jasmine.any(Function));
    expect(mockProcess.stderr.on).toHaveBeenCalledWith('data', jasmine.any(Function));
  });

  it('should watch for process closing', function() {
    ezspawn('ls -lh');
    expect(mockProcess.on).toHaveBeenCalledWith('close', jasmine.any(Function));
  });

  it('should watch for process errors', function() {
    ezspawn('ls -lh');
    expect(mockProcess.on).toHaveBeenCalledWith('error', jasmine.any(Function));
  });

  it('should resolve promise with stdout, stderr, exit status', function(done) {
    ezspawn('ls -lh').then(function(data) {
      expect(data).toEqual({
        stdout: 'foobar-stdout',
        stderr: 'foobar-stderr',
        code: 0
      });
      done();
    });
  });

  it('should reject promise with stdout, stderr, exit status', function(done) {
    exitStatus = 1;
    ezspawn('ls -lh').catch(function(data) {
      expect(data).toEqual({
        stdout: 'foobar-stdout',
        stderr: 'foobar-stderr',
        code: 1
      });
      done();
    });
  });
});
