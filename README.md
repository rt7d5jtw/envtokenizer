# Environment String Tokenizer (ES3 Compliant)

### About

An ECMAScript 3 compliant environment string tokenizer for deserializing raw environment variable text into a standard **JavaScript Object**. It reads key-value pairs from any given string, for example, `.env` file.

The tokenizer includes support for:

* Handling **comments** (`#` or `;`) and whitespace.
* **Variable expansion** (interpolation) using the `${VAR}` syntax, prioritizing variables defined within the parsed string over the host system's environment variables.
* Parsing **multiline string values** (e.g., for RSA keys) enclosed in double quotes (`"`).

### Compatibility and Style

The lexical scanner code is intentionally written using **ECMAScript 3 (ES3) syntax** (var, prototypes, plain objects) and wrapped in a Universal Module Definition (UMD) to attempt to guarantee portability across modern Node.js environments, web browsers, and legacy JavaScript engines like SpiderMonkey and Rhino.

⚠️ **Loading Environment Host Variables:** Because this module attempts to be platform-agnostic, it does not automatically read system environment variables. This feature is used for interpolated strings from the existing host environment variables. To enable variable expansion using the host's environment, you must manually add them before tokenizing:

```javascript
var EnvTokenizer = require('./lib/index.js');

// Pass any raw environment string, not necessarily a file
var envString = "API_KEY=12345\nDB_HOST=localhost";
var tokenizer = new EnvTokenizer(envString);

// Add the host environment (Node.js example)
tokenizer.setEnvironmentalVariables(process.env);

var env = tokenizer.tokenize();
```

### Tested on

Tested to work on NodeJS v0.12.0.

Successfully tested on Windows XP SP3 (via QEMU VM) using Internet Explorer 6.0 (JScript 5.6) and Mozilla Firefox 2.0 (SpiderMonkey).

![Passing tests in Internet Explorer 6 on Windows XP](assets/envparser-working-on-ie6.png)

![Passing tests in Mozilla Firefox 2.0 on Windows XP](assets/envparser-working-on-ff2.png)
