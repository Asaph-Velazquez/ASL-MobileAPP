export class SignSequenceCollector {
  private frames: number[][] = [];
  private lastSeen = 0;
  private waitingForExit = false;

  getSnapshot() {
    return { frameCount: this.frames.length, waitingForExit: this.waitingForExit };
  }

  reset() {
    this.frames = [];
    this.lastSeen = 0;
    this.waitingForExit = false;
  }

  feed(landmarks: number[] | null, now: number, busy: boolean): number[][] | null {
    if (landmarks && landmarks.length === 63 && landmarks.every(Number.isFinite)) {
      this.lastSeen = now;
      if (this.waitingForExit || busy) return null;
      this.frames.push(landmarks);
      if (this.frames.length === 60) {
        this.waitingForExit = true;
        const sequence = this.frames;
        this.frames = [];
        return sequence;
      }
      return null;
    }

    if (this.lastSeen && now - this.lastSeen >= 500) {
      const sequence = !this.waitingForExit && this.frames.length >= 15 ? this.frames : null;
      this.reset();
      return sequence;
    }
    return null;
  }
}
