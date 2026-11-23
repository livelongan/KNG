# 智谱 AI 公共调用

`createZhipuClient` 封装了智谱 OpenAI 兼容接口 `chat/completions`，提供 `chat`（返回 `{ content, usage }`，`usage` 是本次请求的 token 用量统计）和 `createChatCompletion`（获取完整响应）两个方法。

```ts
import { createZhipuClient } from './ai'

const zhipu = createZhipuClient({
  baseUrl: '/api/zhipu',
  model: 'glm-5.3-flash',
})

const models = await zhipu.listModels()
console.log(models.map(({ id }) => id))

const answer = await zhipu.chat({
  messages: [
    { role: 'system', content: '你是一个有帮助的助手。' },
    { role: 'user', content: '你好' },
  ],
})
```

可通过 `model` 选择模型，也可通过 `baseUrl` 指定兼容接口地址。单次请求还支持 `temperature`、`top_p`、`max_tokens`、`reasoning_effort`、`thinking` 和 `signal`。默认模型 `glm-5.3-flash` 会使用智谱文档建议的 `reasoning_effort: "max"`、启用思考，并显式关闭流式输出。

`listModels()` 会向智谱 OpenAI 兼容接口的 `/models` 请求模型 ID；对话页不会再维护自行猜测的静态模型列表。返回内容以当前接口/API Key 实际可见的结果为准。标准模型 API 的 Base URL 为 `https://open.bigmodel.cn/api/paas/v4`。Coding Plan API Key 与标准模型 API Key 分开管理、互不通用；Coding Plan 也仅能在官方指定工具中使用，因此本自定义页面应使用标准模型 API Key。可查看[智谱官方模型概览](https://docs.bigmodel.cn/cn/guide/start/model-overview.md)、[OpenAI 兼容接入说明](https://docs.bigmodel.cn/cn/guide/develop/openai/introduction.md)和[Coding Plan 快速开始](https://docs.bigmodel.cn/cn/coding-plan/quick-start.md)。

**Token 用量与余额：** 每次 `chat` 的结果会带回官方 `usage`（`prompt_tokens` / `completion_tokens` / `total_tokens`，以及缓存命中的 `cached_tokens`）。智谱官方没有开放账户余额或资源包余量的查询接口（已核对官方 OpenAPI 规范，相关候选路径实测均返回 404），如需查看剩余额度，请前往[财务总览](https://open.bigmodel.cn/finance/overview)或[资源包页面](https://open.bigmodel.cn/finance/resourcepack)。

**密钥安全：** AI 聊天页通过同源 `/api/zhipu` 请求，Vite 开发服务器从项目根目录 `.env.local` 的 `ZHIPU_API_KEY=你的密钥` 读取密钥并代理到智谱，密钥不会发送到浏览器。为兼容旧配置，开发代理也暂时支持读取 `VITE_ZHIPU_API_KEY`，建议迁移到不带 `VITE_` 前缀的 `ZHIPU_API_KEY`。页面进入时会自动读取官方模型列表。部署生产环境时，必须在 Web 服务端实现同样的 `/api/zhipu` 代理并从服务端环境变量读取密钥；不要将密钥放进前端构建产物。

## AI 对话页面

访问 `/ai-chat` 可使用聊天界面。页面允许手动附加文本文件或选择目录作为上下文；所选文本会发送给智谱 API。AI 提议创建或修改文件时，页面会先展示完整的新内容、检查目标目录中的已有文件，并在用户再次确认后才写入。文件访问由浏览器目录选择器授权，写入功能需要支持 File System Access API 的安全上下文（例如最新版 Chrome 或 Edge）。

页面不会持久化 API Key 或聊天记录，但因为这是纯前端应用，输入的 Key 仍会在浏览器中用于直接请求智谱。请仅在本地个人环境使用这种方式；公开部署前应改为服务端代理。
