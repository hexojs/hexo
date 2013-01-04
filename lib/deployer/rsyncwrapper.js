"use strict";

var spawn = require("child_process").spawn;
var util = require("util");
var _ = require("lodash");

exports.rsync = function (options,callback) {

    options = options || {};

    if ( typeof options.src === "undefined" ) {
        throw(new Error("'src' directory is missing from options"));
    }

    if ( typeof options.dest === "undefined" ) {
        throw(new Error("'dest' directory is missing from options"));
    }

    if ( typeof options.host !== "undefined" ) {
        options.dest = options.host+":"+options.dest;
    }

    var args = [options.src,options.dest];

    if ( typeof options.host !== "undefined" ) {
        args.push("--rsh=ssh");
    }

    if ( options.recursive === true ) {
        args.push("--recursive");
    }

    if ( options.syncDest === true ) {
        args.push("--delete");
        args.push("--delete-excluded");
    }

    if ( options.dryRun === true ) {
        args.push("--dry-run");
        args.push("--verbose");
        args.push("--stats");
    }

    if ( typeof options.exclude !== "undefined" && util.isArray(options.exclude) ) {
        options.exclude.forEach(function (value,index) {
            args.push("--exclude="+value);
        });
    }

    switch ( options.compareMode ) {
        case "sizeOnly":
            args.push("--size-only");
            break;
        case "checksum":
            args.push("--checksum");
            break;
    }

    if ( typeof options.args !== "undefined" && util.isArray(options.args) ) {
        args = _.union(args,options.args);
    }

    args = _.unique(args);

    var cmd = "rsync "+args.join(" ");

    try {
        var process = spawn("rsync",args);
        var stdoutBuffer = "";
        var stderrBuffer = "";

        process.stdout.on("data", function (data) {
            stdoutBuffer += data;
        });

        process.stderr.on("data", function (data) {
            stderrBuffer += data;
        });

        process.on("exit", function (code) {
            callback(code===0?null:new Error("rsync exited with code "+code+". "+stderrBuffer),stdoutBuffer,stderrBuffer,cmd);
        });
    } catch (error) {
        callback(error,null,null,cmd);
    }
};