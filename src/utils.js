



const fs = require("fs")
const path = require("path")

function set(obj, k, v) {
    const keys = k.split('.')
    let key, current = obj
    while (key = keys.shift()) {
        if (keys.length === 0) {
            current[key] = v
            break
        }
        if (!current[key]) {
            current[key] = {}
        }
        current = current[key]
    }
}

function getMissContent2(source, target) {
    const result = {}
    // 深度对比两个对象，找出source对象中有，但是target对象中没有的字段
    function findMissingFields(source, target, parent) {
        if (typeof source !== 'object') return
        for (const key in source) {
            // 把翻译内容为空，或者目前缺少的添加到翻译容器
            if (!target[key]) {
                parent[key] = source[key]
                continue
            }
            if (typeof target[key] === 'object') {
                if (!parent[key]) parent[key] = {}
                findMissingFields(source[key], target[key], parent[key])
            }
        }
    }
    findMissingFields(source, target, result)
    return result
}


function getMissContent(source, target) {
    if (typeof source !== 'object') return
    let res;
    for (const key in source) {
        if (!target[key]) {
            if (!res) res = {}
            res[key] = source[key]
        }
        if (typeof target[key] === 'object') {
            const childRes = getMissContent(source[key], target[key])
            if (childRes) {
                if (!res) res = {}
                res[key] = childRes
            }
        }
    }
    return res
}


function setMissContent(source, additional) {
    function merge(source, target) {
        for (const key in target) {
            if (!source[key]) {
                source[key] = target[key]
                continue
            }
            if (typeof source[key] === 'object') {
                merge(source[key], target[key])
            }
        }
    }
    merge(source, additional)
}


function getLangStat(absDir, lang) {
    const filePath = path.join(absDir, `${lang}.json`)
    const dirPath = path.join(absDir, lang)
    const isFile = fs.existsSync(filePath)
    const isDir = fs.existsSync(dirPath)
    return {
        isFile,
        isDir,
        filePath,
        dirPath
    }
}

function getLanguageContent(absDir, lang) {
    const { filePath, isFile, dirPath, isDir } = getLangStat(absDir, lang)
    if (isFile) {
        const langContent = JSON.parse(fs.readFileSync(filePath, "utf-8"))
        return langContent
    }

    if (isDir) {
        const files = fs.readdirSync(dirPath)
        const res = {}
        files.forEach(file => {
            if (!file.endsWith('.json')) return
            const filePath = path.join(dirPath, file)
            res[file] = JSON.parse(fs.readFileSync(filePath, "utf-8"))
        })
        return res
    }
    return {}
}


function setLanguageContent(absDir, lang, isDir, langContent) {
    if (isDir) {
        const dirPath = path.join(absDir, lang)
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath)
        }
        Object.keys(langContent).forEach(file => {
            const filePath = path.join(dirPath, file)
            console.log(filePath);
            fs.writeFileSync(filePath, JSON.stringify(langContent[file], null, 2), "utf8")
        })
    } else {
        fs.writeFileSync(path.join(absDir, `${lang}.json`), JSON.stringify(langContent, null, 2), "utf8")
    }

}



module.exports = {
    getMissContent, setMissContent, getLanguageContent, getLangStat, setLanguageContent
}