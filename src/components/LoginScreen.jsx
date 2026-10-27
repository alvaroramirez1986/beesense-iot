import React, { useState } from 'react';

/**
 * Componente SVG de Abeja Animada con aleteo en tiempo real y halo de alto contraste
 * Exportado para reutilizarse también en la vista de Error 404.
 */
export function AnimatedBee({ className = '', size = 38, flip = false }) {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <div
        className="bee-hover-float relative"
        style={{
          width: size,
          height: size,
          transform: flip ? 'scaleX(-1)' : undefined,
        }}
      >
        <svg
          viewBox="0 0 64 64"
          width={size}
          height={size}
          className="drop-shadow-[0_4px_10px_rgba(255,251,235,0.65)]"
        >
          <circle cx="33" cy="32" r="22" fill="rgba(254, 243, 199, 0.22)" />
          <g className="bee-wing">
            <ellipse
              cx="26"
              cy="18"
              rx="10"
              ry="14"
              fill="rgba(255, 255, 255, 0.92)"
              stroke="#94a3b8"
              strokeWidth="1.6"
              transform="rotate(-22 26 18)"
            />
            <ellipse
              cx="38"
              cy="18"
              rx="10"
              ry="14"
              fill="rgba(255, 255, 255, 0.88)"
              stroke="#94a3b8"
              strokeWidth="1.6"
              transform="rotate(22 38 18)"
            />
          </g>
          <polygon points="9,34 18,30 18,38" fill="#0f172a" />
          <ellipse
            cx="33"
            cy="34"
            rx="17"
            ry="12"
            fill="#fbbf24"
            stroke="#0f172a"
            strokeWidth="2.6"
          />
          <path d="M26 23 C25 34, 25 34, 26 45" stroke="#0f172a" strokeWidth="4.6" strokeLinecap="round" />
          <path d="M35 22 C34 34, 34 34, 35 46" stroke="#0f172a" strokeWidth="4.6" strokeLinecap="round" />
          <path d="M43 25 C42 34, 42 34, 43 43" stroke="#0f172a" strokeWidth="3.8" strokeLinecap="round" />
          <circle cx="45" cy="31" r="2.2" fill="#ffffff" />
          <path d="M47 26 Q52 19 56 21" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M49 28 Q55 24 58 27" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Enjambre de 12 Abejas Animadas de Alta Visibilidad (para Login y Vista 404 en Escritorio y Mobile)
 */
export function BeeSwarmOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      <div className="bee-flight-1 absolute left-0 top-0">
        <AnimatedBee size={38} />
      </div>
      <div className="bee-flight-2 absolute left-0 top-0" style={{ animationDelay: '-4s' }}>
        <AnimatedBee size={34} />
      </div>
      <div className="bee-flight-3 absolute left-0 top-0" style={{ animationDelay: '-2s' }}>
        <AnimatedBee size={36} />
      </div>
      <div className="bee-flight-4 absolute left-0 top-0" style={{ animationDelay: '-7s' }}>
        <AnimatedBee size={32} />
      </div>
      <div className="bee-flight-5 absolute left-0 top-0" style={{ animationDelay: '-5s' }}>
        <AnimatedBee size={35} />
      </div>
      <div className="bee-flight-6 absolute left-0 top-0" style={{ animationDelay: '-9s' }}>
        <AnimatedBee size={30} />
      </div>
      <div className="bee-flight-7 absolute left-0 top-0" style={{ animationDelay: '-11s' }}>
        <AnimatedBee size={34} />
      </div>
      <div className="bee-flight-8 absolute left-0 top-0" style={{ animationDelay: '-3s' }}>
        <AnimatedBee size={29} />
      </div>

      <div className="bee-orbit absolute left-[7%] top-[14%]">
        <AnimatedBee size={34} />
      </div>
      <div className="bee-orbit absolute right-[8%] top-[18%]" style={{ animationDelay: '-2.5s' }}>
        <AnimatedBee size={32} flip />
      </div>
      <div className="bee-orbit absolute left-[9%] bottom-[16%]" style={{ animationDelay: '-4s' }}>
        <AnimatedBee size={31} />
      </div>
      <div className="bee-orbit absolute right-[7%] bottom-[20%]" style={{ animationDelay: '-1.5s' }}>
        <AnimatedBee size={36} flip />
      </div>
    </div>
  );
}

/**
 * Pantalla de Acceso (Login - Figura 1)
 * - Sin texto descriptivo secundario bajo el logo
 * - Pantalla de carga (Loader) mostrando exclusivamente el mensaje "Iniciando BeeSense IoT"
 */
