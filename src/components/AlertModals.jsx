import React from 'react';
import { AlertTriangle, BatteryWarning, LogOut } from 'lucide-react';

/**
 * Modales Emergentes de Alerta Prioritaria y Confirmación (Figuras 5 y 6):
 * 1. Figura 5: "¡Alerta de Seguridad!" por apertura de tapa del colmenar principal ("ABIERTA")
 * 2. Figura 6: "¡Batería Crítica!" por caída de nivel de batería bajo 20%
 * 3. Confirmación de "Cerrar Sesión" antes de regresar a la pantalla de Login
 */
export default function AlertModals({
  showLidModal,
  onDismissLidModal,
  showBatteryModal,
  onDismissBatteryModal,
  showLogoutModal,
  onCancelLogout,
  onConfirmLogout,
}) {
  return (
    <>
      {/* ====================================================================
          FIGURA 5: EMISIÓN DE ALERTA POR TAPA DE COLMENAR ABIERTA
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

            <div className="mb-6 px-3.5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/70 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              📱 Alerta enviada al celular del apicultor y almacenada en la base de datos.
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
          FIGURA 6: EMISIÓN DE ALERTA POR BATERÍA CRÍTICA (< 20%)
          ==================================================================== */}
      {showBatteryModal && !showLidModal && (
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
          MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN
          "Al hacer clic en cerrar sesión pida confirmar acción y que devuelva a pantalla de login"
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
