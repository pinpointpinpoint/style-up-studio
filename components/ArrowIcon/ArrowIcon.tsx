export type ArrowDirection = 'left' | 'right' | 'up' | 'down'

const ARROW_SRC: Record<ArrowDirection, string> = {
  left: '/Arrows/ArrowLeft.svg',
  right: '/Arrows/ArrowRight.svg',
  up: '',
  down: ''
}

interface ArrowIconProps {
  direction: ArrowDirection
}

export default function ArrowIcon({ direction }: ArrowIconProps) {
  return <img src={ARROW_SRC[direction]} alt="" />
}