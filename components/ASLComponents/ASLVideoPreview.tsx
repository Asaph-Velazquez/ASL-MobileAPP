import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createVideoPlayer, useVideoPlayer, VideoView } from 'expo-video';
import type { VideoPlayer, VideoViewProps } from 'expo-video';
import { createVideoSession } from '@/services/videoSession';

type ASLVideoPreviewProps = Pick<VideoViewProps, 'style' | 'contentFit'> & {
  source: number;
  replayToken?: number;
};

export function ASLVideoPreview(props: ASLVideoPreviewProps) {
  return Platform.OS === 'web'
    ? <ASLVideoInstance key={props.source} {...props} />
    : <NativeASLVideoInstance {...props} />;
}

type VideoSession = ReturnType<typeof createVideoSession<VideoPlayer>>;

function NativeASLVideoInstance({ source, style, contentFit, replayToken }: ASLVideoPreviewProps) {
  const [session, setSession] = useState<VideoSession | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const player = createVideoPlayer(null);
    player.loop = true;
    player.muted = true;
    const owned = createVideoSession(player);
    setSession(owned);
    return () => owned.dispose();
  }, []);

  useEffect(() => {
    if (!session?.active) return;
    let current = true;
    setLoadFailed(false);
    void session.load(source).then(loaded => {
      if (current && loaded && session.ready) session.player.play();
    }).catch(() => {
      if (current && session.active) setLoadFailed(true);
    });
    return () => { current = false; };
  }, [session, source]);

  if (!session?.active) return <View style={[style, styles.frame]} />;
  return <ASLVideoSurface player={session.player} session={session} style={style}
    contentFit={contentFit} replayToken={replayToken} loadFailed={loadFailed} />;
}

function ASLVideoInstance({ source, style, contentFit = 'contain', replayToken = 0 }: ASLVideoPreviewProps) {
  const player = useVideoPlayer(source, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
  });

  return <ASLVideoSurface player={player} style={style} contentFit={contentFit} replayToken={replayToken} />;
}

type ASLVideoSurfaceProps = Pick<ASLVideoPreviewProps, 'style' | 'contentFit' | 'replayToken'> & {
  player: ReturnType<typeof useVideoPlayer>;
  session?: VideoSession;
  loadFailed?: boolean;
};

function ASLVideoSurface({ player, session, style, contentFit = 'contain', replayToken = 0, loadFailed = false }: ASLVideoSurfaceProps) {
  const viewRef = useRef<VideoView>(null);
  const [needsControls, setNeedsControls] = useState(false);

  useEffect(() => {
    let disposed = false;
    const play = () => {
      if (disposed || (session && !session.ready)) return;
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
      if (disposed || (session && !session.ready)) return;
      player.currentTime = 0;
      play();
    });

    if (replayToken > 0 && (!session || session.ready)) player.currentTime = 0;
    play();

    return () => {
      disposed = true;
      statusSubscription.remove();
      endSubscription.remove();
    };
  }, [player, replayToken, session]);

  return (
    <View style={[style, styles.frame]}>
      <VideoView
        ref={view => {
          viewRef.current = view;
          session?.setAttached(view !== null);
        }}
        player={player}
        style={[styles.video, styles.frame]}
        contentFit={contentFit}
        // TextureView participates in rounded clipping on Android.
        surfaceType="textureView"
        nativeControls={needsControls || loadFailed}
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
