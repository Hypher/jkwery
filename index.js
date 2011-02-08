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
    , options = {};

  while (args.length) {
    arg = args.shift();
    switch (arg) {
      default:
        options.selectors = options.selectors || [];
        options.selectors.push(arg);
    }
  }

  parse(buf, options);
}

/**
 * Parse and apply jQuery.
 */

function parse(html, options) {
  var window = jsdom.jsdom(html, null, jsdomOptions).createWindow()
    , $ = jquery.create(window)
    , selectors = options.selectors || ['*']
    , ctx;

  while (selectors.length) {
    ctx = $(selectors.shift());
  }

  console.log(ctx.html());  
}

