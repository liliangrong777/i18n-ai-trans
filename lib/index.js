#!/usr/bin/env node
const progress = require('process')
const path = require('path')
const fs = require('fs')
const { exec } = require("../src/index")
const { empty } = require("../src/empty")

const commandMap = {
    init() {
        fs.writeFileSync(path.join(progress.cwd(), './i18n_translate.config.js'), fs.readFileSync(path.join(__dirname, './init.config.js')))
    },
    translate() {
        const config = require(path.join(progress.cwd(), './i18n_translate.config.js'))
        exec(config)
    },
    empty() {
        const config = require(path.join(progress.cwd(), './i18n_translate.config.js'))
        empty(config)
    }
}

const cmd = progress.argv[2]
const command = commandMap[cmd]
if (!command) throw "请使用正确的命令：init、translate、empty"
command()


