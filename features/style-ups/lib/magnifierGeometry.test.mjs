import assert from 'node:assert/strict'
import test from 'node:test'
import {getMagnifierGeometry} from './magnifierGeometry.ts'

test('lens and sidebar keep the same image region at every zoom', () => {
    const original = getMagnifierGeometry(72, 108, 180, 180, 0.5)
    for (const scale of [0.9, 1.2, 3, 6]) {
        const zoomed = getMagnifierGeometry(72 * scale, 108 * scale, 180 * scale, 180 * scale, 0.5)
        for (const key of Object.keys(original)) assert.ok(Math.abs(original[key] - zoomed[key]) < 1e-9)
        assert.ok(Math.abs(zoomed.width / zoomed.height - 0.5) < 1e-9)
    }
})

test('lens stays inside image corners and sidebar follows to the image edges', () => {
    const first = getMagnifierGeometry(0, 0, 540, 540, 0.5)
    const last = getMagnifierGeometry(540, 540, 540, 540, 0.5)
    assert.equal(first.left, 0)
    assert.equal(first.top, 0)
    assert.equal(first.backgroundX, 0)
    assert.equal(first.backgroundY, 0)
    assert.equal(last.left + last.width, 1)
    assert.equal(last.top + last.height, 1)
    assert.equal(last.backgroundX, 100)
    assert.equal(last.backgroundY, 100)
})

test('tall sidebars keep lens in bounds and preview positions finite', () => {
    const lens = getMagnifierGeometry(100, 100, 180, 180, 0.15)
    assert.equal(lens.height, 1)
    assert.equal(lens.top, 0)
    assert.ok(Number.isFinite(lens.backgroundY))
    assert.ok(Math.abs(lens.width / lens.height - 0.15) < 1e-9)
})
