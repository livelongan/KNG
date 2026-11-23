#!/usr/bin/env node
/**
 * 列出小说原稿章节文件(.md/.txt),或对比原稿/副本目录的章节覆盖情况(零依赖,Node 18+)。
 *
 * 用法:
 *   node list-chapters.mjs <目录|文件> [更多目录或文件...]     列出章节
 *   node list-chapters.mjs <原稿目录> <副本目录>               对比覆盖情况
 *
 * 输出 JSON:
 *   列表模式 { count, totalBytes, totalChars, files: [{ path, lines, chars, bytes }] }
 *   对比模式 { count, copyCount, missingInCopy: [...], extraInCopy: [...] }
 *   (chars = 去空白字符数,即中文语境的"字数")
 *
 * - 目录递归扫描;按章节名自然排序(第2章排在第10章前,中文数字排序不可靠)。
 * - 自动忽略 summary.md、进度文件、隐藏文件与目录、非 md/markdown/txt。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import process from 'node:process'

const CHAPTER_EXT = new Set(['.md', '.markdown', '.txt'])
const EXCLUDED_DIRS = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage'])
const EXCLUDED_NAMES = new Set([
  'summary.md',
  '.novel-rewrite-progress.md',
  '.novel-stone-progress.md',
  '.translate-zh-progress.md',
])

const collator = new Intl.Collator('zh', { numeric: true, sensitivity: 'base' })

function isChapterFile(name) {
  const lower = name.toLowerCase()
  if (lower.startsWith('.') || EXCLUDED_NAMES.has(lower)) {
    return false
  }
  const dot = lower.lastIndexOf('.')
  if (dot < 0) {
    return false
  }
  return CHAPTER_EXT.has(lower.slice(dot))
}

function toDisplayPath(root, absPath) {
  const rel = relative(root, absPath)
  if (rel && !rel.startsWith('..')) {
    return rel.replaceAll(sep, '/')
  }
  return absPath.replaceAll(sep, '/')
}

function* walkFiles(dir) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const absPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
        yield* walkFiles(absPath)
      }
    } else if (entry.isFile() && isChapterFile(entry.name)) {
      yield absPath
    }
  }
}

function collectChapters(arg) {
  const absTarget = resolve(arg)
  let stat
  try {
    stat = statSync(absTarget)
  } catch {
    console.error(`跳过(路径不存在): ${arg}`)
    return []
  }
  if (stat.isFile()) {
    return [absTarget]
  }
  return [...walkFiles(absTarget)]
}

function analyze(displayPath, absPath) {
  const buffer = readFileSync(absPath)
  const text = buffer.toString('utf8')
  return {
    path: displayPath,
    lines: text.length === 0 ? 0 : text.split('\n').length,
    chars: text.replace(/\s/g, '').length,
    bytes: buffer.length,
  }
}

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error(
    '用法: node list-chapters.mjs <目录|文件>...   或   node list-chapters.mjs <原稿目录> <副本目录>',
  )
  process.exit(1)
}

const resolved = args.map((arg) => (isAbsolute(arg) ? arg : resolve(arg)))
const stats = resolved.map((absPath) => {
  try {
    return statSync(absPath)
  } catch {
    return null
  }
})

// 对比模式:两个参数且都是存在的目录
if (args.length === 2 && stats.every((entry) => entry?.isDirectory())) {
  const [sourceDir, copyDir] = resolved
  const sourceKeys = [...walkFiles(sourceDir)]
    .map((absFile) => relative(sourceDir, absFile).replaceAll(sep, '/'))
    .sort(collator.compare)
  const copyKeys = [...walkFiles(copyDir)].map((absFile) =>
    relative(copyDir, absFile).replaceAll(sep, '/'),
  )
  const sourceKeySet = new Set(sourceKeys)
  const copyKeySet = new Set(copyKeys)
  const missingInCopy = sourceKeys.filter((key) => !copyKeySet.has(key))
  const extraInCopy = [...copyKeySet].filter((key) => !sourceKeySet.has(key)).sort(collator.compare)

  console.log(
    JSON.stringify(
      { count: sourceKeys.length, copyCount: copyKeySet.size, missingInCopy, extraInCopy },
      null,
      2,
    ),
  )
  process.exit(0)
}

// 列表模式
const found = new Set()
for (const arg of args) {
  for (const absFile of collectChapters(arg)) {
    found.add(absFile)
  }
}

const chapters = [...found].sort((a, b) =>
  collator.compare(toDisplayPath(process.cwd(), a), toDisplayPath(process.cwd(), b)),
)

let totalBytes = 0
let totalChars = 0
const files = []
for (const absFile of chapters) {
  const displayPath = toDisplayPath(process.cwd(), absFile)
  try {
    const info = analyze(displayPath, absFile)
    totalBytes += info.bytes
    totalChars += info.chars
    files.push(info)
  } catch (error) {
    console.error(`跳过(无法读取): ${displayPath} — ${error instanceof Error ? error.message : error}`)
  }
}

console.log(JSON.stringify({ count: files.length, totalBytes, totalChars, files }, null, 2))
