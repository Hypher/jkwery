#!/usr/bin/env node

/**
 * Module dependencies.
 */

var jsdom = require('jsdom'),
	jquery = require('./jquery');


/**
 * jsdom options.
 */

var jsdomOptions = {
	features: {
		FetchExternalResources: false,
		ProcessExternalResources: false
	}
};

/**
 *  Some usefull things
 */

function extend(obj, props) {
	Object.getOwnPropertyNames(props).forEach(function(prop) {
		var descriptor = Object.getOwnPropertyDescriptor(props, prop);
		descriptor.enumerable = false;
		Object.defineProperty(obj, prop, descriptor);
	});
};

extend(String.prototype, {wordwrap: function wordwrap(len, sep) {
	if(sep == undefined) sep = '\n';
	var lines = [];
	var i=0;
	while(this.length - i > len) {
		var pos = this.lastIndexOf(' ', i + len);
		if(pos < i) pos = i + len;
		lines.push(this.substring(i, pos));
		i = pos+1;
	}
	
	lines.push(this.substr(i));
	return lines.join('\n');
}});

function findAll(obj, val) {
	var ret = [];
		for(var p in obj)
			if(obj.hasOwnProperty(p) && obj[p] === val)
				ret.push(p);
	return ret;
};

/**
 *  Input command aliases
 */

var aliases = {
	'get': 'eq',
	'count': 'length',
	'len': 'length'
};


function printHelp() {
	function listProps(props) {
		var ret = [];
		for(var p in props) {
			var al = findAll(aliases, p);
			if(al.length)
				ret.push(p+'\xA0('+al.join(',\xA0')+')');
			else
				ret.push(p);
		}
		return ret.join(', ');
	}

	console.log("Usage: xquery [OPTIONS] [function [args, ...] | attribute | special | selector] ...");
	console.log("Parse stdin as an HTML document using jQuery and output results as HTML,")
	console.log("one matching element per line.");
	console.log();
	console.log("OPTIONS are:");
	console.log("  --outerHTML, -o : outputs the outerHTML of each element instead of innerHTML");
	console.log("    --flatten, -f : ensures that each matched element is output on a single line");
	console.log("        --explain : outputs step-by-step what is done.");
	console.log();
	console.log("All these jQuery and DOMElement attributes are supported:");
	var jprops = jquery.getJQueryProps();
	console.log(listProps(jprops).wordwrap(80));
	console.log();
	console.log("All these jQuery functions are supported:");
	var jfns = jquery.getJQueryFns();
	console.log(listProps(jfns).wordwrap(80));
	//console.log();
	//console.log("These special functions are available:")
	//console.log("  None yet.");
}


function Call(name, params) {
	this.name = name;
	this.params = params;
}
Call.prototype.appendParam = function appendParam(param) {
	this.params.push(param);
};

function JQueryCall(name, params, returnsJQuery) {
	Call.call(this, name, params);
	this.returnsJQuery = returnsJQuery;
}
JQueryCall.prototype = new Call();

function JQueryProp(name, htmlProp) {
	this.name = name;
	this.htmlProp = htmlProp || false;
}

/**
 * Parse argv.
 */

