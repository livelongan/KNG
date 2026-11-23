export interface ProposedFileChange {
  path: string
  content: string
}

export interface FileChangeInspection {
  change: ProposedFileChange
  exists: boolean
  existingContent?: string
  existingFileTooLarge?: boolean
}

export interface ParsedAiFileProposal {
  displayContent: string
  proposal?: ProposedFileChange[]
  error?: string
}

const maxProposedFiles = 20
const maxProposedContentLength = 200_000
const maxProposedTotalLength = 500_000
const maxPreviewFileSize = 200_000
const aiFilesBlock = /```ai-files\s*([\s\S]*?)```/i
const textFileExtensions = new Set([
  '.c',
  '.cc',
  '.cfg',
  '.conf',
  '.cpp',
  '.cs',
  '.css',
  '.csv',
  '.dart',
  '.go',
  '.h',
  '.hpp',
  '.html',
  '.ini',
  '.java',
  '.js',
  '.json',
  '.jsx',
  '.kt',
  '.less',
  '.md',
  '.mjs',
  '.py',
  '.rb',
  '.rs',
  '.sass',
  '.scss',
  '.sh',
  '.sql',
  '.svg',
  '.svelte',
  '.swift',
  '.toml',
  '.ts',
  '.tsx',
  '.txt',
  '.vue',
  '.xml',
  '.yaml',
  '.yml',
])
const textFileNames = new Set([
  '.gitattributes',
  '.gitignore',
  'dockerfile',
  'license',
  'makefile',
  'procfile',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeAndValidatePath(path: string): string | null {
  const normalizedPath = path.replace(/\\/g, '/')
  const segments = normalizedPath.split('/')
  const protectedSegments = new Set(['.git', 'node_modules'])
  const fileName = segments[segments.length - 1]?.toLowerCase() ?? ''
  const fileExtension = fileName.slice(fileName.lastIndexOf('.'))

  if (
    !normalizedPath.trim() ||
    normalizedPath.startsWith('/') ||
    /^[a-z]:/i.test(normalizedPath) ||
    normalizedPath.includes('\0') ||
    segments.some((segment) => !segment || segment === '.' || segment === '..') ||
    segments.some((segment) => protectedSegments.has(segment.toLowerCase())) ||
    fileName === '.env' ||
    fileName.startsWith('.env.') ||
    /\.(pem|key|p12|pfx|secret)$/i.test(fileName) ||
    (!textFileExtensions.has(fileExtension) && !textFileNames.has(fileName))
  ) {
    return null
  }

  return normalizedPath
}

export function isShareableTextFilePath(path: string): boolean {
  return normalizeAndValidatePath(path) !== null
}

function assertValidProposedChanges(changes: ProposedFileChange[]): void {
  if (changes.length === 0 || changes.length > maxProposedFiles) {
    throw new Error(`文件方案数量必须在 1 到 ${maxProposedFiles} 之间`)
  }

  const paths = new Set<string>()
  let totalLength = 0
  for (const change of changes) {
    if (normalizeAndValidatePath(change.path) !== change.path) {
      throw new Error(`文件路径不安全或无效：${change.path}`)
    }
    if (paths.has(change.path)) {
      throw new Error(`文件方案中有重复路径：${change.path}`)
    }
    if (change.content.length > maxProposedContentLength) {
      throw new Error(`文件内容过大：${change.path}`)
    }

    totalLength += change.content.length
    if (totalLength > maxProposedTotalLength) {
      throw new Error('文件方案总内容过大，请拆分成多个请求。')
    }
    paths.add(change.path)
  }
}

export function parseAiFileProposal(content: string): ParsedAiFileProposal {
  const matches = content.match(/```ai-files\b/gi) ?? []
  if (matches.length === 0) {
    return { displayContent: content }
  }

  if (matches.length > 1) {
    return {
      displayContent: content,
      error: 'AI 返回了多个文件方案，请让它一次只生成一个文件方案。',
    }
  }

  const match = aiFilesBlock.exec(content)
  if (!match) {
    return {
      displayContent: content,
      error: 'AI 文件方案格式不完整，请让它重新生成。',
    }
  }

  let payload: unknown
  try {
    payload = JSON.parse(match[1])
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        displayContent: content,
        error: 'AI 文件方案不是有效 JSON，请让它重新生成。',
      }
    }
    throw error
  }

  if (!isRecord(payload) || !Array.isArray(payload.files) || payload.files.length === 0) {
    return {
      displayContent: content,
      error: 'AI 文件方案需要包含非空的 files 数组。',
    }
  }

  if (payload.files.length > maxProposedFiles) {
    return {
      displayContent: content,
      error: `一次最多处理 ${maxProposedFiles} 个文件。`,
    }
  }

  const proposal: ProposedFileChange[] = []
  const paths = new Set<string>()
  let totalLength = 0

  for (const item of payload.files) {
    if (!isRecord(item) || typeof item.path !== 'string' || typeof item.content !== 'string') {
      return {
        displayContent: content,
        error: '文件方案中的每一项都必须包含字符串 path 和 content。',
      }
    }

    const path = normalizeAndValidatePath(item.path)
    if (!path) {
      return {
        displayContent: content,
        error: `文件路径不安全或无效：${item.path}`,
      }
    }

    if (paths.has(path)) {
      return {
        displayContent: content,
        error: `文件方案中有重复路径：${path}`,
      }
    }

    if (item.content.length > maxProposedContentLength) {
      return {
        displayContent: content,
        error: `文件内容过大：${path}`,
      }
    }

    totalLength += item.content.length
    if (totalLength > maxProposedTotalLength) {
      return {
        displayContent: content,
        error: '文件方案总内容过大，请拆分成多个请求。',
      }
    }

    paths.add(path)
    proposal.push({ path, content: item.content })
  }

  const displayContent = content.replace(aiFilesBlock, '').trim()
  return { displayContent, proposal }
}

async function inspectExistingFile(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<Pick<FileChangeInspection, 'exists' | 'existingContent' | 'existingFileTooLarge'>> {
  const segments = path.split('/')
  const fileName = segments.pop()
  if (!fileName) {
    return { exists: false }
  }

  try {
    let directory = root
    for (const segment of segments) {
      directory = await directory.getDirectoryHandle(segment)
    }
    const file = await (await directory.getFileHandle(fileName)).getFile()
    if (file.size > maxPreviewFileSize) {
      return { exists: true, existingFileTooLarge: true }
    }
    return { exists: true, existingContent: await file.text() }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      return { exists: false }
    }
    throw error
  }
}

export async function inspectFileChanges(
  root: FileSystemDirectoryHandle,
  changes: ProposedFileChange[],
): Promise<FileChangeInspection[]> {
  assertValidProposedChanges(changes)
  return Promise.all(
    changes.map(async (change) => ({
      change,
      ...(await inspectExistingFile(root, change.path)),
    })),
  )
}

export class FileWriteError extends Error {
  public readonly path: string
  public readonly writtenCount: number

  constructor(path: string, writtenCount: number, cause: unknown) {
    super(`写入 ${path} 失败`, { cause })
    this.name = 'FileWriteError'
    this.path = path
    this.writtenCount = writtenCount
  }
}

export async function writeFileChanges(
  root: FileSystemDirectoryHandle,
  changes: ProposedFileChange[],
): Promise<void> {
  assertValidProposedChanges(changes)
  for (const [index, change] of changes.entries()) {
    try {
      const segments = change.path.split('/')
      const fileName = segments.pop()
      if (!fileName) {
        throw new Error(`无效的文件路径：${change.path}`)
      }

      let directory = root
      for (const segment of segments) {
        directory = await directory.getDirectoryHandle(segment, { create: true })
      }

      const fileHandle = await directory.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(change.content)
      await writable.close()
    } catch (error) {
      throw new FileWriteError(change.path, index, error)
    }
  }
}
