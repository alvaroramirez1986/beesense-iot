import React from 'react';

/**
 * Pie de Página Institucional requerido en documento:
 * "NOTA: El sitio debe tener un pie de pagina con los colores correspondientes que diga 'BeeSense 2026.'"
 */
export default function Footer() {
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
        <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
          Monitoreo Apícola IoT en Tiempo Real • AWS IoT Core &amp; Amazon DynamoDB
        </p>
      </div>
    </footer>
  );
}
