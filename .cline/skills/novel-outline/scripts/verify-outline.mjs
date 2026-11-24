#!/usr/bin/env node
/**
 * 校验 novel-outline 产出文档之间的机械一致性(零依赖,Node 18+)。
 *
 * 用法:   node verify-outline.mjs <书名-outline 目录>
 * 检查:
 *   1. 01–04 四份文档齐全
 *   2. 01 必备小节(一句话简介/简介/人物小传)与「📖 教学注释」存在;人物小传表头含「暗线身份」列;
 *      mermaid 节点 id 纯 ASCII;mermaid 标签与人物小传表对齐
 *   3. 02 必备小节(明线与暗线/全书结构/明线事件链)与教学注释存在
 *   4. 03 逐章表头含「暗线动态」列;存在逐章表并统计章数;章号唯一;03 引用的 F## 必须在 04 有定义
 *   5. 04 必备小节(伏笔表/统一名表/自检十问);伏笔编号格式;04 定义的
 *      F## 必须在 02/03 中被引用;统一名表的定稿名必须出现在 01
 * 输出:JSON { files, chapterCount, foreshadowingCount, mermaidBlocks, warningCount, warnings: [{ code, message, detail }] }
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/

const dir = process.argv[2]
if (!dir) {
  console.error('用法: node verify-outline.mjs <书名-outline 目录>')
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

const SKIP_CELLS = new Set(['姓名', '章节', '编号', '定稿名'])

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
for (const prefix of ['01-', '02-', '03-', '04-']) {
  files[prefix] = readFileByPrefix(prefix)
  if (!files[prefix]) {
    warnings.push({ code: 'MISSING_FILE', message: `缺少 ${prefix}*.md`, detail: '' })
  }
}

// 01:必备小节 + 教学注释 + mermaid
let overviewNames = new Set()
let mermaidBlocks = 0
if (files['01-']) {
  for (const title of ['## 一句话简介', '## 简介', '## 人物小传']) {
    if (!files['01-'].text.includes(title)) {
      warnings.push({ code: 'MISSING_SECTION', message: `01 缺少「${title}」小节`, detail: '' })
    }
  }
  if (!files['01-'].text.includes('📖')) {
    warnings.push({
      code: 'NO_TEACH_NOTE',
      message: '01 缺少「📖 教学注释」引用块(面向小白的讲解是本 skill 的交付要求)',
      detail: '',
    })
  }
  overviewNames = new Set(tableFirstColumn(section(files['01-'].text, '## 人物小传')))
  const overviewHeader = section(files['01-'].text, '## 人物小传')
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith('|'))
  if (overviewHeader && !overviewHeader.includes('暗线身份')) {
    warnings.push({
      code: 'NO_DARKLINE_ID_COLUMN',
      message: '01 人物小传表头缺「暗线身份」列(明暗双线的人物网是本 skill 的复杂度要求)',
      detail: '',
    })
  }
  const blocks = [...files['01-'].text.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)]
  mermaidBlocks = blocks.length
  if (mermaidBlocks === 0) {
    warnings.push({ code: 'NO_MERMAID', message: '01 中没有人物关系 mermaid 图', detail: '' })
  }
  const unknownLabels = new Set()
  for (const block of blocks) {
    const body = block[1]
    for (const match of body.matchAll(/(^|\s)([^\s"'\[\]():]+)[[(]/g)) {
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
      message: '以下 mermaid 标签未出现在 01 人物小传表(若为组织/地名可忽略):',
      detail: [...unknownLabels].join('、'),
    })
  }
}

// 02:必备小节 + 教学注释
if (files['02-']) {
  for (const title of ['## 明线与暗线', '## 全书结构', '## 明线事件链']) {
    if (!files['02-'].text.includes(title)) {
      warnings.push({ code: 'MISSING_SECTION', message: `02 缺少「${title}」小节`, detail: '' })
    }
  }
  if (!files['02-'].text.includes('📖')) {
    warnings.push({ code: 'NO_TEACH_NOTE', message: '02 缺少「📖 教学注释」引用块', detail: '' })
  }
}

// 03:逐章表 + 章数 + 章号唯一
let chapterCount = 0
let text03 = ''
if (files['03-']) {
  text03 = files['03-'].text
  if (!text03.includes('| 章节')) {
    warnings.push({ code: 'NO_CHAPTER_TABLE', message: '03 缺少「| 章节 |」逐章表', detail: '' })
  }
  const header03 = text03.split(/\r?\n/).find((l) => l.includes('| 章节'))
  if (header03 && !header03.includes('暗线动态')) {
    warnings.push({
      code: 'NO_DARKLINE_COLUMN',
      message: '03 逐章表头缺「暗线动态」列(明暗双线是本 skill 的默认结构)',
      detail: '',
    })
  }
  const numbers = []
  for (const rawLine of text03.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line.startsWith('|')) {
      continue
    }
    const value = (line.split('|')[1] ?? '').trim()
    if (/^\d+$/.test(value)) {
      numbers.push(value)
    }
  }
  chapterCount = numbers.length
  if (chapterCount === 0) {
    warnings.push({ code: 'NO_CHAPTER_ROWS', message: '03 逐章表没有任何章节数字行', detail: '' })
  }
  const dup = [...new Set(numbers.filter((v, i) => numbers.indexOf(v) !== i))]
  if (dup.length > 0) {
    warnings.push({
      code: 'DUPLICATE_CHAPTER',
      message: '03 逐章表章号重复:',
      detail: dup.join('、'),
    })
  }
}

// 04:伏笔表 / 统一名表 / 自检十问
let foreshadowingCount = 0
if (files['04-']) {
  const t4 = files['04-'].text
  for (const title of ['## 伏笔表', '## 统一名表', '## 自检十问']) {
    if (!t4.includes(title)) {
      warnings.push({ code: 'MISSING_SECTION', message: `04 缺少「${title}」小节`, detail: '' })
    }
  }
  const ids = tableFirstColumn(section(t4, '## 伏笔表'))
  foreshadowingCount = ids.length
  const badIds = ids.filter((id) => !/^F\d{2}$/.test(id))
  if (badIds.length > 0) {
    warnings.push({
      code: 'BAD_FORESHADOW_ID',
      message: '伏笔编号应统一为 F01 式两位编号:',
      detail: badIds.join('、'),
    })
  }
  const corpus23 = (files['02-']?.text ?? '') + text03
  const orphans = ids.filter((id) => !corpus23.includes(id))
  if (orphans.length > 0) {
    warnings.push({
      code: 'ORPHAN_FORESHADOW',
      message: '以下伏笔编号未在 02/03 正文中被引用(只埋不挂,写作时容易忘):',
      detail: orphans.join('、'),
    })
  }
  const used = [...new Set([...corpus23.matchAll(/F\d{2}/g)].map((m) => m[0]))]
  const undefinedIds = used.filter((id) => !ids.includes(id))
  if (undefinedIds.length > 0) {
    warnings.push({
      code: 'UNDEFINED_FORESHADOW',
      message: '以下伏笔编号在 02/03 被引用,但 04 伏笔表没有定义:',
      detail: undefinedIds.join('、'),
    })
  }
  const names = tableFirstColumn(section(t4, '## 统一名表'))
  const text01 = files['01-']?.text ?? ''
  const missingNames = names.filter((n) => !text01.includes(n))
  if (missingNames.length > 0) {
    warnings.push({
      code: 'NAME_NOT_IN_01',
      message: '统一名表以下定稿名未出现在 01(拼写不一致或漏登记):',
      detail: missingNames.join('、'),
    })
  }
}

console.log(
  JSON.stringify(
    {
      files: Object.fromEntries(
        Object.entries(files).map(([prefix, value]) => [prefix, value ? value.name : null]),
      ),
      chapterCount,
      foreshadowingCount,
      mermaidBlocks,
      warningCount: warnings.length,
      warnings,
    },
    null,
    2,
  ),
)