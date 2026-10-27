import React from 'react';
import { Home, Compass, ArrowLeft } from 'lucide-react';
import { BeeSwarmOverlay, AnimatedBee } from './LoginScreen';

/**
 * Vista de Error 404 Responsiva (Escritorio y Mobile)
 * - Mantiene la animación del panal y el enjambre de abejas volando en el fondo
 * - Soporta Modo Claro y Modo Oscuro (con el logo en líneas y tipografía blancas)
 * - Incluye mensaje alusivo al ecosistema apícola y retorno directo a la plataforma
 */
export default function NotFound404View({
  darkMode = false,
  isAuthenticated = false,
  onReturnHome,
}) {
  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden flex flex-col justify-between items-center px-4 py-6 ${
        darkMode
          ? 'bg-gradient-to-br from-slate-950 via-[#0B1C38] to-slate-900'
          : 'honeycomb-animated-bg'
      }`}
    >
      {/* Enjambre de 12 Abejas Volando en Fondo (Desktop y Mobile) */}
      <BeeSwarmOverlay />

      {/* Celdas hexagonales decorativas de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute -left-12 top-10 w-64 sm:w-80 h-64 sm:h-80 opacity-25 animate-honey-pulse"
          viewBox="0 0 200 200"
        >
          <polygon
            points="100,15 170,55 170,135 100,175 30,135 30,55"
            fill="none"
            stroke="#fde68a"
            strokeWidth="2.5"
          />
        </svg>
        <svg
          className="absolute -right-10 bottom-12 w-64 sm:w-80 h-64 sm:h-80 opacity-20 animate-honey-pulse"
          style={{ animationDelay: '2s' }}
          viewBox="0 0 200 200"
        >
          <polygon
            points="100,15 170,55 170,135 100,175 30,135 30,55"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="h-2" />

      {/* Tarjeta Central Responsiva de Error 404 */}
      <main className="relative z-20 w-[88vw] max-w-[350px] sm:max-w-[520px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[26px] sm:rounded-[32px] shadow-[0_25px_65px_-15px_rgba(15,23,42,0.55)] border border-amber-200/80 dark:border-slate-700/80 px-6 py-8 sm:px-12 sm:py-11 flex flex-col items-center text-center">
        {/* Logo de BeeSense (cambia a líneas y tipografía blancas en Modo Oscuro) */}
        <img
          src={darkMode ? './assets/logo-desktop-dark.png' : './assets/logo-desktop.png'}
          alt="BeeSense IoT"
          className="h-11 sm:h-14 w-auto object-contain mb-5 select-none"
        />

        {/* Etiqueta Superior de Estado 404 */}
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-4 border border-amber-300/60 dark:border-amber-500/30">
          <Compass className="w-3.5 h-3.5" />
          <span>Error 404 • Fuera del Colmenar</span>
        </span>

        {/* Número 404 estilizado con Celda de Panal y Abeja Exploradora */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 my-2 select-none">
          <span className="text-6xl sm:text-8xl font-black tracking-tighter text-[#122B52] dark:text-white drop-shadow-xs">
            4
          </span>

          <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,6 92,28 92,72 50,94 8,72 8,28"
                fill="rgba(245, 158, 11, 0.18)"
                stroke="#D4A017"
                strokeWidth="5"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatedBee size={42} />
            </div>
          </div>

          <span className="text-6xl sm:text-8xl font-black tracking-tighter text-[#2A9D8F] dark:text-teal-400 drop-shadow-xs">
            4
          </span>
        </div>

        {/* Título y Mensaje Alusivo al Error */}
        <h1 className="text-lg sm:text-2xl font-extrabold text-[#122B52] dark:text-white mt-2 mb-2.5">
          ¡Zumbido perdido! Esta celda del panal no existe
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mb-7">
          Nuestras abejas exploradoras recorrieron todo el colmenar pero no lograron encontrar la ruta o página que estás buscando. Es posible que el enlace haya cambiado o que la colmena solicitada no esté registrada.
        </p>

        {/* Botón de Retorno */}
        <button
          type="button"
          onClick={onReturnHome}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#122B52] dark:bg-amber-500 hover:bg-[#1a3b6e] dark:hover:bg-amber-400 active:scale-[0.99] text-white dark:text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition-all"
        >
          {isAuthenticated ? (
            <>
              <Home className="w-4 h-4" />
              <span>Volver al Dashboard en Tiempo Real</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Pantalla de Acceso</span>
            </>
          )}
        </button>
      </main>

      {/* Pie de página institucional */}
      <footer className="relative z-20 mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#122B52]/85 backdrop-blur-sm text-amber-300 text-xs font-bold tracking-wide shadow-md border border-amber-300/30">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>BeeSense 2026.</span>
        </div>
      </footer>
    </div>
  );
}
