const axios = require('axios');

// 添加重试函数
async function retryTranslation(attempt, maxRetries, translationFn) {
    try {
        return await translationFn();
    } catch (error) {
        if (attempt < maxRetries) {
            console.log(`翻译失败，正在进行第 ${attempt + 1} 次重试...`);
            // 在重试前等待一段时间
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            return retryTranslation(attempt + 1, maxRetries, translationFn);
        }
        throw error;
    }
}

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
        const chunks = chunkObject(translateContent, chunkSize);
        let finalResult = {};
        const totalChunks = chunks.length;

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            // 将翻译请求包装在重试函数中
            const content = await retryTranslation(0, 2, async () => {
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
                return res.data.choices[0].message.content;
            });
            
  
            finalResult = { ...finalResult, ...JSON.parse(content) };
            
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