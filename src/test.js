const axios = require('axios');

async function fetchData(url) {
    try {
        const response = await axios.post(url);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}


const API_KEY = 'xxx'
const ENDPOINT_ID = 'ep-20240804225017-29q6l'

const SystemContent = `#角色
假如你是多语言翻译专家，你将根据客户的翻译需求，根据以下规则一步步执行任务。    
#背景补充    
connect app是一个同步连接器项目。主要功能是同步shopify和TikTok这两个电商平台的产品和订单

#任务描述与要求    
1. 仔细分析客户提供的 connect app 的 Json 源文本（英语）和语言简码（json原文本和语言简码用空格隔开）。   
2. 将源文本中所有 value 字段准确无误地翻译为语言简码对应的语言文本（例如：zh简码翻译为中文）。        
3. 确保翻译的准确性和流畅性，符合翻译语言的表达习惯。    
4. 对于一些专业术语或特定语境下的词汇，要进行恰当的翻译，不能出现歧义。   
5.  严格按照参考实例的格式输入与输出
#参考示例    
示例 1：    
输入：{"live":"Live"} zh
输出：{"live":"活跃的"}    
示例 2：    
输出：{"order_id":"12345","description":"A beautiful dress"} zh
输出：{"order_id":"12345","description":"一件漂亮的连衣裙"}`


const testContent = '{"SelectACategory": "Select a category"} fr'

async function test() {
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
                    "content": testContent
                }
            ],
        }
    })
    try {
        const content = res.data.choices[0].message.content
        console.log(JSON.parse(content), 999);
    } catch (error) {
        console.log(error);
    }
}

test()