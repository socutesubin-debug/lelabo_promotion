import { useState, useEffect, useRef } from "react";
import { playSound, playLoop, stopSound } from "./utils/soundManager";
import bgImage from "./assets/lelabo_img/11/11-main.jpg";
import cardImg from "./assets/lelabo_img/11/11-1.png";

/*
  Phase 흐름:
  cardIn (중앙 등장) → cardLeft (좌측 이동) → textIn (우측 문구, 타자 효과로 등장)
*/

const COPY_LINES = [
  "오늘, 당신만의 향이 완성되었습니다.",
  "르라보와 함께한 이 순간이",
  "오래 기억되길 바랍니다.",
];
const FULL_COPY_TEXT = COPY_LINES.join("\n");

function ClosingScreen() {
  const [phase, setPhase] = useState("cardIn");
  const [typedText, setTypedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const timerRef = useRef(null);
  const paperSlidePlayedRef = useRef(false);

  // 11-1.png 카드 등장 시 paper_slide 1회 재생
  useEffect(() => {
    if (paperSlidePlayedRef.current) return;
    paperSlidePlayedRef.current = true;
    playSound("paper_slide", 0.4);
  }, []);

  useEffect(() => {
    if (phase !== "cardIn") return;
    const t = setTimeout(() => setPhase("cardLeft"), 2500); // 등장(1.2s) + 중앙 체류(1.3s)
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "cardLeft") return;
    const t = setTimeout(() => setPhase("textIn"), 1300); // 이동(1.4s) 중 살짝 겹쳐서 등장
    return () => clearTimeout(t);
  }, [phase]);

  // 우측 문구 타자 효과 (더 빠르게)
  useEffect(() => {
    if (phase !== "textIn") return;
    let index = 0;
    // typing 원본 음원이 길게 이어지는 타이핑 사운드라 글자마다 새로 트리거하지 않고,
    // 타자 애니메이션이 진행되는 동안 한 번만 재생하고 끝나면 정지합니다.
    playLoop("typing", 0.3);
    const type = () => {
      if (index >= FULL_COPY_TEXT.length) {
        setTypingDone(true);
        stopSound("typing");
        return;
      }
      index++;
      setTypedText(FULL_COPY_TEXT.slice(0, index));
      const speed = 30 + Math.random() * 24;
      timerRef.current = setTimeout(type, speed);
    };
    timerRef.current = setTimeout(type, 60);
    return () => {
      clearTimeout(timerRef.current);
      stopSound("typing");
    };
  }, [phase]);

  const isCardLeft = phase === "cardLeft" || phase === "textIn";
  const isTextIn = phase === "textIn";
  const typedLines = typedText.split("\n");

  return (
    <section className="closing-screen" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="closing-bg-overlay" />

      <div className="closing-stage">
        <img src={cardImg} alt="" className="closing-card closing-card--in" />

        <div className={`closing-copy ${isCardLeft ? "closing-copy--mounted" : ""} ${isTextIn ? "closing-copy--in" : ""}`}>
          {COPY_LINES.map((_, i) => {
            const lineText = typedLines[i] ?? "";
            const isCurrentLine = !typingDone && i === typedLines.length - 1;
            return (
              <p key={i} className="closing-copy-line">
                {lineText}
                {isCurrentLine && <span className="typing-cursor" />}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ClosingScreen;
