



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

function getTranslatorData(source, target) {
    const result = {}
    // 深度对比两个对象，找出source对象中有，但是target对象中没有的字段
    function findMissingFields(source, target, parentKey = '') {
        if (typeof source !== 'object') return
        for (const key in source) {
            const keyStr = parentKey ? `${parentKey}.${key}` : key
            // 把翻译内容为空，或者目前缺少的添加到翻译容器
            if (!target[key]) {
                set(result, keyStr, source[key])
                continue
            }
            if (typeof target[key] === 'object') {
                findMissingFields(source[key], target[key], keyStr)
            }
        }
    }
    findMissingFields(source, target)
    return result
}


function appendTranslatorData(source, additional) {
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



module.exports = {
    getTranslatorData, appendTranslatorData
}