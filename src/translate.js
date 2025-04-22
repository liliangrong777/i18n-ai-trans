const axios = require('axios');

function chunkObject(obj, chunkSize) {
    // 将对象按照键值对拆分成更小的块
    const entries = Object.entries(obj);
    const chunks = [];
    
    for (let i = 0; i < entries.length; i += chunkSize) {
        const chunk = Object.fromEntries(entries.slice(i, i + chunkSize));
        chunks.push(chunk);
    }
    return chunks;
}

async function translate({SERVER_URL, API_KEY, ENDPOINT_ID, SystemContent, translateContent, lang, chunkSize = 50, onProgress }) {
    try {
        // 如果内容较大，进行分块处理
        const chunks = chunkObject(translateContent, chunkSize);
        let finalResult = {};
        const totalChunks = chunks.length;

        // 串行处理每个块
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
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
                            "content": JSON.stringify(chunk, null, 2) + ' ' + lang
                        }
                    ],
                    "temperature": 0.2
                }
            });
            
            const content = res.data.choices[0].message.content;
            // 合并翻译结果
            finalResult = { ...finalResult, ...JSON.parse(content) };
            
            // 计算并通知进度
            const progress = {
                current: i + 1,
                total: totalChunks,
                percentage: Math.round(((i + 1) / totalChunks) * 100),
                currentChunk: chunk,
                lang: lang
            };
            
            if (onProgress) {
                onProgress(progress);
            }
            
            // 添加随机延迟以避免API限制
            await new Promise(resolve => setTimeout(resolve, 500*Math.random()));
        }
        
        return [finalResult];
    } catch (error) {
        return [null, error.response?.data?.error];
    }
}

module.exports = {
    translate
}