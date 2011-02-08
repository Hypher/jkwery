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

  while (args.length) {
    switch (arg = args.shift()) {
      case 'val':
      case 'text':
      case 'first':
      case 'last':
      case 'width':
      case 'height':
      case 'parent':
        calls.push(['method', arg, []])
        break;
      case 'at':
      case 'get':
        arg = 'eq';
      case 'eq':
      case 'attr':
      case 'hasClass':
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
  var normalized = wrap(html)
    , wrapped = html != normalized
    , window = jsdom.jsdom(normalized, null, jsdomOptions).createWindow()
    , $ = jquery.create(window)
    , ctx = $(wrapped ? 'body' : '*')
    , call;

  while (call = calls.shift()) {
    switch (call[0]) {
      case 'method':
        switch (call[1]) {
          case 'eq':
          case 'first':
          case 'last':
            ctx = ctx[call[1]].apply(ctx, call[2]);
            break;
          case 'parent':
            ctx = ctx.parent();
            break;
          case 'width':
          case 'height':
            // TODO: fix me! jsdom breakage
            call[2][0] = call[1];
            call[1] = 'attr';
          case 'val':
          case 'attr':
          case 'text':
          case 'hasClass':
            console.log(ctx[call[1]].apply(ctx, call[2]));
            process.exit();
            break;
        }
        break;
      case 'selector':
        ctx = ctx.find(call[1]);
    }
  }

  console.log(ctx.html());  
}

/**
 * Wrap to prevent breakage for frags.
 */

function wrap(html) {
  if (!~html.indexOf('<body')) html = '<body>' + html + '</body>';
  if (!~html.indexOf('<html')) html = '<html>' + html + '</html>';
  return html;
}
