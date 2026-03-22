/**
 * xrayAnomalies.js
 * X-Ray anomaly definitions for the X-Ray Diagnosis mini-game.
 * Each anomaly type defines how it looks on the pixelated X-ray and where it appears.
 */

/**
 * Anomaly types with visual descriptions for pixel rendering
 */
export const ANOMALY_TYPES = {
  misalignment: {
    id: 'misalignment',
    name: 'Desalineación vertebral',
    icon: '↔️',
    description: 'Vértebra desplazada lateralmente',
    // Render: offset vertebra 2-3px from centerline
    renderHint: 'offset',
    difficulty: 1,
  },
  disc_narrowing: {
    id: 'disc_narrowing',
    name: 'Estrechamiento discal',
    icon: '📏',
    description: 'Espacio entre vértebras reducido',
    // Render: reduced gap between two vertebrae
    renderHint: 'narrow_gap',
    difficulty: 1,
  },
  osteophyte: {
    id: 'osteophyte',
    name: 'Osteofito',
    icon: '🦴',
    description: 'Espolón óseo en borde vertebral',
    // Render: small bone spur pixels extending from vertebra edge
    renderHint: 'spur',
    difficulty: 2,
  },
  curvature: {
    id: 'curvature',
    name: 'Curvatura anormal',
    icon: '〰️',
    description: 'Escoliosis o cifosis leve',
    // Render: slight S-curve in spine alignment
    renderHint: 'curve',
    difficulty: 2,
  },
  fracture: {
    id: 'fracture',
    name: 'Línea de fractura',
    icon: '⚡',
    description: 'Línea oscura a través del cuerpo vertebral',
    // Render: dark line through vertebra body
    renderHint: 'crack',
    difficulty: 3,
  },
  spondylolisthesis: {
    id: 'spondylolisthesis',
    name: 'Espondilolistesis',
    icon: '➡️',
    description: 'Deslizamiento anterior de una vértebra',
    // Render: one vertebra shifted forward relative to neighbors
    renderHint: 'slide',
    difficulty: 3,
  },
};

/**
 * Map condition zones to likely anomaly placements.
 * Returns an array of anomaly objects with positions.
 */
