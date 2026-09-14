import {boundStyleUpCanvasView} from './canvasViewport.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import {createCanvasTile, getCanvasLayout, getRepeatingCanvasCells, isNearCanvasEdge} from './repeatingCanvas.ts'

test('30 photos fill a compact six-column, five-row rectangle', () => {
    const cells = getRepeatingCanvasCells({x: 1500, y: 1500, scale: 0.9}, 3000, 3000, 30)
    assert.equal(cells.length, 30)
    assert.deepEqual(cells.map(cell => cell.itemIndex), Array.from({length: 30}, (_, index) => index))
    for (let row = 0; row < 5; row++) {
        for (let column = 0; column < 6; column++) {
            assert.ok(cells.some(cell => cell.key === `${column}:${row}`))
        }
    }
})

test('distant views remain filled in every direction at each zoom limit', () => {
    for (const scale of [0.9, 3, 6]) {
        for (const x of [-1000000, 1000000]) {
            for (const y of [-1000000, 1000000]) {
                const cells = getRepeatingCanvasCells({x, y, scale}, 1600, 900, 12, createCanvasTile(12))
                assert.ok(cells.length > 0 && cells.length < 500)
                assert.ok(cells.every(cell => cell.itemIndex >= 0 && cell.itemIndex < 12))
                const xs = cells.map(cell => cell.x * scale + x)
                const ys = cells.map(cell => cell.y * scale + y)
                assert.ok(Math.min(...xs) < 0 && Math.max(...xs) > 1600)
                assert.ok(Math.min(...ys) < 0 && Math.max(...ys) > 900)
            }
        }
    }
})

test('panning and loading preserve cell positions and original image assignments', () => {
    const before = getRepeatingCanvasCells({x: 400, y: 300, scale: 0.85}, 800, 600, 30)
    const after = getRepeatingCanvasCells({x: 450, y: 330, scale: 0.85}, 800, 600, 60)
    for (const cell of before) {
        const same = after.find(next => next.key === cell.key)
        if (!same) continue
        assert.equal(same.x, cell.x)
        assert.equal(same.y, cell.y)
        if (cell.index < 30) assert.equal(same.itemIndex, cell.itemIndex)
    }
    assert.deepEqual(getRepeatingCanvasCells({x: 0, y: 0, scale: 1}, 800, 600, 0), [])
})

test('loading mode shows each loaded photo once and never repeats beyond the frontier', () => {
    const view = {x: 1500, y: 1500, scale: 0.9}
    const first = getRepeatingCanvasCells(view, 3000, 3000, 30)
    assert.equal(first.length, 30)
    assert.equal(new Set(first.map(cell => cell.itemIndex)).size, 30)
    const next = getRepeatingCanvasCells(view, 3000, 10000, 60)
    assert.equal(next.length, 60)
    for (const cell of first) assert.deepEqual(next.find(item => item.key === cell.key), cell)
    assert.deepEqual(getRepeatingCanvasCells({x: 100000, y: 100000, scale: 1}, 800, 600, 30), [])
})

test('all edges trigger loading and new rows extend the bottom without moving cards', () => {
    const bounds = getCanvasLayout(30)
    const center = {x: 500, y: 350, scale: 0.9}
    assert.equal(isNearCanvasEdge(center, 1000, 700, bounds), false)
    for (const [x, y] of [[10000, 350], [-10000, 350], [500, 10000], [500, -10000]]) {
        const bounded = boundStyleUpCanvasView({x, y, scale: 0.9}, 1000, 700, bounds)
        assert.equal(isNearCanvasEdge(bounded, 1000, 700, bounds), true)
    }
    const bottom = boundStyleUpCanvasView({x: 500, y: -10000, scale: 0.9}, 1000, 700, bounds)
    const expanded = getCanvasLayout(60)
    assert.equal(isNearCanvasEdge(bottom, 1000, 700, expanded), false)
    assert.deepEqual(boundStyleUpCanvasView(bottom, 1000, 700, expanded), bottom)
    assert.equal(isNearCanvasEdge(center, 0, 0, bounds), false)
})

test('completed collections repeat without adjacent matches across tile seams', () => {
    for (const count of [12, 30, 41, 60, 90, 121]) {
        const tile = createCanvasTile(count)
        const {columns, rows} = getCanvasLayout(count)
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                const item = tile[y * columns + x]
                assert.ok(item >= 0 && item < count)
                for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
                    assert.notEqual(item, tile[((y + dy) % rows) * columns + (x + dx + columns) % columns])
                }
            }
        }
        const view = {x: 1500, y: 1500, scale: 0.9}
        const originals = getRepeatingCanvasCells(view, 3000, 3000, count)
        const repeated = getRepeatingCanvasCells(view, 3000, 3000, count, tile)
        for (const cell of originals) assert.deepEqual(repeated.find(item => item.key === cell.key), cell)
        assert.ok(repeated.length > originals.length)
    }
})
