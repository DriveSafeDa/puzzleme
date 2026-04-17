const cache = new Map<string, HTMLAudioElement>();

function getAudio(src: string): HTMLAudioElement {
  let audio = cache.get(src);
  if (!audio) {
    audio = new Audio(src);
    cache.set(src, audio);
  }
  return audio;
}

export function playSnap() {
  const a = getAudio("/sounds/snap.mp3");
  a.currentTime = 0;
  a.volume = 0.5;
  a.play().catch(() => {});
}

export function playCelebrate() {
  const a = getAudio("/sounds/celebrate.mp3");
  a.currentTime = 0;
  a.volume = 0.6;
  a.play().catch(() => {});
}

export function playPickUp() {
  const a = getAudio("/sounds/pick-up.mp3");
  a.currentTime = 0;
  a.volume = 0.3;
  a.play().catch(() => {});
}

export function vibrate(ms: number = 50) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}
