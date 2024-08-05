#!/usr/bin/env node
const progress = require('process')
const path = require('path')
const fs = require('fs')
const { exec } = require("../src/index")

const commandMap = {
    init() {
        fs.writeFileSync(path.join(progress.cwd(), './i18n_translate.config.js'), fs.readFileSync(path.join(__dirname, './init.config.js')))
    },
    translate() {
        const config = fs.readFileSync(path.join(progress.cwd(), './i18n_translate.config.js'))
        exec(config)
    }
}

const cmd = progress.argv[2]
const command = commandMap[cmd]
console.log(progress.argv);
if (!command) throw "请使用正确的命令：init或者translate"
command()


