import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import test from 'node:test'
import {evaluate, parse} from 'groq-js'
import {
    bringStyleUpToFront,
    createStyleUpCanvasSession,
    moveStyleUpDrag,
    reconcileStyleUpCanvasSession,
    startStyleUpDrag,
} from './styleUpCanvasSession.ts'
import {STYLE_UPS_PAGE_SIZE} from './constants.ts'

test('cursor pagination loads every Style Up once, including matching creation dates', async () => {
    const source = await readFile(new URL('../../../sanity/lib/queries.ts', import.meta.url), 'utf8')
    const query = source.match(/export const allStyleUpsQuery = defineQuery\(`([\s\S]*?)`\)/)?.[1]
    assert.ok(query)
    const tree = parse(query, {params: {limit: STYLE_UPS_PAGE_SIZE}})
    const dataset = Array.from({length: 41}, (_, index) => ({
        _type: 'styleUp',
        _id: `style-${String(index).padStart(3, '0')}`,
        _createdAt: index < 25 ? '2026-09-10T12:00:00Z' : '2026-09-09T12:00:00Z',
        name: `Style ${index}`,
    }))
    dataset.push({_type: 'project', _id: 'unrelated'})
    const loaded = []
    let cursor = null
    const pageLengths = []
    for (let page = 0; page < 4; page++) {
        const result = await evaluate(tree, {
            dataset,
            params: {
                cursorDate: cursor?._createdAt ?? null,
                cursorId: cursor?._id ?? '',
                limit: STYLE_UPS_PAGE_SIZE,
            },
        })
        const items = await result.get()
        pageLengths.push(items.length)
        loaded.push(...items)
        cursor = items.at(-1) ?? cursor
    }
    assert.deepEqual(pageLengths, [19, 19, 3, 0])
    assert.equal(new Set(loaded.map((item) => item._id)).size, 41)
    assert.deepEqual(loaded.map((item) => item._id), dataset.slice(0, 41).sort((a, b) =>
        b._createdAt.localeCompare(a._createdAt) || b._id.localeCompare(a._id),
    ).map((item) => item._id))
})

test('appending a page retains existing card layouts, drag offsets, and stacking order', () => {
    const firstPage = [{_id: 'first'}, {_id: 'second'}]
    let session = createStyleUpCanvasSession({styleUps: firstPage})
    session = bringStyleUpToFront(session, 'first')
    session = startStyleUpDrag(session, {id: 'first', clientX: 10, clientY: 20})
    session = moveStyleUpDrag(session, {clientX: 90, clientY: 60})
    const next = reconcileStyleUpCanvasSession(session, [...firstPage, {_id: 'third'}])
    assert.deepEqual(next.layouts.first, session.layouts.first)
    assert.equal(next.layouts.first.x, 80)
    assert.equal(next.layouts.first.y, 40)
    assert.equal(next.zIndexes.first, session.zIndexes.first)
    assert.deepEqual(next.drag, session.drag)
    assert.ok(next.layouts.third)
    assert.ok(next.nextZIndex >= session.nextZIndex)
    assert.equal(session.layouts.third, undefined)
})
