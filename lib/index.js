#!/usr/bin/env node
const progress = require('process')
const path = require('path')
const fs = require('fs')
const { exec } = require("../src/index")
const { execSync } = require("child_process")

async function execEmpty({ gitRoot, filePath, fileName }) {
    if (!gitRoot) throw "请配置gitRoot"
    const dir = path.dirname(filePath)
    const relativePath = path.relative(gitRoot, filePath).replace(/\\/g, '/'); // 转换为相对路径
    const stdout = await execSync(`git diff ${relativePath}`, { cwd: gitRoot, encoding: "utf-8" })
    // 获取变化行的key
    const changes = stdout.split('\n').filter(line => line.startsWith('+') || line.startsWith('-'));
    const changedKeys = new Set();

    changes.forEach(line => {
        const match = line.match(/["']([^"']+)["']\s*:/); // 匹配 JSON key
        if (match) {
            changedKeys.add(match[1]);
        }
    });

    const keys = [...changedKeys]
    if (keys.length === 0) {
        console.log('没有变化过的key');
        return
    }

    // 获取所有的多语言文件
    const files = await readdirSync(dir).filter(item => {
        if (item.includes(fileName)) return false
        return item.includes('.json')
    })

    // 遍历多语言文件
    files.forEach(async item => {
        const absPath = path.join(dir, item)
        const res = await readFileSync(absPath)
        const data = JSON.parse(res)
        // 将变化过的key清空
        keys.forEach(k => {
            if (data[k]) {
                data[k] = ""
            }
        })
        await writeFileSync(absPath, JSON.stringify(data, null, 2), 'utf-8')
    })
    console.log('清空完成');
}

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
        const absGitRoot = path.join(progress.cwd(), config.gitRoot)
        const absFilePath = path.join(progress.cwd(), config.translateDir, `${config.sourceLang}.json`)

        execEmpty({
            gitRoot: absGitRoot,
            filePath: absFilePath,
            fileName:`${config.sourceLang}.json`
        })
    }
}

const cmd = progress.argv[2]
const command = commandMap[cmd]
if (!command) throw "请使用正确的命令：init、translate、empty"
command()


