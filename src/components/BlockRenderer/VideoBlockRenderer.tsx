import React, { useState } from 'react';
import type { PageBlock } from '../../types';
import styles from './VideoBlockRenderer.module.css';

interface VideoBlockRendererProps {
  block: PageBlock;
}

const VideoBlockRenderer: React.FC<VideoBlockRendererProps> = ({ block }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { content } = block;

  if (!content?.src && !content?.embedCode) {
    return null;
  }

  const {
    src,
    embedCode,
    type = 'youtube',
    title = '',
    width = '100%',
    height = '315',
    autoplay = false,
    controls = true,
    muted = false,
    poster
  } = content;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Generate YouTube embed URL
  const getYouTubeEmbedUrl = (videoId: string): string => {
    const params = new URLSearchParams();
    if (autoplay) params.append('autoplay', '1');
    if (!controls) params.append('controls', '0');
    if (muted) params.append('mute', '1');
    params.append('rel', '0');
    params.append('modestbranding', '1');

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  // Generate Vimeo embed URL
  const getVimeoEmbedUrl = (url: string): string => {
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const match = url.match(vimeoRegex);
    if (!match) return url;

    const videoId = match[1];
    const params = new URLSearchParams();
    if (autoplay) params.append('autoplay', '1');
    if (muted) params.append('muted', '1');

    return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
  };

  const renderVideo = () => {
    // If custom embed code is provided, use it
    if (embedCode) {
      return (
        <div
          className={styles.embedWrapper}
          dangerouslySetInnerHTML={{ __html: embedCode }}
        />
      );
    }

    // Handle different video types
    if (type === 'youtube' && src) {
      const videoId = getYouTubeVideoId(src);
      if (!videoId) {
        return <div className={styles.error}>잘못된 YouTube URL입니다</div>;
      }

      const embedUrl = getYouTubeEmbedUrl(videoId);

      return (
        <iframe
          src={embedUrl}
          title={title || 'YouTube 비디오'}
          width={width}
          height={height}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
          className={styles.iframe}
        />
      );
    }

    if (type === 'vimeo' && src) {
      const embedUrl = getVimeoEmbedUrl(src);

      return (
        <iframe
          src={embedUrl}
          title={title || 'Vimeo 비디오'}
          width={width}
          height={height}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
          className={styles.iframe}
        />
      );
    }

    if (type === 'direct' && src) {
      return (
        <video
          src={src}
          poster={poster}
          controls={controls}
          autoPlay={autoplay}
          muted={muted}
          width={width}
          height={height}
          className={styles.video}
          onLoadedData={() => setIsLoading(false)}
        >
          브라우저에서 비디오를 지원하지 않습니다.
        </video>
      );
    }

    return <div className={styles.error}>비디오를 불러올 수 없습니다</div>;
  };

  return (
    <div className={styles.videoContainer}>
      {isLoading && (
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner}></div>
          <span>비디오 로딩 중...</span>
        </div>
      )}
      <div className={styles.videoWrapper}>
        {renderVideo()}
      </div>
      {title && (
        <div className={styles.videoTitle}>
          <h3>{title}</h3>
        </div>
      )}
    </div>
  );
};

export default VideoBlockRenderer;