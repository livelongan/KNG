#!/usr/bin/env node
/**
 * 原稿/重写稿逐行 n-gram 查重(零依赖,Node 18+)。
 *
 * 用法:   node check-similarity.mjs <原稿文件> <重写稿文件> [--n=12]
 * 输出:   JSON { n, originalChars, copyChars, duplicateChars, ratio, longestCommonRun,
 *                violationCount, violations: [{ length, copyLine, originalLine, text }] }
 *
 * - 检测两文件中连续 ≥ n 字符的相同片段(跨行片段会拆成多段上报)。
 * - violations 按 length 降序,最多返回 50 条;text 超过 60 字符时截断并注明总长。
 * - violationCount > 0 表示需要继续改写;longestCommonRun 应 ≤ n。
 */
import { readFileSync } from 'node:fs'
import process from 'node:process'

const args = process.argv.slice(2)
let n = 12
const files = []
for (const arg of args) {
  if (arg.startsWith('--n=')) {
    const parsed = Number.parseInt(arg.slice(4), 10)
    if (Number.isFinite(parsed) && parsed >= 4) {
      n = parsed
    } else {
      console.error('无效的 --n 参数')
      process.exit(1)
    }
  } else {
    files.push(arg)
  }
}

if (files.length !== 2) {
  console.error('用法: node check-similarity.mjs <原稿文件> <重写稿文件> [--n=12]')
  process.exit(1)
}

const readLines = (path) => readFileSync(path, 'utf8').split(/\r?\n/)
const originalLines = readLines(files[0])
const copyLines = readLines(files[1])

// 索引原稿全部 n-gram → 出现的行号列表
const index = new Map()
for (let li = 0; li < originalLines.length; li++) {
  const line = originalLines[li]
  for (let i = 0; i + n <= line.length; i++) {
    const gram = line.slice(i, i + n)
    const list = index.get(gram)
    if (list) {
      list.push(li)
    } else {
      index.set(gram, [li])
    }
  }
}

const violations = []
let duplicateChars = 0

for (let ci = 0; ci < copyLines.length; ci++) {
  const line = copyLines[ci]
  let i = 0
  while (i + n <= line.length) {
    const gram = line.slice(i, i + n)
    const candidates = index.get(gram)
    if (!candidates) {
      i += 1
      continue
    }
    // 在候选原稿行上向右扩展,取最长匹配
    let bestLength = n
    let bestOriginalLine = candidates[0]
    for (const li of candidates) {
      const sourceLine = originalLines[li]
      const start = sourceLine.indexOf(gram)
      if (start < 0) {
        continue
      }
      let length = n
      while (
        i + length < line.length &&
        start + length < sourceLine.length &&
        line[i + length] === sourceLine[start + length]
      ) {
        length += 1
      }
      if (length > bestLength) {
        bestLength = length
        bestOriginalLine = li
      }
    }
    violations.push({
      length: bestLength,
      copyLine: ci + 1,
      originalLine: bestOriginalLine + 1,
      text: line.slice(i, i + bestLength),
    })
    duplicateChars += bestLength
    i += bestLength
  }
}

violations.sort((a, b) => b.length - a.length || a.copyLine - b.copyLine)

const originalChars = originalLines.join('').replace(/\s/g, '').length
const copyChars = copyLines.join('').replace(/\s/g, '').length
const longestCommonRun = violations.reduce((max, item) => Math.max(max, item.length), 0)

console.log(
  JSON.stringify(
    {
      n,
      originalChars,
      copyChars,
      duplicateChars,
      ratio: copyChars === 0 ? 0 : Number((duplicateChars / copyChars).toFixed(4)),
      longestCommonRun,
      violationCount: violations.length,
      violations: violations.slice(0, 50).map((item) => ({
        ...item,
        text:
          item.text.length > 60
            ? `${item.text.slice(0, 60)}…(共 ${item.length} 字)`
            : item.text,
      })),
    },
    null,
    2,
  ),
)
