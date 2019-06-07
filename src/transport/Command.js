/**
 * @file Command.js
 * @ignore
 * @copyright David Kartnaller 2017
 * @license GNU GPLv3
 * @author David Kartnaller <david.kartnaller@gmail.com>
 */

/**
 * @typedef {import("../helper/keytypes").RawQueryResponse} RawQueryResponse
 */

const keytypes = require("../helper/keytypes.js")
const ResponseError = require("../exception/ResponseError.js")

/**
 * TeamSpeak Query Command Class
 */
class Command {

  /**
   * Creates the Command Class
   * @constructor
   */
  constructor() {
    this.cmd = ""
    this.opts = {}
    this.multiOpts = []
    this.flags = []
    this.reset()
  }


  /**
   * Initializes the Respone with default values
   * @returns {this}
   */
  reset() {
    this.response = ""
    this.error = null
    return this
  }


  /**
   * Sets the main command to send
   * @param {string} cmd sets the command which will be sent to the TeamSpeak Query
   * @returns {this}
   */
  setCommand(cmd) {
    this.cmd = cmd.trim()
    return this
  }


  /**
   * Sets the TeamSpeak Key Value Pairs
   * @param {object} opts sets the Object with the key value pairs which should get sent to the TeamSpeak Query
   * @returns {this}
   */
  setOptions(opts) {
    this.opts = opts
    return this
  }


  /**
   * Sets the TeamSpeak Key Value Pairs
   * @param {array} opts sets the Object with the key value pairs which should get sent to the TeamSpeak Query
   * @returns {this}
   */
  setMultiOptions(opts) {
    this.multiOpts = opts
    return this
  }


  /**
   * Checks wether there are options used with this command
   * @returns {boolean}
   */
  hasOptions() {
    return Object.values(this.opts).length > 0 || this.hasMultiOptions()
  }


  /**
   * Checks wether there are options used with this command
   * @returns {boolean}
   */
  hasMultiOptions() {
    return this.multiOpts.length > 0
  }


  /**
   * Set TeamSpeak Flags
   * @param {object} flags sets the flags which should get sent to the teamspeak query
   * @returns {this}
   */
  setFlags(flags) {
    this.flags = flags
    return this
  }


  /**
   * Checks wether there are flags used with this command
   * @returns {boolean}
   */
  hasFlags() {
    return this.flags.length > 0
  }


  /**
   * Set the Line which has been received from the TeamSpeak Query
   * @param {string} line the line which has been received from the teamSpeak query
   * @returns {Command}
   */
  setResponse(line) {
    this.response = Command.parse(line)
    return this
  }


  /**
   * Set the error line which has been received from the TeamSpeak Query
   * @param {string} error - The error Line which has been received from the TeamSpeak Query
   * @returns {Command}
   */
  setError(error) {
    this.error = Command.parse(error)[0]
    return this
  }


  /**
   * Get the Parsed Error Object which has been received from the TeamSpeak Query
   * @return {object} Returns the Parsed Error Object
   */
  getError() {
    return new ResponseError(this.error)
  }


  /**
   * Checks if a error has been received
   * @return {boolean} Returns true when a error has been received
   */
  hasError() {
    return this.error !== null && this.error.id > 0
  }


  /**
   * Get the Parsed Response Object which has been received from the TeamSpeak Query
   * @return {object} Returns the Parsed Response Object
   */
  getResponse() {
    return this.response || []
  }


  /**
   * Parses a Query Response
   * @static
   * @param {string} data - The Line which has been received
   * @return {RawQueryResponse[]} Returns the parsed Data
   */
  static parse(data = "") {
    // @ts-ignore
    return data.split("|").map(entry => {
      const res = {}
      entry.split(" ").forEach(str => {
        if (str.indexOf("=") >= 0) {
          const k = Command.unescape(str.substr(0, str.indexOf("=")))
          res[k] = Command.parseValue(k, Command.unescape(str.substr(str.indexOf("=") + 1)))
        } else {
          res[str] = undefined
        }
      })
      return res
    })
  }


  /**
   * Checks if a error has been received
   * @return {string} The parsed String which is readable by the TeamSpeak Query
   */
  build() {
    let cmd = Command.escape(this.cmd)
    if (this.hasFlags()) cmd += ` ${this.buildFlags()}`
    if (this.hasOptions()) cmd += ` ${this.buildOptions()}`
    return cmd
  }


  /**
   * Builds the query string for options
   * @private
   * @return {string} The parsed String which is readable by the TeamSpeak Query
   */
  buildOptions() {
    const opts = this.buildOption(this.opts)
    if (!this.hasMultiOptions()) return opts
    return `${opts} ${this.multiOpts.map(this.buildOption.bind(this)).join("|")}`
  }


  /**
   * Builds the query string for options
   * @private
   * @return {string} The parsed String which is readable by the TeamSpeak Query
   */
  buildOption(options) {
    return Object
      .keys(options)
      .filter(key => [undefined, null].indexOf(options[key]) === -1)
      .filter(key => typeof options[key] !== "number" || !isNaN(options[key]))
      .map(key => this.escapeKeyValue(key, options[key]))
      .join(" ")
  }


  /**
   * Escapes a key and a value
   * @private
   * @param {string} key - the key used
   * @param {string|string[]} value - the value or an array of values
   * @return {string} The parsed String which is readable by the TeamSpeak Query
   */
  escapeKeyValue(key, value) {
    if (Array.isArray(value)) {
      return value.map(v => `${Command.escape(key)}=${Command.escape(v)}`).join("|")
    } else {
      return `${Command.escape(key)}=${Command.escape(value)}`
    }
  }


  /**
   * Builds the query string for flags
   * @private
   * @return {string} The parsed String which is readable by the TeamSpeak Query
   */
  buildFlags() {
    return this.flags.map(f => Command.escape(f)).join(" ")
  }


  /**
   * Parses a value to the type which the key represents
   * @static
   * @param {string} k the key which should get looked up
   * @param {string} v the value which should get parsed
   * @return {any} Returns the parsed Data
   */
  static parseValue(k, v) {
    switch (keytypes[k]) {
      case "ArrayOfInt": return v.split(",").map(i => parseFloat(i))
      case "ArrayOfString": return v.split(",").map(i => String(i))
      case Boolean: return Boolean(v)
      case Number: return parseFloat(v)
      case String: return String(v)
      default: return String(v)
    }
  }

  /**
   * unescapes a string
   * @static
   * @param {string} str the string to escape
   * @returns {string} the unescaped string
   */
  static unescape(str) {
    return String(str)
      .replace(/\\s/g, " ")
      .replace(/\\p/g, "|")
      .replace(/\\n/g, "\n")
      .replace(/\\f/g, "\f")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\v/g, "\v")
      .replace(/\\\//g, "/")
      .replace(/\\\\/g, "\\")
  }

  /**
   * escapes a string
   * @static
   * @param {string} str the string to escape
   * @returns {string} the escaped string
   */
  static escape(str) {
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/\//g, "\\/")
      .replace(/\|/g, "\\p")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      .replace(/\v/g, "\\v")
      .replace(/\f/g, "\\f")
      .replace(/ /g, "\\s")
  }
}

module.exports = Command