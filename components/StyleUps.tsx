'use client';

import { urlFor } from "@/sanity/lib/utils";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import { FC, useState, useRef } from "react";

export type StyleUpItem = {
  _id: string
  name?: string | null
  image?: SanityImageSource | null
}

interface StyleUpsProps {
  styleUps: StyleUpItem[] | null;
}

function getStableNumber(id: string, salt: number) {
  let hash = salt

  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 10000
  }

  return hash / 10000
}

function getScatterStyle(styleUp: StyleUpItem, index: number, isHovered: boolean) {
  const offsetX = -18 + getStableNumber(styleUp._id, 11) * 36
  const offsetY = -16 + getStableNumber(styleUp._id, 23) * 32
  const rotation = -8 + getStableNumber(styleUp._id, 37) * 16
  const width = 82 + getStableNumber(styleUp._id, 51) * 16

  return {
    '--style-up-offset-x': `${offsetX}px`,
    '--style-up-offset-y': `${offsetY}px`,
    '--style-up-rotation': `${rotation}deg`,
    '--style-up-width': `${width}%`,
    zIndex: isHovered ? 1000 : index + 1,
  } as React.CSSProperties
}

export const StyleUps: FC<StyleUpsProps> = ({ styleUps }) => {
  const [hovered, setHovered] = useState<StyleUpItem | null>(styleUps?.[0] ?? null);
  const zoomRef = useRef<HTMLImageElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  if (!styleUps || styleUps.length === 0) return null;

  const LARGE_WIDTH = 3600;
  const LARGE_HEIGHT = 3600;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!zoomRef.current || !sidebarRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const sidebarWidth = sidebarRef.current.offsetWidth;
    const sidebarHeight = sidebarRef.current.offsetHeight;

    // Calculate the offsets for the large image
    const offsetX = Math.max(0, Math.min(x * (LARGE_WIDTH - sidebarWidth), LARGE_WIDTH - sidebarWidth));
    const offsetY = Math.max(0, Math.min(y * (LARGE_HEIGHT - sidebarHeight), LARGE_HEIGHT - sidebarHeight));

    // Directly move the zoomed image via style
    zoomRef.current.style.left = `-${offsetX}px`;
    zoomRef.current.style.top = `-${offsetY}px`;
  };

  return (
    <div className="main_style">
      {/* Left thumbnails */}
      <div className="styleUps">
        {styleUps.map((su, index) => (
          <div
            key={su._id}
            className={`styleUpCard ${hovered?._id === su._id ? 'styleUpCard--hovered' : ''}`}
            style={getScatterStyle(su, index, hovered?._id === su._id)}
            onMouseEnter={() => setHovered(su)}
            onMouseMove={handleMouseMove}
          >
            {su.image && (
              <Image
                src={urlFor(su.image).width(900).height(900).fit('crop').url()}
                height={900}
                width={900}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                alt={`Style up image for ${su.name ?? 'style up'}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Right sidebar */}
      <div
        className="style_sidebar"
        ref={sidebarRef}
      >
        {hovered?.image && (
          <>
            <img
              ref={zoomRef}
              src={urlFor(hovered.image).width(LARGE_WIDTH).url()}
              alt={`Zoomed style up image for ${hovered.name ?? 'style up'}`}
              style={{
                position: 'absolute',
                width: `${LARGE_WIDTH}px`,
                height: `${LARGE_HEIGHT}px`,
                top: '0',
                left: '0',
                transition: 'top 0.05s, left 0.05s', // optional smoothness
                maxWidth: 'none',
                maxHeight: 'none',
              }}
            />
            <div className="style_title">
              <p>{hovered.name?.toUpperCase()}</p>
            </div>
          </>
        )}
        {/* {!hovered && (
          <p style={{ color: '#999', padding: '20px' }}>
            Hover over a thumbnail to see zoom
          </p>
        )} */}
      </div>

    </div>
  );
};
