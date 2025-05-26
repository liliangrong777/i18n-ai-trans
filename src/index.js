const fs = require("fs")
const path = require("path")
const progress = require("process")
const { getMissContent, setMissContent, getLanguageContent, getLangStat, setLanguageContent } = require('./utils')
const { translate } = require("./translate")

const exec = (config) => {
    const { translateDir, SERVER_URL, API_KEY, SystemContent, ENDPOINT_ID, sourceLang = 'en', langs = ['en', 'zh'], chunkSize = 100 } = config
    const absDir = path.join(progress.cwd(), translateDir)
    if (!fs.statSync(absDir).isDirectory()) throw '找不到需要翻译的目录：' + absDir

    const { isDir, isFile } = getLangStat(absDir, sourceLang)
    if (!isDir && !isFile) throw `找不到 ${sourceLang} 需要翻译内容`

    const translateLangs = langs.filter(item => item !== sourceLang)

    // 获取源语言(一般是英文)内容
    let enSourceObj = getLanguageContent(absDir, sourceLang)
    const enContent = Object.fromEntries(Object.entries(enSourceObj).filter(([_, value]) => value !== ""));
    
    const maxConcurrentRequests = 3;
    const translateQueue = [...translateLangs];
    let activeRequests = 0;

    const processQueue = async () => {
        if (translateQueue.length === 0 || activeRequests >= maxConcurrentRequests) {
            return;
        }

        const lang = translateQueue.shift();
        activeRequests++;

        // 获取翻译语言的内容
        const langContent = getLanguageContent(absDir, lang);
        // 只需要翻译缺失和未翻译的字段
        const translateContent = getMissContent(enContent, langContent);

        if (!translateContent) {
            console.log(`${lang} 尚未发现新增文本`);
            activeRequests--;
            processQueue();
            return;
        }

        console.log(`${lang} 开始翻译 ${Object.keys(translateContent).length} 条文本`);
        const [translatorData, error] = await translate({
            SERVER_URL: SERVER_URL || 'https://llm-hub.parcelpanel.com/v1/chat/completions',
            API_KEY,
            ENDPOINT_ID,
            SystemContent,
            lang,
            translateContent,
            chunkSize
        });

        if (translatorData) {
            // 填充翻译内容
            setMissContent(langContent, translatorData);
            // 写入新的文件内容
            setLanguageContent(absDir, lang, isDir, langContent);
            console.log(`${lang} 更新成功`);
        } else {
            console.log(`${lang} 更新失败`, error);
        }

        activeRequests--;
        processQueue();
    };

    for (let i = 0; i < maxConcurrentRequests; i++) {
        processQueue();
    }
}

module.exports = {
    exec
}
