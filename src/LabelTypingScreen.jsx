import { useState, useEffect, useRef, useCallback } from "react";
import bgImage from "./assets/lelabo_img/9/9-bg.jpg";
import typewriterImage from "./assets/lelabo_img/9/9-1.png";
import { playLoop, stopSound } from "./utils/soundManager";

const LABEL_LINES = [
  "I wish you happiness.",
];
const FULL_TEXT = LABEL_LINES.join("\n");

const KEY_POSITIONS = [
  // 1행
  {x:23.5,y:60.9},{x:29.6,y:60.9},{x:36,y:60.9},{x:42.3,y:60.9},{x:48.7,y:60.9},
  {x:54.8,y:60.9},{x:61.2,y:60.9},{x:67.3,y:60.9},{x:73.7,y:60.9},{x:80,y:60.9},
  // 2행
  {x:24.6,y:66.3},{x:31.2,y:66.3},{x:37.9,y:66.3},{x:44.5,y:66.3},{x:51.2,y:66.3},
  {x:57.7,y:66.3},{x:64.1,y:66.3},{x:70.4,y:66.3},{x:76.6,y:66.3},{x:82.5,y:66.3},
  // 3행
  {x:26.1,y:71},{x:32.6,y:71},{x:39.3,y:71},{x:45.9,y:71},{x:52.4,y:71},
  {x:59,y:71},{x:65.3,y:71},{x:71.5,y:71},{x:78,y:71},{x:84.2,y:71},
  // 4행
  {x:29,y:75.7},{x:35.3,y:75.7},{x:41.8,y:75.7},{x:48.4,y:75.7},{x:54.9,y:75.7},
  {x:61.5,y:75.7},{x:68,y:75.7},{x:74.3,y:75.7},{x:80.5,y:75.7},
];

const DEBUG_POSITION = false;

function LabelTypingScreen({ onNext }) {
  const [typewriterVisible, setTypewriterVisible] = useState(false);
  const [typedText, setTypedText]   = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [keyHits, setKeyHits] = useState([]);
  const [pressed, setPressed] = useState(false);
  const timerRef = useRef(null);
  const innerRef = useRef(null);

  const triggerKeyHit = useCallback((x, y) => {
    if (DEBUG_POSITION) return;
    const key = KEY_POSITIONS[Math.floor(Math.random() * KEY_POSITIONS.length)];
    const rx = x ?? key.x;
    const ry = y ?? key.y;
    const id = Date.now() + Math.random();
    setKeyHits((prev) => [...prev, { x: rx, y: ry, id }]);
    setTimeout(() => setKeyHits((prev) => prev.filter((k) => k.id !== id)), 250);
    setPressed(true);
    setTimeout(() => setPressed(false), 80);
  }, []);

  // 타자기 등장
  useEffect(() => {
    const t = setTimeout(() => setTypewriterVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  // 자동 타이핑
  useEffect(() => {
    if (DEBUG_POSITION) return;
    if (!typewriterVisible) return;
    let index = 0;

    // typing 원본 음원이 길게 이어지는 타이핑 사운드라 키 입력마다 새로 트리거하지 않고,
    // 타이핑이 진행되는 동안 한 번만 재생하고 끝나면 정지합니다.
    playLoop("typing", 0.3);

    const type = () => {
      if (index >= FULL_TEXT.length) {
        setTypingDone(true);
        stopSound("typing");
        setTimeout(() => setButtonVisible(true), 500);
        return;
      }
      index++;
      setTypedText(FULL_TEXT.slice(0, index));
      if (FULL_TEXT[index - 1] !== "\n") triggerKeyHit();
      const speed = 200 + Math.random() * 100;
      timerRef.current = setTimeout(type, speed);
    };

    const start = setTimeout(type, 800);
    return () => {
      clearTimeout(start);
      if (timerRef.current) clearTimeout(timerRef.current);
      stopSound("typing");
    };
  }, [typewriterVisible, triggerKeyHit]);

  // 사용자 키보드 입력 시 키 눌림 효과
  useEffect(() => {
    if (DEBUG_POSITION) return;
    const onKeyDown = () => triggerKeyHit();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [triggerKeyHit]);

  // 디버그 모드: 클릭 위치 % 좌표 표시
  const handleDebugClick = useCallback((e) => {
    if (!DEBUG_POSITION) return;
    const rect = innerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const id = Date.now() + Math.random();
    setKeyHits((prev) => [...prev, { x, y, id, label: `${x.toFixed(1)},${y.toFixed(1)}` }]);
    console.log(`클릭 위치: x=${x.toFixed(1)}%, y=${y.toFixed(1)}%`);
  }, []);

  const typedLines = typedText.split("\n");

  return (
    <section
      className="label-typing-screen"
      style={{ backgroundImage: `url(${bgImage})` }}
      onClick={DEBUG_POSITION ? undefined : triggerKeyHit}
    >
      <div className="label-bg-overlay" />

      <div className={`typewriter-wrap ${typewriterVisible ? "typewriter-wrap--visible" : ""}`}>
        <div
          ref={innerRef}
          className={`typewriter-inner ${pressed ? "typewriter-pressed" : ""}`}
          onClick={DEBUG_POSITION ? handleDebugClick : undefined}
          style={DEBUG_POSITION ? { cursor: "crosshair" } : undefined}
        >
          {/* 라벨 종이 텍스트 레이어 */}
          <div className="label-paper-area">
            <div className="label-paper-text">
              {DEBUG_POSITION ? (
                <div className="label-line">I wish you happiness.</div>
              ) : LABEL_LINES.map((_, i) => {
                const typedLine     = typedLines[i] ?? "";
                const isCurrentLine = !typingDone && i === typedLines.length - 1;
                return (
                  <div key={i} className="label-line">
                    {typedLine}
                    {isCurrentLine && <span className="typing-cursor" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 타자기 이미지 */}
          <img src={typewriterImage} alt="" className="typewriter-image" />

          {/* 키 눌림 이펙트 레이어 */}
          <div className="typewriter-key-layer">
            {keyHits.map((hit) => (
              <div
                key={hit.id}
                className="typewriter-key-hit"
                style={{ left: `${hit.x}%`, top: `${hit.y}%` }}
              >
                {DEBUG_POSITION && (
                  <span style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%) translate(14px, -14px)",
                    fontSize: "10px",
                    color: "rgba(255,80,80,0.95)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    fontFamily: "monospace",
                    background: "rgba(0,0,0,0.5)",
                    padding: "1px 3px",
                    borderRadius: "2px",
                  }}>
                    {hit.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 라벨 완성 버튼 */}
      <div className={`label-complete-button ${buttonVisible ? "label-complete-button--visible" : ""}`}>
        <span className="label-complete-kicker">PRINT LABEL</span>
        <button
          className="label-complete-btn"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          라벨 완성
        </button>
      </div>
    </section>
  );
}

export default LabelTypingScreen;
