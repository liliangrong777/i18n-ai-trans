#!/usr/bin/env node
const progress = require('process')
const commandMap = require("../src/command")



const cmd = progress.argv[2]
const command = commandMap[cmd]
console.log(progress.argv);
if (!command) throw "请输入正确的命令：init，translate"

command(...progress.argv.slice(3))


