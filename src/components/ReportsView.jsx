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
} from 'lucide-react';
import { exportEventsToPDF } from '../services/pdfExportService';

/**
 * Lista desplegable de 5 ítems requerida en la especificación de la Figura 3:
 * 1. TODOS (Todas las categorías)
 * 2. TEMPERATURA
 * 3. ESTADO DE TAPADA
 * 4. ESTADO DE BATERIA
 * 5. N/A
 */
const EVENT_TYPE_OPTIONS = [
  { value: 'TODOS', label: 'TODOS LOS EVENTOS' },
  { value: 'TEMPERATURA', label: 'TEMPERATURA' },
  { value: 'ESTADO DE TAPADA', label: 'ESTADO DE TAPADA' },
  { value: 'ESTADO DE BATERIA', label: 'ESTADO DE BATERIA' },
  { value: 'N/A', label: 'N/A' },
];

export default function ReportsView({ events = [] }) {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [tipoEvento, setTipoEvento] = useState('TODOS');

  // Filtrado combinado por Rango de Fechas y por Tipo de Evento (5 ítems)
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // 1. Filtro por Tipo de Evento
      if (tipoEvento !== 'TODOS' && ev.tipoEvento !== tipoEvento) {
        return false;
      }

      // 2. Filtro por Fecha Desde (YYYY-MM-DD)
      if (fechaDesde && ev.isoDate) {
        if (ev.isoDate < fechaDesde) return false;
      }

      // 3. Filtro por Fecha Hasta (YYYY-MM-DD)
      if (fechaHasta && ev.isoDate) {
        if (ev.isoDate > fechaHasta) return false;
      }

      return true;
    });
  }, [events, fechaDesde, fechaHasta, tipoEvento]);

  const handleResetFilters = () => {
    setFechaDesde('');
    setFechaHasta('');
    setTipoEvento('TODOS');
  };

  const handleDownloadPDF = () => {
    exportEventsToPDF(filteredEvents, {
      tipoEvento,
      fechaDesde: fechaDesde || 'Inicio',
      fechaHasta: fechaHasta || 'Actualidad',
    });
  };

  const renderEventIcon = (type) => {
    switch (type) {
      case 'TEMPERATURA':
        return (
          <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <Thermometer className="w-5 h-5" />
          </div>
        );
      case 'ESTADO DE TAPADA':
        return (
          <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        );
      case 'ESTADO DE BATERIA':
        return (
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <BatteryWarning className="w-5 h-5" />
          </div>
        );
      case 'N/A':
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* ====================================================================
          ENCABEZADO AZUL MARINO CON BOTÓN "EXPORTAR A PDF" (Figura 3)
          ==================================================================== */}
      <div className="rounded-[24px] bg-[#16325B] dark:bg-[#0F2442] text-white p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-700/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Registro de Eventos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Historial de alertas y eventos críticos detectados por los sensores y almacenados en Amazon DynamoDB.
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
          BARRA DE FILTRADO POR FECHAS Y LISTA DESPLEGABLE DE 5 ÍTEMS
          ==================================================================== */}
      <div className="rounded-[22px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Etiqueta principal */}
          <div className="md:col-span-3 flex items-center gap-2.5 pb-1">
            <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="text-sm font-extrabold text-[#122B52] dark:text-white block">
                Filtrar Eventos
              </span>
              <span className="text-[11px] text-slate-400">
                Rango de fechas y tipo en DynamoDB
              </span>
            </div>
          </div>

          {/* Selector Tipo de Evento (Lista desplegable de 5 ítems) */}
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

          {/* Fecha Desde */}
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

          {/* Fecha Hasta */}
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

          {/* Botón Limpiar Filtros */}
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
      </div>

      {/* ====================================================================
          LISTADO CRONOLÓGICO DE EVENTOS (Figura 3 - Mobile & Escritorio)
          Incluye Tipo de Evento, Detalle, Fecha/Hora Inicio y Fecha/Hora Término
          ==================================================================== */}
      <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-base font-bold text-slate-600 dark:text-slate-300">
              No se encontraron eventos para los filtros seleccionados
            </p>
            <p className="text-xs text-slate-400">
              Ajuste el rango de fechas o el tipo de evento en la barra superior.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-4">
                {renderEventIcon(ev.tipoEvento)}

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#122B52] dark:text-white">
                      {ev.titulo}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 border border-slate-200/70 dark:border-slate-700">
                      {ev.tipoEvento}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {ev.detalle}
                  </p>
                </div>
              </div>

              {/* Marcas de tiempo de Inicio y Término en DynamoDB */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center gap-2 shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Inicio: {ev.fechaInicio}</span>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
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
          ))
        )}
      </div>
    </div>
  );
}
