import React, { useState } from 'react';

/**
 * Componente SVG de Abeja Animada con aleteo en tiempo real
 */
function AnimatedBee({ className = '', size = 38 }) {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <div className="bee-hover-float relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 64 64" width={size} height={size} className="drop-shadow-md">
          {/* Alas superiores con animación de aleteo */}
          <g className="bee-wing">
            <ellipse cx="26" cy="18" rx="10" ry="14" fill="rgba(255, 255, 255, 0.88)" stroke="#cbd5e1" strokeWidth="1.5" transform="rotate(-22 26 18)" />
            <ellipse cx="38" cy="18" rx="10" ry="14" fill="rgba(255, 255, 255, 0.82)" stroke="#cbd5e1" strokeWidth="1.5" transform="rotate(22 38 18)" />
          </g>
          {/* Aguijón */}
          <polygon points="10,34 18,30 18,38" fill="#0f172a" />
          {/* Cuerpo de la abeja */}
          <ellipse cx="33" cy="34" rx="17" ry="12" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
          {/* Franjas negras */}
          <path d="M26 23 C25 34, 25 34, 26 45" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M35 22 C34 34, 34 34, 35 46" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M43 25 C42 34, 42 34, 43 43" stroke="#0f172a" strokeWidth="3.8" strokeLinecap="round" />
          {/* Ojo y antenas */}
          <circle cx="45" cy="31" r="2" fill="#ffffff" />
          <path d="M47 26 Q52 19 56 21" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <path d="M49 28 Q55 24 58 27" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Pantalla de Acceso (Login - Figura 1)
 * - Fondo con patrón de panal de abejas animado y celdas hexagonales brillantes
 * - Abejas volando por la pantalla en trayectorias orgánicas
 * - Cuadro central blanco con Logo de Inicio oficial de BeeSense
 * - Botón "Acceder con Google" con pantalla de carga dinámica hacia el Dashboard
 */
export default function LoginScreen({ onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    'Verificando credenciales con Google Identity...',
    'Estableciendo sesión segura con AWS IoT Core (MQTT/TLS)...',
    'Sincronizando eventos y telemetría desde Amazon DynamoDB...',
    'Cargando Dashboard de Colmenar Principal - Sector Norte...',
  ];

  const handleGoogleLogin = () => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingStep(0);

    setTimeout(() => setLoadingStep(1), 550);
    setTimeout(() => setLoadingStep(2), 1150);
    setTimeout(() => setLoadingStep(3), 1750);
    setTimeout(() => {
      onLoginSuccess();
    }, 2350);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden honeycomb-animated-bg flex flex-col justify-between items-center px-4 py-6">
      {/* Celdas de panal animadas que pulsan en el fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg className="absolute -left-10 top-12 w-72 h-72 opacity-30 animate-honey-pulse" viewBox="0 0 200 200">
          <polygon points="100,15 170,55 170,135 100,175 30,135 30,55" fill="none" stroke="#fde68a" strokeWidth="2.5" />
          <polygon points="100,40 150,68 150,122 100,150 50,122 50,68" fill="rgba(253, 230, 138, 0.14)" stroke="#fef3c7" strokeWidth="1.5" />
        </svg>
        <svg className="absolute right-8 bottom-16 w-80 h-80 opacity-25 animate-honey-pulse" style={{ animationDelay: '2.5s' }} viewBox="0 0 200 200">
          <polygon points="100,15 170,55 170,135 100,175 30,135 30,55" fill="none" stroke="#fef08a" strokeWidth="2" />
        </svg>
        {/* Destellos de néctar/luz en el panal */}
        <div className="absolute left-[16%] top-[38%] w-3 h-5 rounded-full bg-amber-100/90 blur-[1px] shadow-[0_0_18px_6px_rgba(254,243,199,0.85)] animate-ping" style={{ animationDuration: '3.8s' }} />
        <div className="absolute right-[21%] top-[24%] w-2.5 h-4 rounded-full bg-amber-100/80 blur-[1px] shadow-[0_0_16px_5px_rgba(254,243,199,0.75)] animate-ping" style={{ animationDuration: '4.5s' }} />
        <div className="absolute left-[24%] bottom-[22%] w-24 h-24 rounded-full bg-amber-950/25 blur-2xl" />
      </div>

      {/* Abejas volando dinámicamente por la pantalla */}
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        <div className="bee-flight-1 absolute left-0 top-0">
          <AnimatedBee size={36} />
        </div>
        <div className="bee-flight-2 absolute left-0 top-0">
          <AnimatedBee size={30} />
        </div>
        <div className="bee-flight-3 absolute left-0 top-0">
          <AnimatedBee size={34} />
        </div>
        {/* Abejas flotando cerca del cuadro central como en la Figura 1 */}
        <div className="hidden sm:block absolute right-[22%] top-[46%]">
          <AnimatedBee size={34} />
        </div>
        <div className="hidden md:block absolute right-[6%] top-[61%]">
          <AnimatedBee size={26} />
        </div>
      </div>

      {/* Espaciador superior */}
      <div className="h-4" />

      {/* Cuadro Central Blanco (Figura 1 - Responsive Mobile & Escritorio) */}
      <main className="relative z-20 w-full max-w-[430px] sm:max-w-[460px] bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_25px_60px_-15px_rgba(69,42,6,0.55)] border border-amber-100/80 px-6 py-9 sm:px-10 sm:py-11 flex flex-col items-center text-center transition-all duration-300">
        {!isLoading ? (
          <>
            {/* Contenedor con resplandor cálido detrás del Logo de Inicio (Hoja 2) */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="absolute w-44 h-44 rounded-full bg-amber-300/30 blur-2xl pointer-events-none" />
              <img
                src="./assets/logo-login.png"
                alt="BeeSense - Monitoreo Apícola IoT"
                className="relative w-48 sm:w-56 h-auto object-contain select-none drop-shadow-sm transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-7 leading-relaxed">
              Plataforma de telemetría apícola en tiempo real conectada con <span className="font-semibold text-slate-700">AWS IoT Core</span>.
            </p>

            {/* Botón Principal "Acceder con Google" (Figura 1) */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group w-full max-w-[330px] flex items-center justify-center gap-3.5 px-6 py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.99] text-[#122B52] font-bold text-sm sm:text-base border border-slate-200/90 shadow-[0_6px_20px_rgba(18,43,82,0.08)] hover:shadow-[0_10px_25px_rgba(18,43,82,0.14)] hover:border-amber-400/70 transition-all duration-200"
            >
              {/* Ícono oficial de Google */}
              <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
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
          </>
        ) : (
          /* Pantalla de Carga Dinámica en la Transición al Dashboard */
          <div className="py-6 px-2 w-full flex flex-col items-center justify-center space-y-6 animate-fadeIn">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-amber-100 border-t-amber-500 border-r-teal-500 animate-spin" />
              <img
                src="./assets/logo-login.png"
                alt="Cargando BeeSense"
                className="absolute w-14 h-14 object-contain"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#122B52]">
                Iniciando BeeSense IoT
              </h2>
              <p className="text-xs sm:text-sm font-medium text-teal-700 min-h-[2.5rem] flex items-center justify-center px-2">
                {loadingMessages[loadingStep]}
              </p>
            </div>

            {/* Barra de progreso dinámica */}
            <div className="w-full max-w-xs bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>

            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Túnel TLS 8883 Activo
            </span>
          </div>
        )}
      </main>

      {/* Pie de página institucional en Login */}
      <footer className="relative z-20 mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#122B52]/85 backdrop-blur-sm text-amber-300 text-xs font-bold tracking-wide shadow-md border border-amber-300/30">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>BeeSense 2026.</span>
        </div>
      </footer>
    </div>
  );
}
