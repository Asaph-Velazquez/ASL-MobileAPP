import React from 'react';
import { AccessibilityInfo, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { aslLetterSource, fingerspellingCharacters } from '@/data/aslAlphabet';

export function ASLFingerspelling({ text }: { text: string }) {
  const scroll = React.useRef<ScrollView>(null);
  const position = React.useRef(0);
  const touched = React.useRef(false);
  const [paused, setPaused] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(true);
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const [contentWidth, setContentWidth] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (active) setReduceMotion(enabled);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);

  React.useEffect(() => {
    touched.current = false;
    setPaused(false);
    position.current = 0;
    scroll.current?.scrollTo({ x: 0, animated: false });
  }, [text]);

  React.useEffect(() => {
    const limit = Math.max(0, contentWidth - viewportWidth);
    if (paused || reduceMotion || viewportWidth === 0 || limit === 0) return;
    let holdUntil = Date.now() + 1400;
    const timer = setInterval(() => {
      if (touched.current || Date.now() < holdUntil) return;
      if (position.current >= limit) {
        position.current = 0;
        holdUntil = Date.now() + 1400;
      } else {
        position.current = Math.min(limit, position.current + 0.9);
        if (position.current === limit) holdUntil = Date.now() + 1800;
      }
      scroll.current?.scrollTo({ x: position.current, animated: false });
    }, 32);
    return () => clearInterval(timer);
  }, [contentWidth, viewportWidth, paused, reduceMotion, text]);

  const pause = () => {
    // Stop immediately so no autoplay tick competes with the user's gesture.
    touched.current = true;
    setPaused(true);
  };

  return <ScrollView ref={scroll} horizontal nestedScrollEnabled
    showsHorizontalScrollIndicator persistentScrollbar
    style={styles.container} contentContainerStyle={styles.letters}
    onLayout={event => setViewportWidth(event.nativeEvent.layout.width)}
    onContentSizeChange={width => setContentWidth(width)}
    onTouchStart={pause} onScrollBeginDrag={pause}>
    {fingerspellingCharacters(text).map((character, index) => {
      if (character === ' ') return <View key={index} style={styles.space} />;
      const source = aslLetterSource(character);
      return <View key={index} style={styles.letter} accessible
        onAccessibilityTap={pause}
        accessibilityLabel={source ? `ASL letter ${character}` : character}>
        {source ? <Image source={source} resizeMode="contain" style={styles.image} />
          : <Text style={styles.symbol}>{character}</Text>}
        <Text style={styles.caption}>{character}</Text>
      </View>;
    })}
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 0, backgroundColor: '#FFFFFF', borderRadius: 16 },
  letters: { padding: 12, gap: 8, alignItems: 'center' },
  space: { width: 22 },
  letter: { width: 76, alignItems: 'center', gap: 8 },
  image: { width: 76, height: 112 },
  caption: { color: '#171717', fontSize: 22, fontWeight: '800' },
  symbol: { color: '#171717', fontSize: 32, height: 112, textAlignVertical: 'center', paddingTop: 30 },
});
