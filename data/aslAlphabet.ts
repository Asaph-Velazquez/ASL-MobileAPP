import type { ImageSourcePropType } from 'react-native';

// Static imports let Metro bundle every letter for offline use.
export const aslAlphabet = {
  A: require('../assets/images/ASL-letras/A.png'),
  B: require('../assets/images/ASL-letras/B.png'),
  C: require('../assets/images/ASL-letras/C.png'),
  D: require('../assets/images/ASL-letras/D.png'),
  E: require('../assets/images/ASL-letras/E.png'),
  F: require('../assets/images/ASL-letras/F.png'),
  G: require('../assets/images/ASL-letras/G.png'),
  H: require('../assets/images/ASL-letras/H.png'),
  I: require('../assets/images/ASL-letras/I.png'),
  J: require('../assets/images/ASL-letras/J.png'),
  K: require('../assets/images/ASL-letras/K.png'),
  L: require('../assets/images/ASL-letras/L.png'),
  M: require('../assets/images/ASL-letras/M.png'),
  N: require('../assets/images/ASL-letras/N.png'),
  O: require('../assets/images/ASL-letras/O.png'),
  P: require('../assets/images/ASL-letras/P.png'),
  Q: require('../assets/images/ASL-letras/Q.png'),
  R: require('../assets/images/ASL-letras/R.png'),
  S: require('../assets/images/ASL-letras/S.png'),
  T: require('../assets/images/ASL-letras/T.png'),
  U: require('../assets/images/ASL-letras/U.png'),
  V: require('../assets/images/ASL-letras/V.png'),
  W: require('../assets/images/ASL-letras/W.png'),
  X: require('../assets/images/ASL-letras/X.png'),
  Y: require('../assets/images/ASL-letras/Y.png'),
  Z: require('../assets/images/ASL-letras/Z.png'),
} satisfies Record<string, ImageSourcePropType>;

export function fingerspellingCharacters(text: string): string[] {
  return Array.from(text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim());
}

export function aslLetterSource(character: string): ImageSourcePropType | undefined {
  return Object.prototype.hasOwnProperty.call(aslAlphabet, character)
    ? aslAlphabet[character as keyof typeof aslAlphabet] : undefined;
}
