type OwnedVideoPlayer = {
  pause(): void;
  release(): void;
  replaceAsync(source: number): Promise<void>;
};

/** Owns a native player until its view and pending loads have both detached. */
export function createVideoSession<T extends OwnedVideoPlayer>(player: T) {
  let active = true;
  let attached = false;
  let ready = false;
  let released = false;
  let pending = 0;
  let revision = 0;
  let queue: Promise<unknown> = Promise.resolve();

  const releaseWhenUnused = () => {
    // Let all React effect cleanups remove their listeners before releasing.
    queueMicrotask(() => {
      if (!active && !attached && pending === 0 && !released) {
        released = true;
        player.release();
      }
    });
  };

  return {
    player,
    get active() { return active; },
    get ready() { return active && ready; },
    setAttached(value: boolean) {
      attached = value;
      releaseWhenUnused();
    },
    load(source: number): Promise<boolean> {
      if (!active) return Promise.resolve(false);
      const requestedRevision = ++revision;
      ready = false;
      player.pause();
      pending += 1;
      const task = queue.then(async () => {
        if (!active || requestedRevision !== revision) return false;
        await player.replaceAsync(source);
        ready = active && requestedRevision === revision;
        return ready;
      });
      queue = task.catch(() => {}).finally(() => {
        pending -= 1;
        releaseWhenUnused();
      });
      return task;
    },
    dispose() {
      if (!active) return;
      active = false;
      ready = false;
      player.pause();
      releaseWhenUnused();
    },
  };
}
