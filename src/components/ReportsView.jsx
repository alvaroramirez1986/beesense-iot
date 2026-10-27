import React, { useState, useMemo } from 'react';
import {
  FileDown,
  Calendar,
  Filter,
  Thermometer,
  BatteryWarning,
  ShieldAlert,
  WifiOff,
  RotateCcw,
  Clock,
  CheckCircle2,
  Zap,
  MapPin,
  Smartphone,
} from 'lucide-react';
import { exportEventsToPDF } from '../services/pdfExportService';
import { getEventTimeHHMM } from '../services/awsApiService';

/**
 * Lista desplegable de categorías de eventos en la vista de Reportes:
 * 1. TODOS (Todas las categorías)
 * 2. TEMPERATURA
 * 3. ESTADO DE TAPADA
 * 4. ALERTA CELULAR (Alertas enviadas al celular por apertura de tapa)
 * 5. ESTADO DE BATERIA
 * 6. N/A
 */
const EVENT_TYPE_OPTIONS = [
  { value: 'TODOS', label: 'TODOS LOS EVENTOS' },
  { value: 'TEMPERATURA', label: 'TEMPERATURA' },
  { value: 'ESTADO DE TAPADA', label: 'ESTADO DE TAPADA' },
  { value: 'ALERTA CELULAR', label: 'ALERTA CELULAR (TAPA ABIERTA)' },
  { value: 'ESTADO DE BATERIA', label: 'ESTADO DE BATERIA' },
  { value: 'N/A', label: 'N/A' },
];

