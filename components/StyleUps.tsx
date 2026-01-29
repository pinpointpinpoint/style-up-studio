'use client';

import { urlFor } from "@/sanity/lib/utils";
import Image from "next/image";
import { FC, useState, useRef } from "react";

interface StyleUpsProps {
  styleUps: any | null;
}

export const StyleUps: FC<StyleUpsProps> = ({ styleUps }) => {
  const [hovered, setHovered] = useState<any | null>({
    coverImage: null,
    title: null
  });
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
        {styleUps.map((su) => (
          <div
            key={su._id}
            style={{ maxWidth: '100%', cursor: 'crosshair', position: 'relative' }}
            onMouseEnter={() => setHovered({
              coverImage: su.coverImage, 
              title: su.title
            })}
            onMouseLeave={() => setHovered(null)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={urlFor(su.coverImage)?.width(300).height(300).url()}
              alt={su.coverImage.alt}
              style={{ width: '100%', display: 'block' }}
            />



      <div
        className="style_sidebar--preview"
        ref={sidebarRef}
      >
{hovered && hovered.coverImage && (
          <>
            <Image
              ref={zoomRef}
              src={urlFor(hovered.coverImage)?.width(LARGE_WIDTH).url()}
              alt={hovered.coverImage.alt}
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
              <p>{hovered.title.toUpperCase()}</p>
            </div>
          </>
        )}
        </div>




          </div>



        ))}
      </div>

      {/* Right sidebar */}
      <div
        className="style_sidebar"
        ref={sidebarRef}
      >
        {hovered && hovered.coverImage && (
          <>
            <img
              ref={zoomRef}
              src={urlFor(hovered.coverImage)?.width(LARGE_WIDTH).url()}
              alt={hovered.coverImage.alt}
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
              <p>{hovered.title.toUpperCase()}</p>
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
