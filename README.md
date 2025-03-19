# i18n-ai-trans

**i18n-ai-trans** i18n-ai-trans 是一个高效、简洁的多语言翻译工具，开箱即用，零依赖，安装后只需简单几步就能实现整个多语言文本的快速翻译。

## 功能演示
![](https://media.giphy.com/media/7HhZwOLJAZ14kn7wlT/giphy.gif)
![](https://media.giphy.com/media/nYUvsRocA0INuxyblZ/giphy.gif)

## 特点

- **简单易用**: 开箱即用，零依赖，仅需简单的配置与命令即可启动翻译流程。
- **高效快速**: 通过AI进行翻译，只需要短短几秒就能完成整个多语言的翻译工作。
- **增量翻译**: 翻译前进行内容检查，对于已翻译过或者修改过的字段不会翻译。
- **高度可定制**: 支持通过配置文件扩展功能（主要是优化prompt）。
- **支持namespace**: 支持命名空间（项目较大时会将某个语言的翻译文本放在文件夹中，插件在翻译前会自动检测是否启用了命名空间，再进行翻译工作）。



## 快速开始

### 安装

```sh
npm install i18n-ai-trans --save-dev
```

### 初始化配置

```sh
npx i18n-ai-trans init
```

这将创建一个默认的配置文件 `i18n_translate.config.js`。


### 配置文件

编辑 `i18n_translate.config.js` 来定义您的翻译设置，例如：

```javascript
module.exports = {
    // API_KEY,找良荣要
    API_KEY: '',
    // 模型ID
    ENDPOINT_ID: 'deepseek-v3',
    // 模型预设内容 https://www.volcengine.com/docs/82379/1221660
    SystemContent: `
  #角色
  假如你是多语言翻译专家，你将根据客户的翻译需求，根据以下规则一步步执行任务。    
  #背景补充    
  EcomSend Feed 是一个同步连接器项目。主要功能是同步shopify和TikTok这两个电商平台的产品和订单。
  
  #任务描述与要求    
  1. 仔细分析客户提供的 EcomSend Feed 的 Json 源文本（英语）和语言简码（json原文本和语言简码用空格隔开）。   
  2. 将源文本中所有 value 字段准确无误地翻译为语言简码对应的语言文本
     1. 语言简码的关系如下 en->English,zh-CN->Chinese (Simplified),zh-TW->Chinese (Traditional),fr->French,de->German,it->Italian,es->Spanish,pt-PT->Portuguese (Portugal)
  3. 确保翻译的准确性和流畅性，符合翻译语言的表达习惯。    
  4. 对于一些专业术语或特定语境下的词汇，要进行恰当的翻译，不能出现歧义。   
  5.  严格按照参考实例的格式输入与输出
  #参考示例    
  示例 1：    
  输入：{"live":"Live"} zh-CN
  输出：{"live":"活跃的"}    
  示例 2：    
  输出：{"order_id":"12345","description":"A beautiful dress"} zh-CN
  输出：{"order_id":"12345","description":"一件漂亮的连衣裙"}
  示例 3：    
  输出：{"name":"EcomSend Feed"} zh-CN
  输出：{"name":"EcomSend Feed"}
      `,
    // 翻译目录（相对路径）
    translateDir: './src/locales',
    // 源语言,默认en
    sourceLang: 'en',
    // app需要支持多少种语言
    langs: ['en', 'zh-CN', 'zh-TW', 'fr', 'de', 'it', 'es', 'pt-PT'],
    // git根目录
    gitRoot: '.',
}
```
| 配置字段        | 含义                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `API_KEY`       | 密钥，找良荣要                                                                                                                          |
| `ENDPOINT_ID`   | 模型名称 默认：deepseek-v3                                                                                                              |
| `SystemContent` | 预制文本，设定模型的行为和背景，告知模型需要扮演的角色。可以查看[Prompt最佳实践](https://www.volcengine.com/docs/82379/1221660)了解更多 |
| `translateDir`  | 需要翻译的文件夹目录（相对路径）                                                                                                        |
| `sourceLang?`   | 源语言 默认：en                                                                                                                         |
| `langs?`        | app需要支持哪些语言，例如：["en", "zh-CN"]                                                                                              |
| `gitRoot?`        | git根目录，相对路径                                                                                 |


### 开始翻译

```sh
npx i18n-ai-trans translate
```

此命令会自动处理未翻译的条目，并更新相应的语言包文件。

## 工作原理

1. **检测缺失翻译**: 找出语言包中的缺失或者未翻译的字段。
2. **调用 AI 接口**: 调取AI翻译接口进行文本翻译。
3. **更新语言包**: 将新翻译的内容整合到对应的语言包中。



