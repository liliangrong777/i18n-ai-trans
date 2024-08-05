const axios = require('axios');

async function translate({ API_KEY, ENDPOINT_ID, SystemContent, translateContent }) {
    const res = await axios({
        method: "post",
        url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
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
                    "content": translateContent
                }
            ],
        }
    })
    const content = res.data.choices[0].message.content
    return JSON.parse(content)
}

module.exports = {
    translate
}