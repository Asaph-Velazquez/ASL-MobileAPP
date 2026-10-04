import { useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import type { VideoViewProps } from 'expo-video';

type ASLVideoPreviewProps = Pick<VideoViewProps, 'style' | 'contentFit'> & {
  source: number;
};

export function ASLVideoPreview(props: ASLVideoPreviewProps) {
  // Keep the native view and its player in the same lifetime when the asset changes.
  return <ASLVideoInstance key={props.source} {...props} />;
}

function ASLVideoInstance({ source, style, contentFit = 'contain' }: ASLVideoPreviewProps) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
  });

  useEffect(() => {
    // Web cannot play during setup: VideoView has not attached its video element yet.
    const statusSubscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') player.play();
    });
    const endSubscription = player.addListener('playToEnd', () => {
      player.currentTime = 0;
      player.play();
    });

    player.play();

    return () => {
      statusSubscription.remove();
      endSubscription.remove();
    };
  }, [player]);

  return <VideoView player={player} style={style} contentFit={contentFit} nativeControls={false} playsInline />;
}
