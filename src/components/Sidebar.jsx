import React, { useState } from 'react';
import {
  Home,
  FileText,
  User,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';

/**
 * Navegación Responsiva de BeeSense (Escritorio y Mobile - Figuras 2 y 2.1)
 * - En Versión Mobile (< 768px o modo vista móvil):
 *   Contrae la navegación en un botón de Menú Hamburguesa (☰) en la esquina superior
 *   izquierda y centra el Logo Versión Móvil en la cabecera superior (tal como en Figura 2.1).
 *   Al tocar el ícono de hamburguesa, despliega el menú lateral deslizable con:
 *   Dashboard, Reportes (con badge rojo), Mi Cuenta, y en la parte inferior el botón de
 *   Modo Oscuro justo sobre el botón de Cerrar Sesión.
 * - En Versión Escritorio (>= 768px):
 *   Muestra el menú lateral izquierdo fijo con el Logo Versión de Escritorio.
 */
export default function Sidebar({
  activeTab,
  setActiveTab,
  eventsCount = 0,
  darkMode,
  onToggleDarkMode,
  onRequestLogout,
  forceMobileView = false,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'reportes', label: 'Reportes', icon: FileText, badge: eventsCount },
    { id: 'cuenta', label: 'Mi Cuenta', icon: User },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ====================================================================
          BARRA SUPERIOR MÓVIL CON MENÚ HAMBURGUESA (Figura 2.1)
          Se muestra automáticamente en pantallas móviles (< 768px) o al
          activar la previsualización móvil.
          ==================================================================== */}
      <header
        className={`${
          forceMobileView ? 'flex' : 'flex md:hidden'
        } sticky top-0 z-30 w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 py-3.5 items-center justify-between shadow-xs`}
      >
        {/* Botón de Menú Hamburguesa (☰) a la izquierda según Figura 2.1 */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Abrir menú hamburguesa"
          aria-expanded={mobileMenuOpen}
          className="relative p-2 -ml-1 rounded-xl text-[#122B52] dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
        >
          {mobileMenuOpen ? (
            <X className="w-7 h-7 stroke-[2.4]" />
          ) : (
            <Menu className="w-7 h-7 stroke-[2.4]" />
          )}
          {/* Indicador sutil en el icono hamburguesa si existen alertas registradas */}
          {!mobileMenuOpen && eventsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* Logo Oficial Versión Móvil Centrado (Hoja 2 y Figura 2.1) */}
        <button
          type="button"
          onClick={() => handleSelectTab('dashboard')}
          className="flex items-center justify-center focus:outline-none"
        >
          <img
            src={darkMode ? './assets/logo-mobile-dark.png' : './assets/logo-mobile.png'}
            alt="BeeSense Logo"
            className="h-9 sm:h-10 w-auto object-contain select-none"
          />
        </button>

        {/* Espaciador simétrico derecho para mantener el logo 100% centrado como en Figura 2.1 */}
        <div className="w-9 h-9" aria-hidden="true" />
      </header>

      {/* ====================================================================
          MENÚ DESPLEGABLE (DRAWER HAMBURGUESA) PARA VERSIÓN MOBILE
          ==================================================================== */}
      <div
        className={`${
          forceMobileView ? 'block' : 'md:hidden'
        } fixed inset-0 z-50 transition-all duration-300 ${
          mobileMenuOpen ? ' visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
      >
        {/* Fondo oscurecido al abrir el menú hamburguesa */}
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Panel lateral deslizable del Menú Hamburguesa */}
        <aside
          className={`relative z-10 w-72 max-w-[82vw] bg-white dark:bg-slate-900 h-full flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Cabecera del Menú Hamburguesa con Logo Móvil y botón cerrar (X) */}
            <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <img
                src={darkMode ? './assets/logo-mobile-dark.png' : './assets/logo-mobile.png'}
                alt="BeeSense Mobile Logo"
                className="h-9 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Cerrar menú hamburguesa"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opciones de Navegación del Menú Hamburguesa */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-[#122B52] dark:bg-amber-500 text-white dark:text-slate-950 shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-3.5">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-red-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Parte inferior del Menú Hamburguesa: Botón Modo Oscuro SOBRE Cerrar Sesión */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-amber-300 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-700 transition-colors"
            >
              <span className="flex items-center gap-3">
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-[#122B52]" />
                )}
                <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </span>
              <span
                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                  darkMode ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onRequestLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ====================================================================
          MENÚ LATERAL DE ESCRITORIO (Figura 2 - Oculto en versión Mobile)
          ==================================================================== */}
      {!forceMobileView && (
        <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 min-h-screen flex-col justify-between select-none transition-colors duration-300">
          <div>
            {/* Cabecera con Logo Versión de Escritorio (Hoja 2 del documento) */}
            <div className="px-6 py-7 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="focus:outline-none group"
              >
                <img
                  src={darkMode ? './assets/logo-desktop-dark.png' : './assets/logo-desktop.png'}
                  alt="BeeSense - Monitoreo Apícola IoT"
                  className="w-48 h-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </button>
            </div>

            {/* Enlaces de Navegación */}
            <nav className="px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-[#122B52] dark:bg-amber-500 text-white dark:text-slate-950 shadow-[0_8px_20px_-4px_rgba(18,43,82,0.35)]'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-3.5">
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-red-500 text-white shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Pie del Sidebar: Botón Modo Oscuro SOBRE el botón Cerrar Sesión */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <button
              type="button"
              onClick={onToggleDarkMode}
              title="Activar/Desactivar Modo Oscuro para descanso visual"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-amber-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700 transition-all"
            >
              <span className="flex items-center gap-3">
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-[#122B52]" />
                )}
                <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </span>
              <span
                className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                  darkMode ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
              </span>
            </button>

            <button
              type="button"
              onClick={onRequestLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
