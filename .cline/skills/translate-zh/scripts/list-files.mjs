#!/usr/bin/env node
/**
 * 列出待中文化的候选文件(零依赖,Node 18+)。
 *
 * 用法:   node list-files.mjs <路径|glob>...
 * 示例:   node list-files.mjs src/ai readme.md
 *         node list-files.mjs "src" 双星加斜杠加星点md(含星号参数请加引号)
 *
 * - 目录会递归扫描;glob 支持双星(跨目录)、单星(目录内)、问号。
 * - 自动排除 node_modules、dist、.git、.env*、lock 文件、二进制与压缩文件。
 * - cjkRatio = 中文字符数 / 非空白字符数,>= 0.3 一般视为已中文化。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import process from 'node:process'

const EXCLUDED_DIRS = new Set([
  '.git', '.claude', '.cline', '.idea', '.vscode',
  'node_modules', 'dist', 'build', 'coverage',
])

const EXCLUDED_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.webm', '.zip', '.gz', '.pdf', '.lock',
])

const EXCLUDED_FILE_PATTERNS = [
  /^\.env(\.|$)/i,
  /(^|\/)package-lock\.json$/,
  /\.min\./,
  /(^|\/)\.translate-zh-progress\.md$/,
]

const CJK_REGEX = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g

function isExcludedFile(relPath) {
  return EXCLUDED_FILE_PATTERNS.some((pattern) => pattern.test(relPath))
}

function* walkFiles(absDir) {
  let entries
  try {
    entries = readdirSync(absDir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const absPath = join(absDir, entry.name)
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        yield* walkFiles(absPath)
      }
    } else if (entry.isFile()) {
      yield absPath
    }
  }
}

function globToRegex(pattern) {
  const p = pattern.replaceAll('\\', '/')
  let re = ''
  let i = 0
  while (i < p.length) {
    const ch = p[i]
    if (ch === '*') {
      if (p[i + 1] === '*') {
        i += 2
        if (p[i] === '/') {
          i += 1
          re += '(?:[^/]*/)*'
        } else {
          re += '.*'
        }
      } else {
        i += 1
        re += '[^/]*'
      }
    } else if (ch === '?') {
      i += 1
      re += '[^/]'
    } else {
      re += /[.+^${}()|[\]\\]/.test(ch) ? `\\${ch}` : ch
      i += 1
    }
  }
  return new RegExp(`^${re}$`)
}

function analyze(relPath, absPath) {
  const buffer = readFileSync(absPath)
  const text = buffer.toString('utf8')
  const nonWhitespace = text.replace(/\s/g, '')
  const cjkCount = (text.match(CJK_REGEX) ?? []).length
  const total = nonWhitespace.length
  return {
    path: relPath,
    lines: text.length === 0 ? 0 : text.split('\n').length,
    bytes: buffer.length,
    hasChinese: cjkCount > 0,
    cjkRatio: total === 0 ? 0 : Number((cjkCount / total).toFixed(3)),
  }
}

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('用法: node list-files.mjs <路径|glob>...   示例: node list-files.mjs src/ai "**/*.md"')
  process.exit(1)
}

const root = process.cwd()
const found = new Map()

for (const arg of args) {
  const hasGlobChar = /[*?]/.test(arg)
  const absTarget = join(root, arg)

  if (!hasGlobChar) {
    let stat
    try {
      stat = statSync(absTarget)
    } catch {
      console.error(`跳过(路径不存在): ${arg}`)
      continue
    }
    if (stat.isDirectory()) {
      for (const absFile of walkFiles(absTarget)) {
        found.set(absFile, true)
      }
    } else {
      found.set(absTarget, true)
    }
  } else {
    const regex = globToRegex(arg)
    for (const absFile of walkFiles(root)) {
      const relPath = relative(root, absFile).replaceAll(sep, '/')
      if (regex.test(relPath)) {
        found.set(absFile, true)
      }
    }
  }
}

const files = []
for (const absFile of found.keys()) {
  const relPath = relative(root, absFile).replaceAll(sep, '/')
  const ext = relPath.slice(relPath.lastIndexOf('.')).toLowerCase()
  if (EXCLUDED_EXT.has(ext) || isExcludedFile(relPath)) {
    continue
  }
  try {
    files.push(analyze(relPath, absFile))
  } catch (error) {
    console.error(`跳过(无法读取): ${relPath} — ${error instanceof Error ? error.message : error}`)
  }
}

files.sort((a, b) => a.cjkRatio - b.cjkRatio || a.path.localeCompare(b.path))

console.log(JSON.stringify({ count: files.length, files }, null, 2))
