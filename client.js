window.__ModuleLoader__.load({
  id: '@local/dsh-statutes',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const API = '/dsh-statutes'

    /* ------------------------------------------------------------------ icons */

    function lineIcon(children, size) {
      return h('svg', {
        viewBox: '0 0 16 16',
        width: size || 16,
        height: size || 16,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.4,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: false,
      }, children)
    }

    const icons = {
      scale: () => lineIcon([
        h('path', { key: 'a', d: 'M8 2.1v11.2' }),
        h('path', { key: 'b', d: 'M4.2 13.3h7.6' }),
        h('path', { key: 'c', d: 'M2.3 5.4h11.4' }),
        h('path', { key: 'd', d: 'M2.3 5.4 1.2 8.2a1.5 1.5 0 0 0 2.4 0z' }),
        h('path', { key: 'e', d: 'M13.7 5.4l-1.1 2.8a1.5 1.5 0 0 0 2.4 0z' }),
      ]),
      doc: () => lineIcon([
        h('path', { key: 'a', d: 'M4.4 2.4h4.9l2.3 2.3v8.9H4.4z' }),
        h('path', { key: 'b', d: 'M6.2 6.6h4.1M6.2 9h4.1M6.2 11.4h2.6' }),
      ]),
      plus: () => lineIcon([h('path', { key: 'a', d: 'M8 3.2v9.6M3.2 8h9.6' })]),
      pencil: () => lineIcon([
        h('path', { key: 'a', d: 'M3 13l.6-2.5 6.7-6.7 1.9 1.9-6.7 6.7z' }),
        h('path', { key: 'b', d: 'm9.2 2.5 1.4-1.4 1.9 1.9-1.4 1.4' }),
      ]),
      trash: () => lineIcon([
        h('path', { key: 'a', d: 'M3.4 4.4h9.2' }),
        h('path', { key: 'b', d: 'M6.2 4.4V2.9h3.6v1.5' }),
        h('path', { key: 'c', d: 'M4.8 4.4 5.4 13h5.2l.6-8.6' }),
      ]),
      check: () => lineIcon([h('path', { key: 'a', d: 'm3.4 8.4 3 3 6.2-6.8' })]),
      chevron: () => lineIcon([h('path', { key: 'a', d: 'm4.4 6.4 3.6 3.6 3.6-3.6' })]),
      layers: () => lineIcon([
        h('path', { key: 'a', d: 'M8 2.2 2.4 5.1 8 8l5.6-2.9z' }),
        h('path', { key: 'b', d: 'M2.4 8.7 8 11.6l5.6-2.9' }),
      ]),
      shield: () => lineIcon([h('path', { key: 'a', d: 'M8 2.1 3.6 3.7v4.1c0 2.7 1.8 4.7 4.4 5.7 2.6-1 4.4-3 4.4-5.7V3.7z' })]),
      close: () => lineIcon([h('path', { key: 'a', d: 'm4.2 4.2 7.6 7.6M11.8 4.2l-7.6 7.6' })]),
    }

    /* ------------------------------------------------------------------ styles */

    const CSS = `
.dshs-chip{display:inline-flex;align-items:center;gap:4px;height:28px;min-width:0;max-width:220px;padding:0 4px 0 8px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:13px;font-weight:500;line-height:20px;cursor:pointer;outline:none}
.dshs-chip:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dshs-chip:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.dshs-chip[data-active="true"]{color:var(--dsw-alias-label-primary)}
.dshs-chip[data-active="true"] .dshs-chipGlyph{color:var(--dsw-alias-brand-primary)}
.dshs-chipGlyph{flex:none;display:inline-flex;color:var(--dsw-alias-label-secondary)}
.dshs-chipGlyph svg{width:14px;height:14px}
.dshs-chipLabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.dshs-chevron{flex:none;display:inline-flex;color:var(--dsw-alias-label-caption);transition:transform .12s}
.dshs-chevron[data-open="true"]{transform:rotate(180deg)}
.dshs-chevron svg{width:14px;height:14px}

.dshs-scrim{position:fixed;inset:0;z-index:2147483000}
.dshs-scrim[data-modal="true"]{background:var(--dsw-alias-bg-mask-1)}
.dshs-panel{position:fixed;z-index:2147483001;display:flex;flex-direction:column;box-sizing:border-box;min-width:228px;max-width:min(360px,calc(100vw - 24px));max-height:min(70vh,520px);padding:4px;background:var(--dsw-alias-bg-overlay);border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);box-shadow:var(--dsw-elevation-panel,0 8px 24px rgba(0,0,0,.24));overflow:auto;overscroll-behavior:contain}
.dshs-row{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:7px 8px;border:0;border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;font-weight:400;line-height:20px;text-align:left;cursor:pointer;outline:none}
.dshs-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dshs-row:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}
.dshs-row[data-danger="true"]{color:var(--dsw-alias-state-error-primary)}
.dshs-row[data-danger="true"]:hover{background:var(--dsw-alias-interactive-bg-hover-danger)}
.dshs-rowGlyph{flex:none;display:inline-flex;color:var(--dsw-alias-menu-icon)}
.dshs-row[data-danger="true"] .dshs-rowGlyph{color:inherit}
.dshs-rowLabel{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshs-badge{flex:none;font-size:8px;font-weight:500;line-height:10px;letter-spacing:.2px;color:var(--dsw-alias-label-tertiary)}
.dshs-check{flex:none;display:inline-flex;color:var(--dsw-alias-label-primary)}
.dshs-group{display:flex;align-items:center;gap:6px;padding:8px 8px 2px;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.dshs-divider{height:1px;margin:4px 6px;background:var(--dsw-alias-border-l1)}
.dshs-empty{padding:4px 8px 8px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.dshs-error{margin:4px;padding:6px 8px;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px}
.dshs-switch{position:relative;flex:none;width:28px;height:16px;border-radius:8px;background:var(--dsw-alias-border-l3);transition:background .12s}
.dshs-switch[data-on="true"]{background:var(--dsw-alias-brand-primary)}
.dshs-switch::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:var(--dsw-alias-switch-thumb);transition:transform .12s}
.dshs-switch[data-on="true"]::after{transform:translateX(12px)}

.dshs-modal{position:fixed;z-index:2147483002;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;box-sizing:border-box;width:min(640px,calc(100vw - 32px));max-height:88vh;background:var(--dsw-alias-bg-overlay);border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-panel);box-shadow:var(--dsw-elevation-prominent,0 24px 60px rgba(0,0,0,.3));overflow:hidden}
.dshs-modalBody{padding:16px 16px 4px;overflow:auto;min-height:0}
.dshs-modalFooter{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:10px 16px 14px;border-top:.5px solid var(--dsw-alias-border-l1)}
.dshs-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;line-height:22px;color:var(--dsw-alias-label-primary)}
.dshs-hint{margin:4px 0 14px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}
.dshs-field{margin-bottom:10px}
.dshs-fieldLabel{margin-bottom:4px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.dshs-input,.dshs-textarea,.dshs-select{width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:20px;outline:none}
.dshs-input:focus,.dshs-textarea:focus,.dshs-select:focus{border-color:var(--dsw-alias-brand-primary)}
.dshs-textarea{min-height:92px;resize:vertical}
.dshs-ruleRow{display:grid;grid-template-columns:1fr 96px;gap:6px;margin-bottom:8px;padding:8px;border:.5px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1)}
.dshs-btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12px;font-weight:500;cursor:pointer;outline:none}
.dshs-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dshs-btn:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}
.dshs-btn[data-primary="true"]{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-inverted)}
.dshs-btn[data-primary="true"]:hover{background:var(--dsw-alias-button-primary-hover)}
.dshs-btn[data-quiet="true"]{border-color:transparent}
.dshs-spacer{flex:1 1 auto}
`

    /* ------------------------------------------------------------------ store */

    const ui = { open: null }
    const uiListeners = new Set()

    function setUi(next) {
      ui.open = next
      for (const fn of uiListeners) fn()
    }

    function useUi() {
      const [, force] = React.useState(0)
      React.useEffect(() => {
        const fn = () => force((x) => x + 1)
        uiListeners.add(fn)
        return () => uiListeners.delete(fn)
      }, [])
      return ui.open
    }

    const data = { laws: [], sessions: new Map(), error: '', listeners: new Set() }

    function notify() {
      for (const fn of data.listeners) fn()
    }

    function useData() {
      const [, force] = React.useState(0)
      React.useEffect(() => {
        const fn = () => force((x) => x + 1)
        data.listeners.add(fn)
        return () => data.listeners.delete(fn)
      }, [])
      return data
    }

    async function fetchState(sessionId) {
      if (!sessionId) return null
      try {
        const res = await fetch(`${API}/state?sessionId=${encodeURIComponent(sessionId)}`, { headers: { accept: 'application/json' } })
        const value = await res.json()
        if (value && value.ok) {
          data.laws = value.laws || []
          data.sessions.set(sessionId, value)
          data.error = ''
          notify()
        } else if (value) {
          data.error = value.message || '读取法条失败'
          notify()
        }
        return value
      } catch (error) {
        data.error = String((error && error.message) || error)
        notify()
        return null
      }
    }

    async function runOp(payload) {
      try {
        const res = await fetch(`${API}/op`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const value = await res.json()
        if (value && value.ok && value.state) {
          data.laws = value.state.laws || data.laws
          data.sessions.set(value.state.sessionId, value.state)
          notify()
        }
        return value || { ok: false, message: '空响应' }
      } catch (error) {
        return { ok: false, message: String((error && error.message) || error) }
      }
    }

    function stateOf(sessionId) {
      return sessionId ? data.sessions.get(sessionId) : undefined
    }

    /* -------------------------------------------------------------- positioning */

    function placePanel(anchor) {
      const width = 300
      const x = anchor && Number.isFinite(anchor.x) ? anchor.x : 72
      const y = anchor && Number.isFinite(anchor.y) ? anchor.y : 72
      const left = Math.min(Math.max(8, x), Math.max(8, (window.innerWidth || 1200) - width - 8))
      if (y > (window.innerHeight || 800) * 0.55) {
        return { left: `${left}px`, bottom: `${Math.max(8, (window.innerHeight || 800) - y + 6)}px` }
      }
      return { left: `${left}px`, top: `${y + 6}px` }
    }

    /* -------------------------------------------------------------------- chip */

    function Chip(props) {
      const view = useData()
      const current = useUi()
      const sessionId = props && (props.sessionId || (props.session && props.session.id))

      React.useEffect(() => {
        if (!sessionId) return undefined
        fetchState(sessionId)
        const onFocus = () => fetchState(sessionId)
        window.addEventListener('focus', onFocus)
        return () => window.removeEventListener('focus', onFocus)
      }, [sessionId])

      const state = stateOf(sessionId)
      const count = state && state.effective ? state.effective.length : 0
      const open = current && current.sessionId === sessionId ? current : null

      const toggle = (event) => {
        if (event) {
          event.preventDefault()
          event.stopPropagation()
        }
        if (open) {
          setUi(null)
          return
        }
        const rect = event && event.currentTarget ? event.currentTarget.getBoundingClientRect() : null
        setUi({
          kind: 'picker',
          sessionId,
          anchor: rect ? { x: rect.left, y: rect.top } : { x: 72, y: 72 },
        })
      }

      const contextMenu = (event) => {
        event.preventDefault()
        event.stopPropagation()
        const rect = event.currentTarget ? event.currentTarget.getBoundingClientRect() : null
        setUi({
          kind: 'menu',
          sessionId,
          anchor: rect ? { x: rect.left, y: rect.top } : { x: 72, y: 72 },
        })
      }

      return h('button', {
        type: 'button',
        className: 'dshs-chip',
        'data-active': count > 0 ? 'true' : 'false',
        title: '法条：左键选择要挂载的法条，右键管理仓库',
        onMouseDown: (event) => event.stopPropagation(),
        onClick: toggle,
        onContextMenu: contextMenu,
      },
        h('span', { className: 'dshs-chipGlyph' }, icons.scale()),
        h('span', { className: 'dshs-chipLabel' }, count > 0 ? `法条 ${count}` : '法条'),
        h('span', { className: 'dshs-chevron', 'data-open': open ? 'true' : 'false' }, icons.chevron()),
      )
    }

    /* ----------------------------------------------------------------- overlay */

    function Overlay() {
      const open = useUi()

      React.useEffect(() => {
        if (!open) return undefined
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            setUi(null)
          }
        }
        window.addEventListener('keydown', onKey, true)
        return () => window.removeEventListener('keydown', onKey, true)
      }, [open])

      if (!open) return null

      const close = (event) => {
        if (event) event.stopPropagation()
        setUi(null)
      }

      if (open.kind === 'editor') {
        return h(React.Fragment, null,
          h('div', { className: 'dshs-scrim', 'data-modal': 'true', onMouseDown: close }),
          h('div', { className: 'dshs-modal', onMouseDown: (event) => event.stopPropagation() },
            h(Editor, { open, key: open.law ? open.law.id : 'statutes-new' })),
        )
      }

      return h(React.Fragment, null,
        h('div', { className: 'dshs-scrim', onMouseDown: close }),
        h('div', {
          className: 'dshs-panel',
          style: placePanel(open.anchor),
          onMouseDown: (event) => event.stopPropagation(),
        }, open.kind === 'menu' ? h(Menu, { open }) : h(Picker, { open })),
      )
    }

    /* -------------------------------------------------------------------- menu */

    function Menu({ open }) {
      const view = useData()
      const [error, setError] = React.useState('')

      React.useEffect(() => {
        if (!view.laws.length && open.sessionId) fetchState(open.sessionId)
      }, [view.laws.length, open.sessionId])

      const edit = (law) => setUi({ kind: 'editor', sessionId: open.sessionId, anchor: open.anchor, law })
      const create = () => setUi({ kind: 'editor', sessionId: open.sessionId, anchor: open.anchor, law: null })

      const remove = async (law) => {
        setError('')
        const result = await runOp({ op: 'delete', id: law.id, sessionId: open.sessionId })
        if (!result.ok) setError(result.message || '删除失败')
      }

      const laws = view.laws || []
      const rows = []

      rows.push(h('button', { key: 'add', type: 'button', className: 'dshs-row', onClick: create },
        h('span', { className: 'dshs-rowGlyph' }, icons.plus()),
        h('span', { className: 'dshs-rowLabel' }, '新增法条')))

      rows.push(h('div', { key: 'g-edit', className: 'dshs-group' }, '修改法条'))
      if (laws.length === 0) {
        rows.push(h('div', { key: 'e-edit', className: 'dshs-empty' }, '仓库还是空的'))
      } else {
        for (const law of laws) {
          rows.push(h('button', { key: `edit-${law.id}`, type: 'button', className: 'dshs-row', onClick: () => edit(law) },
            h('span', { className: 'dshs-rowGlyph' }, icons.pencil()),
            h('span', { className: 'dshs-rowLabel' }, law.title),
            law.rules && law.rules.length ? h('span', { className: 'dshs-badge' }, `护栏 ${law.rules.length}`) : null))
        }
      }

      rows.push(h('div', { key: 'g-del', className: 'dshs-group' }, '删除法条'))
      if (laws.length === 0) {
        rows.push(h('div', { key: 'e-del', className: 'dshs-empty' }, '暂无可删除的法条'))
      } else {
        for (const law of laws) {
          rows.push(h('button', {
            key: `del-${law.id}`,
            type: 'button',
            className: 'dshs-row',
            'data-danger': 'true',
            onClick: () => remove(law),
          },
            h('span', { className: 'dshs-rowGlyph' }, icons.trash()),
            h('span', { className: 'dshs-rowLabel' }, law.title)))
        }
      }

      if (error) rows.push(h('div', { key: 'err', className: 'dshs-error' }, error))

      rows.push(h('div', { key: 'div', className: 'dshs-divider' }))
      rows.push(h('button', {
        key: 'open-panel',
        type: 'button',
        className: 'dshs-row',
        onClick: () => setUi({ kind: 'picker', sessionId: open.sessionId, anchor: open.anchor }),
      },
        h('span', { className: 'dshs-rowGlyph' }, icons.layers()),
        h('span', { className: 'dshs-rowLabel' }, '打开法条面板')))

      return h(React.Fragment, null, rows)
    }

    /* ------------------------------------------------------------------ picker */

    function Picker({ open }) {
      const view = useData()
      const [error, setError] = React.useState('')
      const state = stateOf(open.sessionId)

      React.useEffect(() => {
        if (!state && open.sessionId) fetchState(open.sessionId)
      }, [state, open.sessionId])

      const effective = new Set((state && state.effective) || [])
      const inheritedSet = new Set((state && state.inherited) || [])
      const laws = view.laws || []

      const toggle = async (law) => {
        setError('')
        const result = effective.has(law.id)
          ? await runOp({ op: 'detach', sessionId: open.sessionId, lawId: law.id })
          : await runOp({ op: 'attach', sessionId: open.sessionId, lawId: law.id })
        if (!result.ok) setError(result.message || '操作失败')
      }

      const setInherit = async (value) => {
        const result = await runOp({ op: 'inherit', sessionId: open.sessionId, value })
        if (!result.ok) setError(result.message || '操作失败')
      }

      const rows = []
      rows.push(h('div', { key: 'head', className: 'dshs-group' },
        h('span', { className: 'dshs-spacer' }, null),
        h('span', null, `${effective.size} / ${laws.length}`)))

      if (laws.length === 0) {
        rows.push(h('div', { key: 'empty', className: 'dshs-empty' }, '仓库还是空的，先新建一条法条。'))
      } else {
        for (const law of laws) {
          const checked = effective.has(law.id)
          const inherited = inheritedSet.has(law.id)
          rows.push(h('button', {
            key: law.id,
            type: 'button',
            className: 'dshs-row',
            onClick: () => toggle(law),
          },
            h('span', { className: 'dshs-rowGlyph' }, icons.doc()),
            h('span', { className: 'dshs-rowLabel' },
              h('span', null, law.title),
              law.builtin ? h('span', { className: 'dshs-badge', style: { marginLeft: '6px' } }, '内置') : null,
              inherited ? h('span', { className: 'dshs-badge', style: { marginLeft: '6px' } }, '继承') : null),
            law.rules && law.rules.length ? h('span', { className: 'dshs-badge' }, `护栏 ${law.rules.length}`) : null,
            checked ? h('span', { className: 'dshs-check' }, icons.check()) : null))
        }
      }

      if (error) rows.push(h('div', { key: 'err', className: 'dshs-error' }, error))

      rows.push(h('div', { key: 'div', className: 'dshs-divider' }))
      rows.push(h('button', {
        key: 'new',
        type: 'button',
        className: 'dshs-row',
        onClick: () => setUi({ kind: 'editor', sessionId: open.sessionId, anchor: open.anchor, law: null }),
      },
        h('span', { className: 'dshs-rowGlyph' }, icons.plus()),
        h('span', { className: 'dshs-rowLabel' }, '新建法条')))

      const inheritOn = !!(state && state.binding && state.binding.inheritToChildren !== false)
      rows.push(h('button', {
        key: 'inherit',
        type: 'button',
        className: 'dshs-row',
        onClick: () => setInherit(!inheritOn),
      },
        h('span', { className: 'dshs-rowGlyph' }, icons.layers()),
        h('span', { className: 'dshs-rowLabel' }, '子对话继承'),
        h('span', { className: 'dshs-switch', 'data-on': inheritOn ? 'true' : 'false' })))

      return h(React.Fragment, null, rows)
    }

    /* ------------------------------------------------------------------ editor */

    function blankRule() {
      return { tools: '*', match: 'contains', pattern: '', action: 'deny' }
    }

    function Editor({ open }) {
      const law = open.law
      const [title, setTitle] = React.useState(law ? law.title : '')
      const [note, setNote] = React.useState(law ? law.note || '' : '')
      const [body, setBody] = React.useState(law ? law.body || '' : '')
      const [rules, setRules] = React.useState(
        law && law.rules && law.rules.length
          ? law.rules.map((rule) => ({
              id: rule.id,
              tools: Array.isArray(rule.tools) ? rule.tools.join(', ') : '*',
              match: rule.match || 'contains',
              pattern: rule.pattern || '',
              action: rule.action || 'deny',
            }))
          : [],
      )
      const [error, setError] = React.useState('')
      const [busy, setBusy] = React.useState(false)

      const patchRule = (index, patch) => {
        setRules((current) => current.map((rule, i) => (i === index ? Object.assign({}, rule, patch) : rule)))
      }

      const save = async () => {
        if (busy) return
        if (!title.trim()) {
          setError('法条标题不能为空')
          return
        }
        const payloadRules = rules
          .filter((rule) => String(rule.pattern || '').trim())
          .map((rule) => ({
            id: rule.id,
            tools: String(rule.tools || '*').split(/[,，\s]+/).filter(Boolean),
            match: rule.match,
            pattern: String(rule.pattern).trim(),
            action: rule.action,
          }))
        const patch = { title: title.trim(), note: note.trim(), body, rules: payloadRules }
        setBusy(true)
        setError('')
        const result = law
          ? await runOp({ op: 'update', id: law.id, sessionId: open.sessionId, patch })
          : await runOp({ op: 'create', law: patch, sessionId: open.sessionId })
        if (!result.ok) {
          setBusy(false)
          setError(result.message || '保存失败')
          return
        }
        if (!law && result.law && open.sessionId) {
          await runOp({ op: 'attach', sessionId: open.sessionId, lawId: result.law.id })
        }
        setBusy(false)
        setUi(null)
      }

      return h(React.Fragment, null,
        h('div', { className: 'dshs-modalBody' },
          h('div', { className: 'dshs-title' },
            h('span', { className: 'dshs-rowGlyph' }, icons.scale()),
            law ? '修改法条' : '新增法条'),
          h('div', { className: 'dshs-hint' }, '所有对话共用这个仓库；挂在对话上的法条会在每次回答前注入，护栏会在工具调用前执行。'),

          h('div', { className: 'dshs-field' },
            h('div', { className: 'dshs-fieldLabel' }, '标题'),
            h('input', {
              className: 'dshs-input',
              value: title,
              placeholder: '例如：执行命令前必须 dry-run',
              onChange: (event) => setTitle(event.target.value),
            })),

          h('div', { className: 'dshs-field' },
            h('div', { className: 'dshs-fieldLabel' }, '备注（只给用户看，不注入模型）'),
            h('input', {
              className: 'dshs-input',
              value: note,
              placeholder: '可选',
              onChange: (event) => setNote(event.target.value),
            })),

          h('div', { className: 'dshs-field' },
            h('div', { className: 'dshs-fieldLabel' }, '正文要求（注入到每次回答前的系统提示）'),
            h('textarea', {
              className: 'dshs-textarea',
              value: body,
              placeholder: '例如：执行任何命令前，先用 --dry-run 或只读命令确认影响范围。',
              onChange: (event) => setBody(event.target.value),
            })),

          h('div', { className: 'dshs-field' },
            h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' } },
              h('div', { className: 'dshs-fieldLabel', style: { marginBottom: 0 } }, '强制护栏（结构化，命中即拦截工具调用）'),
              h('button', {
                type: 'button',
                className: 'dshs-btn',
                onClick: () => setRules((current) => current.concat([blankRule()])),
              }, '添加规则')),

            rules.length === 0
              ? h('div', { className: 'dshs-empty', style: { padding: '2px 0 8px' } }, '没有护栏规则：这条法条只做提示，不会拦截工具调用。')
              : rules.map((rule, index) => h('div', { key: index, className: 'dshs-ruleRow' },
                  h('input', {
                    className: 'dshs-input',
                    value: rule.tools,
                    placeholder: '工具名，如 pwsh,bash 或 *',
                    onChange: (event) => patchRule(index, { tools: event.target.value }),
                  }),
                  h('select', {
                    className: 'dshs-select',
                    value: rule.match,
                    onChange: (event) => patchRule(index, { match: event.target.value }),
                  },
                    h('option', { value: 'contains' }, '包含'),
                    h('option', { value: 'regex' }, '正则'),
                    h('option', { value: 'prefix' }, '前缀')),
                  h('input', {
                    className: 'dshs-input',
                    value: rule.pattern,
                    placeholder: '匹配文本，如 rm -rf',
                    onChange: (event) => patchRule(index, { pattern: event.target.value }),
                  }),
                  h('select', {
                    className: 'dshs-select',
                    value: rule.action,
                    onChange: (event) => patchRule(index, { action: event.target.value }),
                  },
                    h('option', { value: 'deny' }, '拒绝'),
                    h('option', { value: 'ask' }, '转人工')),
                  h('button', {
                    type: 'button',
                    className: 'dshs-btn',
                    'data-quiet': 'true',
                    style: { gridColumn: '2', color: 'var(--dsw-alias-state-error-primary)' },
                    onClick: () => setRules((current) => current.filter((_, i) => i !== index)),
                  }, '删除规则')))),

          error ? h('div', { className: 'dshs-error', style: { margin: '8px 0 0' } }, error) : null),

        h('div', { className: 'dshs-modalFooter' },
          h('button', {
            type: 'button',
            className: 'dshs-btn',
            onClick: () => setUi(null),
          }, '取消'),
          h('button', {
            type: 'button',
            className: 'dshs-btn',
            'data-primary': 'true',
            disabled: busy,
            style: busy ? { opacity: 0.6 } : null,
            onClick: save,
          }, busy ? '保存中…' : '保存')),
      )
    }

    /* ------------------------------------------------------------------- apply */

    function installStyles() {
      if (typeof document === 'undefined') return () => {}
      const existing = document.querySelector('style[data-dsh-statutes="1"]')
      if (existing) return () => {}
      const tag = document.createElement('style')
      tag.setAttribute('data-dsh-statutes', '1')
      tag.textContent = CSS
      document.head.appendChild(tag)
      return () => {
        tag.remove()
      }
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => installStyles())

        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left',
          id: 'statutes-chip',
          order: 40,
          label: () => '法条',
        }, Chip))

        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'statutes-overlay',
          order: 900,
        }, Overlay))
      },
    }
  },
})
