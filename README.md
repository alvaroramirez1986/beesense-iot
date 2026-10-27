# 🐝 BeeSense IoT — Plataforma de Monitoreo Telemétrico Apícola en Tiempo Real (2026)

Este repositorio contiene la implementación integral (Hardware ESP32 + Back-End Serverless en AWS + Front-End SPA en React/Tailwind CSS + Scripts de Despliegue en Amazon S3) del proyecto **BeeSense**.

---

## 📁 Estructura del Proyecto

```text
beesense/
├── README.md                          # Guía de instalación, arquitectura y despliegue
├── preview.html                       # Vista previa interactiva autónoma (abrir directo en navegador)
├── package.json                       # Dependencias (React 18, Vite, Tailwind, Recharts, jsPDF, Lucide)
├── vite.config.js                     # Configuración de empaquetado para Amazon S3
├── tailwind.config.js                 # Paleta BeeSense, Modo Oscuro y animaciones críticas
├── postcss.config.js                  # Configuración de PostCSS
├── .env.example                       # Variables de entorno para conexión con AWS API Gateway
├── index.html                         # HTML raíz de la SPA
├── public/
│   └── assets/
│       ├── logo-login.png             # Logo oficial vertical para pantalla de inicio (Hoja 2)
│       ├── logo-desktop.png           # Logo oficial horizontal versión escritorio (Hoja 2)
│       ├── logo-desktop-dark.png      # Variante modo oscuro para escritorio
│       ├── logo-mobile.png            # Logo oficial compacto versión móvil (Hoja 2)
│       └── logo-mobile-dark.png       # Variante modo oscuro para móvil
├── src/
│   ├── main.jsx                       # Punto de entrada React
│   ├── index.css                      # Animaciones de panal, vuelo de abejas y parpadeo de alertas
│   ├── App.jsx                        # Orquestador de estados, sincronización DynamoDB y modales
│   ├── services/
│   │   ├── awsApiService.js           # Consumo REST/AWS y máquina de estados de eventos en DynamoDB
│   │   └── pdfExportService.js        # Exportación de reportes a formato PDF (jsPDF + AutoTable)
│   └── components/
│       ├── LoginScreen.jsx            # Figura 1: Panal animado, abejas volando, login Google y carga dinámica
│       ├── Sidebar.jsx                # Figuras 2 y 2.1: Menú escritorio/móvil, Modo Oscuro y Cerrar Sesión
│       ├── DashboardView.jsx          # Figuras 2 y 2.1: 4 tarjetas dinámicas + Gráfico (X: 10 min, Y: 5 en 5 a 50°C)
│       ├── ReportsView.jsx            # Figura 3: Filtro de fechas, dropdown de 5 tipos de evento y Exportar PDF
│       ├── ProfileView.jsx            # Figura 4: Perfil del Apicultor y carga de avatar (máx. 600x600 px)
│       ├── AlertModals.jsx            # Figuras 5 y 6: Modales de Tapa Abierta, Batería Crítica y Confirmación Logout
│       └── Footer.jsx                 # Pie de página institucional "BeeSense 2026."
├── backend-aws/
│   ├── lambda-ingest-iot/index.mjs    # Función Lambda receptora de IoT Core hacia DynamoDB
│   ├── lambda-api-reader/index.mjs    # Función Lambda para API Gateway (GET/POST/PATCH con CORS)
│   ├── iot-rule-sql.json              # Regla SQL para el motor de reglas de AWS IoT Core
│   ├── s3-bucket-policy.json          # Política pública de lectura para Bucket S3
│   └── s3-cors-config.json            # Configuración CORS para el Bucket S3
└── firmware-esp32/
    └── beesense_node.ino              # Firmware C++/Arduino para ESP32 (DHT22, DS18B20, Reed Switch, ADC y TLS X.509)
```

---

## 🚀 Inicio Rápido en Desarrollo Local

1. **Instalar dependencias:**
   ```bash
   cd /home/usuario/.gemini/antigravity/scratch/beesense
   npm install
   ```

2. **Configurar variables de entorno (opcional para conectar directo a tu API Gateway):**
   ```bash
   cp .env.example .env
   ```

3. **Levantar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Compilar para producción y sincronizar con Amazon S3:**
   ```bash
   npm run build
   aws s3 sync dist/ s3://beesense-web-hosting-2026 --delete
   ```
