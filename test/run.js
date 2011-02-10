#!/usr/bin/env node

var fs = require('fs');
var exec = require('child_process').exec;
var assert = require('assert');

function test(name, file, cmdline, output) {

	try {
		exec('cat '+file+' | jkwery '+cmdline, function(ret, stdout, stderr) {
				try {
					assert.equal(stdout, output, 'stdout missmatch');
					//assert.test(stderr, error, 'stderr missmatch');
					nb_success++;
					if(process.argv[2] != '-s')
						console.error("Test "+name+" [\033[01;32mpassed\033[00m]");
				} catch(ex) {
					if(ex.name != 'AssertionError') throw ex;
					console.error("Test "+name+" [\033[01;31mfailed\033[00m]");
					console.error('cat '+file+' | jkwery '+cmdline);
					console.error("---------- outputed ----------");
					console.error(ex.actual);
					console.error("---------- expected ----------");
					console.error(ex.expected);
					console.error("-----------------------------");
				}
			});
	} catch(ex) {
		console.error("exec failed on "+file+": "+ex);
	}

}

var nb_tests = 0;
var nb_success = 0;

fs.readdirSync('.').forEach(function(file) {
	if(/\.test$/.test(file)) {
		var content = fs.readFileSync(file, 'utf-8');
		content = content.split('\n');
		nb_tests++;
		test(file, content.shift(), content.shift(), content.join('\n'));
	}
});

process.on('exit', function () {
	console.log("Tests: "+nb_success+"/"+nb_tests+" passed.");
});

