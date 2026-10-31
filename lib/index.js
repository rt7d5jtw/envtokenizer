/*
 * WARNING: ES3 Syntax Compliant only.
 * Uses UMD for cross-environment compatibility.
 */
/* global define */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD environment (RequireJS)
    define([], factory);
  }
  else if (typeof module === 'object' && module.exports) {
    // CommonJS environment (NodeJS)
    module.exports = factory();
  }
  else {
    /* Legacy or Global environment.
     * 'root' will be the global object.
     * (window in browsers, global in Node)
     */
    root.EnvTokenizer = factory();
  }
}(this, function () {

  function EnvTokenizer(source) {
    /** @type {?string} */
    this.source = source;

    /** @type {number} */
    this.cursor = 0;

    /** @type {?Object<string, string>} */
    this.tokens = {};

    /** @type {?Object<string, string>} */
    this.env = {};
  }

  EnvTokenizer.prototype = {

    /* Sets the environment variables from the host
     *
     * For example, EnvTokenizer.setEnvironmentalVariables(process.env);
     * sets the environmental variables of the host variables stored to the
     * this.env object.
     *
     * This is used for interpolated strings.
     */
    setEnvironmentalVariables: function (envObject) {
      this.env = envObject;
    },

    /**
     * Sets the source string to be tokenized.
     * @param {string} source - The raw environment text.
     * @returns {void}
     */
    setSource: function (source) {
      this.source = source;
    },

    /**
     * Resets the cursor position to the beginning of the source.
     * @returns {void}
     */
    reset: function () {
      this.cursor = null;
      this.cursor = 0;
    },

    /**
     * Parses the source string into a key-value token object.
     * @returns {Object<string, string>} A dictionary of parsed environment variables.
     */
    tokenize: function () {
      while (!this.isEOF()) {
        switch (this.peek()) {
        case " ": {
          while (this.peek().charCodeAt(0) === 32) {
            this.cursor += 1;
          }
          break;
        }
        case "\r":
        case "\n": {
          this.cursor += 1;
          break;
        }
        // Comments '#'
        case "#": {
          while (this.peek() !== "\n" && !this.isEOF()) {
            this.cursor += 1;
          }

          continue;
        }
        default: {
          // isAlphabetic case
          if (this.isAlphabetic(this.peek())) {
            this.readKVPair();
          } else {
            this.cursor += 1;
          }
        }
        }
      }

      return this.tokens;
    },

    /**
     * Reads and parses a single key-value pair from the current cursor position, storing it directly into the tokens object.
     * @throws {Error} If the line is missing the '=' separator.
     * @returns {void}
     */
    readKVPair: function () {
      var key = "";
      var value = "";

      while (this.peek() !== "\n" && !this.isEOF()) {
        // Read the key
        while (this.peek() !== "=") {
          var c = this.peek();

          if (c !== " ") {
            key += this.peek();
          }

          if (c === "\n" || c ===  "\r" || c === "") {
            throw new Error("Invalid format: Missing '=' key-value pair separator in line!");
          }

          this.cursor += 1;
        }

        // Read the value
        if (this.peek() === "=") {
          // Move the cursor from `=`
          this.cursor += 1;

          // Handle possible multiline comments like RSA keys
          if (this.peek() === "\"") {
            // Move the cursor from `"`
            this.cursor += 1;

            while (this.peek() !== "\"") {
              value += this.peek();
              this.cursor += 1;
            }

            // Add the final `"`
            this.cursor += 1;

            break;
          }

          while (!this.isEOF() && this.peek() !== "\n") {
            // Skip comments
            if (this.peek() === ";" || this.peek() === "#") {
              while (this.source.charAt(this.cursor) !== "\n" && !this.isEOF()) {
                this.cursor += 1;
              }
            } else if (this.peek() === "$" && this.peekAhead() === "{") {
              // Variable expansion case
              // 1. Check the already parsed variables
              // 2. Check the environment variables
              // 3. If there is no variable to expand upon, then we just use it as it is
              //
              // NOTE: The scanner prioritizes the .env variables included in the file
              // first and the variables defined in the environment second.
              // This means that USER variable defined in the file will override USER
              // variable in the environment.

              //this.isInterpolated()
              var interpolated = "";

              // Forward the cursor from '${'
              this.cursor += 2;

              while (this.peek() !== "}") {
                interpolated += this.peek();
                this.cursor += 1;
              }

              // Check if value is already parsed value from the .env file
              var parsedVariable = this.tokens[interpolated];

              // Concatenate into the string
              if (parsedVariable) {
                value += parsedVariable;
              } else if (parsedVariable === undefined) {

                var env = this.env[interpolated];

                // If there is no such variable to expand upon,
                // concatenate the string as it is.
                value += (env === undefined) ? interpolated : env;
              }
            } else {
              value += this.peek();
            }

            this.cursor += 1;
          }

          break;
        }

        this.cursor += 1;
      }

      value = this.stringTrim(value);

      this.tokens[key] = value;
    },

    /**
     * Returns current character by cursor position
     * @returns {?string}
     */
    peek: function () {
      return this.source.charAt(this.cursor);
    },

    /**
     * Lookahead method
     * Returns next character
     * @returns {string}
     */
    peekAhead: function () {
      return this.source.charAt(this.cursor + 1);
    },

    /**
     * Checks if character is alphabetic
     * @param {string}
     * @returns {boolean}
     */
    isAlphabetic: function (c) {
      if (c === undefined) {
        throw new Error(
          "[ERROR] [Tokenizer.isAlphabetic()] Input was undefined!"
        );
      }

      return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
    },

    /**
     * Checks if the cursor has reached EOF.
     * @returns {boolean}
     */
    isEOF: function () {
      return this.cursor >= this.source.length;
    },

    /**
     * Trims leading and trailing whitespace from a string.
     * @param {string} str - The string to trim.
     * @returns {string} The trimmed string.
     */
    stringTrim: function (str) {
      return str.replace(/^\s+|\s+$/g, "");
    }
  };

  return EnvTokenizer;
}));
