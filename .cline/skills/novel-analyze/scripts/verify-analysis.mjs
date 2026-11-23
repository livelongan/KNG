#!/usr/bin/env node
/**
 * 校验 novel-analyze 产出文档之间的机械一致性(零依赖,Node 18+)。
 *
 * 用法:   node verify-analysis.mjs <书名-analysis 目录>
 * 检查:
 *   1. 04「人物弧线」的人物都出现在 03「人物速览表」
 *   2. 03 mermaid 引号标签若不在速览表 → 提示核对(身份/组织名可忽略)
 *   3. mermaid 节点 id 应为纯 ASCII(含中文 → 警告)
 *   4. 03 存在 mermaid 代码块且围栏配对
 *   5. 05「专有名词表」的术语在 01–04 中至少出现一次(孤立术语)
 * 输出:JSON { files, mermaidBlocks, warningCount, warnings: [{ code, message, detail }] }
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/

const dir = process.argv[2]
if (!dir) {
  console.error('用法: node verify-analysis.mjs <书名-analysis 目录>')
  process.exit(1)
}

function readFileByPrefix(prefix) {
  try {
    const name = readdirSync(dir).find(
      (entry) => entry.startsWith(prefix) && entry.toLowerCase().endsWith('.md'),
    )
    if (!name) {
      return null
    }
    return { name, text: readFileSync(join(dir, name), 'utf8') }
  } catch {
    return null
  }
}

function section(text, title) {
  const start = text.indexOf(title)
  if (start < 0) {
    return ''
  }
  const next = text.indexOf('\n## ', start + title.length)
  return next < 0 ? text.slice(start) : text.slice(start, next)
}

const SKIP_CELLS = new Set(['姓名', '人物', '术语'])

function tableFirstColumn(sectionText) {
  const values = []
  for (const rawLine of sectionText.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line.startsWith('|')) {
      continue
    }
    const value = (line.split('|')[1] ?? '').trim()
    if (!value || SKIP_CELLS.has(value) || /^:?-+:?$/.test(value)) {
      continue
    }
    values.push(value)
  }
  return values
}

const warnings = []
const files = {}
for (const prefix of ['01-', '02-', '03-', '04-', '05-']) {
  files[prefix] = readFileByPrefix(prefix)
  if (!files[prefix]) {
    warnings.push({ code: 'MISSING_FILE', message: `缺少 ${prefix}*.md`, detail: '' })
  }
}

// 03:速览表人名 + mermaid 检查
const overviewNames = new Set()
let mermaidBlocks = 0
if (files['03-']) {
  for (const name of tableFirstColumn(section(files['03-'].text, '## 人物速览表'))) {
    overviewNames.add(name)
  }
  const blocks = [...files['03-'].text.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)]
  mermaidBlocks = blocks.length
  if (mermaidBlocks === 0) {
    warnings.push({
      code: 'NO_MERMAID',
      message: '03-人物关系.md 中没有 mermaid 关系图',
      detail: '',
    })
  }

  const unknownLabels = new Set()
  for (const block of blocks) {
    const body = block[1]
    // 节点 id 含中文(形如 `中文[` 或 `中文(` 的节点定义)
    for (const match of body.matchAll(/(^|\s)([^\s"'[\]():]+)[[(]/g)) {
      if (CJK.test(match[2])) {
        warnings.push({
          code: 'MERMAID_CJK_ID',
          message: `mermaid 节点 id 含中文:「${match[2]}」,应改为 ASCII id、中文放引号内标签`,
          detail: '',
        })
      }
    }
    for (const match of body.matchAll(/\["([^"]+)"\]/g)) {
      const core = match[1].replace(/\(.*?\)/g, '').trim()
      if (core && !overviewNames.has(core)) {
        unknownLabels.add(match[1])
      }
    }
  }
  if (unknownLabels.size > 0) {
    warnings.push({
      code: 'MERMAID_LABELS_NOT_IN_TABLE',
      message: '以下 mermaid 标签未出现在 03 速览表(若为身份/组织/地名可忽略):',
      detail: [...unknownLabels].join('、'),
    })
  }
}

// 04:人物弧线小节标题与速览表对齐
if (files['04-'] && files['03-']) {
  const arcSection = section(files['04-'].text, '## 人物弧线')
  if (!arcSection) {
    warnings.push({ code: 'NO_ARC_SECTION', message: '04 缺少「## 人物弧线」小节', detail: '' })
  } else {
    const unknownNames = [...arcSection.matchAll(/^### (.+)$/gm)]
      .map((match) => match[1].trim())
      .filter((name) => name && !overviewNames.has(name))
    if (unknownNames.length > 0) {
      warnings.push({
        code: 'ARC_NAME_NOT_IN_TABLE',
        message: '04 人物弧线的以下人物不在 03 人物速览表中(拼写不一致或漏登记):',
        detail: unknownNames.join('、'),
      })
    }
  }
}

// 05:专有名词孤立检查
if (files['05-']) {
  const terms = tableFirstColumn(section(files['05-'].text, '## 专有名词表'))
  const corpus = ['01-', '02-', '03-', '04-']
    .map((prefix) => files[prefix]?.text ?? '')
    .join('')
  const orphans = terms.filter((term) => !corpus.includes(term))
  if (orphans.length > 0) {
    warnings.push({
      code: 'ORPHAN_TERM',
      message: `以下 ${orphans.length} 个术语未在 01–04 中出现(孤立设定,请核对):`,
      detail: orphans.slice(0, 20).join('、'),
    })
  }
}

console.log(
  JSON.stringify(
    {
      files: Object.fromEntries(
        Object.entries(files).map(([prefix, value]) => [prefix, value ? value.name : null]),
      ),
      mermaidBlocks,
      warningCount: warnings.length,
      warnings,
    },
    null,
    2,
  ),
)
