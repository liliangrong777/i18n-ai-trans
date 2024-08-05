const fs = require("fs")
const path = require("path")
const { getMissContent, appendTranslatorData } = require('./utils')
const { batchExec } = require('./batch')
const { translate } = require("./translate")

const exec = (translateDirRelative, key, epId, SystemContent) => {
    const absDir = path.join(progress.cwd(), translateDirRelative)
    if (fs.statSync(absDir).isDirectory()) {
        throw '找不到需要翻译的目录：' + absDir
    }
    const enFileContent = fs.readFileSync(path.join(absDir, 'en.json'), "utf-8")
    const enContent = JSON.parse(enFileContent)
    batchExec(absDir, async (fileContent, filePath) => {
        // 不是json文件直接返回
        if (!filePath.endsWith('.json')) return
        // 不需要翻译英文
        const lang = path.basename(filePath, '.json')
        if (lang === 'en') return
        const langContent = JSON.parse(fileContent)
        const missContent = getMissContent(enContent, langContent)
        // 掉接口翻译内容
        const translatorData = await translate({
            API_KEY: key, ENDPOINT_ID: epId, SystemContent, translateContent: missContent
        })

        // 将返回到内容JSON与原内容进行合并
        appendTranslatorData(langContent, translatorData)
        // 将新内容写入文件中
        fs.writeFileSync(filePath, JSON.stringify(langContent, null, 2), "utf8")
        console.log(`${lang} 更新成功`);

    })
}

module.exports = {
    exec
}






