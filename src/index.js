const fs = require("fs")
const path = require("path")
const progress = require("process")
const { getMissContent, setMissContent, getLanguageContent, getLangStat, setLanguageContent } = require('./utils')
const { translate } = require("./translate")

const exec = (config) => {
    const { translateDir, API_KEY, SystemContent, ENDPOINT_ID, sourceLang = 'en', langs = ['en', 'zh'] } = config
    const absDir = path.join(progress.cwd(), translateDir)
    if (!fs.statSync(absDir).isDirectory()) throw '找不到需要翻译的目录：' + absDir

    const { isDir, isFile } = getLangStat(absDir, sourceLang)
    if (!isDir && !isFile) throw `找不到 ${en} 需要翻译内容`

    const translateLangs = langs.filter(item => item !== sourceLang)

    // 获取源语言(一般是英文)内容
    const enContent = getLanguageContent(absDir, sourceLang)
    translateLangs.forEach(async lang => {
        // 获取翻译语言的内容
        const langContent = getLanguageContent(absDir, lang)
        // 只需要翻译缺失和未翻译的字段
        const translateContent = getMissContent(enContent, langContent)

        if (!translateContent) {
            console.log(`${lang} 尚未发现新增文本`);
            return
        }
        const [translatorData, error] = await translate({
            API_KEY,
            ENDPOINT_ID,
            SystemContent,
            lang,
            translateContent
        })
        if (translatorData) {
            // 填充翻译内容
            setMissContent(langContent, translatorData)
            // 写入新的文件内容
            setLanguageContent(absDir, lang, isDir, langContent)
            console.log(`${lang} 更新成功`);
        } else {
            console.log(`${lang} 更新失败`, error);
        }
    })
}

module.exports = {
    exec
}
