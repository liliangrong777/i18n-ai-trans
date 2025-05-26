const axios = require('axios');

async function translate({ SERVER_URL, API_KEY, ENDPOINT_ID, SystemContent, translateContent, lang, chunkSize }) {
    let errorResult = null;
    let successCount = 0;
    let totalCount = Object.keys(translateContent).length;

    async function recursiveTranslate(contentObj, delay = 0) {
        await new Promise(resolve => setTimeout(resolve, delay));


        async function splitTranslate(contentObj, count) {
            const res = await Promise.all(splitObject(contentObj, count).map((part, i) => recursiveTranslate(part, Math.random() * 100 + i * 100)));
            return Object.assign({}, ...res);
        }

        try {
            const contentLength = Object.keys(contentObj).length;
            if(contentLength <= chunkSize){
                const content = await callTranslate({ SERVER_URL, API_KEY, ENDPOINT_ID, SystemContent, contentObj, lang })
                successCount = successCount + contentLength;
                console.log(`${lang} 翻译成功 ${successCount}/${totalCount}`);
                return JSON.parse(content);
            }else{
                const count = Math.ceil(contentLength / chunkSize);
                return await splitTranslate(contentObj, count);
            }
        } catch (error) {
            // 如果内容只有10个 key，直接返回错误
            if (Object.keys(contentObj).length <= 10) {
                errorResult = error.response?.data?.error || error.message;
                return {};
            }
            // 2分递归
            return await splitTranslate(contentObj, 2);
        }
    }

    const result = await recursiveTranslate(translateContent);
    if (errorResult) {
        return [null, errorResult];
    }
    return [result];
}

module.exports = {
    translate
}


// 任意拆分对象
function splitObject(obj, parts = 2) {
    const entries = Object.entries(obj);
    const partSize = Math.ceil(entries.length / parts);
    const result = [];

    for (let i = 0; i < parts; i++) {
        const start = i * partSize;
        const end = start + partSize;
        const part = Object.fromEntries(entries.slice(start, end));
        result.push(part);
    }

    return result;
}


async function callTranslate({ SERVER_URL, API_KEY, ENDPOINT_ID, SystemContent, contentObj, lang }) {
    const res = await axios({
        method: "post",
        url: SERVER_URL,
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        data: {
            "model": `${ENDPOINT_ID}`,
            "messages": [
                {
                    "role": "system",
                    "content": SystemContent
                },
                {
                    "role": "user",
                    "content": JSON.stringify(contentObj, null, 2) + ' ' + lang
                }
            ],
            "temperature": 0.2
        }
    })
    return res.data.choices[0].message.content;
}