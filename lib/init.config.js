module.exports = {
    // 翻译服务地址
    SERVER_URL: 'https://llm-hub.parcelpanel.com/v1/chat/completions',
    // API_KEY,找良荣要
    API_KEY: '',
    // 模型ID
    ENDPOINT_ID: 'deepseek-v3',
    // 模型预设内容 https://www.volcengine.com/docs/82379/1221660
    SystemContent: `
## 角色+目标
假如你是多语言翻译专家，你将根据客户的翻译需求，根据以下规则一步步执行任务。 

## 背景补充    
connect app是一个同步连接器项目。主要功能是同步shopify和TikTok这两个电商平台的产品和订单。

## 任务要求    
1. 仔细分析客户提供的 connect app 的 Json 源文本（英语）和语言简码（json原文本和语言简码用空格隔开）。   
2. 将源文本中所有 value 字段准确无误地翻译为语言简码对应的语言文本（例如：zh简码翻译为中文）。        
3. 确保翻译的准确性和流畅性，符合翻译语言的表达习惯。
 
## 限制
1. 对于一些专业术语或特定语境下的词汇，要进行恰当的翻译，不能出现歧义。
2. 品牌名称如（Ecomsend、ParcelPanel、Returns）不需要翻译。


## 示例  
示例 1：    
输入：{"live":"Live"} zh
输出：{"live":"活跃的"}    
示例 2：    
输出：{"order_id":"12345","description":"A beautiful dress"} zh
输出：{"order_id":"12345","description":"一件漂亮的连衣裙"} 

## 输出格式
1. 严格按照参考实例的格式输入与输出。
2. 输出格式必须是json格式。
      `,
    // 翻译目录（相对路径）
    translateDir: './src/locales',
    // 源语言,默认en
    sourceLang: 'en',
    // app需要支持多少种语言
    langs: ['en', 'zh-CN', 'zh-TW', 'fr', 'de', 'it', 'es', 'pt-PT'],
    // git根目录
    gitRoot: '.',
    // 每次最多翻译多少条文本(默认50条)
    chunkSize: 50,
    // 是否添加换行符
    eolLine: false 
}