export function getAnomaliesForCondition(condition) {
  const zones = condition.zones || ['lumbar'];
  const isDangerous = condition.dangerous || condition.isDangerous || false;
  const anomalies = [];

  // Vertebra Y positions per zone (normalized 0-1)
  const ZONE_Y_RANGES = {
    cervical: { start: 0.05, end: 0.22, vertebrae: ['C1','C2','C3','C4','C5','C6','C7'] },
    thoracic: { start: 0.24, end: 0.58, vertebrae: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'] },
    lumbar:   { start: 0.62, end: 0.78, vertebrae: ['L1','L2','L3','L4','L5'] },
    gluteal:  { start: 0.82, end: 0.90, vertebrae: ['S1','S2'] },
  };

  zones.forEach(zone => {
    const range = ZONE_Y_RANGES[zone] || ZONE_Y_RANGES.lumbar;

    // Always add a misalignment or disc narrowing (basic anomaly)
    const basicType = Math.random() < 0.5 ? 'misalignment' : 'disc_narrowing';
    const y1 = range.start + Math.random() * (range.end - range.start);
    anomalies.push({
      ...ANOMALY_TYPES[basicType],
      x: 0.5,
      y: y1,
      hitRadius: 0.06,
      vertebra: range.vertebrae[Math.floor(Math.random() * range.vertebrae.length)],
    });

    // 50% chance of a second anomaly (osteophyte or curvature)
    if (Math.random() < 0.5 || isDangerous) {
      const advType = Math.random() < 0.5 ? 'osteophyte' : 'curvature';
      const y2 = range.start + Math.random() * (range.end - range.start);
      // Avoid placing too close to first anomaly
      const adjustedY = Math.abs(y2 - y1) < 0.08 ? y2 + 0.10 : y2;
      anomalies.push({
        ...ANOMALY_TYPES[advType],
        x: 0.5 + (Math.random() - 0.5) * 0.1, // slight lateral offset
        y: Math.min(0.92, adjustedY),
        hitRadius: 0.07,
        vertebra: range.vertebrae[Math.floor(Math.random() * range.vertebrae.length)],
      });
    }
  });

  // Dangerous conditions: add a fracture or spondylolisthesis
  if (isDangerous) {
    const dangerType = Math.random() < 0.5 ? 'fracture' : 'spondylolisthesis';
    const mainZone = zones[0] || 'lumbar';
    const range = ZONE_Y_RANGES[mainZone] || ZONE_Y_RANGES.lumbar;
    const y = range.start + (range.end - range.start) * 0.5;
    anomalies.push({
      ...ANOMALY_TYPES[dangerType],
      x: 0.5,
      y,
      hitRadius: 0.06,
      vertebra: range.vertebrae[Math.floor(range.vertebrae.length / 2)],
    });
  }

  // Cap at 4 anomalies
  return anomalies.slice(0, 4);
}

/**
 * X-Ray spine pixel data for rendering.
 * Returns pixel positions for a basic spine X-ray silhouette.
 * Colors: bone = light (#d4c8a8), disc = darker (#8a7b60), bg = dark (#1a1a2e)
 */
export const XRAY_COLORS = {
  bone: '#d4c8a8',
  boneHighlight: '#e8dcc0',
  boneShadow: '#9a8b6a',
  disc: '#6a5b40',
  background: '#0a0a1e',
  backgroundLight: '#141428',
  anomalyGlow: '#ff6b6b44',
};

/**
 * Generate X-ray vertebrae pixel positions.
 * Each vertebra is a rectangle with a disc space below.
 * @param {number} width - pixel width of the x-ray view
 * @param {number} height - pixel height of the x-ray view
 */
export function generateXRaySpine(width, height) {
  const vertebrae = [];
  const px = Math.max(2, Math.floor(width / 40)); // pixel unit size

  // All vertebrae from C1 to S2
  const allVert = [
    // Cervical (smaller)
    { id: 'C1', y: 0.04, w: 3, h: 1.5 },
    { id: 'C2', y: 0.07, w: 3, h: 1.5 },
    { id: 'C3', y: 0.10, w: 3.5, h: 1.5 },
    { id: 'C4', y: 0.13, w: 3.5, h: 1.5 },
    { id: 'C5', y: 0.16, w: 4, h: 1.5 },
    { id: 'C6', y: 0.19, w: 4, h: 1.5 },
    { id: 'C7', y: 0.22, w: 4.5, h: 2 },
    // Thoracic (medium)
    { id: 'T1', y: 0.26, w: 5, h: 2 },
    { id: 'T2', y: 0.29, w: 5, h: 2 },
    { id: 'T3', y: 0.32, w: 5.5, h: 2 },
    { id: 'T4', y: 0.35, w: 5.5, h: 2 },
    { id: 'T5', y: 0.38, w: 6, h: 2 },
    { id: 'T6', y: 0.41, w: 6, h: 2 },
    { id: 'T7', y: 0.44, w: 6, h: 2 },
    { id: 'T8', y: 0.47, w: 6, h: 2 },
    { id: 'T9', y: 0.50, w: 6.5, h: 2 },
    { id: 'T10', y: 0.53, w: 6.5, h: 2 },
    { id: 'T11', y: 0.56, w: 7, h: 2 },
    { id: 'T12', y: 0.59, w: 7, h: 2.5 },
    // Lumbar (larger)
    { id: 'L1', y: 0.63, w: 8, h: 3 },
    { id: 'L2', y: 0.67, w: 8.5, h: 3 },
    { id: 'L3', y: 0.71, w: 9, h: 3 },
    { id: 'L4', y: 0.75, w: 9, h: 3 },
    { id: 'L5', y: 0.79, w: 9, h: 3 },
    // Sacral (fused, wider)
    { id: 'S1', y: 0.84, w: 10, h: 3 },
    { id: 'S2', y: 0.88, w: 9, h: 3 },
  ];

  allVert.forEach(v => {
    vertebrae.push({
      id: v.id,
      x: (width / 2) - (v.w * px / 2),
      y: v.y * height,
      width: v.w * px,
      height: v.h * px,
      normalizedY: v.y,
    });
  });

  return vertebrae;
}
