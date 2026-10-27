import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  AlertTriangle,
  Battery,
  BatteryWarning,
  Sliders,
  Wifi,
  WifiOff,
  ShieldAlert,
  Box,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { evaluateTelemetryStatus } from '../services/awsApiService';

/**
 * Vista Principal del Dashboard (Figuras 2 y 2.1 - Escritorio y Mobile)
 * - En Escritorio (>= 768px): Muestra el Gráfico de Área panorámico (Tendencia de Temperatura).
 * - En Mobile (< 768px): Utiliza un Gráfico de Barras Horizontales Comparativas de alta
 *   legibilidad (orientado verticalmente para pantallas móviles) + vista de Columnas Táctiles,
 *   respetando los intervalos de 10 minutos y la escala de 0°C a 50°C de 5 en 5.
 */
export default function DashboardView({
  telemetry,
  chartData,
  darkMode,
  onSimulateTelemetryChange,
  forceMobileView = false,
}) {
  const [showSimulator, setShowSimulator] = useState(false);
  // Permite alternar en mobile entre Barras Horizontales Comparativas (por defecto) y Gráfico Deslizable
  const [mobileChartType, setMobileChartType] = useState('horizontal-bars'); // 'horizontal-bars' | 'swipe-columns'

  const {
    tempStatus,
    climaExteriorStatus,
    tapaStatus,
    bateriaStatus,
    anySensorDisconnected,
  } = evaluateTelemetryStatus(telemetry);

  // Ticks exactos de temperatura de 5 en 5 hasta llegar a 50 grados según especificación del documento
  const tempTicksBy5 = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

  // Formateo seguro de lecturas dinámicas o N/A en caso de desconexión del sensor
  const displayTempInt =
    tempStatus === 'NA' ? 'N/A' : `${Number(telemetry.tempInterior).toFixed(1)}°C`;

  const displayTempExt =
    climaExteriorStatus === 'NA' ? 'N/A' : `${Number(telemetry.tempExterior).toFixed(1)}°C`;

  const displayHumExt =
    climaExteriorStatus === 'NA' ? 'N/A' : `${Number(telemetry.humedadExterior).toFixed(1)}%`;

  const displayTapa =
    tapaStatus === 'NA'
      ? 'N/A'
      : String(telemetry.estadoTapa).toUpperCase() === 'ABIERTA'
      ? 'ABIERTA'
      : 'Cerrada';

  const displayBateria =
    bateriaStatus === 'NA' ? 'N/A' : `${Number(telemetry.bateria).toFixed(1)}%`;

  const batteryPercentageClamped =
    bateriaStatus === 'NA'
      ? 0
      : Math.max(0, Math.min(100, Number(telemetry.bateria)));

  // Diferencial térmico actual (Interior - Exterior) para cabecera del gráfico móvil
  const thermalDelta =
    tempStatus !== 'NA' && climaExteriorStatus !== 'NA'
      ? (Number(telemetry.tempInterior) - Number(telemetry.tempExterior)).toFixed(1)
      : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
      {/* ====================================================================
          ENCABEZADO DEL DASHBOARD E INDICADOR "SISTEMA EN LÍNEA"
          ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#122B52] dark:text-white tracking-tight">
            Monitoreo en Tiempo Real
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Colmenar Principal - Sector Norte
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botón para abrir/cerrar el simulador de telemetría IoT */}
          <button
            type="button"
            onClick={() => setShowSimulator((prev) => !prev)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 hover:bg-amber-500/25 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showSimulator ? 'Ocultar Simulador ESP32' : 'Simular Sensores ESP32 / AWS'}</span>
          </button>

          {/* Pill de Estado "Sistema En Línea" (Figura 2 y 2.1) */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                anySensorDisconnected
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
              }`}
            />
            <span
              className={`text-xs sm:text-sm font-bold ${
                anySensorDisconnected
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {anySensorDisconnected ? 'Alerta de Sensor (N/A)' : 'Sistema En Línea'}
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          CONSOLA DE PRUEBA DE TELEMETRÍA EN VIVO (OPCIONAL / DESPLEGABLE)
          ==================================================================== */}
      {showSimulator && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-amber-300/70 dark:border-amber-500/40 p-4 sm:p-5 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#122B52] dark:text-amber-400">
                Emulador de Telemetría MQTT (Nodo ESP32 → AWS IoT Core → DynamoDB)
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Cada anomalía se guarda automáticamente en DynamoDB con fecha/hora de inicio y término.
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                onSimulateTelemetryChange({
                  tempInterior: 34.2,
                  tempExterior: 25.1,
                  humedadExterior: 44.5,
                  estadoTapa: 'Cerrada',
                  bateria: 86.4,
                })
              }
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              ✓ Parámetros Normales
            </button>

            <button
              type="button"
              onClick={() => onSimulateTelemetryChange({ tempInterior: 36.8 })}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition"
            >
              🌡️ Temp. ≥ 36.1°C (Rojo)
            </button>

            <button
              type="button"
              onClick={() => onSimulateTelemetryChange({ tempInterior: 13.4 })}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-700 text-white hover:bg-rose-800 transition"
            >
              ❄️ Temp. &lt; 15°C (Parpadeo)
            </button>

            <button
              type="button"
              onClick={() => onSimulateTelemetryChange({ estadoTapa: 'ABIERTA' })}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 text-white hover:bg-orange-700 transition"
            >
              🚨 Abrir Tapa (Modal + Parpadeo)
            </button>

            <button
              type="button"
              onClick={() => onSimulateTelemetryChange({ bateria: 16.5 })}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition"
            >
              🪫 Batería &lt; 20% (Modal Crítico)
            </button>

            <button
              type="button"
              onClick={() => onSimulateTelemetryChange({ bateria: 8.2 })}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-800 text-white hover:bg-red-900 transition"
            >
              ⚡ Batería &lt; 10% (Parpadeo)
            </button>

            <button
              type="button"
              onClick={() =>
                onSimulateTelemetryChange({
                  tempInterior: null,
                  estadoTapa: 'N/A',
                })
              }
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-white hover:bg-slate-800 transition"
            >
              🔌 Desconectar Sensor (N/A)
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          GRILLA DE 4 TARJETAS DE TELEMETRÍA EN TIEMPO REAL (Figuras 2 y 2.1)
          ==================================================================== */}
      <div
        className={`grid ${
          forceMobileView
            ? 'grid-cols-1'
            : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
        } gap-5`}
      >
        {/* TARJETA 1: TEMPERATURA INTERIOR */}
        <div
          className={`relative rounded-[22px] p-6 transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.07)] border ${
            tempStatus === 'LOW_BLINK_ALERT'
              ? 'bg-[#FFF1F1] dark:bg-red-950/60 border-red-400 border-l-[6px] border-l-red-600 critical-blink-alert'
              : tempStatus === 'HIGH_ALERT'
              ? 'bg-[#FFF1F1] dark:bg-red-950/45 border-red-200 dark:border-red-800/80 border-l-[6px] border-l-red-500'
              : tempStatus === 'NA'
              ? 'bg-slate-100/90 dark:bg-slate-900 border-slate-300 dark:border-slate-700 border-l-[6px] border-l-slate-400'
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 border-l-[6px] border-l-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                tempStatus === 'HIGH_ALERT' || tempStatus === 'LOW_BLINK_ALERT'
                  ? 'bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300'
                  : tempStatus === 'NA'
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}
            >
              {tempStatus === 'NA' ? (
                <WifiOff className="w-6 h-6" />
              ) : (
                <Thermometer className="w-6 h-6" />
              )}
            </div>

            {(tempStatus === 'HIGH_ALERT' || tempStatus === 'LOW_BLINK_ALERT') && (
              <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
            )}
          </div>

          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            TEMP. INTERIOR
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                tempStatus === 'HIGH_ALERT' || tempStatus === 'LOW_BLINK_ALERT'
                  ? 'text-red-600 dark:text-red-400'
                  : tempStatus === 'NA'
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-[#122B52] dark:text-white'
              }`}
            >
              {displayTempInt}
            </span>
            {tempStatus === 'LOW_BLINK_ALERT' && (
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-600 text-white">
                BAJA CRÍTICA
              </span>
            )}
          </div>
        </div>

        {/* TARJETA 2: CLIMA EXTERIOR */}
        <div
          className={`relative rounded-[22px] p-6 transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.07)] border ${
            climaExteriorStatus === 'NA'
              ? 'bg-slate-100/90 dark:bg-slate-900 border-slate-300 dark:border-slate-700 border-l-[6px] border-l-slate-400'
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 border-l-[6px] border-l-[#2A9D8F]'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Thermometer className="w-6 h-6" />
            </div>
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#2A9D8F] dark:text-teal-400 flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
          </div>

          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            CLIMA EXTERIOR
          </p>

          {climaExteriorStatus === 'NA' ? (
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-400 dark:text-slate-500">
              N/A
            </span>
          ) : (
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#122B52] dark:text-white">
                {displayTempExt}
              </span>
              <span className="text-slate-300 dark:text-slate-700 text-2xl font-light">|</span>
              <span className="text-xl sm:text-2xl font-bold text-[#2A9D8F] dark:text-teal-400">
                {displayHumExt}
              </span>
            </div>
          )}
        </div>

        {/* TARJETA 3: ESTADO TAPA */}
        <div
          className={`relative rounded-[22px] p-6 transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.07)] border ${
            tapaStatus === 'OPEN_BLINK_ALERT'
              ? 'bg-[#FFF5EB] dark:bg-orange-950/55 border-orange-300 dark:border-orange-800 border-l-[6px] border-l-orange-500 critical-blink-alert'
              : tapaStatus === 'NA'
              ? 'bg-slate-100/90 dark:bg-slate-900 border-slate-300 dark:border-slate-700 border-l-[6px] border-l-slate-400'
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 border-l-[6px] border-l-[#122B52] dark:border-l-amber-500'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                tapaStatus === 'OPEN_BLINK_ALERT'
                  ? 'bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-300'
                  : tapaStatus === 'NA'
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-[#122B52] dark:text-slate-200'
              }`}
            >
              {tapaStatus === 'OPEN_BLINK_ALERT' ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <Box className="w-6 h-6" />
              )}
            </div>

            {tapaStatus === 'OPEN_BLINK_ALERT' && (
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-orange-600 text-white shadow-xs">
                ALERTA
              </span>
            )}
          </div>

          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            ESTADO TAPA
          </p>
          <span
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              tapaStatus === 'OPEN_BLINK_ALERT'
                ? 'text-orange-600 dark:text-orange-400'
                : tapaStatus === 'NA'
                ? 'text-slate-400 dark:text-slate-500'
                : 'text-[#122B52] dark:text-white'
            }`}
          >
            {displayTapa}
          </span>
        </div>

        {/* TARJETA 4: BATERÍA */}
        <div
          className={`relative rounded-[22px] p-6 transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.07)] border ${
            bateriaStatus === 'CRITICAL_BLINK_10'
              ? 'bg-[#FFF1F1] dark:bg-red-950/60 border-red-400 border-l-[6px] border-l-red-600 critical-blink-alert'
              : bateriaStatus === 'LOW_ALERT_20'
              ? 'bg-[#FFF1F1] dark:bg-red-950/45 border-red-200 dark:border-red-800 border-l-[6px] border-l-red-500'
              : bateriaStatus === 'NA'
              ? 'bg-slate-100/90 dark:bg-slate-900 border-slate-300 dark:border-slate-700 border-l-[6px] border-l-slate-400'
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 border-l-[6px] border-l-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                bateriaStatus === 'CRITICAL_BLINK_10' || bateriaStatus === 'LOW_ALERT_20'
                  ? 'bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300'
                  : bateriaStatus === 'NA'
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {bateriaStatus === 'CRITICAL_BLINK_10' || bateriaStatus === 'LOW_ALERT_20' ? (
                <BatteryWarning className="w-6 h-6" />
              ) : (
                <Battery className="w-6 h-6" />
              )}
            </div>
          </div>

          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            BATERÍA
          </p>

          <div className="flex items-center gap-3.5">
            <span
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                bateriaStatus === 'CRITICAL_BLINK_10' || bateriaStatus === 'LOW_ALERT_20'
                  ? 'text-red-600 dark:text-red-400'
                  : bateriaStatus === 'NA'
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-[#122B52] dark:text-white'
              }`}
            >
              {displayBateria}
            </span>

            {bateriaStatus !== 'NA' && (
              <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    bateriaStatus === 'CRITICAL_BLINK_10' || bateriaStatus === 'LOW_ALERT_20'
                      ? 'bg-red-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${batteryPercentageClamped}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================
          SECCIÓN DE GRÁFICO ADAPTATIVO (ESCRITORIO vs MOBILE)
          ==================================================================== */}
      <section className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 sm:p-8 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#122B52] dark:text-white">
              Tendencia de Temperatura
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Intervalos cada 10 minutos • Escala de 0°C a 50°C (de 5 en 5)
            </p>
          </div>

          {/* Leyenda de series Interior y Exterior */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-3.5 h-3.5 rounded-full bg-[#D99B26]" />
                <span>Interior</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-3.5 h-3.5 rounded-full bg-[#2A9D8F]" />
                <span>Exterior</span>
              </div>
            </div>

            {/* Selector de tipo de gráfico exclusivo para versión Mobile */}
            <div className={`${forceMobileView ? 'flex' : 'flex md:hidden'} items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl`}>
              <button
                type="button"
                onClick={() => setMobileChartType('horizontal-bars')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition ${
                  mobileChartType === 'horizontal-bars'
                    ? 'bg-[#122B52] dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Barras Mobile</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileChartType('swipe-columns')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition ${
                  mobileChartType === 'swipe-columns'
                    ? 'bg-[#122B52] dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Gráfico Recharts</span>
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            1. VISTA MÓVIL (< 768px): GRÁFICO DE BARRAS HORIZONTALES COMPARATIVAS
               Diseñado específicamente para pantallas verticales de teléfonos:
               - Eje Vertical: Intervalos de 10 en 10 minutos con tipografía grande.
               - Eje Horizontal: Escala térmica de 0°C a 50°C graduada de 5 en 5.
            ------------------------------------------------------------------ */}
        <div className={`${forceMobileView ? 'block' : 'block md:hidden'} space-y-5`}>
          {/* Resumen Superior de Diferencial Térmico para Lectura Rápida en Terreno */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 text-center">
            <div>
              <span className="block text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400">
                Cámara Cría
              </span>
              <span className="text-base font-extrabold text-[#122B52] dark:text-white">
                {displayTempInt}
              </span>
            </div>
            <div className="border-x border-slate-200 dark:border-slate-700 px-1">
              <span className="block text-[10px] font-extrabold uppercase text-teal-600 dark:text-teal-400">
                Exterior
              </span>
              <span className="text-base font-extrabold text-[#122B52] dark:text-white">
                {displayTempExt}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-extrabold uppercase text-slate-400">
                Diferencial Δ
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {thermalDelta !== null ? `${thermalDelta > 0 ? '+' : ''}${thermalDelta}°C` : 'N/A'}
              </span>
            </div>
          </div>

          {mobileChartType === 'horizontal-bars' ? (
            <div className="space-y-3">
              {/* Regla Superior de Escala de Temperatura (de 5 en 5 hasta 50°C) */}
              <div className="pl-14 pr-2">
                <div className="flex justify-between text-[10px] font-extrabold text-slate-400 dark:text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-800">
                  {tempTicksBy5.map((tick) => (
                    <span key={tick} className={tick % 10 === 0 ? 'block' : 'hidden xs:block'}>
                      {tick}°
                    </span>
                  ))}
                </div>
              </div>

              {/* Filas Comparativas por cada intervalo de 10 minutos (orden cronológico reciente arriba) */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {[...chartData].reverse().map((row, idx) => {
                  const intPct = Math.min(100, Math.max(0, (row.interior / 50) * 100));
                  const extPct = Math.min(100, Math.max(0, (row.exterior / 50) * 100));
                  const isRowCritical = row.interior >= 36.1 || row.interior < 15.0;

                  return (
                    <div
                      key={row.time + idx}
                      className={`p-3 rounded-2xl border transition-all ${
                        idx === 0
                          ? 'bg-amber-50/40 dark:bg-slate-800/90 border-amber-300/70 dark:border-amber-500/40 shadow-xs'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Etiqueta de Hora (Intervalo de 10 minutos) */}
                        <div className="w-12 shrink-0 text-center">
                          <span className="block text-xs font-extrabold text-[#122B52] dark:text-white">
                            {row.time}
                          </span>
                          {idx === 0 && (
                            <span className="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              Actual
                            </span>
                          )}
                        </div>

                        {/* Barras Horizontales Comparativas (Escala 0 a 50°C) */}
                        <div className="flex-1 space-y-2">
                          {/* Barra Interior */}
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-amber-700 dark:text-amber-300">Interior</span>
                              <span
                                className={`font-extrabold ${
                                  isRowCritical
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-[#122B52] dark:text-white'
                                }`}
                              >
                                {row.interior.toFixed(1)}°C
                              </span>
                            </div>
                            <div className="relative w-full h-3.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                              {/* Línea guía de umbral crítico 36.1°C (72.2% de 50°C) */}
                              <div
                                className="absolute top-0 bottom-0 w-[2px] bg-red-500/70 z-10"
                                style={{ left: '72.2%' }}
                                title="Umbral crítico 36.1°C"
                              />
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isRowCritical
                                    ? 'bg-gradient-to-r from-red-500 to-rose-600'
                                    : 'bg-gradient-to-r from-amber-500 to-[#D99B26]'
                                }`}
                                style={{ width: `${intPct}%` }}
                              />
                            </div>
                          </div>

                          {/* Barra Exterior */}
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-teal-700 dark:text-teal-300">Exterior</span>
                              <span className="font-extrabold text-[#2A9D8F] dark:text-teal-400">
                                {row.exterior.toFixed(1)}°C
                              </span>
                            </div>
                            <div className="w-full h-3 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-[#2A9D8F] transition-all duration-500"
                                style={{ width: `${extPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Modo Alternativo Mobile: Gráfico Recharts de Barras Verticales (440px de alto) */
            <div className="w-full h-[440px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[...chartData].reverse()}
                  margin={{ top: 5, right: 18, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={darkMode ? '#1e293b' : '#e2e8f0'}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 50]}
                    ticks={tempTicksBy5}
                    tickFormatter={(v) => `${v}°`}
                    tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="time"
                    width={46}
                    tick={{ fill: darkMode ? '#f8fafc' : '#122B52', fontSize: 12, fontWeight: 800 }}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      `${Number(val).toFixed(1)} °C`,
                      name === 'interior' ? 'Temp. Interior' : 'Temp. Exterior',
                    ]}
                  />
                  <ReferenceLine x={36.1} stroke="#ef4444" strokeDasharray="3 3" />
                  <Bar dataKey="interior" fill="#D99B26" radius={[0, 6, 6, 0]} barSize={12} />
                  <Bar dataKey="exterior" fill="#2A9D8F" radius={[0, 6, 6, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------
            2. VISTA DE ESCRITORIO (>= 768px): GRÁFICO DE ÁREA PANORÁMICO (Figura 2)
               - Eje X: Cada 10 minutos
               - Eje Y: De 5 en 5 hasta 50 grados
            ------------------------------------------------------------------ */}
        {!forceMobileView && (
          <div className="hidden md:block w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 16, left: -12, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gradInterior" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D99B26" stopOpacity={0.42} />
                    <stop offset="95%" stopColor="#D99B26" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradExterior" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2A9D8F" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2A9D8F" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={darkMode ? '#1e293b' : '#f1f5f9'}
                />

                {/* Eje X: Intervalos de 10 minutos */}
                <XAxis
                  dataKey="time"
                  tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: darkMode ? '#334155' : '#e2e8f0' }}
                  tickLine={false}
                  dy={8}
                />

                {/* Eje Y: De 5 en 5 hasta 50 grados */}
                <YAxis
                  domain={[0, 50]}
                  ticks={tempTicksBy5}
                  interval={0}
                  tickFormatter={(val) => `${val}°`}
                  tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: darkMode ? '#334155' : '#e2e8f0',
                    borderRadius: '14px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1)} °C`,
                    name === 'interior' ? 'Temp. Interior' : 'Temp. Exterior',
                  ]}
                  labelFormatter={(label) => `Hora (Intervalo 10 min): ${label}`}
                />

                <Area
                  type="monotone"
                  dataKey="interior"
                  stroke="#D99B26"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#gradInterior)"
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />

                <Area
                  type="monotone"
                  dataKey="exterior"
                  stroke="#2A9D8F"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#gradExterior)"
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