export default function LoginScreen({ onLoginSuccess, onOpen404Preview }) {
  const [isLoading, setIsLoading] = useState(false);
  const [progressWidth, setProgressWidth] = useState(20);

  const handleGoogleLogin = () => {
    if (isLoading) return;
    setIsLoading(true);
    setProgressWidth(25);

    setTimeout(() => setProgressWidth(55), 500);
    setTimeout(() => setProgressWidth(85), 1100);
    setTimeout(() => setProgressWidth(100), 1650);
    setTimeout(() => {
      onLoginSuccess();
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden honeycomb-animated-bg flex flex-col justify-between items-center px-4 py-5 sm:py-6">
      {/* Celdas de panal animadas que pulsan en el fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg className="absolute -left-10 top-12 w-60 sm:w-72 h-60 sm:h-72 opacity-30 animate-honey-pulse" viewBox="0 0 200 200">
          <polygon points="100,15 170,55 170,135 100,175 30,135 30,55" fill="none" stroke="#fde68a" strokeWidth="2.5" />
          <polygon points="100,40 150,68 150,122 100,150 50,122 50,68" fill="rgba(253, 230, 138, 0.14)" stroke="#fef3c7" strokeWidth="1.5" />
        </svg>
        <svg className="absolute right-4 sm:right-8 bottom-16 w-64 sm:w-80 h-64 sm:h-80 opacity-25 animate-honey-pulse" style={{ animationDelay: '2.5s' }} viewBox="0 0 200 200">
          <polygon points="100,15 170,55 170,135 100,175 30,135 30,55" fill="none" stroke="#fef08a" strokeWidth="2" />
        </svg>
        <div className="absolute left-[16%] top-[38%] w-3 h-5 rounded-full bg-amber-100/90 blur-[1px] shadow-[0_0_18px_6px_rgba(254,243,199,0.85)] animate-ping" style={{ animationDuration: '3.8s' }} />
        <div className="absolute right-[21%] top-[24%] w-2.5 h-4 rounded-full bg-amber-100/80 blur-[1px] shadow-[0_0_16px_5px_rgba(254,243,199,0.75)] animate-ping" style={{ animationDuration: '4.5s' }} />
      </div>

      {/* Enjambre de 12 Abejas Volando en Mobile y Escritorio */}
      <BeeSwarmOverlay />

      <div className="h-2 sm:h-4" />

      {/* Cuadro Central Blanco con proporciones optimizadas en Mobile y Escritorio */}
      <main className="relative z-20 w-[85vw] max-w-[320px] sm:w-full sm:max-w-[440px] bg-white/95 backdrop-blur-md rounded-[24px] sm:rounded-[28px] shadow-[0_25px_60px_-15px_rgba(69,42,6,0.55)] border border-amber-100/80 px-5 py-7 sm:px-10 sm:py-11 flex flex-col items-center text-center transition-all duration-300">
        {!isLoading ? (
          <>
            {/* Contenedor con resplandor cálido detrás del Logo de Inicio (Hoja 2) */}
            <div className="relative flex items-center justify-center mb-6 sm:mb-8">
              <div className="absolute w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-amber-300/30 blur-2xl pointer-events-none" />
              <img
                src="./assets/logo-login.png"
                alt="BeeSense - Monitoreo Apícola IoT"
                className="relative w-36 sm:w-52 h-auto object-contain select-none drop-shadow-sm transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>

            {/* Contenedor dimensionado para el botón de inicio de sesión con Google en Mobile y Escritorio */}
            <div className="w-full max-w-[250px] sm:max-w-[320px] bg-slate-50/80 p-1.5 sm:p-2 rounded-2xl border border-slate-200/70 shadow-inner">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="group w-full flex items-center justify-center gap-2.5 sm:gap-3.5 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] text-[#122B52] font-bold text-xs sm:text-base border border-slate-200/90 shadow-[0_4px_14px_rgba(18,43,82,0.08)] hover:shadow-[0_8px_20px_rgba(18,43,82,0.14)] hover:border-amber-400/70 transition-all duration-200"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.86c2.26-2.09 3.56-5.17 3.56-8.8z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.98c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.31c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31V6.6H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.4l3.98-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l3.98 3.09c.95-2.85 3.6-4.94 6.73-4.94z"
                  />
                </svg>
                <span>Acceder con Google</span>
              </button>
            </div>
          </>
        ) : (
          /* Pantalla de Carga (Loader): Muestra únicamente el texto "Iniciando BeeSense IoT" */
          <div className="py-5 sm:py-7 px-2 w-full flex flex-col items-center justify-center space-y-5 animate-fadeIn">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-100 border-t-amber-500 border-r-teal-500 animate-spin" />
              <img
                src="./assets/logo-login.png"
                alt="Cargando BeeSense"
                className="absolute w-12 h-12 sm:w-14 sm:h-14 object-contain"
              />
            </div>

            <h2 className="text-base sm:text-xl font-extrabold text-[#122B52]">
              Iniciando BeeSense IoT
            </h2>

            <div className="w-full max-w-[220px] sm:max-w-xs bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Pie de página institucional en Login */}
      <footer className="relative z-20 mt-4 flex flex-col sm:flex-row items-center gap-2 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#122B52]/85 backdrop-blur-sm text-amber-300 text-xs font-bold tracking-wide shadow-md border border-amber-300/30">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>BeeSense 2026.</span>
        </div>

        {onOpen404Preview && (
          <button
            type="button"
            onClick={onOpen404Preview}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold backdrop-blur-xs transition"
          >
            Ver Página 404
          </button>
        )}
      </footer>
    </div>
  );
}
