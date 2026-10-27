/**
 * ============================================================================
 * SERVICIO DE EXPORTACIÓN DE REPORTES A FORMATO PDF CON LOGOTIPO BEESENSE
 * ============================================================================
 * - Incluye el logotipo oficial de BeeSense en su resolución nativa (644x197 px)
 *   respetando su proporción exacta (3.269:1) y alineación vertical/horizontal.
 * - Incluye la columna "Nombre de Colmenar" ("Colmenar Principal - Sede PAO")
 *   en la grilla de datos del reporte PDF.
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateTimeCL } from './awsApiService';
import { BEESENSE_LOGO_BASE64, BEESENSE_LOGO_ASPECT_RATIO } from './logoBase64';

export function exportEventsToPDF(events, filters = {}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Franja Superior Institucional Azul Marino BeeSense (#122B52)
  const headerHeight = 36;
  doc.setFillColor(18, 43, 82);
  doc.rect(0, 0, 297, headerHeight, 'F');

  // 2. Línea acento inferior dorada (#D4A017)
  doc.setFillColor(212, 160, 23);
  doc.rect(0, headerHeight - 1.5, 297, 1.5, 'F');

  // 3. Contenedor blanco redondeado con alineación simétrica y proporción exacta del Logo BeeSense
  const badgeX = 14;
  const badgeY = 5.5;
  const badgeW = 64;
  const badgeH = 23.5;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'F');

  const logoMaxW = 58;
  const logoH = Number((logoMaxW / (BEESENSE_LOGO_ASPECT_RATIO || 3.269)).toFixed(2));
  const logoX = badgeX + (badgeW - logoMaxW) / 2;
  const logoY = badgeY + (badgeH - logoH) / 2;

  try {
    doc.addImage(BEESENSE_LOGO_BASE64, 'PNG', logoX, logoY, logoMaxW, logoH, undefined, 'SLOW');
  } catch (err) {
    console.warn('[BeeSense PDF] Fallback de texto si addImage falla:', err);
    doc.setTextColor(18, 43, 82);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('BeeSense IoT', badgeX + 8, badgeY + 14);
  }

  // 4. Título y Subtítulo del Reporte Oficial alineados a la derecha del Logotipo
  const textStartX = 84;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15.5);
  doc.text('REPORTE OFICIAL DE EVENTOS Y ALERTAS TELEMÉTRICAS IoT', textStartX, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Colmenar: Colmenar Principal - Sede PAO   |   Fecha de emisión: ${formatDateTimeCL(new Date())}`,
    textStartX,
    21.5
  );

  // 5. Resumen de filtros aplicados (incluyendo Rango Horario si fue activado manualmente)
  const tipoLabel = filters.tipoEvento || 'TODOS';
  const desdeLabel = filters.fechaDesde || 'Inicio';
  const hastaLabel = filters.fechaHasta || 'Actualidad';
  const horarioLabel = filters.rangoHorarioActivo
    ? `${filters.horaDesde || '00:00'} a ${filters.horaHasta || '23:59'} hrs`
    : 'Día completo';

  doc.setTextColor(245, 158, 11);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    `Filtros -> Tipo: ${tipoLabel}  |  Fechas: ${desdeLabel} - ${hastaLabel}  |  Horario: ${horarioLabel}  |  Total: ${events.length} evento(s)`,
    textStartX,
    28.5
  );

  // 6. Construcción de filas de la tabla incluyendo la columna "Nombre de Colmenar"
  const tableRows = events.map((ev, index) => [
    index + 1,
    ev.nombreColmenar || 'Colmenar Principal - Sede PAO',
    ev.tipoEvento || 'N/A',
    ev.titulo || ev.tipoEvento,
    ev.detalle || '-',
    ev.fechaInicio || '-',
    ev.fechaTermino || 'En curso (Activa)',
  ]);

  autoTable(doc, {
    startY: 42,
    head: [[
      '#',
      'Nombre de Colmenar',
      'Categoría',
      'Evento',
      'Descripción Detallada',
      'Fecha y Hora de Inicio',
      'Fecha y Hora de Término',
    ]],
    body:
      tableRows.length > 0
        ? tableRows
        : [[
            '-',
            'Colmenar Principal - Sede PAO',
            'SIN REGISTROS',
            'No existen eventos para los filtros seleccionados',
            '-',
            '-',
            '-',
          ]],
    theme: 'grid',
    headStyles: {
      fillColor: [18, 43, 82],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [244, 247, 251],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 46, fontStyle: 'bold' },
      2: { cellWidth: 34, fontStyle: 'bold' },
      3: { cellWidth: 38 },
      4: { cellWidth: 63 },
      5: { cellWidth: 39 },
      6: { cellWidth: 39 },
    },
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `BeeSense 2026. — Plataforma de Monitoreo Apícola IoT — Página ${data.pageNumber}`,
        14,
        pageHeight - 8
      );
    },
  });

  const fileTimestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  doc.save(`BeeSense_Reporte_Eventos_${fileTimestamp}.pdf`);
}
