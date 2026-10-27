import React, { useState, useEffect, useRef, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ReportsView from './components/ReportsView';
import ProfileView from './components/ProfileView';
import AlertModals from './components/AlertModals';
import NotFound404View from './components/NotFound404View';
import Footer from './components/Footer';
import {
  buildTenMinuteSeries,
  evaluateTelemetryStatus,
  fetchEventsFromDynamoDB,
  fetchLatestTelemetryFromAWS,
  formatDateTimeCL,
  registerEventEndInDynamoDB,
  registerEventStartInDynamoDB,
  toISODateString,
  toTimeHHMM24,
} from './services/awsApiService';

export default function App() {
  // 1. Estado de Autenticación, Navegación Principal y Detección de Ruta 404
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [show404Page, setShow404Page] = useState(() => {
    const hash = window.location.hash;
    return hash === '#/404' || (hash && !['#/', '#/login', '#/dashboard', '#/reportes', '#/cuenta'].includes(hash));
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/404') {
        setShow404Page(true);
      } else if (['', '#/', '#/login', '#/dashboard', '#/reportes', '#/cuenta'].includes(hash)) {
        setShow404Page(false);
      } else {
        setShow404Page(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. Modo Oscuro para descanso visual (sobre botón Cerrar Sesión)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('beesense_dark_mode') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('beesense_dark_mode', String(darkMode));
  }, [darkMode]);

  // 3. Avatar del Apicultor (validado a máx 600x600 px)
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return localStorage.getItem('beesense_avatar_url') || null;
  });

  const handleUpdateAvatar = (newUrl) => {
    setAvatarUrl(newUrl);
    if (newUrl) {
      localStorage.setItem('beesense_avatar_url', newUrl);
    } else {
      localStorage.removeItem('beesense_avatar_url');
    }
  };

  // 4. Estado Dinámico de Telemetría en Tiempo Real (alimentado por AWS / Stream IoT)
  const [telemetry, setTelemetry] = useState(() => ({
    tempInterior: 34.2,
    tempExterior: 24.8,
    humedadExterior: 45.2,
    estadoTapa: 'Cerrada',
    bateria: 86.5,
    timestamp: new Date().toISOString(),
  }));

  // 5. Serie Temporal Histórica en intervalos de 10 minutos (Eje X cada 10 min)
  const [chartData, setChartData] = useState(() => buildTenMinuteSeries(34.2, 24.8));

  // 6. Historial de Eventos almacenados en Amazon DynamoDB
  const [events, setEvents] = useState([]);

  // 7. Modales Prioritarios (Figuras 5 y 6 + Confirmación de Logout)
  const [showLidModal, setShowLidModal] = useState(false);
  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Referencia de eventos activos en curso para registrar automáticamente fechaInicio y fechaTermino en DynamoDB
  const activeEventsRef = useRef({
    TEMPERATURA: null,
    'ESTADO DE TAPADA': null,
    'ESTADO DE BATERIA': null,
    'N/A': null,
  });

  // Carga inicial de eventos desde DynamoDB
  useEffect(() => {
    fetchEventsFromDynamoDB().then((loaded) => {
      setEvents(loaded);
    });
  }, []);

  /**
   * Máquina de Estados de Persistencia Automática en DynamoDB:
   * Registra fecha/hora de inicio al comenzar una anomalía y registra
   * fecha/hora de término cuando el parámetro vuelve a la normalidad.
   */
  const syncAnomaliesWithDynamoDB = useCallback(async (currentTelemetry) => {
    const status = evaluateTelemetryStatus(currentTelemetry);
    const now = new Date();
    const formattedNow = formatDateTimeCL(now);
    const isoDate = toISODateString(now);
    const horaInicio24 = toTimeHHMM24(now);

    const handleCategoryTransition = async (categoryKey, isAnomalyActive, buildEventPayload) => {
      const currentActiveId = activeEventsRef.current[categoryKey];

      if (isAnomalyActive && !currentActiveId) {
        const newEventId = `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        activeEventsRef.current[categoryKey] = newEventId;

        const payload = {
          id: newEventId,
          nombreColmenar: 'Colmenar Principal - Sede PAO',
          tipoEvento: categoryKey,
          ...buildEventPayload(),
          fechaInicio: formattedNow,
          fechaTermino: 'En curso (Activa)',
          isoDate,
          horaInicio24,
          estadoEvento: 'ACTIVO',
        };

        const updatedList = await registerEventStartInDynamoDB(payload);
        setEvents(updatedList);
      } else if (!isAnomalyActive && currentActiveId) {
        activeEventsRef.current[categoryKey] = null;
        const updatedList = await registerEventEndInDynamoDB(
          currentActiveId,
          formattedNow,
          now.toISOString()
        );
        setEvents(updatedList);
      }
    };

    // 1. TEMPERATURA (>= 36.1 °C o < 15.0 °C)
    const isTempAnomaly =
      status.tempStatus === 'HIGH_ALERT' || status.tempStatus === 'LOW_BLINK_ALERT';
    await handleCategoryTransition('TEMPERATURA', isTempAnomaly, () => ({
      titulo: 'Alerta Temperatura',
      detalle:
        status.tempStatus === 'HIGH_ALERT'
          ? `Temperatura interior crítica alta: ${Number(currentTelemetry.tempInterior).toFixed(1)}°C (Umbral ≥ 36.1°C)`
          : `Temperatura interior crítica baja: ${Number(currentTelemetry.tempInterior).toFixed(1)}°C (Umbral < 15.0°C)`,
    }));

    // 2. ESTADO DE TAPADA (Tapa ABIERTA)
    const isLidAnomaly = status.tapaStatus === 'OPEN_BLINK_ALERT';
    if (isLidAnomaly && !activeEventsRef.current['ESTADO DE TAPADA']) {
      setShowLidModal(true);
    }
    await handleCategoryTransition('ESTADO DE TAPADA', isLidAnomaly, () => ({
      titulo: 'Alerta Estado de Tapada',
      detalle: 'Apertura física detectada: Tapa del colmenar principal ABIERTA',
    }));

    // 3. ESTADO DE BATERIA (< 20% / < 10%)
    const isBatteryAnomaly =
      status.bateriaStatus === 'CRITICAL_BLINK_10' ||
      status.bateriaStatus === 'LOW_ALERT_20';
    if (isBatteryAnomaly && !activeEventsRef.current['ESTADO DE BATERIA']) {
      setShowBatteryModal(true);
    }
    await handleCategoryTransition('ESTADO DE BATERIA', isBatteryAnomaly, () => ({
      titulo: 'Alerta Estado de Batería',
      detalle: `Nivel energético crítico en nodo ESP32: ${Number(currentTelemetry.bateria).toFixed(1)}%`,
    }));

    // 4. N/A (Pérdida de conectividad en uno o más sensores)
    const isSensorNA = status.anySensorDisconnected;
    await handleCategoryTransition('N/A', isSensorNA, () => ({
      titulo: 'Alerta Sensor Sin Señal (N/A)',
      detalle: 'Pérdida de conectividad detectada en sonda(s) del nodo telemétrico (lectura N/A)',
    }));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      syncAnomaliesWithDynamoDB(telemetry);
    }
  }, [telemetry, isAuthenticated, syncAnomaliesWithDynamoDB]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const remoteData = await fetchLatestTelemetryFromAWS();
      if (remoteData && typeof remoteData === 'object') {
        setTelemetry((prev) => ({ ...prev, ...remoteData }));
        return;
      }

      setTelemetry((prev) => {
        if (prev.tempInterior === null) return prev;
        const deltaInt = (Math.random() - 0.5) * 0.16;
        const deltaExt = (Math.random() - 0.5) * 0.12;
        const nextInt = Number((Number(prev.tempInterior) + deltaInt).toFixed(1));
        const nextExt = Number((Number(prev.tempExterior) + deltaExt).toFixed(1));
        return {
          ...prev,
          tempInterior: nextInt,
          tempExterior: nextExt,
          timestamp: new Date().toISOString(),
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleSimulateTelemetryChange = (partialUpdate) => {
    setTelemetry((prev) => {
      const next = { ...prev, ...partialUpdate, timestamp: new Date().toISOString() };
      if (next.tempInterior !== null && next.tempExterior !== null) {
        setChartData((prevChart) => {
          const updated = [...prevChart];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              interior: Number(next.tempInterior),
              exterior: Number(next.tempExterior),
            };
          }
          return updated;
        });
      }
      return next;
    });
  };

  // Si se activa una ruta inexistente o la vista de Error 404
  if (show404Page) {
    return (
      <NotFound404View
        darkMode={darkMode}
        isAuthenticated={isAuthenticated}
        onReturnHome={() => {
          window.history.replaceState(null, '', window.location.pathname);
          setShow404Page(false);
        }}
      />
    );
  }

  // Si no ha iniciado sesión, muestra la Pantalla de Login (Figura 1)
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={() => setIsAuthenticated(true)}
        onOpen404Preview={() => setShow404Page(true)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F7FB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Navegación Lateral (Escritorio) y Barra Superior Hamburguesa (Mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        eventsCount={events.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onRequestLogout={() => setShowLogoutModal(true)}
      />

      {/* Contenedor Principal + Pie de Página "BeeSense 2026." */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <DashboardView
              telemetry={telemetry}
              chartData={chartData}
              darkMode={darkMode}
              onSimulateTelemetryChange={handleSimulateTelemetryChange}
            />
          )}

          {activeTab === 'reportes' && <ReportsView events={events} />}

          {activeTab === 'cuenta' && (
            <ProfileView
              avatarUrl={avatarUrl}
              onUpdateAvatar={handleUpdateAvatar}
            />
          )}
        </main>

        {/* Pie de página institucional requerido: "BeeSense 2026." */}
        <Footer onOpen404={() => setShow404Page(true)} />
      </div>

      {/* Modales Emergentes Prioritarios (Figuras 5 y 6 + Confirmación de Logout) */}
      <AlertModals
        showLidModal={showLidModal}
        onDismissLidModal={() => setShowLidModal(false)}
        showBatteryModal={showBatteryModal}
        onDismissBatteryModal={() => setShowBatteryModal(false)}
        showLogoutModal={showLogoutModal}
        onCancelLogout={() => setShowLogoutModal(false)}
        onConfirmLogout={() => {
          setShowLogoutModal(false);
          setIsAuthenticated(false);
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}