function parseArguments() {
	var arg;
	var args = process.argv.slice(2);
	var jQueryFns = jquery.getJQueryFns();
	var jQueryProps = jquery.getJQueryProps();
	
	var pendingParams = 0; // if nonzero, next args can be optional params
	var noMoreParams = false; // if an arg is followed by a comma, no more optional args are accepted
	var calls = [];

	function escapeArg(arg) {
		if (arg[0] === "'" || arg[0] === '"') {
			return arg.substr(1, arg.length-2);
		}
		return false;
	}
	
	function parseParams(fndef) {
		var params = args.splice(0, fndef[1]).map(function(arg){ return escapeArg(arg)||arg; });
		if (params.length < fndef[1]) {
			console.error(arg + ' requires at least ' + fndef[1] + ' argument' + (fndef[1] > 1 ? 's' : ''));
			process.exit(1);
		}
		// optional params ?
		pendingParams = noMoreParams ? 0 : (fndef.length > 2) ? fndef[2] - fndef[1] : 0;
		
		return params;
	}

	
	while (args.length) {
		arg = args.shift();
		
		if (arg in aliases) arg = aliases[arg];
		
		if (arg[arg.length-1] == ',') {
			noMoreParams = true;
			arg = arg.substr(0, arg.length-1);
		} else {
			noMoreParams = false;
		}
		
		switch (arg) {
			// handle special cases
			case '--explain':
				explain = true;
			break;
			case '--help':
				printHelp();
				process.exit();
			break;
			case '--outerHTML':
			case '-o':
				outerHTML = true;
			break;
			case '--flatten':
			case '-f':
				flattenHTML = true;
			break;
			//case 'special':
			//	calls.push(new Call(arg));
			//break;
			case ',':
				noMoreParams = true;
			break;
			default:
				var escaped = escapeArg(arg);
				if (escaped !== false) {
					arg = escaped;
					escaped = true;
				}
				
				var fndef; // any jQueryFns function name?
				if (!escaped && (fndef = jQueryFns[arg])) {
					var params = parseParams(fndef);
					calls.push(new JQueryCall(arg, params, fndef[0]));
				} else if(!escaped && (arg in jQueryProps)) {
					calls.push(new JQueryProp(arg, jQueryProps[arg]));
				} else {
					if (pendingParams) {
						calls[calls.length - 1].appendParam(arg);
						pendingParams--;
					} else { // else treated as a selector
						pendingParams = 0;
						calls.push(new JQueryCall('find', [arg], true));
					}
				}
			// end default case
		}
	}

	return calls;
}

/**
 * Parse and apply jQuery & special calls.
 */

function processHTML(html, calls) {
	var normalized = wrap(html),
		wrapped = html != normalized,
		window = jsdom.jsdom(normalized, null, jsdomOptions).createWindow(),
		$ = jquery.create(window),
		ctx = $(wrapped ? 'body' : '*'),
		ret,
		call;
	
	while (call = calls.shift()) {
		if (call instanceof JQueryCall) {
			if (call.returnsJQuery) {
				ctx = ctx[call.name].apply(ctx, call.params);
				if(explain) console.error("Call $."+call.name+"("+call.params.join(',')+") ["+ctx.length+" item"+(ctx.length>1?'s':'')+"]");
			} else {
				if(explain) console.error("Return $."+call.name+"("+call.params.join(',')+")");
				returns(ctx[call.name].apply(ctx, call.params)); // return value
			}
		} else if (call instanceof JQueryProp) {
			if(explain) {
				if(call.htmlProp) console.error("Return [DOMElement]."+call.name+" of each $");
				else console.error("Return each $."+call.name);
			}
			returns(ctx.map(function(){
					if(call.htmlProp) return this[call.name];
					else return $(this)[call.name];
				}).get().join('\n'));
		} else {
			switch (call.name) {
				default:
					console.error("Unknown call "+call.name);
			}
		}
	}

	if(outerHTML) {
		ctx = ctx.map(function(){ return ($('<html/>').append(this))[0]; });
		if(explain) console.error("outerHTML wraps all $ elements in a separate document");
	}
	if(flattenHTML && explain) {
		console.error("flattenHTML removes newlines from elements' HTML");
	}

	var output = [];
	ctx.each(function () {
		var html = $(this).html();
		if(flattenHTML) html = html.replace(/\n|\r/g, '');
		output.push(html);
	});
	returns(output.join('\n'));
}

function returns(value) {
	console.log(value);
	if (typeof value === 'boolean' || typeof value === 'number' && value == parseInt(value)) {
		process.exit(Number(value));
	}
	process.exit();
}

/**
 * Wrap to prevent breakage for frags.
 */

function wrap(html) {
	if (!~html.indexOf('<body')) html = '<body>' + html + '</body>';
	if (!~html.indexOf('<html')) html = '<html>' + html + '</html>';
	return html;
}


/**
 * Buffer stdin.
 */

var stdin = process.openStdin(),
	buf = '';

var explain = false; // this mode can be enabled in parseArguments with --explain
var outerHTML = false; // idem with --outerHTML or -o
var flattenHTML = false; // item with --flatten or -f

var calls = parseArguments();

stdin.setEncoding('utf8');
stdin.on('data', function (chunk) { buf += chunk; })
     .on('end', function () {  processHTML(buf, calls); });

