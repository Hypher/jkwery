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
 *  Input command aliases
 */

var aliases = {
    'get': 'eq',
	'count': 'length',
	'outer': 'outerHTML'
};


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

function JQueryProp(name) {
	this.name = name;
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
    var calls = [];

    function parseParams(fndef) {
        var params = args.splice(0, fndef[1]);
        if (params.length < fndef[1]) {
            console.log(arg + ' requires at least ' + fndef[1] + ' argument' + (fndef[1] > 1 ? 's' : ''));
            process.exit(1);
        }
        // optional params ?
		pendingParams = (fndef.length > 2) ? fndef[2] - fndef[1] : 0;
		
        return params;
    }

	
    while (args.length) {
        arg = args.shift();
        if (arg in aliases) arg = aliases[arg];
        switch (arg) {
            // handle special cases
			case 'width':
			case 'height':
			case 'outerHTML':
			case 'tagName':
				calls.push(new Call(arg));
				break;
			default:
				var escaped = false;
				if (arg[0] === "'" || arg[0] === '"') {
					arg = arg.substr(1, arg.length-2);
					escaped = true;
				}
				
				var fndef; // any jQueryFns function name?
				if (!escaped && (fndef = jQueryFns[arg])) {
					var params = parseParams(fndef);
					calls.push(new JQueryCall(arg, params, fndef[0]));
				} else if(!escaped && (arg in jQueryProps)) {
					calls.push(new JQueryProp(arg));
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
        call;
	
    while (call = calls.shift()) {
		if (call instanceof JQueryCall) {
            if (call.returnsJQuery) {
                ctx = ctx[call.name].apply(ctx, call.params);
            } else {
                returns(ctx[call.name].apply(ctx, call.params)); // return value
            }
        } else if (call instanceof JQueryProp) {
			returns(ctx[call.name]);
		} else {
            switch (call.name) {
				case 'width':
				case 'height':
					returns(ctx.attr(call.name));
				break;
				case 'outerHTML':
					ctx = ctx.map(function(){ return ($('<html/>').append(this))[0]; });
				break;
				case 'tagName':
					returns(ctx.map(function(){ return this.tagName; }).get().join('\n'));
				break;
				default:
					console.log("Unknown call "+call.name);
            }
        }
    }

    var output = [];
    ctx.each(function () {
        output.push($(this).html());
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

var calls = parseArguments();

stdin.setEncoding('utf8');
stdin.on('data', function (chunk) { buf += chunk; })
     .on('end', function () {  processHTML(buf, calls); });

