import assert from 'node:assert/strict'
import test from 'node:test'
import {waitForPageMedia} from './waitForPageMedia.ts'

test('waits for visible video frames and painting, without waiting for offscreen videos', async () => {
    const frames = new Map()
    let nextId = 0
    globalThis.requestAnimationFrame = callback => { frames.set(++nextId, callback); return nextId }
    globalThis.cancelAnimationFrame = id => frames.delete(id)
    const paint = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()) }
    globalThis.HTMLImageElement = class extends EventTarget {}
    globalThis.MutationObserver = class { observe() {} disconnect() {} }
    let report
    globalThis.IntersectionObserver = class {
        constructor(callback) { report = callback }
        observe() {}
        disconnect() {}
    }
    const video = Object.assign(new EventTarget(), {readyState: 1, error: null})
    const offscreen = Object.assign(new EventTarget(), {readyState: 0, error: null})
    const root = {querySelector: () => null, querySelectorAll: () => [video, offscreen]}
    let ready = false
    const stop = waitForPageMedia(root, () => { ready = true })
    paint()
    report([{target: video, isIntersecting: true, intersectionRatio: 1}, {target: offscreen, isIntersecting: false, intersectionRatio: 0}])
    video.dispatchEvent(new Event('loadedmetadata'))
    await Promise.resolve()
    assert.equal(ready, false)
    video.dispatchEvent(new Event('loadeddata'))
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(ready, false)
    paint()
    assert.equal(ready, false)
    paint()
    assert.equal(ready, true)
    stop()
})

test('releases the intro when media stalls, even if visibility never resolves', async () => {
    const root = {querySelector: () => null, querySelectorAll: () => []}
    let calls = 0
    const stop = waitForPageMedia(root, () => { calls++ }, 10)
    await new Promise(resolve => setTimeout(resolve, 30))
    assert.equal(calls, 1)
    stop()
})

test('cancelling the wait prevents the timeout from dismissing the intro', async () => {
    const root = {querySelector: () => null, querySelectorAll: () => []}
    let calls = 0
    const stop = waitForPageMedia(root, () => { calls++ }, 10)
    stop()
    await new Promise(resolve => setTimeout(resolve, 30))
    assert.equal(calls, 0)
})
