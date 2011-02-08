#!/usr/bin/env node

/**
 * Module dependencies.
 */

var jsdom = require('jsdom')
  , jquery = require('./jquery');

/**
 * jsdom options.
 */

var jsdomOptions = {
  features: {
      FetchExternalResources: false
    , ProcessExternalResources: false
  }
};

/**
 * Buffer stdin.
 */

var stdin = process.openStdin()
  , buf = '';

stdin.setEncoding('utf8');
stdin
  .on('data', function(chunk){ buf += chunk; })
  .on('end', parseArguments);

/**
 * Parse argv.
 */

function parseArguments() {
  var arg
    , args = process.argv.slice(2)
    , calls = [];

  function required() {
    if (args.length) return [args.shift()];
    console.log(arg + ' requires an argument');
    process.exit(1);
  }

  while (arg = args.shift()) {
    switch (arg) {
      case 'attr':
        calls.push(['method', arg, required(1)])
        break;
      default:
        calls.push(['selector', arg])
    }
  }

  parse(buf, calls);
}

/**
 * Parse and apply jQuery.
 */

function parse(html, calls) {
  var window = jsdom.jsdom(html, null, jsdomOptions).createWindow()
    , $ = jquery.create(window)
    , ctx = $('*')
    , call;

  while (call = calls.shift()) {
    switch (call[0]) {
      case 'method':
        switch (call[1]) {
          case 'attr':
            console.log(ctx[call[1]].apply(ctx, call[2]));
            break;
        }
        break;
      case 'selector':
        ctx = ctx.find(call[1]);
    }
  }

  console.log(ctx.html());  
}

