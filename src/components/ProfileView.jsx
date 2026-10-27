import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, AlertTriangle, Trash2, Upload } from 'lucide-react';

/**
 * Vista de Perfil de Usuario ("Mi Perfil" - Figura 4)
 * - Permite al Apicultor cambiar su avatar cargando una imagen de máximo 600x600 píxeles
 * - Muestra ID único de usuario y estado "Cuenta Activa y Sincronizada"
 * - Incluye panel de Información del Sistema y adaptación Mobile
 */
export default function ProfileView({ avatarUrl, onUpdateAvatar }) {
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadStatus({
        type: 'error',
        message: 'Por favor seleccione un archivo de imagen válido (PNG, JPG o WEBP).',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      const img = new Image();
      img.onload = () => {
        // Validación estricta de dimensión máxima 600x600 píxeles requerida en el documento
        if (img.width > 600 || img.height > 600) {
          setUploadStatus({
            type: 'error',
            message: `La imagen seleccionada mide ${img.width}x${img.height} px. El tamaño máximo permitido es de 600x600 píxeles.`,
          });
          return;
        }

        onUpdateAvatar(dataUrl);
        setUploadStatus({
          type: 'success',
          message: `Avatar actualizado correctamente (${img.width}x${img.height} px).`,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#122B52] dark:text-white tracking-tight">
        Mi Perfil
      </h1>

      {/* ====================================================================
          TARJETA PRINCIPAL DEL APICULTOR (Figura 4 - Mobile & Escritorio)
          ==================================================================== */}
      <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.07)] flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
          {/* Avatar Circular con opción de carga (máximo 600x600 px) */}
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar Apicultor"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-teal-500/30 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#122B52] via-[#1B4965] to-[#2A9D8F] text-white flex items-center justify-center text-4xl sm:text-5xl font-extrabold shadow-md select-none">
                U
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Cambiar imagen de avatar (máx. 600x600 px)"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#122B52] hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Información de Identidad del Apicultor */}
          <div className="space-y-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#122B52] dark:text-white">
              Apicultor
            </h2>

            <div className="inline-block px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono font-semibold">
              ID: 15797764717598643303
            </div>

            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Cuenta Activa y Sincronizada
              </span>
            </div>
          </div>
        </div>

        {/* Controles para subir o restablecer Avatar */}
        <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Cambiar Avatar (Máx. 600×600 px)</span>
          </button>

          {avatarUrl && (
            <button
              type="button"
              onClick={() => {
                onUpdateAvatar(null);
                setUploadStatus({
                  type: 'success',
                  message: 'Se ha restablecido el avatar predeterminado.',
                });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Restaurar inicial "U"</span>
            </button>
          )}
        </div>
      </div>

      {/* Mensaje de estado de validación de imagen (600x600 px) */}
      {uploadStatus && (
        <div
          className={`rounded-2xl p-4 flex items-center gap-3 text-xs sm:text-sm font-semibold border ${
            uploadStatus.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}
        >
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* ====================================================================
          PANEL DE INFORMACIÓN DEL SISTEMA (Figura 4)
          ==================================================================== */}
      <div className="relative overflow-hidden rounded-[22px] bg-[#FEF8E8] dark:bg-amber-950/30 border border-[#F5E1A4] dark:border-amber-800/60 p-6 sm:p-8 shadow-xs">
        {/* Marca de agua decorativa derecha como en la Figura 4 */}
        <AlertTriangle className="pointer-events-none absolute -right-4 -top-4 w-36 h-36 text-amber-500/10 rotate-12" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <h3 className="text-base sm:text-lg font-extrabold text-[#854D0E] dark:text-amber-300">
            Información del Sistema
          </h3>
          <p className="text-xs sm:text-sm text-[#92400E] dark:text-amber-200/90 leading-relaxed">
            Esta es la interfaz oficial de <strong className="font-extrabold">BeeSense IoT</strong>. Los colores, alertas y métricas están configurados para brindar un monitoreo claro e intenso del estado de los colmenares en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
}
