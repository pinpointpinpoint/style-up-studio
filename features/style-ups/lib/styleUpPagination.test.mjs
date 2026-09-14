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
    getStyleUpMobilePosition,
    getStyleUpMobileCanvasSize,
} from './styleUpCanvasSession.ts'
import {STYLE_UPS_PAGE_SIZE} from './constants.ts'

test('mobile pages expand outward with unique cells and enough room for each image', () => {
    const cells = new Set()
    const count = 76
    const halfSize = getStyleUpMobileCanvasSize(count) / 2
    for (let index = 0; index < count; index++) {
        const position = getStyleUpMobilePosition(`style-${index}`, index)
        const cell = `${Math.round(position.x / 260)},${Math.round(position.y / 260)}`
        assert.ok(!cells.has(cell))
        cells.add(cell)
        assert.ok(Math.abs(position.x) + 90 < halfSize)
        assert.ok(Math.abs(position.y) + 90 < halfSize)
        if (index < 9) {
            assert.ok(Math.abs(Math.round(position.x / 260)) <= 1)
            assert.ok(Math.abs(Math.round(position.y / 260)) <= 1)
        }
    }
    assert.ok(cells.has('0,0'))
    assert.ok(cells.has('-1,0'))
    assert.ok(cells.has('1,0'))
    assert.ok(cells.has('0,-1'))
    assert.ok(cells.has('0,1'))
})

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
    assert.deepEqual(pageLengths, [30, 11, 0, 0])
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

test('drag bounds use the rendered mobile grid position', () => {
    let session = createStyleUpCanvasSession({styleUps: [{_id: 'first'}]})
    session = startStyleUpDrag(session, {
        id: 'first',
        clientX: 75,
        clientY: 300,
        bounds: {
            canvasWidth: 290,
            canvasHeight: 1000,
            cardWidth: 140,
            cardHeight: 140,
            centerX: 75,
            centerY: 300,
            boundaryLeft: -15,
            boundaryRight: 305,
        },
    })
    const movedLeft = moveStyleUpDrag(session, {clientX: -1000, clientY: -1000})
    assert.equal(movedLeft.layouts.first.x, -20)
    assert.equal(movedLeft.layouts.first.y, -230)
    const movedRight = moveStyleUpDrag(session, {clientX: 2000, clientY: 2000})
    assert.equal(movedRight.layouts.first.x, 160)
    assert.equal(movedRight.layouts.first.y, 630)
})
