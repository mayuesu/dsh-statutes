import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

/**
 * 法条 (statutes): a shared repository of reusable rules.
 *
 * - A conversation may attach any number of laws.
 * - Every model step receives the attached laws as an early system-prompt
 *   section, so the model reads them before answering.
 * - Every law may carry structured guards, enforced before a tool call:
 *   `deny` blocks the call, `ask` turns the call into an approval request.
 */

export const inject = ['systemPrompt', 'tools']

const SECTION_NAME = 'statutes:notice'
const SECTION_ORDER = 400
const API_BASE = '/dsh-statutes'
const MAX_BODY_BYTES = 2 * 1024 * 1024
const MATCH_MODES = new Set(['contains', 'regex', 'prefix'])
const ACTIONS = new Set(['deny', 'ask'])

function storeFile() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  return path.join(home, 'statutes', 'store.json')
}

function emptyStore() {
  return { version: 1, laws: {}, bindings: {}, seeded: false }
}

/** Stable identity of the blank law shipped with the plugin. */
const DEFAULT_LAW_ID = 'statute-default'

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function normalizeRules(input) {
  if (!Array.isArray(input)) return []
  const rules = []
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue
    const tools = Array.isArray(raw.tools)
      ? raw.tools.map((t) => asString(t).trim()).filter(Boolean)
      : asString(raw.tools).split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean)
    const pattern = asString(raw.pattern).trim()
    const match = MATCH_MODES.has(raw.match) ? raw.match : 'contains'
    const action = ACTIONS.has(raw.action) ? raw.action : 'deny'
    if (!pattern) continue
    rules.push({ id: asString(raw.id) || randomUUID(), tools: tools.length ? tools : ['*'], match, pattern, action })
  }
  return rules
}

function normalizeLaw(raw, id) {
  const now = Date.now()
  return {
    id,
    title: asString(raw?.title).trim().slice(0, 120),
    body: asString(raw?.body),
    note: asString(raw?.note).trim().slice(0, 300),
    rules: normalizeRules(raw?.rules),
    builtin: raw?.builtin === true,
    order: Number.isFinite(raw?.order) ? raw.order : now,
    createdAt: Number.isFinite(raw?.createdAt) ? raw.createdAt : now,
    updatedAt: Number.isFinite(raw?.updatedAt) ? raw.updatedAt : now,
  }
}

function normalizeBinding(raw) {
  const lawIds = Array.isArray(raw?.lawIds) ? raw.lawIds.map((v) => asString(v)).filter(Boolean) : []
  const detached = Array.isArray(raw?.detached) ? raw.detached.map((v) => asString(v)).filter(Boolean) : []
  return {
    lawIds: [...new Set(lawIds)],
    detached: [...new Set(detached)],
    inheritToChildren: raw?.inheritToChildren !== false,
    updatedAt: Number.isFinite(raw?.updatedAt) ? raw.updatedAt : Date.now(),
  }
}

function normalizeStore(raw) {
  const store = emptyStore()
  const laws = raw && typeof raw.laws === 'object' && raw.laws ? raw.laws : {}
  for (const [id, value] of Object.entries(laws)) {
    if (!value || typeof value !== 'object') continue
    const law = normalizeLaw(value, id)
    if (law.title) store.laws[id] = law
  }
  const bindings = raw && typeof raw.bindings === 'object' && raw.bindings ? raw.bindings : {}
  for (const [sessionId, value] of Object.entries(bindings)) {
    if (!value || typeof value !== 'object') continue
    const binding = normalizeBinding(value)
    if (binding.lawIds.length || binding.detached.length || binding.inheritToChildren === false) {
      store.bindings[sessionId] = binding
    }
  }
  // A store that already holds laws predates the built-in seed; never add a second blank law.
  store.seeded = raw?.seeded === true || Object.keys(store.laws).length > 0
  return store
}

function argText(args) {
  if (args === null || args === undefined) return ''
  if (typeof args !== 'object') return String(args)
  const direct = args.command ?? args.cmd ?? args.code ?? args.script
  if (typeof direct === 'string') return direct
  try {
    return JSON.stringify(args)
  } catch {
    return ''
  }
}

