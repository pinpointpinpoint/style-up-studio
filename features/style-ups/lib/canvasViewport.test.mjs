import assert from 'node:assert/strict'
import test from 'node:test'
import {boundCanvasView, moveCanvasView, resizeCanvasView} from './canvasViewport.ts'

test('one pointer pans without changing scale', () => {
    assert.deepEqual(moveCanvasView({x: -100, y: -200, scale: 0.9},
        [{x: 20, y: 30}], [{x: 50, y: 10}],
    ), {x: -70, y: -220, scale: 0.9})
})

test('pinching keeps the canvas point beneath the moving midpoint', () => {
    const view = {x: -100, y: -200, scale: 1}
    const next = moveCanvasView(view,
        [{x: 100, y: 100}, {x: 200, y: 100}],
        [{x: 80, y: 120}, {x: 280, y: 120}],
    )
    assert.equal(next.scale, 2)
    assert.equal((180 - next.x) / next.scale, (150 - view.x) / view.scale)
    assert.equal((120 - next.y) / next.scale, (100 - view.y) / view.scale)
})

test('zoom limits and coincident fingers produce finite transforms', () => {
    const view = {x: 0, y: 0, scale: 1}
    const before = [{x: 0, y: 0}, {x: 100, y: 0}]
    assert.equal(moveCanvasView(view, before, [{x: 0, y: 0}, {x: 1000, y: 0}]).scale, 6)
    assert.equal(moveCanvasView(view, before, [{x: 0, y: 0}, {x: 1, y: 0}]).scale, 0.9)
    const coincident = moveCanvasView(view, [{x: 0, y: 0}, {x: 0, y: 0}], before)
    assert.ok(Number.isFinite(coincident.x))
    assert.equal(coincident.scale, 1)
})

test('canvas bounds prevent panning beyond the edges and center a zoomed-out canvas', () => {
    const viewport = {width: 320, height: 600}
    const canvas = {width: 900, height: 1800}
    assert.deepEqual(boundCanvasView({x: -5000, y: 5000, scale: 1}, viewport, canvas),
        {x: -580, y: 0, scale: 1})
    assert.deepEqual(boundCanvasView({x: -5000, y: 5000, scale: 0.3}, viewport, canvas),
        {x: 25, y: 30, scale: 0.3})
})

test('lifting one finger allows continued panning at the current zoom', () => {
    const pinched = moveCanvasView({x: 0, y: 0, scale: 1},
        [{x: 0, y: 0}, {x: 100, y: 0}],
        [{x: 0, y: 0}, {x: 200, y: 0}],
    )
    const panned = moveCanvasView(pinched, [{x: 200, y: 0}], [{x: 210, y: 20}])
    assert.equal(panned.scale, pinched.scale)
    assert.equal(panned.x, pinched.x + 10)
    assert.equal(panned.y, pinched.y + 20)
})

test('expanding around the center keeps existing images at the same screen position', () => {
    const before = {width: 1420, height: 1420}
    const after = {width: 1940, height: 1940}
    const view = {x: -650, y: -450, scale: 0.9}
    const resized = resizeCanvasView(view, before, after)
    for (const offset of [-260, 0, 260]) {
        assert.ok(Math.abs((before.width / 2 + offset) * view.scale + view.x -
            ((after.width / 2 + offset) * resized.scale + resized.x)) < 0.001)
        assert.ok(Math.abs((before.height / 2 + offset) * view.scale + view.y -
            ((after.height / 2 + offset) * resized.scale + resized.y)) < 0.001)
    }
})


test('desktop caps zoom at 3x while mobile allows 6x, preserving the anchor', () => {
    const before = [{x: 100, y: 200}, {x: 200, y: 200}]
    const after = [{x: -350, y: 200}, {x: 650, y: 200}]
    const view = {x: -100, y: -50, scale: 1}
    for (const maximum of [3, 6]) {
        const next = moveCanvasView(view, before, after, maximum)
        assert.equal(next.scale, maximum)
        assert.equal((150 - next.x) / next.scale, (150 - view.x) / view.scale)
        assert.equal((200 - next.y) / next.scale, (200 - view.y) / view.scale)
    }
    const resized = moveCanvasView({...view, scale: 6}, before, before, 3)
    assert.equal(resized.scale, 3)
})
