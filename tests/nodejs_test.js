/*
 * WARNING: REQUIRES NodeJS
 * WARNING: ES3 SYNTAX COMPATIBILITY ONLY.
 *
 * This test file is written using only ECMAScript 3 (ES3) syntax HOWEVER,
 * this code is NOT platform-independent; it has a fundamental dependency on
 * Node.js native modules and global objects (require, fs, path, process, node:test).
 *
 * It MUST be run in a Node.js environment to work properly.
 */

var colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

var testResults = {
  passed: 0,
  failed: 0,
  errors: []
}

var testrunner = null;
try {
  var testrunner = require('node:test');
} catch (err) {
  console.warn(colors.yellow + "Warning: " + colors.reset + "node:test module not found. Using fallback.");

  testrunner = {
    test: function (testTitle, testFunction) {
      var start = new Date().getTime();
      try {
        testFunction();
        var end = new Date().getTime();
        console.log(colors.green + "[TEST PASSED] " + colors.reset + testTitle + " (" + (end - start) + "ms)");
      } catch (err) {
        var end = new Date().getTime();
        testResults.failed += 1;
        testResults.errors[testResults.errors.length] = testTitle + " -> " + err.message;
        console.log(colors.red + "[TEST FAILED] " + colors.reset + testTitle + " (" + (end - start) + "ms)");
      }
    }
  }
}

var assert = null;
try {
  var assert = require('node:assert');
} catch (err) {
  console.warn(colors.yellow + "Warning: " + colors.reset + "node:assert module not found. using fallback.");

  assert = {
    ok: function (condition, message) {
      if (!condition) {
        throw new Error(message || "Assertion failed: expected truthy value.");
      }
    }
  }
}

var process = null;
try {
  process = require('node:process');
} catch (err) {
  console.warn(colors.yellow + "Warning: " + colors.reset + "node:process module not found. Using fallback.");

  process = {
    env: {}
  }
}

var fs   = require('fs');
var path = require('path');

var EnvTokenizer = require('../lib/index.js')

/**
 * Synchronously reads the file through {readFileSync}
 * Returns the file contents of the resolved file.
 * For example: filePath = .env
 *
 * @param {string} filePath
 * @return Result<FileBuffer>
 */
function loadFile(filePath, flag, enc) {
  // set default parameters
  flag = flag || "r";
  enc  = enc || "utf-8";

  var buffer = null;
  var err = null;

  try {
    var resolvedFilePath = path.resolve(__dirname, '..', filePath);

    buffer = fs.readFileSync(resolvedFilePath, {
      encoding: enc,
      flag: flag,
    });

  } catch (exception) {
    err = exception
    return { buffer: buffer, err: err };
  }

  return {
    buffer: buffer,
    err: err
  };
}

console.log();

testrunner.test('Test .env parsing', function (t) {
  var result = loadFile('tests/.env');
  var buffer = result.buffer
  var err    = result.err

  if (err) {
    console.error('.env2 file could not be loaded for test', err)
    return;
  }

  var tokenizer = new EnvTokenizer(buffer)
  tokenizer.setEnvironmentalVariables(process.env);

  var env = tokenizer.tokenize()
  //console.log('Config:', env)

  assert.ok(
    env['DB_PORT']        === '5432' &&
    env['JWT_SECRET']     === 'supersecretpassword' &&
    env['JWT_EXPIRATION'] === '3600' &&
    env['PRIVATE_KEY']    === "-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQCeJzObNCgZcwSizyClJUc/tn+lHxBm/9sg2wwSTHfspteV2Xel\nHSjhdiMUUAtGeTExFdKXcolD55AQa6WpHmQ8v0uQMchvBSa+R19tQ1PSlYDgSjQm\n2+y/1N7agABjl8teDuIXhlALN7g98bvXkOakC6/io2ZEh/5ddxAEyiGvkQIDAQAB\nAoGBAJjmTX4/boUsLc85cNY4tClkxwNchP8PXUrme0U1qLuikcrN9F4tUtim3kNF\nH6GCiYxrDK5ejVaZCS7W49IdD8ofPtLJTqxk8vsgTiEofRDQ8XPK6Wlu2Z/jLF8x\n1+x/HzBD90cHMoPVlqCjhND37UFapK5+KMVPR9gWHVjjVgABAkEA8qdbO5nDIR8f\naBJyZ0BoSoN97knOTvFGpENNByiylVY8dr/tZZu8jH81BAMrIp7E53H16IfihYut\n7tmt8vaEYQJBAKbaDJbjNLuQSG06GOS+4nqPd1G2as/xlmxKmw4VHL8tke/kk6MO\nxI0estfZTUjLAHech72ef4U9Qgd6rLAw+TECQC9YLfnUB3mH7AXPS5kPvQmE3GZI\n6kMG2oSkSPwzmZx/pe55hiVEHKbBDyQIRjtMBRkvaA6FrNHnrfkjacg1ByECQHD8\n3+Gd4qvRPPqaiRj+GqgcVxTCjvpaAx86Nl4G9fyQg28MPt4AtiFKVJnO0YMl1R8q\npNFHb9tubDRcYmy9/UECQHghjs/zKqufzat431lWcc8CDsctUXwOa6oPKosHHkIZ\ndSJ0hIBru+ERKenEpZPaawW+O70R9GlvMDciL0vEvGA=\n-----END RSA PRIVATE KEY-----" &&
    env['PORT']           === '8080' &&
    env['MODE']           === 'development'
  )
})

testrunner.test('Test .env2 parsing', function (t) {
  var result = loadFile('tests/.env2');
  var buffer = result.buffer
  var err = result.err

  if (err) {
    console.error('.env2 file could not be loaded for test', err)
    return;
  }

  var tokenizer = new EnvTokenizer(buffer)
  tokenizer.setEnvironmentalVariables(process.env);

  var env = tokenizer.tokenize()
  //console.log('Config =', env)

  assert.ok(
    env['USER']        === 'testuser'           &&
    env['DOMAIN']      === 'example.org'        &&
    env['ADMIN_EMAIL'] === 'admin@example.org'  &&
    env['ROOT_URL']    === 'example.org/app'    &&
    env['SOME_URL']    === 'SOMEVARIABLE/cache' &&
    env['TEST_URL']    === 'testuser/data'
  )
})

testrunner.test('Test .env3 parsing [MALFORMED ENV FILE TEST]', function (t) {
  var result = loadFile('tests/.env3');
  var buffer = result.buffer
  var err    = result.err

  if (err) {
    console.error('.env3 file could not be loaded for test', err)
    return;
  }

  var tokenizer = new EnvTokenizer(buffer)
  tokenizer.setEnvironmentalVariables(process.env);

  var env = null;
  var caughtErr = null
  var threw = false;

  try {
    env = tokenizer.tokenize()
  } catch (err) {
    threw = true;
    caughtErr = err;
  }

  assert.ok(threw === true, "Expected tokenizer to throw an error, but it did not.");
  if (threw) {
    var expectedMessage = "Invalid format: Missing '=' key-value pair separator in line!";
    var hasRightMessage = caughtErr.message === expectedMessage;
    assert.ok(hasRightMessage, "Threw an error, but it was an unexpected one: " + caughtErr.message);
  }
})
