const path = require('path')
const { execSync } = require("child_process")
const { readFileSync, readdirSync, writeFileSync } = require('fs');

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

function empty(config) {
    const absGitRoot = path.join(process.cwd(), config.gitRoot)
    const absFilePath = path.join(process.cwd(), config.translateDir, `${config.sourceLang}.json`)

    execEmpty({
        gitRoot: absGitRoot,
        filePath: absFilePath,
        fileName:`${config.sourceLang}.json`
    })
}

module.exports = { execEmpty, empty } 