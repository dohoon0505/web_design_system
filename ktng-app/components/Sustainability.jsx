export default function Sustainability() {
  return (
    <section className="sus">
      <h2 className="sus__h">Sustainability for Growth</h2>
      <div className="sus__leaves">
        <div className="sus__leaf sus__leaf--1" />
        <div className="sus__leaf sus__leaf--2" />
        <div className="sus__leaf sus__leaf--3" />
        <div className="sus__leaf sus__leaf--4" />
      </div>
      <style jsx>{`
        .sus { position: relative; height: 855px; background: #fff; overflow: hidden; padding: 0 89px; display: flex; align-items: center; }
        .sus__h { font-size: 84px; font-weight: 600; color: #000; letter-spacing: -0.025em; line-height: 1.15; position: relative; z-index: 2; max-width: 60%; margin: 0; }
        .sus__leaves { position: absolute; top: 50%; right: 12%; transform: translateY(-50%); width: 560px; height: 560px; pointer-events: none; z-index: 1; }
        .sus__leaf { position: absolute; width: 140px; height: 320px; border-radius: 70px; transform-origin: bottom center; animation: sus-sway 6s ease-in-out infinite; }
        @keyframes sus-sway { 0%, 100% { transform: rotate(var(--rot, 0deg)); } 50% { transform: rotate(calc(var(--rot, 0deg) + 4deg)); } }
        .sus__leaf--1 { --rot: 15deg;  top: 0;    left: 120px; background: var(--c-leaf-1); opacity: 0.85; animation-delay: 0s; }
        .sus__leaf--2 { --rot: -10deg; top: 30px; left: 220px; background: var(--c-leaf-2); opacity: 0.9;  animation-delay: 1.5s; }
        .sus__leaf--3 { --rot: 20deg;  top: 60px; left: 320px; background: var(--c-leaf-3); opacity: 0.95; animation-delay: 3s; }
        .sus__leaf--4 { --rot: -5deg;  top: 90px; left: 400px; background: var(--c-leaf-4); opacity: 0.85; animation-delay: 4.5s; }
        @media (max-width: 1024px) {
          .sus__h { font-size: 48px; max-width: 100%; }
          .sus__leaves { width: 360px; height: 360px; right: 5%; opacity: 0.7; }
          .sus__leaf { width: 88px; height: 200px; border-radius: 44px; }
        }
      `}</style>
    </section>
  );
}
