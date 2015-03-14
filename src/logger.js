/*jshint devel:true*/
export class Logger{
  constructor() {
    this.log = (function(){ return console.log.bind(console); })();
    this.debug = console.debug.bind(console, "DEBUG:");
    this.info = (function(){ return console.log.bind(console, "INFO:"); })();
    this.warn = console.warn.bind(console, "WARN:");
    this.error = console.error.bind(console, "ERROR:");
  }
}

export var logger = new Logger();
