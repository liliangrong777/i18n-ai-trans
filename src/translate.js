const axios = require('axios');

function chunkObject(obj) {
    // 将对象按照键值对拆分成更小的块
    const entries = Object.entries(obj);
    const chunks = [];
    const CHUNK_SIZE = 30; // 可以根据实际情况调整块大小
    
    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
        const chunk = Object.fromEntries(entries.slice(i, i + CHUNK_SIZE));
        chunks.push(chunk);
    }
    return chunks;
}

async function translate({SERVER_URL, API_KEY, ENDPOINT_ID, SystemContent, translateContent, lang, onProgress }) {
    try {
        // 如果内容较大，进行分块处理
        const chunks = chunkObject(translateContent);
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
                currentChunk: chunk
            };
            
            if (onProgress) {
                onProgress(progress);
            }
            
            // 添加随机延迟以避免API限制
            await new Promise(resolve => setTimeout(resolve, 1000*Math.random()));
        }
        
        return [finalResult];
    } catch (error) {
        console.error('translate failed');
        return [null, error.response?.data?.error];
    }
}

module.exports = {
    translate
}