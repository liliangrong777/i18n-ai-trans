const progress = require('process')
const path = require('path')
const fs = require('fs')
const { exec } = require("../src/index")

// const [translateDirRelative, id, epId] = progress.argv.slice(2)

// const absDir = path.join(progress.cwd(), translateDirRelative)

module.exports = {
    init() {
        fs.writeFileSync(path.join(progress.cwd(), './i18n_translate.config.js'), fs.readFileSync(path.join(__dirname, './init.config.js')))
    },
    translate(...args) {
        if (args.length !== 3) throw '参数数量必须为3 translateDirRelative，id，epId'
        const [translateDirRelative, id, epId] = args
        exec(translateDirRelative, id, epId)
    }
}