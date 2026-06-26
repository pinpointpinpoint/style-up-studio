import {describe, expect, it} from 'vitest'
import {
    bringStyleUpToFront,
    createStyleUpCanvasSession,
    endStyleUpDrag,
    getStyleUpDragOffsetBounds,
    getStyleUpCanvasHeight,
    moveStyleUpDrag,
    startStyleUpDrag,
} from './styleUpCanvasSession'

describe('style up canvas session', () => {
    it('creates bounded random layouts and initializes stacking order', () => {
        const randomValues = [0, 0, 1, 1, 0.5, 0.5]
        const session = createStyleUpCanvasSession({
            styleUps: [{_id: 'style-up-a'}, {_id: 'style-up-b'}],
            random: () => randomValues.shift() ?? 0,
        })

        expect(session).toEqual({
            drag: null,
            layouts: {
                'style-up-a': {
                    left: 7,
                    top: 93,
                    width: 14,
                    x: 0,
                    y: 0,
                },
                'style-up-b': {
                    left: 50,
                    top: 50,
                    width: 26,
                    x: 0,
                    y: 0,
                },
            },
            zIndexes: {},
            nextZIndex: 3,
        })
    })

    it('creates stable default layouts from style up ids', () => {
        const styleUps = [{_id: 'style-up-a'}, {_id: 'style-up-b'}]

        expect(createStyleUpCanvasSession({styleUps})).toEqual(
            createStyleUpCanvasSession({styleUps}),
        )
    })

    it('brings a style up to the front and advances the stacking counter', () => {
        const session = createStyleUpCanvasSession({
            styleUps: [{_id: 'style-up-a'}, {_id: 'style-up-b'}],
            random: () => 0.5,
        })

        expect(bringStyleUpToFront(session, 'style-up-a')).toEqual({
            ...session,
            zIndexes: {
                'style-up-a': 3,
            },
            nextZIndex: 4,
        })
    })

    it('starts dragging from the selected style up current offset', () => {
        const session = {
            ...createStyleUpCanvasSession({
                styleUps: [{_id: 'style-up-a'}],
                random: () => 0.5,
            }),
            layouts: {
                'style-up-a': {
                    left: 50,
                    top: 50,
                    width: 20,
                    x: 12,
                    y: -4,
                },
            },
        }

        expect(
            startStyleUpDrag(session, {
                id: 'style-up-a',
                clientX: 100,
                clientY: 200,
            }),
        ).toEqual({
            ...session,
            drag: {
                id: 'style-up-a',
                startClientX: 100,
                startClientY: 200,
                startX: 12,
                startY: -4,
                minX: Number.NEGATIVE_INFINITY,
                maxX: Number.POSITIVE_INFINITY,
                minY: Number.NEGATIVE_INFINITY,
                maxY: Number.POSITIVE_INFINITY,
            },
        })
    })

    it('moves only the dragged style up from the recorded pointer origin', () => {
        const session = startStyleUpDrag(
            {
                ...createStyleUpCanvasSession({
                    styleUps: [{_id: 'style-up-a'}, {_id: 'style-up-b'}],
                    random: () => 0.5,
                }),
                layouts: {
                    'style-up-a': {
                        left: 50,
                        top: 50,
                        width: 20,
                        x: 12,
                        y: -4,
                    },
                    'style-up-b': {
                        left: 40,
                        top: 40,
                        width: 18,
                        x: 2,
                        y: 3,
                    },
                },
            },
            {
                id: 'style-up-a',
                clientX: 100,
                clientY: 200,
            },
        )

        expect(moveStyleUpDrag(session, {clientX: 125, clientY: 190})).toEqual({
            ...session,
            layouts: {
                ...session.layouts,
                'style-up-a': {
                    ...session.layouts['style-up-a'],
                    x: 37,
                    y: -14,
                },
            },
        })
    })

    it('clamps dragged style ups inside the canvas bounds', () => {
        const session = startStyleUpDrag(
            {
                ...createStyleUpCanvasSession({
                    styleUps: [{_id: 'style-up-a'}],
                    random: () => 0.5,
                }),
                layouts: {
                    'style-up-a': {
                        left: 50,
                        top: 50,
                        width: 20,
                        x: 0,
                        y: 0,
                    },
                },
            },
            {
                id: 'style-up-a',
                clientX: 100,
                clientY: 200,
                bounds: {
                    canvasWidth: 1000,
                    canvasHeight: 800,
                    cardWidth: 200,
                    cardHeight: 160,
                },
            },
        )

        expect(moveStyleUpDrag(session, {clientX: 700, clientY: -300})).toEqual({
            ...session,
            layouts: {
                ...session.layouts,
                'style-up-a': {
                    ...session.layouts['style-up-a'],
                    x: 400,
                    y: -320,
                },
            },
        })
    })

    it('calculates drag offset bounds from card and canvas dimensions', () => {
        expect(
            getStyleUpDragOffsetBounds(
                {
                    left: 25,
                    top: 75,
                    width: 20,
                    x: 0,
                    y: 0,
                },
                {
                    canvasWidth: 1000,
                    canvasHeight: 800,
                    cardWidth: 200,
                    cardHeight: 160,
                },
            ),
        ).toEqual({
            minX: -150,
            maxX: 650,
            minY: -520,
            maxY: 120,
        })
    })

    it('allows drag bounds to extend beyond the canvas origin', () => {
        expect(
            getStyleUpDragOffsetBounds(
                {
                    left: 50,
                    top: 50,
                    width: 20,
                    x: 0,
                    y: 0,
                },
                {
                    canvasWidth: 1000,
                    canvasHeight: 800,
                    cardWidth: 200,
                    cardHeight: 160,
                    boundaryLeft: -30,
                    boundaryTop: -30,
                    boundaryRight: 1030,
                    boundaryBottom: 830,
                },
            ),
        ).toEqual({
            minX: -430,
            maxX: 430,
            minY: -350,
            maxY: 350,
        })
    })

    it('ends dragging by clearing drag state', () => {
        const session = startStyleUpDrag(
            createStyleUpCanvasSession({
                styleUps: [{_id: 'style-up-a'}],
                random: () => 0.5,
            }),
            {
                id: 'style-up-a',
                clientX: 100,
                clientY: 200,
            },
        )

        expect(endStyleUpDrag(session)).toEqual({
            ...session,
            drag: null,
        })
    })

    it('scales canvas height with item count', () => {
        expect(getStyleUpCanvasHeight(0)).toBe('max(calc(100% - 60px), 660px)')
        expect(getStyleUpCanvasHeight(9)).toBe('max(calc(100% - 60px), 780px)')
    })
})
