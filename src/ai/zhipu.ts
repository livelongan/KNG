const DEFAULT_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4'
const DEFAULT_MODEL = 'glm-5.3-flash'

export type ZhipuModel = string

export interface ZhipuModelInfo {
  id: ZhipuModel
}

export type ZhipuMessageRole = 'system' | 'user' | 'assistant'

export interface ZhipuMessage {
  role: ZhipuMessageRole
  content: string
}

export interface ZhipuClientOptions {
  apiKey?: string
  baseUrl?: string
  model?: ZhipuModel
}

export interface ZhipuChatOptions {
  messages: ZhipuMessage[]
  model?: ZhipuModel
  temperature?: number
  top_p?: number
  max_tokens?: number
  reasoning_effort?: 'max' | 'xhigh' | 'high' | 'medium' | 'low' | 'minimal' | 'none'
  thinking?: {
    type: 'enabled' | 'disabled'
    clear_thinking?: boolean
  }
  signal?: AbortSignal
}

export interface ZhipuChatCompletion {
  id: string
  model: string
  choices: {
    message: {
      role: ZhipuMessageRole
      content: string | null
    }
    finish_reason: string | null
  }[]
}

export class ZhipuApiError extends Error {
  public readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'ZhipuApiError'
    this.status = status
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isChatCompletion(value: unknown): value is ZhipuChatCompletion {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.model !== 'string') {
    return false
  }

  return (
    Array.isArray(value.choices) &&
    value.choices.every(
      (choice: unknown) =>
        isRecord(choice) &&
        isRecord(choice.message) &&
        (choice.message.role === 'system' ||
          choice.message.role === 'user' ||
          choice.message.role === 'assistant') &&
        (typeof choice.message.content === 'string' || choice.message.content === null) &&
        (typeof choice.finish_reason === 'string' || choice.finish_reason === null),
    )
  )
}

function getErrorMessage(body: string, status: number): string {
  if (body.trim()) {
    try {
      const payload: unknown = JSON.parse(body)
      if (isRecord(payload)) {
        const error = payload.error
        if (isRecord(error) && typeof error.message === 'string') {
          const code =
            typeof error.code === 'string' || typeof error.code === 'number'
              ? ` (${error.code})`
              : ''
          const hint =
            status === 401
              ? ' 请确认 API Key 有效，且为标准模型 API Key；Coding Plan Key 与标准 API Key 不通用。'
              : status === 403
                ? ' 请确认该 API Key 有权调用此模型；Coding Plan Key 仅适用于官方指定工具。'
                : ''
          return `HTTP ${status}${code}: ${error.message}${hint}`
        }
        if (typeof payload.message === 'string') {
          return `HTTP ${status}: ${payload.message}`
        }
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error
      }
    }

    return `HTTP ${status}: ${body}`
  }

  return `智谱 API 请求失败（HTTP ${status}）`
}

export function createZhipuClient(options: ZhipuClientOptions) {
  const apiKey = options.apiKey?.trim() ?? ''
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
  const defaultModel = options.model ?? DEFAULT_MODEL

  function getAuthorizationHeaders(): Record<string, string> {
    return apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  }

  async function fetchApi(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init)
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(
          `无法连接智谱 API（${baseUrl}）。请检查网络连接、浏览器跨域限制或代理配置。`,
          { cause: error },
        )
      }
      throw error
    }
  }

  async function listModels(signal?: AbortSignal): Promise<ZhipuModelInfo[]> {
    const response = await fetchApi(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        ...getAuthorizationHeaders(),
      },
      signal,
    })
    const body = await response.text()

    if (!response.ok) {
      throw new ZhipuApiError(getErrorMessage(body, response.status), response.status)
    }

    let result: unknown
    try {
      result = JSON.parse(body)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('智谱模型列表接口返回了无法解析的 JSON', { cause: error })
      }
      throw error
    }

    if (
      !isRecord(result) ||
      !Array.isArray(result.data) ||
      !result.data.every((modelInfo: unknown) => isRecord(modelInfo) && typeof modelInfo.id === 'string')
    ) {
      throw new Error('智谱模型列表接口返回的数据格式不正确')
    }

    return result.data.map((modelInfo: { id: string }) => ({ id: modelInfo.id }))
  }

  async function createChatCompletion(
    chatOptions: ZhipuChatOptions,
  ): Promise<ZhipuChatCompletion> {
    if (chatOptions.messages.length === 0) {
      throw new Error('messages 不能为空')
    }

    const { signal, ...requestOptions } = chatOptions
    const model = chatOptions.model ?? defaultModel
    const flashModelDefaults =
      model === DEFAULT_MODEL
        ? {
            reasoning_effort: 'max',
            thinking: { type: 'enabled', clear_thinking: false },
          }
        : {}
    const response = await fetchApi(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        ...getAuthorizationHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stream: false,
        ...flashModelDefaults,
        ...requestOptions,
        model,
      }),
      signal,
    })
    const body = await response.text()

    if (!response.ok) {
      throw new ZhipuApiError(getErrorMessage(body, response.status), response.status)
    }

    let result: unknown
    try {
      result = JSON.parse(body)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('智谱 API 返回了无法解析的 JSON', { cause: error })
      }
      throw error
    }

    if (!isChatCompletion(result)) {
      throw new Error('智谱 API 返回的数据格式不正确')
    }

    return result
  }

  async function chat(chatOptions: ZhipuChatOptions): Promise<string> {
    const completion = await createChatCompletion(chatOptions)
    const content = completion.choices[0]?.message.content
    if (content === null || content === undefined) {
      throw new Error('智谱 API 响应中没有文本内容')
    }
    return content
  }

  return { chat, createChatCompletion, listModels }
}
