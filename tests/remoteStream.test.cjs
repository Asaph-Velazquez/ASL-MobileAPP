const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function service() {
  class Stream {
    tracks = [];
    getTracks() { return this.tracks; }
    getTrackById(id) { return this.tracks.find(track => track.id === id); }
    addTrack(track) { this.tracks.push(track); }
  }
  const imports = {
    'expo-camera': { Camera: {} },
    'react-native': { Platform: { OS: 'android' } },
    'react-native-webrtc': { MediaStream: Stream, RTCPeerConnection: class {} },
  };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../services/webrtc.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', code)(mod, mod.exports, name => imports[name]);
  return mod.exports;
}

test('audio and video from different remote streams keep one owned stream without duplicate tracks', () => {
  const snapshots = [];
  const peer = service().createGuestPeerConnection({ onRemoteStream: stream => snapshots.push({ stream, tracks: [...stream.getTracks()] }),
    onIceCandidate() {}, onConnectionStateChange() {} });
  const audio = { id: 'audio', kind: 'audio' }, video = { id: 'video', kind: 'video' };
  peer.ontrack({ track: audio, streams: [{ getTracks: () => [audio] }] });
  peer.ontrack({ track: video, streams: [{ getTracks: () => [video] }] });
  peer.ontrack({ track: video, streams: [] });
  assert.equal(snapshots[0].stream, snapshots[1].stream);
  assert.equal(snapshots[1].stream, snapshots[2].stream);
  assert.deepEqual(snapshots[0].tracks, [audio]);
  assert.deepEqual(snapshots[2].tracks, [audio, video]);
});
