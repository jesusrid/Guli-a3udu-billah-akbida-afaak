import { useState, useRef, useCallback, useEffect } from "react";
import photo1 from "@assets/IMG-20260204-WA0022_1776378280395.jpg";
import photoMain from "@assets/IMG-20260204-WA0026_1776379107634.jpg";

const FIREWORK_COLORS = [
  "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff",
  "#ff6bcd", "#ff9f43", "#a29bfe", "#fd79a8",
  "#ff4757", "#eccc68", "#7bed9f", "#70a1ff",
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
};

export default function Home() {
  const [celebrated, setCelebrated] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [laPos, setLaPos] = useState({ x: 0, y: 0 });
  const idRef = useRef(0);
  const laButtonRef = useRef<HTMLButtonElement>(null);
  const laPosRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  const burst = useCallback((cx: number, cy: number) => {
    const count = 60;
    const newParticles: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(3, 10);
      return {
        id: ++idRef.current,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
        size: randomBetween(7, 16),
        life: 1,
      };
    });
    setParticles((p) => [...p, ...newParticles]);
    let frame = 0;
    const animate = () => {
      frame++;
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.18,
            life: p.life - 0.018,
          }))
          .filter((p) => p.life > 0)
      );
      if (frame < 80) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (celebrated) return;

    const handleMouseMove = (e: MouseEvent) => {
      const btn = laButtonRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const btnCx = rect.left + rect.width / 2;
      const btnCy = rect.top + rect.height / 2;

      const dx = e.clientX - btnCx;
      const dy = e.clientY - btnCy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const FLEE_RADIUS = 160;
      if (dist < FLEE_RADIUS) {
        const fleeStrength = ((FLEE_RADIUS - dist) / FLEE_RADIUS) * 180;
        const angle = Math.atan2(dy, dx);
        const fleeX = -Math.cos(angle) * fleeStrength;
        const fleeY = -Math.sin(angle) * fleeStrength;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const maxX = vw / 2 - rect.width / 2 - 16;
        const maxY = vh / 2 - rect.height / 2 - 16;

        const newX = Math.max(-maxX, Math.min(maxX, laPosRef.current.x + fleeX));
        const newY = Math.max(-maxY, Math.min(maxY, laPosRef.current.y + fleeY));

        laPosRef.current = { x: newX, y: newY };
        setLaPos({ x: newX, y: newY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const btn = laButtonRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const btnCx = rect.left + rect.width / 2;
      const btnCy = rect.top + rect.height / 2;

      const dx = touch.clientX - btnCx;
      const dy = touch.clientY - btnCy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const FLEE_RADIUS = 180;
      if (dist < FLEE_RADIUS) {
        const fleeStrength = ((FLEE_RADIUS - dist) / FLEE_RADIUS) * 180;
        const angle = Math.atan2(dy, dx);
        const fleeX = -Math.cos(angle) * fleeStrength;
        const fleeY = -Math.sin(angle) * fleeStrength;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const maxX = vw / 2 - rect.width / 2 - 16;
        const maxY = vh / 2 - rect.height / 2 - 16;

        const newX = Math.max(-maxX, Math.min(maxX, laPosRef.current.x + fleeX));
        const newY = Math.max(-maxY, Math.min(maxY, laPosRef.current.y + fleeY));

        laPosRef.current = { x: newX, y: newY };
        setLaPos({ x: newX, y: newY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [celebrated]);

  const handleAhClick = () => {
    setCelebrated(true);
    setTimeout(() => burst(window.innerWidth / 2, window.innerHeight / 2), 100);
    setTimeout(() => burst(window.innerWidth * 0.25, window.innerHeight * 0.4), 350);
    setTimeout(() => burst(window.innerWidth * 0.75, window.innerHeight * 0.35), 600);
    setTimeout(() => burst(window.innerWidth * 0.5, window.innerHeight * 0.65), 900);
    setTimeout(() => burst(window.innerWidth * 0.15, window.innerHeight * 0.6), 1200);
    setTimeout(() => burst(window.innerWidth * 0.85, window.innerHeight * 0.55), 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 40%, #e1bee7 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "fixed",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: p.color,
            opacity: p.life,
            pointerEvents: "none",
            zIndex: 99,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}

      {!celebrated ? (
        <>
          <div
            style={{
              textAlign: "center",
              marginBottom: "24px",
              animation: "fadeInDown 0.8s ease",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(1.8rem, 5.5vw, 3.2rem)",
                fontWeight: "bold",
                color: "#ad1457",
                textShadow: "0 2px 8px rgba(173,20,87,0.2)",
                letterSpacing: "0.04em",
              }}
            >
              ana assiff akbidaa 💕
            </h1>
          </div>

          <div
            style={{
              width: "260px",
              height: "260px",
              borderRadius: "50%",
              border: "6px solid #f48fb1",
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(244, 143, 177, 0.55)",
              marginBottom: "24px",
              flexShrink: 0,
            }}
          >
            <img
              src={photoMain}
              alt="akbida"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
              }}
            />
          </div>

          <p
            style={{
              fontSize: "clamp(1.3rem, 4vw, 2rem)",
              color: "#6a1b9a",
              fontStyle: "italic",
              marginBottom: "44px",
              textAlign: "center",
              fontWeight: "600",
              textShadow: "0 1px 4px rgba(106,27,154,0.15)",
              animation: "fadeIn 1.2s ease",
            }}
          >
            Lahysameh akbida 🌸
          </p>

          <div
            style={{
              display: "flex",
              gap: "32px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <button
              onClick={handleAhClick}
              style={{
                padding: "18px 52px",
                fontSize: "1.8rem",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #e91e63, #ad1457)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(233,30,99,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s",
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 10px 30px rgba(233,30,99,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(233,30,99,0.4)";
              }}
            >
              Ah 💖
            </button>

            <button
              ref={laButtonRef}
              onClick={(e) => e.preventDefault()}
              style={{
                padding: "18px 52px",
                fontSize: "1.8rem",
                fontWeight: "bold",
                background: "linear-gradient(135deg, #bdbdbd, #757575)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "not-allowed",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                transition: "transform 0.25s cubic-bezier(.68,-0.55,.27,1.55)",
                transform: `translate(${laPos.x}px, ${laPos.y}px)`,
                userSelect: "none",
                WebkitUserSelect: "none",
                zIndex: 10,
              }}
            >
              La 🙈
            </button>
          </div>

          <p
            style={{
              marginTop: "28px",
              fontSize: "0.95rem",
              color: "#c2185b",
              opacity: 0.75,
              fontStyle: "italic",
            }}
          >
            (hint: khtaari akbidaaa 🥺)
          </p>
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            zIndex: 60,
            position: "relative",
            animation: "popIn 0.5s cubic-bezier(.68,-0.55,.27,1.55)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            pointerEvents: "none",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(1.6rem, 5.5vw, 2.8rem)",
              fontWeight: "bold",
              color: "#ad1457",
              textShadow: "0 2px 12px rgba(173,20,87,0.3)",
              letterSpacing: "0.04em",
            }}
          >
            NBGHIKKK RBKKK AKBIDAAA 🎆
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <img
              src="https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif"
              alt="fireworks"
              style={{
                width: "clamp(140px, 30vw, 220px)",
                height: "clamp(140px, 30vw, 220px)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(233,30,99,0.35)",
                objectFit: "cover",
                border: "4px solid #f48fb1",
              }}
            />

            <div
              style={{
                width: "clamp(140px, 30vw, 220px)",
                height: "clamp(140px, 30vw, 220px)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(233,30,99,0.35)",
                border: "4px solid #f48fb1",
                flexShrink: 0,
              }}
            >
              <img
                src={photo1}
                alt="akbida smiling"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            </div>
          </div>

          <p
            style={{
              fontSize: "clamp(2rem, 8vw, 3.5rem)",
              letterSpacing: "0.1em",
            }}
          >
            😘💋😘💋😘💋😘💋😘
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.3); }
          70% { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
