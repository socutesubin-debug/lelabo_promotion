// 전역 사운드 매니저: 배경음악(BGM) + 효과음(SFX)을 한 곳에서 관리합니다.
// 화면 컴포넌트는 사운드 파일을 직접 다루지 않고 이 모듈의 함수만 호출합니다.
import backgroundSrc from "../assets/music/background.mp3";
import clickSrc from "../assets/music/click.mp3";
import popSrc from "../assets/music/pop.mp3";
import glass1Src from "../assets/music/glass1.mp3";
import glass2Src from "../assets/music/glass2.mp3";
import waterdropSrc from "../assets/music/waterdrop.mp3";
import rubbingSrc from "../assets/music/rubbing.mp3";
import stirringLiquidSrc from "../assets/music/stirring_liquid.mp3";
import shiningSrc from "../assets/music/shining.mp3";
import typingSrc from "../assets/music/typing.mp3";
import paperSlideSrc from "../assets/music/paper_slide.mp3";
import boxCloseSrc from "../assets/music/box_clos.mp3";

const SOUND_SRC = {
  background: backgroundSrc,
  click: clickSrc,
  pop: popSrc,
  glass1: glass1Src,
  glass2: glass2Src,
  waterdrop: waterdropSrc,
  rubbing: rubbingSrc,
  stirring_liquid: stirringLiquidSrc,
  shining: shiningSrc,
  typing: typingSrc,
  paper_slide: paperSlideSrc,
  box_close: boxCloseSrc,
};

const BGM_VOLUME = 0.2;
const CLICK_VOLUME = 0.38;

let muted = false;
let bgmEl = null;
let bgmStarted = false;

// loop 사운드(name -> Audio): 장면 전용 루프(예: stirring_liquid)
const loopingSounds = new Map();
// 동시에 겹쳐 재생 중인 one-shot 인스턴스(name -> Set<Audio>): stopSound로 강제 정지 가능하게 추적
const activeOneShots = new Map();
// 사운드별 throttle 마지막 재생 시각
const lastPlayedAt = new Map();

function getSrc(name) {
  const src = SOUND_SRC[name];
  if (!src) console.warn(`[soundManager] 알 수 없는 사운드: "${name}"`);
  return src;
}

function trackOneShot(name, el) {
  let set = activeOneShots.get(name);
  if (!set) {
    set = new Set();
    activeOneShots.set(name, set);
  }
  set.add(el);
  const cleanup = () => set.delete(el);
  el.addEventListener("ended", cleanup);
  el.addEventListener("error", cleanup);
}

// 브라우저 자동재생 정책 때문에 최초 사용자 인터랙션 시 한 번만 호출하면 됩니다.
// 화면 전환 중에도 끊기지 않도록 전역에서 단 하나의 인스턴스만 재생합니다.
export function startBackgroundMusic() {
  if (bgmStarted) return;
  if (!bgmEl) {
    bgmEl = new Audio(SOUND_SRC.background);
    bgmEl.loop = true;
    bgmEl.volume = BGM_VOLUME;
    bgmEl.muted = muted;
  }
  bgmStarted = true;
  bgmEl.play().catch(() => {
    // 재생 실패(자동재생 차단 등) 시 다음 인터랙션에서 다시 시도할 수 있도록 플래그를 되돌립니다.
    bgmStarted = false;
  });
}

// 짧은 효과음: 매번 새 Audio 인스턴스를 만들어 겹쳐 재생되어도 자연스럽게 들리게 합니다.
// options.throttleMs를 주면 짧은 시간 내 중복 재생을 막습니다(예: 빠른 타이핑).
// options.maxDurationMs를 주면 원본 음원 길이와 무관하게 그 시점에서 강제로 정지합니다.
// (일부 음원 파일이 의도한 "짧은 효과음"보다 훨씬 길어 여러 인스턴스가 겹칠 때 사용)
export function playSound(name, volume = 0.4, options = {}) {
  if (muted) return null;
  const src = getSrc(name);
  if (!src) return null;

  const { throttleMs, maxDurationMs } = options;
  if (throttleMs) {
    const now = Date.now();
    const last = lastPlayedAt.get(name) ?? 0;
    if (now - last < throttleMs) return null;
    lastPlayedAt.set(name, now);
  }

  const el = new Audio(src);
  el.volume = volume;
  trackOneShot(name, el);
  el.play().catch(() => {});

  if (maxDurationMs) {
    setTimeout(() => {
      el.pause();
      el.currentTime = 0;
    }, maxDurationMs);
  }

  return el;
}

export function playClick() {
  playSound("click", CLICK_VOLUME);
}

// 지속/반복 사운드(예: 저어주는 효과음). 같은 name은 인스턴스를 재사용합니다.
export function playLoop(name, volume = 0.3) {
  if (muted) return null;
  const src = getSrc(name);
  if (!src) return null;

  let el = loopingSounds.get(name);
  if (!el) {
    el = new Audio(src);
    el.loop = true;
    loopingSounds.set(name, el);
  }
  el.volume = volume;
  el.muted = muted;
  el.play().catch(() => {});
  return el;
}

// 특정 사운드를 정지합니다. 루프 인스턴스와 현재 재생 중인 one-shot 인스턴스 모두 대상입니다.
export function stopSound(name) {
  const loopEl = loopingSounds.get(name);
  if (loopEl) {
    loopEl.pause();
    loopEl.currentTime = 0;
    loopingSounds.delete(name);
  }

  const set = activeOneShots.get(name);
  if (set) {
    set.forEach((el) => {
      el.pause();
      el.currentTime = 0;
    });
    set.clear();
  }
}

// 장면 전환 시 background를 제외한 모든 반복 사운드를 정지합니다.
export function stopAllLoopingSounds() {
  loopingSounds.forEach((el) => {
    el.pause();
    el.currentTime = 0;
  });
  loopingSounds.clear();
}

export function toggleMute() {
  muted = !muted;
  if (bgmEl) bgmEl.muted = muted;
  loopingSounds.forEach((el) => {
    el.muted = muted;
  });
  return muted;
}

export function isMuted() {
  return muted;
}
