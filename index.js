#!/usr/bin/env node

/**
 * Module dependencies.
 */

var jsdom = require('jsdom')
  , jquery = require('./jquery');

/**
 * jsdom options.
 */

var options = {
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
stdin.on('data', function(chunk){
  buf += chunk;
}).on('end', function(){
  var window = jsdom.jsdom(buf, null, options).createWindow();
  var $ = jquery.create(window);
  console.log($('html').html());
});
