import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import test from 'node:test'
import ts from 'typescript'

// Exercise effect teardown/reconnection with pending server responses, without a DOM.
test('returning to Work restarts an interrupted refresh and ignores the old response', async () => {
    const root = fileURLToPath(new URL('../../../', import.meta.url))
    const effects = []
    const requests = []
    let state
    const react = {
        useState(initial) {
            state = typeof initial === 'function' ? initial() : initial
            return [state, update => { state = typeof update === 'function' ? update(state) : update }]
        },
        useRef: current => ({current}),
        useCallback: callback => callback,
        useEffect: effect => { effects.push(effect) },
    }
    const modules = new Map()
    function load(filename) {
        if (modules.has(filename)) return modules.get(filename)
        const loadedModule = {exports: {}}
        const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
            compilerOptions: {module: ts.ModuleKind.CommonJS},
        }).outputText
        const require = name => {
            if (name === 'react') return react
            if (name === '@/app/(site)/actions') return {
                getProjects: () => new Promise(resolve => requests.push(resolve)),
            }
            const target = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name)
            return load(`${target}.ts`)
        }
        new Function('require', 'module', 'exports', code)(require, loadedModule, loadedModule.exports)
        modules.set(filename, loadedModule.exports)
        return loadedModule.exports
    }
    const {useWorkSectionSession} = load(path.join(root, 'features/work/hooks/useWorkSectionSession.ts'))
    useWorkSectionSession({
        initialProjects: [], initialFilter: {type: 'featured'},
        sidebarFilters: {projectTypes: [{_id: 'music', slug: 'music-videos', title: 'Music Videos', referenceCount: 1}], brands: [], personalities: []},
        isProjectsLoading: false, pathname: '/work/type/music-videos',
        searchParams: new URLSearchParams(), router: {push() {}, back() {}}, pageSize: 15,
    })
    effects[0]()
    effects[1]()
    const leave = effects[2]()
    assert.equal(requests.length, 1)
    leave()
    const leaveAgain = effects[2]()
    assert.equal(requests.length, 2, 'Back must start a replacement request before the old request completes')
    requests[0]([{_id: 'stale'}])
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(state.isLoading, true)
    assert.deepEqual(state.visibleProjects, [])
    requests[1]([{_id: 'fresh'}])
    await new Promise(resolve => setImmediate(resolve))
    assert.deepEqual(state.visibleProjects, [{_id: 'fresh'}])
    assert.equal(state.isLoading, false)
    leaveAgain()
})
