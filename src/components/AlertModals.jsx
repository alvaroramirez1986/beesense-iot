import React from 'react';
import {
  AlertTriangle,
  BatteryWarning,
  LogOut,
  MessageSquareText,
  Thermometer,
  WifiOff,
} from 'lucide-react';

/**
 * Modales Emergentes de Alerta Prioritaria y Confirmación:
 * 1. Alerta de Seguridad por apertura de tapa ("ABIERTA") con indicador "ENVIANDO SMS"
 * 2. Alerta de Temperatura Crítica (> 36°C o < 15°C)
 * 3. Alerta de Sensores Fuera de Línea ("N/A")
 * 4. Alerta de Batería Crítica (< 20%)
 * 5. Confirmación de "Cerrar Sesión" antes de regresar a la pantalla de Login
 */
export default function AlertModals({
  showLidModal,
  onDismissLidModal,
  showTempModal,
  tempValue,
  onDismissTempModal,
  showSensorNAModal,
  onDismissSensorNAModal,
  showBatteryModal,
  onDismissBatteryModal,
  showLogoutModal,
  onCancelLogout,
  onConfirmLogout,
}) {
  const isHighTemp = tempValue !== null && tempValue !== undefined && Number(tempValue) > 36.0;

  return (
    <>
      {/* ====================================================================
          1. EMISIÓN DE ALERTA POR TAPA DE COLMENAR ABIERTA + "ENVIANDO SMS"
          ==================================================================== */}
      {showLidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-[390px] rounded-[28px] bg-white dark:bg-slate-900 p-7 sm:p-8 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] border border-slate-100 dark:border-slate-800">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-orange-100/90 dark:bg-orange-950/80 text-orange-500 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#122B52] dark:text-white mb-2.5">
              ¡Alerta de Seguridad!
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Se ha detectado que la tapa del colmenar principal se encuentra{' '}
              <span className="font-extrabold text-orange-600 dark:text-orange-400">
                ABIERTA
              </span>
              .
            </p>

            <div className="mb-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/70 text-xs font-extrabold tracking-wider text-indigo-700 dark:text-indigo-300">
              <MessageSquareText className="w-4 h-4 shrink-0" />
              <span>ENVIANDO SMS</span>
            </div>

            <button
              type="button"
              onClick={onDismissLidModal}
              className="w-full py-3.5 px-6 rounded-xl bg-[#122B52] hover:bg-[#1a3b6e] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          2. EMISIÓN DE ALERTA POR TEMPERATURA INTERIOR CRÍTICA (> 36°C o < 15°C)
          ==================================================================== */}
      {showTempModal && !showLidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-[390px] rounded-[28px] bg-white dark:bg-slate-900 p-7 sm:p-8 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] border border-slate-100 dark:border-slate-800">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-red-100/90 dark:bg-red-950/80 text-red-500 flex items-center justify-center">
              <Thermometer className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#122B52] dark:text-white mb-2.5">
              ¡Alerta de Temperatura!
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-7">
              {isHighTemp ? (
                <>
                  La temperatura interior de la colmena ha superado los{' '}
                  <span className="font-extrabold text-red-600 dark:text-red-400">
                    36°C ({Number(tempValue).toFixed(1)}°C)
                  </span>
                  . Se requiere revisión inmediata en el colmenar.
                </>
              ) : (
                <>
                  La temperatura interior de la colmena ha descendido a un nivel crítico{' '}
                  <span className="font-extrabold text-red-600 dark:text-red-400">
                    ({tempValue !== null && tempValue !== undefined ? `${Number(tempValue).toFixed(1)}°C` : 'Baja crítica'})
                  </span>
                  . Se requiere revisión inmediata en el colmenar.
                </>
              )}
            </p>

            <button
              type="button"
              onClick={onDismissTempModal}
              className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          3. EMISIÓN DE ALERTA POR SENSORES FUERA DE LÍNEA (N/A)
          ==================================================================== */}
      {showSensorNAModal && !showLidModal && !showTempModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-[390px] rounded-[28px] bg-white dark:bg-slate-900 p-7 sm:p-8 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] border border-slate-100 dark:border-slate-800">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-red-100/90 dark:bg-red-950/80 text-red-500 flex items-center justify-center">
              <WifiOff className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#122B52] dark:text-white mb-2.5">
              ¡Sensores Fuera de Línea!
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-7">
              Se ha detectado pérdida de conexión{' '}
              <span className="font-extrabold text-red-600 dark:text-red-400">
                (N/A)
              </span>{' '}
              en uno o más sensores del colmenar. Verifique el estado del nodo en terreno.
            </p>

            <button
              type="button"
              onClick={onDismissSensorNAModal}
              className="w-full py-3.5 px-6 rounded-xl bg-[#122B52] hover:bg-[#1a3b6e] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          4. EMISIÓN DE ALERTA POR BATERÍA CRÍTICA (< 20%)
          ==================================================================== */}
      {showBatteryModal && !showLidModal && !showTempModal && !showSensorNAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-[390px] rounded-[28px] bg-white dark:bg-slate-900 p-7 sm:p-8 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] border border-slate-100 dark:border-slate-800">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-red-100/90 dark:bg-red-950/80 text-red-500 flex items-center justify-center">
              <BatteryWarning className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#122B52] dark:text-white mb-2.5">
              ¡Batería Crítica!
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-7">
              El nivel de batería ha caído por debajo del{' '}
              <span className="font-extrabold text-red-600 dark:text-red-400">
                20%
              </span>
              . Es necesario revisión y recarga en el colmenar.
            </p>

            <button
              type="button"
              onClick={onDismissBatteryModal}
              className="w-full py-3.5 px-6 rounded-xl bg-red-500 hover:bg-red-600 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          5. MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN
          ==================================================================== */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-[390px] rounded-[28px] bg-white dark:bg-slate-900 p-7 sm:p-8 text-center shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center">
              <LogOut className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-extrabold text-[#122B52] dark:text-white mb-2">
              ¿Cerrar Sesión?
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              ¿Está seguro que desea finalizar su sesión actual en la plataforma{' '}
              <strong className="font-bold">BeeSense IoT</strong> y volver a la pantalla de acceso?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onCancelLogout}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirmLogout}
                className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