function truncate(text, limit = 160) {
  const clean = String(text).replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit)}…` : clean
}

function toolMatches(tools, toolName) {
  if (!Array.isArray(tools) || tools.length === 0) return true
  for (const entry of tools) {
    const value = asString(entry).trim()
    if (!value) continue
    if (value === '*') return true
    if (value.toLowerCase() === String(toolName).toLowerCase()) return true
  }
  return false
}

function patternMatches(rule, text) {
  if (!rule.pattern) return false
  try {
    if (rule.match === 'regex') return new RegExp(rule.pattern, 'i').test(text)
    if (rule.match === 'prefix') return text.trimStart().toLowerCase().startsWith(rule.pattern.toLowerCase())
    return text.toLowerCase().includes(rule.pattern.toLowerCase())
  } catch {
    return false
  }
}

function fmtTools(tools) {
  if (!Array.isArray(tools) || tools.length === 0) return '全部工具'
  return tools.map((t) => (t === '*' ? '全部工具' : t)).join(' / ')
}

export function apply(ctx) {
  const file = storeFile()
  let store = emptyStore()
  let diskSeeded = false

  try {
    if (fs.existsSync(file)) {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
      diskSeeded = raw?.seeded === true
      store = normalizeStore(raw)
    }
  } catch (error) {
    ctx.logger?.warn?.(`[statutes] failed to read ${file}: ${error?.message ?? error}`)
    store = emptyStore()
  }

  function save() {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true })
      const tmp = `${file}.tmp-${process.pid}-${Date.now()}`
      fs.writeFileSync(tmp, JSON.stringify(store, null, 2), 'utf8')
      fs.renameSync(tmp, file)
    } catch (error) {
      ctx.logger?.error?.(`[statutes] failed to write ${file}: ${error?.message ?? error}`)
    }
  }

  // Ship one blank law named 默认 the first time a repository is created.
  if (!store.seeded) {
    store.seeded = true
    const now = Date.now()
    store.laws[DEFAULT_LAW_ID] = normalizeLaw({
      title: '默认',
      body: '',
      note: '空白法条：点开「修改」写上你的要求即可。',
      rules: [],
      builtin: true,
      order: 0,
      createdAt: now,
      updatedAt: now,
    }, DEFAULT_LAW_ID)
    save()
  } else if (!diskSeeded) {
    // Upgrade a pre-existing repository with the marker so a deleted built-in law never returns.
    save()
  }

  // A repository created before the built-in law existed adopts its blank 默认 as the built-in one.
  if (!Object.values(store.laws).some((law) => law.builtin)) {
    const legacyDefault = Object.values(store.laws).find((law) => law.title === '默认' && !(law.body ?? '').trim())
    if (legacyDefault) {
      legacyDefault.builtin = true
      save()
    }
  }

  /* ---------------------------------------------------------------- sessions */

  let sessionIndex = { at: 0, ids: new Set(), parent: new Map(), origin: new Map(), ok: false }

  async function refreshSessions(force) {
    const controller = ctx.get('sessionController')
    if (!controller) return sessionIndex
    if (!force && sessionIndex.ok && Date.now() - sessionIndex.at < 1500) return sessionIndex
    try {
      const value = await controller.list({}, new AbortController().signal)
      const ids = new Set()
      const parent = new Map()
      const origin = new Map()
      for (const item of value?.items ?? []) {
        if (!item?.sessionId) continue
        ids.add(item.sessionId)
        if (item.parentSessionId) parent.set(item.sessionId, item.parentSessionId)
        if (item.origin) origin.set(item.sessionId, item.origin)
      }
      sessionIndex = { at: Date.now(), ids, parent, origin, ok: true }
      pruneBindings()
    } catch (error) {
      ctx.logger?.warn?.(`[statutes] session list unavailable: ${error?.message ?? error}`)
    }
    return sessionIndex
  }

  function pruneBindings() {
    if (!sessionIndex.ok || sessionIndex.ids.size === 0) return
    let changed = false
    for (const sessionId of Object.keys(store.bindings)) {
      if (!sessionIndex.ids.has(sessionId)) {
        delete store.bindings[sessionId]
        changed = true
      }
    }
    if (changed) save()
  }

  /* ---------------------------------------------------------------- bindings */

  function bindingOf(sessionId) {
    return store.bindings[sessionId]
  }

  function ensureBinding(sessionId) {
    let binding = store.bindings[sessionId]
    if (!binding) {
      binding = { lawIds: [], detached: [], inheritToChildren: true, updatedAt: Date.now() }
      store.bindings[sessionId] = binding
    }
    return binding
  }

  function inheritedLaws(sessionId) {
    let cursor = sessionId
    for (let hop = 0; hop < 8; hop += 1) {
      const parent = sessionIndex.parent.get(cursor)
      if (!parent) return []
      const parentBinding = bindingOf(parent)
      if (parentBinding && parentBinding.inheritToChildren !== false && parentBinding.lawIds.length) {
        return parentBinding.lawIds
      }
      cursor = parent
    }
    return []
  }

  function effectiveLawIds(sessionId) {
    const binding = bindingOf(sessionId)
    const own = binding?.lawIds ?? []
    const detached = new Set(binding?.detached ?? [])
    const inherited = inheritedLaws(sessionId).filter((id) => !detached.has(id))
    return [...new Set([...own, ...inherited])].filter((id) => store.laws[id])
  }

  function effectiveLaws(sessionId) {
    return effectiveLawIds(sessionId).map((id) => store.laws[id])
  }

  function sortedLaws() {
    return Object.values(store.laws).sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
  }

  function usersOfLaw(lawId) {
    const users = []
    for (const [sessionId, binding] of Object.entries(store.bindings)) {
      const usedDirectly = (binding.lawIds ?? []).includes(lawId)
      if (!usedDirectly) continue
      if (sessionIndex.ok && sessionIndex.ids.size > 0 && !sessionIndex.ids.has(sessionId)) continue
      users.push(sessionId)
    }
    return users
  }

  /* ------------------------------------------------------------------- notice */

  function renderNotice(sessionId) {
    const laws = effectiveLaws(sessionId)
    if (laws.length === 0) return ''
    const lines = [
      '## 法条（回答与执行操作前必须遵守）',
      '以下是本对话挂载的强制规则。先核对规则，再回答或调用工具；规则与用户要求冲突时，先指出冲突，再按法条执行。',
    ]
    laws.forEach((law, index) => {
      lines.push('', `${index + 1}. 《${law.title}》`)
      if (law.body?.trim()) lines.push(law.body.trim())
      const guards = (law.rules ?? []).filter((rule) => rule.pattern)
      if (guards.length > 0) {
        const summary = guards
          .map((rule) => `${rule.action === 'ask' ? '触发将转人工审批' : '触发将被系统拒绝'}（工具 ${fmtTools(rule.tools)}，匹配「${rule.pattern}」，${rule.match === 'regex' ? '正则' : rule.match === 'prefix' ? '前缀' : '包含'}）`)
          .join('；')
        lines.push(`   ⚠ 强制护栏：${summary}`)
      }
    })
    return lines.join('\n').slice(0, 8000)
  }

  /* ------------------------------------------------------------------- guards */

  function decide(exec) {
    const sessionId = exec?.agent?.id
    if (!sessionId) return null
    const laws = effectiveLaws(sessionId)
    if (laws.length === 0) return null
    const text = argText(exec.arguments)
    if (!text) return null
    let pending = null
    for (const law of laws) {
      for (const rule of law.rules ?? []) {
        if (!rule.pattern) continue
        if (!toolMatches(rule.tools, exec.name)) continue
        if (!patternMatches(rule, text)) continue
        const reason = `违反法条《${law.title}》：工具 ${exec.name} 的参数「${truncate(text)}」命中护栏规则「${rule.pattern}」`
        if (rule.action === 'deny') return { action: 'deny', law, rule, reason }
        if (!pending) pending = { action: 'ask', law, rule, reason }
      }
    }
    return pending
  }

  ctx.effect(() => ctx.tools.guard((exec) => {
    const decision = decide(exec)
    return decision && decision.action === 'deny' ? decision.reason : undefined
  }), 'statutes-guard')

  ctx.on('tools/pre-execute', async (exec, next) => {
    const decision = decide(exec)
    if (!decision) return next()
    if (decision.action === 'deny') {
      return {
        kind: 'deny',
        reason: decision.reason,
        info: { name: 'statutes', code: 'statute-denied', reason: decision.law.title },
      }
    }
    return {
      kind: 'ask',
      reason: decision.reason,
      displayReason: { en: decision.reason, zh: decision.reason },
    }
  })

  /* ------------------------------------------------------------------- prompt */

  ctx.effect(() => ctx.systemPrompt.section({
    name: SECTION_NAME,
    order: SECTION_ORDER,
    text: (assemblyContext) => {
      const agentId = assemblyContext?.agent?.id ?? assemblyContext?.scope?.id
      if (!agentId) return ''
      return renderNotice(agentId)
    },
  }), 'statutes-section')

  ctx.on('agent/created', async (payload) => {
    const sessionId = payload?.agent?.id
    if (!sessionId) return
    if (!sessionIndex.ok || !sessionIndex.ids.has(sessionId) || Date.now() - sessionIndex.at > 3000) {
      await refreshSessions(true)
    }
  })

  /* -------------------------------------------------------------- mutations */

  function lawView(law) {
    return { ...law }
  }

  function createLaw(input) {
    const now = Date.now()
    const title = asString(input?.title).trim().slice(0, 120)
    if (!title) return { ok: false, error: 'invalid', message: '法条标题不能为空' }
    const id = randomUUID()
    const order = sortedLaws().reduce((max, law) => Math.max(max, law.order), 0) + 1
    const law = normalizeLaw({ ...input, order, createdAt: now, updatedAt: now }, id)
    store.laws[id] = law
    save()
    return { ok: true, law: lawView(law) }
  }

  function updateLaw(id, patch) {
    const law = store.laws[id]
    if (!law) return { ok: false, error: 'not-found', message: '法条不存在' }
    const next = normalizeLaw({ ...law, ...patch, id, createdAt: law.createdAt, updatedAt: Date.now() }, id)
    if (!next.title) return { ok: false, error: 'invalid', message: '法条标题不能为空' }
    store.laws[id] = next
    save()
    return { ok: true, law: lawView(next) }
  }

  function deleteLaw(id) {
    if (!store.laws[id]) return { ok: false, error: 'not-found', message: '法条不存在' }
    const users = usersOfLaw(id)
    if (users.length > 0) {
      return {
        ok: false,
        error: 'in-use',
        message: `还有 ${users.length} 个对话正在使用这条法条，不能删除`,
        sessions: users,
      }
    }
    delete store.laws[id]
    for (const [, binding] of Object.entries(store.bindings)) {
      binding.lawIds = (binding.lawIds ?? []).filter((value) => value !== id)
      binding.detached = (binding.detached ?? []).filter((value) => value !== id)
    }
    save()
    return { ok: true }
  }

  function attachLaw(sessionId, lawId) {
    if (!store.laws[lawId]) return { ok: false, error: 'not-found', message: '法条不存在' }
    const binding = ensureBinding(sessionId)
    if (!binding.lawIds.includes(lawId)) binding.lawIds.push(lawId)
    binding.detached = binding.detached.filter((value) => value !== lawId)
    binding.updatedAt = Date.now()
    save()
    return { ok: true }
  }

  function detachLaw(sessionId, lawId) {
    const binding = ensureBinding(sessionId)
    const wasOwn = binding.lawIds.includes(lawId)
    binding.lawIds = binding.lawIds.filter((value) => value !== lawId)
    const inherited = inheritedLaws(sessionId)
    if (!wasOwn && inherited.includes(lawId) && !binding.detached.includes(lawId)) binding.detached.push(lawId)
    binding.updatedAt = Date.now()
    save()
    return { ok: true, wasOwn }
  }

  function setInherit(sessionId, value) {
    const binding = ensureBinding(sessionId)
    binding.inheritToChildren = value !== false
    binding.updatedAt = Date.now()
    save()
    return { ok: true }
  }

  function stateFor(sessionId) {
    const binding = bindingOf(sessionId)
    const own = binding?.lawIds ?? []
    const inherited = inheritedLaws(sessionId).filter((id) => store.laws[id])
    const detached = binding?.detached ?? []
    return {
      ok: true,
      sessionId,
      laws: sortedLaws().map(lawView),
      binding: {
        lawIds: own,
        detached,
        inheritToChildren: binding ? binding.inheritToChildren !== false : true,
      },
      inherited: inherited.filter((id) => !detached.includes(id) && !own.includes(id)),
      effective: effectiveLawIds(sessionId),
      indexReady: sessionIndex.ok,
    }
  }

  /* ---------------------------------------------------------------- http api */

  function sendJson(res, status, value) {
    const body = Buffer.from(JSON.stringify(value), 'utf8')
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': String(body.length),
      'cache-control': 'no-store',
    })
    res.end(body)
  }

  function readJson(req) {
    return new Promise((resolve, reject) => {
      const chunks = []
      let size = 0
      req.on('data', (chunk) => {
        size += chunk.length
        if (size > MAX_BODY_BYTES) {
          reject(new Error('request body too large'))
          req.destroy()
          return
        }
        chunks.push(chunk)
      })
      req.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
        } catch (error) {
          reject(error)
        }
      })
      req.on('error', reject)
    })
  }

  const webServer = ctx.get('webServer')
  if (webServer) {
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: `${API_BASE}/state`,
      handler: async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost')
          const sessionId = asString(url.searchParams.get('sessionId'))
          if (!sessionId) return sendJson(res, 200, { ok: false, error: 'invalid', message: '缺少 sessionId' })
          await refreshSessions(false)
          return sendJson(res, 200, stateFor(sessionId))
        } catch (error) {
          return sendJson(res, 200, { ok: false, error: 'internal', message: String(error?.message ?? error) })
        }
      },
    }), 'statutes-state-route')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: `${API_BASE}/op`,
      handler: async (req, res) => {
        try {
          if (req.method !== 'POST') return sendJson(res, 200, { ok: false, error: 'method', message: '仅支持 POST' })
          const body = await readJson(req)
          const op = asString(body?.op)
          const sessionId = asString(body?.sessionId)
          let result
          switch (op) {
            case 'create':
              result = createLaw(body.law ?? body)
              break
            case 'update':
              result = updateLaw(asString(body.id), body.patch ?? body.law ?? {})
              break
            case 'delete':
              result = deleteLaw(asString(body.id))
              break
            case 'attach':
              result = sessionId ? attachLaw(sessionId, asString(body.lawId)) : { ok: false, error: 'invalid', message: '缺少会话' }
              break
            case 'detach':
              result = sessionId ? detachLaw(sessionId, asString(body.lawId)) : { ok: false, error: 'invalid', message: '缺少会话' }
              break
            case 'inherit':
              result = sessionId ? setInherit(sessionId, body.value !== false) : { ok: false, error: 'invalid', message: '缺少会话' }
              break
            case 'usage':
              result = { ok: true, sessions: usersOfLaw(asString(body.id)) }
              break
            default:
              result = { ok: false, error: 'unknown-op', message: `未知操作：${op}` }
          }
          if (result.ok && sessionId) result.state = stateFor(sessionId)
          return sendJson(res, 200, result)
        } catch (error) {
          return sendJson(res, 200, { ok: false, error: 'internal', message: String(error?.message ?? error) })
        }
      },
    }), 'statutes-op-route')
  }

  /* -------------------------------------------------------------------- tool */

  ctx.effect(() => ctx.tools.register({
    name: 'statutes',
    description: '管理「法条」仓库并控制当前对话挂载哪些法条。用户也可以直接在输入框下栏操作。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        action: {
          type: 'string',
          enum: ['list', 'create', 'update', 'delete', 'attach', 'detach', 'inherit', 'state'],
          description: 'list=列出全部法条；state=查看当前对话状态；create/update/delete 维护仓库；attach/detach 改变当前对话的挂载。',
        },
        id: { type: 'string', description: '法条 id（update/delete/attach/detach 使用）' },
        title: { type: 'string', description: '法条标题' },
        body: { type: 'string', description: '法条正文要求（会注入到系统提示）' },
        note: { type: 'string', description: '给用户看的备注，不注入' },
        rules: {
          type: 'array',
          description: '强制护栏规则；命中后拒绝工具调用或转人工审批。',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              tools: { type: 'array', items: { type: 'string' }, description: '工具名列表，["*"] 表示全部' },
              match: { type: 'string', enum: ['contains', 'regex', 'prefix'] },
              pattern: { type: 'string' },
              action: { type: 'string', enum: ['deny', 'ask'] },
            },
            required: ['pattern'],
          },
        },
        sessionId: { type: 'string', description: '目标对话 id；省略时使用当前对话' },
        value: { type: 'boolean', description: 'inherit 动作的取值' },
      },
      required: ['action'],
    },
    output: {
      schema: { type: 'object' },
      render(_args, value) {
        return [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }]
      },
    },
    async execute(args, exec) {
      const action = asString(args?.action)
      const fallbackSession = exec?.agent?.id
      const sessionId = asString(args?.sessionId) || asString(fallbackSession)
      switch (action) {
        case 'list':
          return { ok: true, laws: sortedLaws().map(lawView) }
        case 'state':
          await refreshSessions(false)
          return stateFor(sessionId ?? '')
        case 'create':
          return createLaw(args)
        case 'update':
          return updateLaw(asString(args?.id), args)
        case 'delete':
          return deleteLaw(asString(args?.id))
        case 'attach':
          return sessionId ? attachLaw(sessionId, asString(args?.id)) : { ok: false, error: 'invalid', message: '缺少会话' }
        case 'detach':
          return sessionId ? detachLaw(sessionId, asString(args?.id)) : { ok: false, error: 'invalid', message: '缺少会话' }
        case 'inherit':
          return sessionId ? setInherit(sessionId, args?.value !== false) : { ok: false, error: 'invalid', message: '缺少会话' }
        default:
          return { ok: false, error: 'unknown-action', message: `未知操作：${action}` }
      }
    },
  }), 'statutes-tool')

  void refreshSessions(true)
}
