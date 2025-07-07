#!/usr/bin/env node
const progress = require('process')
const path = require('path')
const fs = require('fs')
const { exec } = require("../src/index")
const { empty } = require("../src/empty")


function getPath() {
    const configPath = path.join(progress.cwd(), './i18n_translate.config.js')
    const configPathCjs = path.join(progress.cwd(), './i18n_translate.config.cjs')
    
    if (fs.existsSync(configPath)) {
        return configPath
    } else if (fs.existsSync(configPathCjs)) {
        return configPathCjs
    }
    return configPath
}
const commandMap = {
    init() {
        fs.writeFileSync(getPath(), fs.readFileSync(path.join(__dirname, './init.config.js')))
    },
    translate() {
        const config = require(getPath())
        exec(config)
    },
    empty() {
        const config = require(getPath())
        empty(config)
    }
}

const cmd = progress.argv[2]
const command = commandMap[cmd]
if (!command) throw "请使用正确的命令：init、translate、empty"
command()


