// Fractions of the image, independent of the card's zoomed pixel dimensions.
export function getMagnifierGeometry(pointerX: number, pointerY: number, cardWidth: number, cardHeight: number, sidebarAspect: number) {
    const width = Math.min(0.3, sidebarAspect * cardHeight / cardWidth)
    const height = width * cardWidth / cardHeight / sidebarAspect
    const clamp = (value: number, maximum: number) => Math.max(0, Math.min(maximum, value))
    const left = clamp(pointerX / cardWidth - width / 2, 1 - width)
    const top = clamp(pointerY / cardHeight - height / 2, 1 - height)
    return {
        left, top, width, height,
        backgroundX: width < 1 ? left / (1 - width) * 100 : 0,
        backgroundY: height < 1 ? top / (1 - height) * 100 : 0,
        backgroundSize: 100 / width,
    }
}
