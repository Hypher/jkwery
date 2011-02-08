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

  while (args.length) {
    arg = args.shift();
    switch (arg) {
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
    , call
    , ctx;

  if (0 == calls.length) calls = [['selector', '*']];

  while (call = calls.shift()) {
    switch (call[0]) {
      case 'selector':
        ctx = $(call[1]);
    }
  }

  console.log(ctx.html());  
}

