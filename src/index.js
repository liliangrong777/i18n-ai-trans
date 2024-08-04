const fs = require("fs")
const path = require("path")
const { getTranslatorData, appendTranslatorData } = require('./utils')
const { batchExec } = require('./batch')

const batchExportIcons = () => {
    const enFileContent = fs.readFileSync(path.join(__dirname, '../test', 'en.json'), "utf-8")
    const enContent = JSON.parse(enFileContent)
    batchExec(path.join(__dirname, '../test'), (fileContent, filePath) => {
        // 不是json文件直接返回
        if (!filePath.endsWith('.json')) return
        // 不需要翻译英文
        const lang = path.basename(filePath, '.json')
        if (lang === 'en') return
        const langContent = JSON.parse(fileContent)
        const translatorData = getTranslatorData(enContent, langContent)
        // 掉接口翻译内容
        // 将返回到内容JSON与原内容进行合并
        appendTranslatorData(langContent, translatorData)
        // 将新内容写入文件中
        fs.writeFileSync(filePath, JSON.stringify(langContent, null, 2), "utf8")
        console.log(`${lang} 更新成功`);

    })
}

batchExportIcons()






