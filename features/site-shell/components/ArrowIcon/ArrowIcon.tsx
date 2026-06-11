export type ArrowDirection = 'left' | 'right' | 'up' | 'down'

const ROTATION: Record<ArrowDirection, string> = {
    up: '0deg',
    right: '90deg',
    down: '180deg',
    left: '270deg',
}

interface ArrowIconProps {
    direction: ArrowDirection
}

export default function ArrowIcon({direction}: ArrowIconProps) {
    return (
        <svg
            width="11"
            height="15"
            viewBox="0 0 11 15"
            style={{transform: `rotate(${ROTATION[direction]})`}}
            aria-hidden="true"
            focusable="false"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M10.0139 5.6039C6.45234 5.6039 5.00694 1.50391 5.00694 1.50391C5.00694 1.50391 3.56158 5.6039 -5.12016e-07 5.6039"
                stroke="currentColor"
            />
            <path
                d="M7.00971 13.8038C4.50623 13.8038 5.00693 2.52881 5.00693 2.52881C5.00693 2.52881 5.50762 13.8038 3.00415 13.8038"
                stroke="currentColor"
            />
        </svg>
    )
}