export default function ReportsView({ events = [] }) {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [tipoEvento, setTipoEvento] = useState('TODOS');

  // Filtro de búsqueda por Rango Horario (desactivado por defecto para optimizar el rendimiento de las consultas)
  const [rangoHorarioActivo, setRangoHorarioActivo] = useState(false);
  const [horaDesde, setHoraDesde] = useState('08:00');
  const [horaHasta, setHoraHasta] = useState('20:00');

  // Filtrado combinado: solo evalúa el rango horario cuando el usuario lo activa manualmente
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (tipoEvento !== 'TODOS' && ev.tipoEvento !== tipoEvento) {
        return false;
      }

      if (fechaDesde && ev.isoDate) {
        if (ev.isoDate < fechaDesde) return false;
      }

      if (fechaHasta && ev.isoDate) {
        if (ev.isoDate > fechaHasta) return false;
      }

      if (rangoHorarioActivo && horaDesde && horaHasta) {
        const evTime = getEventTimeHHMM(ev);
        if (horaDesde <= horaHasta) {
          if (evTime < horaDesde || evTime > horaHasta) return false;
        } else {
          if (evTime < horaDesde && evTime > horaHasta) return false;
        }
      }

      return true;
    });
  }, [events, fechaDesde, fechaHasta, tipoEvento, rangoHorarioActivo, horaDesde, horaHasta]);

  const handleResetFilters = () => {
    setFechaDesde('');
    setFechaHasta('');
    setTipoEvento('TODOS');
    setRangoHorarioActivo(false);
    setHoraDesde('08:00');
    setHoraHasta('20:00');
  };

  const handleDownloadPDF = () => {
    exportEventsToPDF(filteredEvents, {
      tipoEvento,
      fechaDesde: fechaDesde || 'Inicio',
      fechaHasta: fechaHasta || 'Actualidad',
      rangoHorarioActivo,
      horaDesde,
      horaHasta,
    });
  };

  const renderEventIcon = (type) => {
    switch (type) {
      case 'TEMPERATURA':
        return (
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <Thermometer className="w-5 h-5" />
          </div>
        );
      case 'ESTADO DE TAPADA':
        return (
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        );
      case 'ALERTA CELULAR':
        return (
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
        );
      case 'ESTADO DE BATERIA':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <BatteryWarning className="w-5 h-5" />
          </div>
        );
      case 'N/A':
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* ====================================================================
          ENCABEZADO AZUL MARINO CON BOTÓN "Exportar a PDF" (Figura 3)
          ==================================================================== */}
      <div className="rounded-[24px] bg-[#16325B] dark:bg-[#0F2442] text-white p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-700/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Registro de Eventos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Historial de alertas y eventos críticos detectados por los sensores
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.99] text-white font-bold text-xs sm:text-sm border border-white/25 shadow-sm transition-all shrink-0"
        >
          <FileDown className="w-4 h-4 text-amber-300" />
          <span>Exportar a PDF</span>
        </button>
      </div>

      {/* ====================================================================
          BARRA DE FILTRADO POR FECHAS, TIPO DE EVENTO Y RANGO HORARIO MANUAL
          ==================================================================== */}
      <div className="rounded-[22px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3 flex items-center gap-2.5 pb-2">
            <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-sm font-extrabold text-[#122B52] dark:text-white block">
              Filtrar Eventos
            </span>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Tipo de Evento
            </label>
            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={tipoEvento}
                onChange={(e) => setTipoEvento(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {EVENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        {/* Filtro Opcional por Rango Horario (Activación manual) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={rangoHorarioActivo}
              onClick={() => setRangoHorarioActivo((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                rangoHorarioActivo ? 'bg-[#2A9D8F]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  rangoHorarioActivo ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-[#122B52] dark:text-white">
                  Filtrar por Rango Horario
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/70">
                  <Zap className="w-3 h-3" />
                  <span>Activación manual</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {rangoHorarioActivo
                  ? 'Filtro horario activo: acotando registros dentro de la franja horaria seleccionada.'
                  : 'Actívelo manualmente cuando requiera acotar la búsqueda por franja horaria.'}
              </p>
            </div>
          </div>

          {rangoHorarioActivo && (
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2A9D8F]" />
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Hora Desde:
                </label>
                <input
                  type="time"
                  value={horaDesde}
                  onChange={(e) => setHoraDesde(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Hora Hasta:
                </label>
                <input
                  type="time"
                  value={horaHasta}
                  onChange={(e) => setHoraHasta(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          GRILLA DE DATOS DE EVENTOS (CON COLUMNA "NOMBRE DE COLMENAR")
          Adaptada para Escritorio (Tabla/Grilla estructurada) y Mobile
          ==================================================================== */}
      <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-base font-bold text-slate-600 dark:text-slate-300">
              No se encontraron eventos para los filtros seleccionados
            </p>
            <p className="text-xs text-slate-400">
              Ajuste el rango de fechas, el tipo de evento o la franja horaria en la barra superior.
            </p>
          </div>
        ) : (
          <>
            {/* Cabecera de Columnas de la Grilla (Visible en Escritorio) */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <div className="col-span-3">Nombre de Colmenar</div>
              <div className="col-span-4">Evento y Detalle</div>
              <div className="col-span-2">Categoría</div>
              <div className="col-span-3 text-right">Inicio / Término</div>
            </div>

            {/* Filas de la Grilla de Datos */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEvents.map((ev) => {
                const colmenarName = ev.nombreColmenar || 'Colmenar Principal - Sede PAO';
                return (
                  <div
                    key={ev.id}
                    className="p-4 sm:px-6 sm:py-5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 items-start lg:items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Columna 1: Nombre de Colmenar */}
                    <div className="lg:col-span-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="lg:hidden text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Nombre de Colmenar
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-[#122B52] dark:text-amber-300">
                          {colmenarName}
                        </span>
                      </div>
                    </div>

                    {/* Columna 2: Evento y Descripción Detallada */}
                    <div className="lg:col-span-4 flex items-start sm:items-center gap-3.5">
                      {renderEventIcon(ev.tipoEvento)}
                      <div className="space-y-0.5">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#122B52] dark:text-white">
                          {ev.titulo}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                          {ev.detalle}
                        </p>
                      </div>
                    </div>

                    {/* Columna 3: Categoría */}
                    <div className="lg:col-span-2 flex items-center">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 border border-slate-200/70 dark:border-slate-700">
                        {ev.tipoEvento}
                      </span>
                    </div>

                    {/* Columna 4: Marcas de tiempo Inicio / Término */}
                    <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-1.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Inicio: {ev.fechaInicio}</span>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          ev.fechaTermino && ev.fechaTermino !== 'En curso (Activa)'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                            : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-800/60 animate-pulse'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Término: {ev.fechaTermino || 'En curso (Activa)'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
