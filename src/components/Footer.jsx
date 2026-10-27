import React from 'react';
import { Compass } from 'lucide-react';

/**
 * Pie de Página Institucional requerido en documento:
 * "NOTA: El sitio debe tener un pie de pagina con los colores correspondientes que diga 'BeeSense 2026.'"
 * (Depurado sin mención a tecnologías de nube).
 */
export default function Footer({ onOpen404 }) {
  return (
    <footer className="w-full mt-auto border-t border-amber-500/25 bg-gradient-to-r from-[#122B52] via-[#163564] to-[#122B52] text-white px-6 py-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#D4A017]" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2A9D8F]" />
          <span className="font-extrabold tracking-wide text-[#F59E0B]">
            BeeSense 2026.
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
            Monitoreo Apícola IoT en Tiempo Real
          </p>
          {onOpen404 && (
            <button
              type="button"
              onClick={onOpen404}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-300 text-[11px] font-bold border border-white/15 transition"
            >
              <Compass className="w-3 h-3" />
              <span>Vista 404</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
