import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player'

const generateThumbnail = (videoSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.currentTime = 1; // pick 1 second for thumbnail

    video.addEventListener('loadeddata', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/jpeg');
      resolve(imgData);
    });

    video.addEventListener('error', (e) => reject(e));
  });
};

const VideoPlayerWithDynamicThumbnail = ({ videoSrc }: { videoSrc: string }) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    generateThumbnail(videoSrc).then(setThumbnail);
  }, [videoSrc]);

// UPDATE PLAYING STUFF FOR VIDEOS (NOT YOUTUBE URLS)

  return (
    <ReactPlayer
      src={videoSrc}
      playing={playing}
      controls
      playIcon={<div style={{background: "white", padding: "3px 15px", border: "1px solid black"}}>Play</div>}
      light={thumbnail || true} // fallback if not loaded yet
      onClickPreview={() => setPlaying(true)}
      width="100%"
      height="100%"
    />
  );
};

export default VideoPlayerWithDynamicThumbnail;
