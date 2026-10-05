import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import type { VideoViewProps } from 'expo-video';

type ASLVideoPreviewProps = Pick<VideoViewProps, 'style' | 'contentFit'> & {
  source: number;
  replayToken?: number;
};

export function ASLVideoPreview(props: ASLVideoPreviewProps) {
  // Keep the native view and its player in the same lifetime when the asset changes.
  return <ASLVideoInstance key={props.source} {...props} />;
}

function ASLVideoInstance({ source, style, contentFit = 'contain', replayToken = 0 }: ASLVideoPreviewProps) {
  const viewRef = useRef<VideoView>(null);
  const [needsControls, setNeedsControls] = useState(false);
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
  });

  useEffect(() => {
    let disposed = false;
    const play = () => {
      if (disposed) return;
      if (Platform.OS !== 'web') {
        player.play();
        return;
      }

      // Expo's web player discards play()'s promise; handle it on the mounted media element.
      const video = viewRef.current?.nativeRef.current as HTMLVideoElement | null;
      if (!video) return;
      void video.play().then(() => {
        if (!disposed) setNeedsControls(false);
      }).catch((error: unknown) => {
        if (disposed || (error instanceof Error && error.name === 'AbortError')) return;
        // Keep manual playback available if the browser rejects autoplay.
        setNeedsControls(true);
      });
    };
    // Web cannot play during setup: VideoView has not attached its video element yet.
    const statusSubscription = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') play();
    });
    const endSubscription = player.addListener('playToEnd', () => {
      player.currentTime = 0;
      play();
    });

    if (replayToken > 0) player.currentTime = 0;
    play();

    return () => {
      disposed = true;
      statusSubscription.remove();
      endSubscription.remove();
    };
  }, [player, replayToken]);

  return (
    <View style={[style, styles.frame]}>
      <VideoView
        ref={viewRef}
        player={player}
        style={[styles.video, styles.frame]}
        contentFit={contentFit}
        // TextureView participates in rounded clipping on Android.
        surfaceType="textureView"
        nativeControls={needsControls}
        playsInline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 16, overflow: 'hidden' },
  // A web video keeps its intrinsic dimensions when only absolute insets are set.
  video: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
});
