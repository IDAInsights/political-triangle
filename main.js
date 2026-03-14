/**
 * EL TRIÁNGULO POLÍTICO — main.js
 * Codebook V3.2
 *
 * Módulos:
 *  1. Estado global
 *  2. Datos: vértices, índices, casos ilustrativos
 *  3. Nav: scroll, modo especialista, hamburger
 *  4. Triángulo interactivo (sliders + clic en SVG)
 *  5. Cálculo de posición y zona
 *  6. Panel de posición
 *  7. Tooltip de vértices
 *  8. Casos ilustrativos
 *  9. Tarjetas de índices (toggle individual)
 * 10. Scroll reveal
 * 11. Hero mini-triángulo
 * 12. Init
 */

'use strict';

/* ══════════════════════════════════════════════════
   1. ESTADO GLOBAL
══════════════════════════════════════════════════ */
const state = {
  expertMode: false,
  studentMode: false,
  dualView: false,
  showTrayectorias: false,
  iae: 50,
  iue: 0,
  activeCaso: null,
};

/* ══════════════════════════════════════════════════
   2. DATOS
══════════════════════════════════════════════════ */

/** Vértices del triángulo — extremos conceptuales */
const VERTICES = {
  anarquia: {
    label: 'Anarquía',
    iae: 0,
    iue: 0,
    color: '#4A90D9',
    desc: 'Ausencia de Estado. IAE = 0: no hay aparato coercitivo. El IUE no tiene sentido cuando no hay Estado que lo oriente.',
    detail: 'Ningún régimen real alcanza este vértice. Es el límite conceptual de la ausencia de coerción estatal.',
  },
  comunismo: {
    label: 'Comunismo · Homogeneidad económica',
    iae: 100,
    iue: -100,
    color: '#C0392B',
    desc: 'Estado total con orientación universalista-progresista. IAE = 100, IUE = −100: máximo alcance estatal, uso orientado a eliminar diferencias económicas.',
    detail: 'IUE_efectivo = −100. El Estado es omnipresente y su proyecto es la homogeneización económica por vía coercitiva.',
  },
  fascismo: {
    label: 'Fascismo · Teocracia · Homogeneidad cultural',
    iae: 100,
    iue: 100,
    color: '#8B1A1A',
    desc: 'Estado total con orientación particularista. IAE = 100, IUE = +100: máximo alcance estatal orientado a imponer un orden cultural, nacional o religioso.',
    detail: 'IUE_efectivo = +100. La coerción se dirige a eliminar la diversidad en nombre de una identidad particular.',
  },
};

/** Zonas del triángulo con sus rangos aproximados */
const ZONAS = [
  {
    id: 'anarquia_cercana',
    label: 'Zona de baja coerción',
    labelTech: 'IAE < 15',
    desc: 'Estados muy débiles o en proceso de colapso. Poca capacidad coercitiva real.',
    iae_max: 15,
  },
  {
    id: 'liberal',
    label: 'Liberalismo',
    labelTech: 'IAE 15–45 · IUE −30 a +30',
    desc: 'Estado presente pero limitado. Protege derechos y libertades individuales sin imponer un proyecto cultural uniforme.',
    iae_min: 15, iae_max: 45, iue_min: -30, iue_max: 30,
  },
  {
    id: 'social_democracia',
    label: 'Social democracia',
    labelTech: 'IAE 30–60 · IUE −60 a −10',
    desc: 'Estado de bienestar con orientación redistributiva. Interviene activamente en la economía para reducir desigualdades.',
    iae_min: 30, iae_max: 60, iue_min: -60, iue_max: -10,
  },
  {
    id: 'conservadurismo',
    label: 'Conservadurismo democrático',
    labelTech: 'IAE 30–60 · IUE 10 a 60',
    desc: 'Estado presente con orientación hacia el orden cultural y social establecido, pero con contrapesos democráticos.',
    iae_min: 30, iae_max: 60, iue_min: 10, iue_max: 60,
  },
  {
    id: 'intervencionismo',
    label: 'Intervencionismo',
    labelTech: 'IAE 45–70 · IUE −20 a +20',
    desc: 'Estado muy activo en la economía y la regulación, sin orientación ideológica clara. Común en economías mixtas.',
    iae_min: 45, iae_max: 70, iue_min: -20, iue_max: 20,
  },
  {
    id: 'autoritarismo_mercado',
    label: 'Autoritarismo de mercado',
    labelTech: 'IAEc alto · IAEe bajo',
    desc: 'Control político estricto combinado con economía relativamente libre. Asimetría IAEc/IAEe característica.',
  },
  {
    id: 'democratico',
    label: 'Zona de estados democráticos',
    labelTech: 'IAE 20–65, pluralismo real',
    desc: 'Espacio interior del triángulo donde coexisten proyectos políticos opuestos y el poder está distribuido.',
    iae_min: 20, iae_max: 65,
  },
];

/** Casos ilustrativos */
const CASOS = [
  {
    id: 'noruega',
    label: 'Noruega',
    periodo: 'actual',
    iae: 55,
    iue: -40,
    color: '#1B5C9E',
    zona: 'Social democracia',
    filter: 'democratico',
    desc: 'Estado de bienestar fuerte con orientación redistributiva y alta legitimidad institucional.',
    indices: { iac: 18, iaee: 52 },
  },
  {
    id: 'eeuu',
    label: 'EE.UU.',
    periodo: '2000s',
    iae: 40,
    iue: 20,
    color: '#2874A6',
    zona: 'Liberalismo-conservador',
    filter: 'democratico',
    desc: 'Alcance estatal moderado con orientación conservadora en lo cultural, liberal en lo económico.',
    indices: { iac: 25, iaee: 35 },
  },
  {
    id: 'china',
    label: 'China',
    periodo: 'actual',
    iae: 80,
    iue: -15,
    color: '#C0392B',
    zona: 'Autoritarismo de mercado',
    filter: 'autoritario',
    desc: 'Alto control civil (IAEc elevado) con economía parcialmente liberalizada (IAEe moderado). Asimetría estructural.',
    indices: { iac: 78, iaee: 55 },
    iaec: 88,
    iaee_val: 55,
    highCoercion: true,
  },
  {
    id: 'venezuela',
    label: 'Venezuela',
    periodo: '2010s',
    iae: 72,
    iue: -65,
    color: '#E07B20',
    zona: 'Autoritarismo izquierdista',
    filter: 'autoritario',
    desc: 'Expansión estatal con proyecto homogeneizador económico. Alta presencia del aparato civil y económico.',
    indices: { iac: 65, iaee: 70 },
    iaec: 72,
    iaee_val: 58,
    trayectoria: {
      label: 'Venezuela 1999',
      iae: 42,
      iue: -30,
      color: '#E07B20',
      desc: 'Inicio del gobierno de Chávez: alcance estatal moderado, orientación redistributiva incipiente.',
    },
  },
  {
    id: 'iran',
    label: 'Irán',
    periodo: 'actual',
    iae: 75,
    iue: 80,
    color: '#8B1A1A',
    zona: 'Teocracia autoritaria',
    filter: 'autoritario',
    desc: 'Estado con fuerte orientación religiosa particularista. Alto control civil con legitimación teológica.',
    indices: { iac: 78, iaee: 50 },
    iaec: 82,
    iaee_val: 48,
    highCoercion: true,
    trayectoria: {
      label: 'Irán 1979',
      iae: 55,
      iue: 55,
      color: '#8B1A1A',
      desc: 'Revolución Islámica: expansión inicial del aparato estatal con fuerte proyecto teocrático en construcción.',
    },
  },
  {
    id: 'somalia',
    label: 'Somalia',
    periodo: '1990s',
    iae: 8,
    iue: 0,
    color: '#888',
    zona: 'Estado fallido',
    filter: 'extremo',
    desc: 'Colapso del Estado. IAE cercano a 0: el monopolio de la violencia se fragmenta entre actores no estatales.',
    indices: { iac: 10, iaee: 5 },
    iaec: 10,
    iaee_val: 5,
  },
  {
    id: 'suecia_80',
    label: 'Suecia',
    periodo: '1980s',
    iae: 62,
    iue: -55,
    color: '#0F6E5A',
    zona: 'Social democracia plena',
    filter: 'democratico',
    desc: 'Modelo de Estado de bienestar en su punto de mayor expansión. Alto alcance con orientación redistributiva.',
    indices: { iac: 22, iaee: 68 },
    iaec: 22,
    iaee_val: 70,
    trayectoria: {
      label: 'Suecia 2020s',
      iae: 52,
      iue: -30,
      color: '#0F6E5A',
      desc: 'Retroceso moderado del Estado de bienestar y desplazamiento hacia el centro en uso estatal.',
    },
  },
  {
    id: 'alemania_nazi',
    label: 'Alemania Nazi',
    periodo: '1938',
    iae: 88,
    iue: 85,
    color: '#4A1A1A',
    zona: 'Fascismo histórico',
    filter: 'extremo',
    desc: 'Expansión total del aparato estatal con proyecto homogeneizador cultural de carácter genocida.',
    indices: { iac: 92, iaee: 72 },
    iaec: 92,
    iaee_val: 72,
    highCoercion: true,
    trayectoria: {
      label: 'Alemania 1933',
      iae: 58,
      iue: 50,
      color: '#4A1A1A',
      desc: 'Toma del poder: alcance estatal moderado en expansión, uso del Estado virando hacia la homogeneización cultural.',
    },
  },
];

/* ══════════════════════════════════════════════════
   3. NAV
══════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('modeToggle');
  const modeLabel = document.getElementById('modeLabel');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  // Scroll shadow
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Modo progresivo: público → estudiante → especialista → público
  const MODES = [
    { key: 'public',   label: 'Modo estudiante',    bodyClass: '' },
    { key: 'student',  label: 'Modo especialista',  bodyClass: 'student-mode' },
    { key: 'expert',   label: 'Modo público',       bodyClass: 'expert-mode' },
  ];
  let modeIndex = 0;

  toggle.addEventListener('click', () => {
    // Quitar clases anteriores
    document.body.classList.remove('student-mode', 'expert-mode');
    modeIndex = (modeIndex + 1) % MODES.length;
    const mode = MODES[modeIndex];
    if (mode.bodyClass) document.body.classList.add(mode.bodyClass);
    modeLabel.textContent = mode.label;
    state.expertMode = mode.key === 'expert';
    state.studentMode = mode.key === 'student';
    updateIndexCards();
    updateContextReading();
    // Mostrar/ocultar capas en cards
    document.querySelectorAll('.card-student').forEach(el => {
      el.hidden = !state.studentMode && !state.expertMode;
    });
    document.querySelectorAll('.card-technical').forEach(el => {
      if (state.expertMode) el.hidden = false;
      else if (!state.studentMode) el.hidden = true;
    });
  });

  // Hamburger
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });

  // Cerrar menú al navegar
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.textContent = '☰';
    });
  });

  // Active link en scroll
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const observerCb = (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  };

  const sectionObserver = new IntersectionObserver(observerCb, {
    rootMargin: '-40% 0px -55% 0px',
  });
  sections.forEach(s => sectionObserver.observe(s));
}

/* ══════════════════════════════════════════════════
   4. TRIÁNGULO INTERACTIVO
══════════════════════════════════════════════════ */

/**
 * Coordenadas del triángulo SVG:
 *  Vértice anarquía  = (300, 40)
 *  Vértice comunismo = (80, 490)
 *  Vértice fascismo  = (520, 490)
 *
 * Mapeamos IAE e IUE a coordenadas usando coordenadas baricéntricas.
 */

const TRI = {
  // Vértice superior (Anarquía)
  A: { x: 300, y: 40,  iae: 0,   iue: 0 },
  // Vértice inferior izquierdo (Comunismo)
  C: { x: 80,  y: 490, iae: 100, iue: -100 },
  // Vértice inferior derecho (Fascismo)
  F: { x: 520, y: 490, iae: 100, iue: 100 },
};

/**
 * De índices (iae 0–100, iue −100 a +100) a coordenadas SVG.
 * Usamos pesos baricéntricos:
 *  w_A = 1 - iae/100
 *  w_C = (iae/100) * (1 - iue_norm)     // iue_norm = (iue+100)/200
 *  w_F = (iae/100) * iue_norm
 */
function indicesToXY(iae, iue) {
  const iaeN = Math.max(0, Math.min(100, iae)) / 100;
  const iueN = (Math.max(-100, Math.min(100, iue)) + 100) / 200;
  const wA = 1 - iaeN;
  const wC = iaeN * (1 - iueN);
  const wF = iaeN * iueN;
  return {
    x: wA * TRI.A.x + wC * TRI.C.x + wF * TRI.F.x,
    y: wA * TRI.A.y + wC * TRI.C.y + wF * TRI.F.y,
  };
}

/**
 * De coordenadas SVG a índices (clic en el triángulo).
 */
function xyToIndices(x, y, svgEl) {
  // Obtener bounding box del SVG
  const vb = svgEl.viewBox.baseVal;
  const rect = svgEl.getBoundingClientRect();
  const scaleX = vb.width / rect.width;
  const scaleY = vb.height / rect.height;
  const svgX = x * scaleX;
  const svgY = y * scaleY;

  // Resolver sistema baricéntrico inverso
  // P = wA*A + wC*C + wF*F, wA+wC+wF=1
  // Resolver via Cramer
  const denom = (TRI.C.y - TRI.F.y) * (TRI.A.x - TRI.F.x) + (TRI.F.x - TRI.C.x) * (TRI.A.y - TRI.F.y);
  if (Math.abs(denom) < 1e-10) return null;

  const wA = ((TRI.C.y - TRI.F.y) * (svgX - TRI.F.x) + (TRI.F.x - TRI.C.x) * (svgY - TRI.F.y)) / denom;
  const wC = ((TRI.F.y - TRI.A.y) * (svgX - TRI.F.x) + (TRI.A.x - TRI.F.x) * (svgY - TRI.F.y)) / denom;
  const wF = 1 - wA - wC;

  // Fuera del triángulo
  if (wA < -0.01 || wC < -0.01 || wF < -0.01) return null;

  // Calcular índices
  const iaeN = wC + wF; // 1 - wA
  const iueN = wF / (wC + wF + 1e-10);

  return {
    iae: Math.round(Math.max(0, Math.min(100, iaeN * 100))),
    iue: Math.round(Math.max(-100, Math.min(100, (iueN * 200) - 100))),
  };
}

function initTriangle() {
  const svg = document.getElementById('mainTriangle');
  const iaeSlider = document.getElementById('iaeSlider');
  const iueSlider = document.getElementById('iueSlider');
  const iaeValEl = document.getElementById('iaeVal');
  const iueValEl = document.getElementById('iueVal');

  if (!svg) return;

  // Dual-view toggle
  const dualToggle = document.getElementById('dualViewToggle');
  if (dualToggle) {
    dualToggle.addEventListener('change', () => {
      state.dualView = dualToggle.checked;
      renderUserPoint();
    });
  }

  // Actualizar punto desde sliders
  function updateFromSliders() {
    state.iae = parseInt(iaeSlider.value, 10);
    state.iue = parseInt(iueSlider.value, 10);
    iaeValEl.textContent = state.iae;
    iueValEl.textContent = state.iue >= 0 ? '+' + state.iue : state.iue;
    renderUserPoint();
    updatePositionPanel();
    updateContextReading();
    updateIUEAxis();
  }

  iaeSlider.addEventListener('input', updateFromSliders);
  iueSlider.addEventListener('input', updateFromSliders);

  // Clic en SVG
  svg.addEventListener('click', (e) => {
    const svgRect = svg.getBoundingClientRect();
    const localX = e.clientX - svgRect.left;
    const localY = e.clientY - svgRect.top;
    const result = xyToIndices(localX, localY, svg);
    if (!result) return;

    state.iae = result.iae;
    state.iue = result.iue;

    iaeSlider.value = state.iae;
    iueSlider.value = state.iue;
    iaeValEl.textContent = state.iae;
    iueValEl.textContent = state.iue >= 0 ? '+' + state.iue : state.iue;

    renderUserPoint();
    updatePositionPanel();
    updateContextReading();
    updateIUEAxis();
  });

  // Touch drag en SVG
  svg.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const svgRect = svg.getBoundingClientRect();
    const localX = touch.clientX - svgRect.left;
    const localY = touch.clientY - svgRect.top;
    const result = xyToIndices(localX, localY, svg);
    if (!result) return;
    state.iae = result.iae;
    state.iue = result.iue;
    iaeSlider.value = state.iae;
    iueSlider.value = state.iue;
    iaeValEl.textContent = state.iae;
    iueValEl.textContent = state.iue >= 0 ? '+' + state.iue : state.iue;
    renderUserPoint();
    updatePositionPanel();
    updateContextReading();
    updateIUEAxis();
  }, { passive: false });

  // Vértices clicables
  Object.keys(VERTICES).forEach(key => {
    const el = document.getElementById(`v-${key}`);
    if (!el) return;
    el.addEventListener('click', () => showVertexTooltip(key, el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showVertexTooltip(key, el);
      }
    });
  });

  // Clic fuera cierra tooltip
  document.addEventListener('click', (e) => {
    const tooltip = document.getElementById('triangleTooltip');
    if (!tooltip.hidden && !e.target.closest('.vertex')) {
      tooltip.hidden = true;
    }
  });

  // Render inicial
  updateFromSliders();
}

function renderUserPoint() {
  const svg = document.getElementById('mainTriangle');
  if (!svg) return;
  const dot = document.getElementById('userDot');
  const pulse = document.getElementById('userPulse');
  if (!dot || !pulse) return;

  const { x, y } = indicesToXY(state.iae, state.iue);

  dot.setAttribute('cx', x);
  dot.setAttribute('cy', y);
  dot.setAttribute('opacity', '1');

  pulse.setAttribute('cx', x);
  pulse.setAttribute('cy', y);
  pulse.setAttribute('opacity', '1');

  // Vista dual IAEc / IAEe
  const dualDotC = document.getElementById('dualDotC');
  const dualLabelC = document.getElementById('dualLabelC');
  const dualLine = document.getElementById('dualLine');
  const dualGroup = document.getElementById('dualPointC');

  if (dualDotC && dualLine && dualGroup) {
    if (state.dualView) {
      // Simular IAEc más alto que IAEe (como en autoritarismos de mercado)
      // IAEc = IAE * 1.15 capped at 100; IAEe = IAE * 0.85
      const iaecVal = Math.min(100, Math.round(state.iae * 1.18));
      const iaeeVal = Math.max(0, Math.round(state.iae * 0.82));
      const { x: cx, y: cy } = indicesToXY(iaecVal, state.iue);

      dualDotC.setAttribute('cx', cx);
      dualDotC.setAttribute('cy', cy);
      if (dualLabelC) {
        dualLabelC.setAttribute('x', cx);
        dualLabelC.setAttribute('y', cy - 14);
      }
      dualGroup.setAttribute('opacity', '1');
      dualLine.setAttribute('x1', x);
      dualLine.setAttribute('y1', y);
      dualLine.setAttribute('x2', cx);
      dualLine.setAttribute('y2', cy);
      dualLine.setAttribute('opacity', '0.7');

      // Añadir etiqueta IAEe al punto principal si no existe
      let iaeeLbl = document.getElementById('dualLabelE');
      if (!iaeeLbl) {
        iaeeLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        iaeeLbl.setAttribute('id', 'dualLabelE');
        iaeeLbl.setAttribute('text-anchor', 'middle');
        iaeeLbl.setAttribute('font-family', 'DM Sans, sans-serif');
        iaeeLbl.setAttribute('font-size', '9');
        iaeeLbl.setAttribute('fill', 'var(--c-iaee-bg)');
        svg.appendChild(iaeeLbl);
      }
      iaeeLbl.setAttribute('x', x);
      iaeeLbl.setAttribute('y', y - 14);
      iaeeLbl.textContent = 'IAEe';
      iaeeLbl.setAttribute('opacity', '1');
    } else {
      dualGroup.setAttribute('opacity', '0');
      dualLine.setAttribute('opacity', '0');
      const iaeeLbl = document.getElementById('dualLabelE');
      if (iaeeLbl) iaeeLbl.setAttribute('opacity', '0');
    }
  }
}

/* ══════════════════════════════════════════════════
   5. CÁLCULO DE ZONA
══════════════════════════════════════════════════ */
function calcZone(iae, iue) {
  if (iae < 12) return 'Estado mínimo / Colapso';
  if (iae < 40) {
    if (iue < -30)      return 'Liberalismo de izquierda';
    if (iue > 30)       return 'Liberalismo conservador';
    return 'Liberalismo';
  }
  if (iae < 65) {
    if (iue < -50)      return 'Social democracia';
    if (iue < -20)      return 'Centro-izquierda';
    if (iue > 50)       return 'Conservadurismo';
    if (iue > 20)       return 'Centro-derecha';
    return 'Centro democrático';
  }
  // IAE >= 65
  if (iue < -60)        return 'Autoritarismo de izquierda';
  if (iue > 60)         return 'Autoritarismo de derecha';
  return 'Autoritarismo pragmático';
}

function calcIUEe(iae, iue) {
  return ((iue / 100) * iae).toFixed(1);
}

/* ══════════════════════════════════════════════════
   5b. LECTURA CONTEXTUAL VIVA
══════════════════════════════════════════════════ */

const CONTEXT_DB = [
  // Estado mínimo / colapso
  {
    test: (iae) => iae < 12,
    public: 'El Estado tiene una presencia muy débil o inexistente. No hay monopolio real de la fuerza: la coerción está fragmentada entre actores no estatales.',
    student: 'Ojo: un IAE bajo no significa libertad. Puede indicar colapso institucional, donde la violencia la ejercen grupos armados, milicias o señores de la guerra en lugar del Estado.',
    expert: 'IAE < 12: zona de colapso estatal. FTE elevada. El modelo opera en modo degradado: los índices formales no capturan la distribución real de la coerción.',
  },
  // Liberalismo clásico
  {
    test: (iae, iue) => iae >= 12 && iae < 40 && iue >= -30 && iue <= 30,
    public: 'Estado presente pero limitado, sin orientación ideológica fuerte. Protege derechos individuales sin imponer un proyecto cultural uniforme.',
    student: 'Esta zona es la que los pensadores liberales clásicos consideraban óptima: Estado como árbitro, no como actor transformador. El bajo IAE implica que el Estado tiene capacidad limitada para imponer cualquier agenda, sea de izquierda o de derecha.',
    expert: 'Zona liberal clásica: IAE 12–40, IUE ±30. IUEe bajo en valor absoluto. Alta sensibilidad al IC2 negativo (crisis puede empujar hacia autoritarismo con IAE bajo).',
  },
  // Liberalismo de izquierda
  {
    test: (iae, iue) => iae >= 12 && iae < 45 && iue < -30,
    public: 'Estado relativamente pequeño con orientación progresista: protege libertades individuales y promueve derechos civiles universales, pero con capacidad limitada para redistribuir recursos.',
    student: 'El bajo IAE es la restricción clave: aunque el Estado quiere redistribuir (IUE negativo), tiene poca capacidad real para hacerlo. La intención universalista no se traduce necesariamente en impacto efectivo.',
    expert: 'IUEe negativo moderado. Asimetría intención/capacidad. Vulnerable a captura por élites si IAEc < IAEe.',
  },
  // Liberalismo conservador
  {
    test: (iae, iue) => iae >= 12 && iae < 45 && iue > 30,
    public: 'Estado pequeño con orientación conservadora: defiende el orden cultural y social establecido, pero con capacidad limitada de intervención.',
    student: 'Un Estado liberal-conservador puede ser culturalmente restrictivo (IUE alto) pero sin los instrumentos para imponerlo masivamente. Es la diferencia entre una sociedad conservadora y un régimen autoritario conservador.',
    expert: 'IUEe positivo bajo. Baja capacidad coercitiva limita el alcance del proyecto particularista. II1 relativamente alto contiene el IVR.',
  },
  // Social democracia
  {
    test: (iae, iue) => iae >= 40 && iae < 68 && iue < -20,
    public: 'Estado de bienestar con orientación redistributiva. Interviene activamente para reducir desigualdades económicas y garantizar derechos sociales universales.',
    student: 'La combinación de IAE moderado-alto con IUE negativo define el espacio socialdemócrata: el Estado tiene capacidad real de redistribuir y elige usarla hacia la igualdad. Es la zona donde se ubican los países nórdicos actuales.',
    expert: 'Zona de equilibrio estable. IAEc moderado preserva pluralismo político. IAEe elevado financia redistribución. II1 alto actúa como freno al IVR. Riesgo de desplazamiento si IC2 negativo sostenido.',
  },
  // Centro democrático
  {
    test: (iae, iue) => iae >= 40 && iae < 68 && iue >= -20 && iue <= 20,
    public: 'Estado activo en la economía y la regulación, sin orientación ideológica fuerte hacia ningún polo. Zona de alta negociación política y pluralismo.',
    student: 'El centro no es ausencia de política: es la zona donde las fuerzas opuestas se neutralizan mutuamente. Un Estado puede llegar aquí por pragmatismo o porque las coaliciones políticas bloquean movimientos en cualquier dirección.',
    expert: 'IUEe próximo a cero. Equilibrio dinámico, no estático. Sensible a polarización: IC1 elevado puede desplazar rápidamente hacia los extremos del IUE.',
  },
  // Conservadurismo democrático
  {
    test: (iae, iue) => iae >= 40 && iae < 68 && iue > 20,
    public: 'Estado con capacidad real de intervención, orientado a preservar el orden cultural y social establecido. Tiene contrapesos democráticos que limitan el proyecto particularista.',
    student: 'A diferencia del autoritarismo conservador, aquí existen instituciones que moderan el uso del poder. El Estado puede favorecer a grupos particulares, pero no puede eliminar la competencia política.',
    expert: 'Zona de conservadurismo institucionalizado. IAEc moderado preserva mecanismos de accountability. Riesgo de captura si IAEc sube sin aumento de II1.',
  },
  // Autoritarismo izquierdista
  {
    test: (iae, iue) => iae >= 68 && iue < -40,
    public: 'Estado muy poderoso orientado a un proyecto homogeneizador económico. El aparato estatal tiene alcance real sobre la economía y la vida civil, y lo usa para eliminar diferencias de clase o propiedad.',
    student: 'Alta coerción + orientación universalista = el Estado puede realmente redistribuir, pero también puede suprimir disidencia. La homogeneización forzada tiene costos: destruye los mecanismos de información que hacen funcionar la economía.',
    expert: 'IUEe negativo elevado. IC2 negativo (crisis económica) típicamente invierte el IVR en estos regímenes. CE elevado si las élites del partido capturan el aparato redistribuidor.',
  },
  // Autoritarismo pragmático
  {
    test: (iae, iue) => iae >= 68 && iue >= -40 && iue <= 40,
    public: 'Estado muy poderoso sin proyecto ideológico claro. El control es el objetivo en sí mismo. Característico de regímenes que priorizan la supervivencia sobre la ideología.',
    student: 'El "autoritarismo pragmático" es inestable por definición: sin legitimidad ideológica, depende casi exclusivamente de la coerción y del IC1 (liderazgo personal). Cuando el liderazgo falla, estos regímenes colapsan o se transforman rápidamente.',
    expert: 'IUEe bajo en valor absoluto pese a IAE alto. Alta dependencia del IC1. II1 mínimo. Vulnerable a IC2 negativo sin recursos redistributivos ni identitarios para compensar.',
  },
  // Autoritarismo de derecha / teocracia
  {
    test: (iae, iue) => iae >= 68 && iue > 40,
    public: 'Estado muy poderoso orientado a imponer un orden cultural, nacional o religioso particular. La coerción se dirige a eliminar la diversidad en nombre de una identidad o fe.',
    student: 'La distinción entre fascismo, teocracia y nacionalismo extremo no es el nivel de coerción (todos tienen IAE muy alto), sino el contenido del proyecto particularista (nación, raza, religión). El modelo los agrupa porque comparten la estructura de poder, aunque sus fundamentos sean distintos.',
    expert: 'IUEe positivo elevado. Máxima presión homogeneizadora. Protocolo de coerción extrema obligatorio si hay evidencia de crímenes de lesa humanidad documentados.',
  },
];

function getContextForPosition(iae, iue) {
  for (const entry of CONTEXT_DB) {
    if (entry.test(iae, iue)) return entry;
  }
  return {
    public: 'Posición fuera de los rangos definidos. Ajusta los sliders para explorar el espacio del modelo.',
    student: '',
    expert: '',
  };
}

function updateContextReading() {
  const contextText = document.getElementById('contextText');
  const contextStudent = document.getElementById('contextStudent');
  const contextStudentText = document.getElementById('contextStudentText');
  const contextExpert = document.getElementById('contextExpert');
  const contextExpertText = document.getElementById('contextExpertText');
  if (!contextText) return;

  const ctx = getContextForPosition(state.iae, state.iue);

  contextText.style.opacity = '0';
  setTimeout(() => {
    contextText.textContent = ctx.public;
    contextText.style.opacity = '1';
  }, 150);

  if (contextStudentText) contextStudentText.textContent = ctx.student || '';
  if (contextExpertText) contextExpertText.textContent = ctx.expert || '';

  if (contextStudent) {
    contextStudent.hidden = !ctx.student || (!state.studentMode && !state.expertMode);
  }
  if (contextExpert) {
    contextExpert.hidden = !ctx.expert || !state.expertMode;
  }
}

/* ══════════════════════════════════════════════════
   5c. ACTUALIZADOR EJE IUE
══════════════════════════════════════════════════ */
function updateIUEAxis() {
  const marker = document.getElementById('iueAxisMarker');
  if (!marker) return;
  // IUE va de -100 a +100, mapeamos a 0%-100% del eje
  const pct = (state.iue + 100) / 200 * 100;
  marker.style.left = pct + '%';
}

/* ══════════════════════════════════════════════════
   6. PANEL DE POSICIÓN
══════════════════════════════════════════════════ */
function updatePositionPanel() {
  const iaeEl  = document.getElementById('posIAE');
  const iueEl  = document.getElementById('posIUE');
  const iueeEl = document.getElementById('posIUEe');
  const zoneEl = document.getElementById('posZone');
  if (!iaeEl) return;

  iaeEl.textContent  = state.iae;
  iueEl.textContent  = state.iue >= 0 ? '+' + state.iue : state.iue;
  iueeEl.textContent = calcIUEe(state.iae, state.iue);
  zoneEl.textContent = calcZone(state.iae, state.iue);
}

/* ══════════════════════════════════════════════════
   7. TOOLTIP DE VÉRTICES
══════════════════════════════════════════════════ */
function showVertexTooltip(key, el) {
  const v = VERTICES[key];
  if (!v) return;

  const tooltip = document.getElementById('triangleTooltip');
  const ttName = tooltip.querySelector('.tt-name');
  const ttDesc = tooltip.querySelector('.tt-desc');
  const ttIndices = tooltip.querySelector('.tt-indices');

  ttName.textContent = v.label;
  ttDesc.textContent = state.expertMode ? v.detail : v.desc;

  ttIndices.innerHTML = `
    <span class="tt-index-pill">IAE=${v.iae}</span>
    <span class="tt-index-pill">IUE=${v.iue}</span>
  `;

  // Posicionar tooltip relativo al contenedor
  const container = document.querySelector('.triangle-container');
  const containerRect = container.getBoundingClientRect();
  const svgEl = document.getElementById('mainTriangle');
  const svgRect = svgEl.getBoundingClientRect();
  const { x: vx, y: vy } = indicesToXY(v.iae, v.iue);
  const scaleX = svgRect.width / 600;
  const scaleY = svgRect.height / 560;

  let left = (vx * scaleX) + svgRect.left - containerRect.left + 16;
  let top  = (vy * scaleY) + svgRect.top  - containerRect.top  - 16;

  // Evitar que salga del contenedor
  left = Math.min(left, containerRect.width - 260);
  top  = Math.max(top, 0);

  tooltip.style.left = left + 'px';
  tooltip.style.top  = top + 'px';
  tooltip.hidden = false;
}

/* ══════════════════════════════════════════════════
   8. CASOS ILUSTRATIVOS
══════════════════════════════════════════════════ */
function initCasos() {
  const list = document.getElementById('casosList');
  const pointsGroup = document.getElementById('casosPoints');
  const casosSvg = document.getElementById('casosTriangle');
  if (!list || !pointsGroup) return;

  // El triángulo de casos usa viewBox 500x460
  const TRI2 = {
    A: { x: 250, y: 30 },
    C: { x: 60,  y: 430 },
    F: { x: 440, y: 430 },
  };

  function toXY2(iae, iue) {
    const iaeN = Math.max(0, Math.min(100, iae)) / 100;
    const iueN = (Math.max(-100, Math.min(100, iue)) + 100) / 200;
    const wA = 1 - iaeN;
    const wC = iaeN * (1 - iueN);
    const wF = iaeN * iueN;
    return {
      x: wA * TRI2.A.x + wC * TRI2.C.x + wF * TRI2.F.x,
      y: wA * TRI2.A.y + wC * TRI2.C.y + wF * TRI2.F.y,
    };
  }

  // Renderizar lista
  CASOS.forEach(caso => {
    const item = document.createElement('div');
    item.className = 'caso-item reveal';
    item.dataset.id = caso.id;
    item.dataset.filter = caso.filter || 'all';
    item.innerHTML = `
      <span class="caso-dot" style="background:${caso.color}"></span>
      <div class="caso-info">
        <div class="caso-name">
          ${caso.label}
          <span class="caso-period">${caso.periodo}</span>
          ${caso.highCoercion ? '<span class="caso-coercion-badge">⚑ alta coerción</span>' : ''}
        </div>
        <div class="caso-desc">${caso.desc}</div>
      </div>
      <div class="caso-indices">
        <span class="caso-pill">IAE=${caso.iae}</span>
        <span class="caso-pill">IUE=${caso.iue >= 0 ? '+' : ''}${caso.iue}</span>
      </div>
    `;
    item.addEventListener('click', () => activateCaso(caso.id));
    list.appendChild(item);
  });

  // Renderizar puntos en SVG
  CASOS.forEach(caso => {
    const { x, y } = toXY2(caso.iae, caso.iue);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'caso-point');
    g.setAttribute('data-id', caso.id);
    g.setAttribute('data-filter', caso.filter || 'all');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', caso.label);

    g.innerHTML = `
      <circle cx="${x}" cy="${y}" r="7"
        fill="${caso.color}" fill-opacity="0.85"
        stroke="white" stroke-width="1.5"/>
      <text x="${x + 10}" y="${y + 4}"
        class="caso-point-label"
        font-family="DM Sans, sans-serif"
        font-size="10"
        fill="var(--ink-2)">${caso.label}</text>
    `;
    g.addEventListener('click', () => activateCaso(caso.id));
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateCaso(caso.id);
      }
    });
    pointsGroup.appendChild(g);

    // Renderizar trayectoria si existe (oculta por defecto)
    if (caso.trayectoria) {
      const { x: x0, y: y0 } = toXY2(caso.trayectoria.iae, caso.trayectoria.iue);
      const tg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tg.setAttribute('class', 'trayectoria-group');
      tg.setAttribute('data-caso', caso.id);
      tg.setAttribute('opacity', '0');
      tg.style.transition = 'opacity 0.3s';

      // Línea de trayectoria con flecha
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x0); line.setAttribute('y1', y0);
      line.setAttribute('x2', x); line.setAttribute('y2', y);
      line.setAttribute('stroke', caso.color);
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '5 3');
      line.setAttribute('marker-end', 'url(#arrowTray)');
      line.setAttribute('opacity', '0.7');

      // Punto origen
      const dot0 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot0.setAttribute('cx', x0); dot0.setAttribute('cy', y0); dot0.setAttribute('r', '5');
      dot0.setAttribute('fill', caso.color); dot0.setAttribute('fill-opacity', '0.4');
      dot0.setAttribute('stroke', caso.color); dot0.setAttribute('stroke-width', '1');

      // Etiqueta origen
      const lbl0 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl0.setAttribute('x', x0 + 8); lbl0.setAttribute('y', y0 + 4);
      lbl0.setAttribute('font-family', 'DM Sans, sans-serif');
      lbl0.setAttribute('font-size', '9');
      lbl0.setAttribute('fill', caso.color);
      lbl0.textContent = caso.trayectoria.label;

      tg.appendChild(line);
      tg.appendChild(dot0);
      tg.appendChild(lbl0);
      pointsGroup.insertBefore(tg, pointsGroup.firstChild); // detrás de los puntos actuales
    }
  });

  // Añadir marcador de flecha para trayectorias
  if (casosSvg) {
    const defs = casosSvg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML += `<marker id="arrowTray" viewBox="0 0 10 10" refX="8" refY="5"
      markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"/>
    </marker>`;
    if (!casosSvg.querySelector('defs')) casosSvg.insertBefore(defs, casosSvg.firstChild);
  }

  // Filtros
  document.querySelectorAll('.caso-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.caso-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.caso-item').forEach(item => {
        const show = filter === 'all' || item.dataset.filter === filter;
        item.classList.toggle('hidden', !show);
      });
      document.querySelectorAll('.caso-point').forEach(pt => {
        const show = filter === 'all' || pt.dataset.filter === filter;
        pt.setAttribute('opacity', show ? '1' : '0.15');
      });
    });
  });

  // Toggle trayectorias
  const trayToggle = document.getElementById('trayectoriaToggle');
  if (trayToggle) {
    trayToggle.addEventListener('change', () => {
      state.showTrayectorias = trayToggle.checked;
      document.querySelectorAll('.trayectoria-group').forEach(g => {
        g.setAttribute('opacity', state.showTrayectorias ? '1' : '0');
      });
    });
  }

  function activateCaso(id) {
    state.activeCaso = id;
    document.querySelectorAll('.caso-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });
    document.querySelectorAll('.caso-point').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });

    // Nota epistémica para alta coerción
    const caso = CASOS.find(c => c.id === id);
    const existing = document.querySelector('.epistemic-note');
    if (existing) existing.remove();
    if (caso && caso.highCoercion) {
      const activeItem = document.querySelector(`.caso-item[data-id="${id}"]`);
      if (activeItem) {
        const note = document.createElement('div');
        note.className = 'epistemic-note visible';
        note.innerHTML = `<strong>⚑ Nota metodológica:</strong> Este caso involucra evidencia documentada de coerción extrema. El modelo describe la <em>estructura del poder</em>, no evalúa normativamente. La descripción cuantitativa no sustituye el análisis histórico y jurídico de los hechos.`;
        activeItem.insertAdjacentElement('afterend', note);
      }
    }
  }
}

/* ══════════════════════════════════════════════════
   9. TARJETAS DE ÍNDICES — toggle individual
══════════════════════════════════════════════════ */
function initIndexCards() {
  document.querySelectorAll('.index-card').forEach(card => {
    const toggle = card.querySelector('.card-toggle');
    const technical = card.querySelector('.card-technical');
    const student = card.querySelector('.card-student');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      // En modo público: alterna técnico
      // En modo estudiante: alterna entre estudiante y técnico
      if (state.expertMode) return; // en experto todo ya está visible
      if (state.studentMode) {
        // Si hay técnico oculto, mostrarlo
        if (technical) {
          const showing = !technical.hidden;
          technical.hidden = showing;
          toggle.textContent = showing ? 'Ver fórmula ↓' : 'Ocultar fórmula ↑';
        }
      } else {
        // Modo público: mostrar primero student si existe, luego técnico
        if (student && student.hidden) {
          student.hidden = false;
          toggle.textContent = 'Ver fórmula ↓';
        } else if (technical) {
          const showing = !technical.hidden;
          technical.hidden = showing;
          if (student) student.hidden = showing ? true : student.hidden;
          toggle.textContent = showing ? 'Ver más ↓' : 'Ocultar ↑';
        }
      }
    });
  });
}

function updateIndexCards() {
  document.querySelectorAll('.card-toggle').forEach(btn => {
    if (state.expertMode) {
      btn.textContent = '';
    } else if (state.studentMode) {
      btn.textContent = 'Ver fórmula ↓';
    } else {
      btn.textContent = 'Ver más ↓';
    }
  });
}

/* ══════════════════════════════════════════════════
   10. SCROLL REVEAL
══════════════════════════════════════════════════ */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════
   11. HERO MINI-TRIÁNGULO
══════════════════════════════════════════════════ */
function initHeroTriangle() {
  const container = document.getElementById('heroVisual');
  if (!container) return;

  container.innerHTML = `
  <svg viewBox="0 0 420 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="heroGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#E8E4DA" stop-opacity="1"/>
        <stop offset="100%" stop-color="#D4CFBF" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <polygon points="210,30 40,370 380,370"
      fill="url(#heroGrad)" stroke="#C8C5BC" stroke-width="1.5"/>
    <polygon points="210,30 40,370 125,370 155,220"
      fill="#4A90D9" fill-opacity="0.08"/>
    <polygon points="210,30 380,370 295,370 265,220"
      fill="#8B1A1A" fill-opacity="0.08"/>
    <polygon points="125,370 295,370 210,200"
      fill="#555" fill-opacity="0.06"/>
    <line x1="210" y1="30" x2="210" y2="370" stroke="#C8C5BC" stroke-width="0.5" stroke-dasharray="3 4"/>
    <line x1="125" y1="200" x2="295" y2="200" stroke="#C8C5BC" stroke-width="0.5" stroke-dasharray="3 4"/>
    <circle cx="210" cy="30" r="5" fill="#4A90D9"/>
    <circle cx="40" cy="370" r="5" fill="#C0392B"/>
    <circle cx="380" cy="370" r="5" fill="#8B1A1A"/>
    <text x="210" y="18" text-anchor="middle"
      font-family="DM Sans, sans-serif" font-size="11" fill="#6B6A65">Anarquía</text>
    <text x="20" y="388" text-anchor="start"
      font-family="DM Sans, sans-serif" font-size="11" fill="#6B6A65">Comunismo</text>
    <text x="400" y="388" text-anchor="end"
      font-family="DM Sans, sans-serif" font-size="11" fill="#6B6A65">Fascismo</text>
    <text x="210" y="145" text-anchor="middle"
      font-family="DM Sans, sans-serif" font-size="10" fill="#A8A7A2" letter-spacing="0.06em">LIBERALISMO</text>
    <text x="210" y="290" text-anchor="middle"
      font-family="DM Sans, sans-serif" font-size="10" fill="#A8A7A2" letter-spacing="0.06em">INTERVENCIONISMO</text>
    <circle cx="210" cy="145" r="6" fill="#1B5C9E" fill-opacity="0.8"/>
    <text x="222" y="149" font-family="DM Sans, sans-serif" font-size="9" fill="#3D3C38">Noruega</text>
    <circle cx="196" cy="185" r="6" fill="#2874A6" fill-opacity="0.8"/>
    <text x="208" y="189" font-family="DM Sans, sans-serif" font-size="9" fill="#3D3C38">EE.UU.</text>
    <circle cx="225" cy="268" r="6" fill="#C0392B" fill-opacity="0.8"/>
    <text x="237" y="272" font-family="DM Sans, sans-serif" font-size="9" fill="#3D3C38">China</text>
    <circle cx="138" cy="290" r="6" fill="#E07B20" fill-opacity="0.8"/>
    <text x="150" y="294" font-family="DM Sans, sans-serif" font-size="9" fill="#3D3C38">Venezuela</text>
    <text x="65" y="358" text-anchor="middle"
      font-family="DM Sans, sans-serif" font-size="9" fill="#A8A7A2">← Progresista</text>
    <text x="355" y="358" text-anchor="middle"
      font-family="DM Sans, sans-serif" font-size="9" fill="#A8A7A2">Conservador →</text>
  </svg>`;
}

/* ══════════════════════════════════════════════════
   11b. EXPLAINER ANIMADO 1D → 2D
══════════════════════════════════════════════════ */
function initHeroExplainer() {
  const animContainer = document.getElementById('heroExpAnim');
  if (!animContainer) return;

  const steps = [
    // Step 0: eje horizontal 1D
    () => `<svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="100" x2="340" y2="100" stroke="#C8C5BC" stroke-width="1.5"/>
      <circle cx="40" cy="100" r="6" fill="#1B5C9E"/>
      <circle cx="340" cy="100" r="6" fill="#8B1A1A"/>
      <text x="40" y="122" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#6B6A65">Izquierda</text>
      <text x="340" y="122" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#6B6A65">Derecha</text>
      <circle cx="190" cy="100" r="8" fill="#E07B20" stroke="white" stroke-width="2"/>
      <text x="190" y="86" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">régimen X</text>
      <text x="190" y="160" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2" letter-spacing="0.06em">EJE ÚNICO: IUE</text>
    </svg>`,

    // Step 1: añadir eje vertical IAE, espacio 2D
    () => `<svg viewBox="0 0 380 240" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="190" x2="340" y2="190" stroke="#C8C5BC" stroke-width="1.5"/>
      <line x1="190" y1="20" x2="190" y2="190" stroke="#C8C5BC" stroke-width="1.5" stroke-dasharray="4 3"/>
      <circle cx="40" cy="190" r="5" fill="#1B5C9E"/>
      <circle cx="340" cy="190" r="5" fill="#8B1A1A"/>
      <text x="40" y="208" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">Izquierda</text>
      <text x="340" y="208" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">Derecha</text>
      <text x="178" y="28" text-anchor="end" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2">IAE alto</text>
      <text x="178" y="188" text-anchor="end" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2">IAE=0</text>
      <circle cx="220" cy="120" r="8" fill="#E07B20" stroke="white" stroke-width="2"/>
      <text x="232" y="116" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">régimen X</text>
      <text x="190" y="228" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2" letter-spacing="0.06em">ESPACIO 2D: IUE + IAE</text>
    </svg>`,

    // Step 2: triángulo completo con los 3 vértices
    () => `<svg viewBox="0 0 380 280" xmlns="http://www.w3.org/2000/svg">
      <polygon points="190,20 40,250 340,250" fill="#F0EDE6" stroke="#C8C5BC" stroke-width="1.5"/>
      <polygon points="190,20 40,250 115,250 145,145" fill="#4A90D9" fill-opacity="0.07"/>
      <polygon points="190,20 340,250 265,250 235,145" fill="#8B1A1A" fill-opacity="0.07"/>
      <circle cx="190" cy="20" r="5" fill="#4A90D9"/>
      <circle cx="40" cy="250" r="5" fill="#C0392B"/>
      <circle cx="340" cy="250" r="5" fill="#8B1A1A"/>
      <text x="190" y="13" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">Anarquía</text>
      <text x="24" y="264" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">Comunismo</text>
      <text x="356" y="264" text-anchor="end" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">Fascismo</text>
      <circle cx="190" cy="105" r="6" fill="#1B5C9E" fill-opacity="0.85"/>
      <text x="200" y="109" font-family="DM Sans,sans-serif" font-size="9" fill="#3D3C38">Noruega</text>
      <circle cx="200" cy="140" r="6" fill="#2874A6" fill-opacity="0.85"/>
      <text x="210" y="144" font-family="DM Sans,sans-serif" font-size="9" fill="#3D3C38">EE.UU.</text>
      <circle cx="175" cy="185" r="6" fill="#C0392B" fill-opacity="0.85"/>
      <text x="185" y="189" font-family="DM Sans,sans-serif" font-size="9" fill="#3D3C38">China</text>
      <text x="190" y="272" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2" letter-spacing="0.06em">EL TRIÁNGULO POLÍTICO</text>
    </svg>`,
  ];

  let currentStep = 0;

  function renderStep(idx) {
    animContainer.innerHTML = steps[idx]();
    // Actualizar textos
    document.querySelectorAll('.hero-exp-step').forEach(p => {
      p.classList.toggle('active', parseInt(p.dataset.step) === idx);
    });
    // Actualizar dots
    document.querySelectorAll('.exp-dot').forEach(dot => {
      dot.classList.toggle('active', parseInt(dot.dataset.step) === idx);
    });
    // Botones
    const prev = document.getElementById('expPrev');
    const next = document.getElementById('expNext');
    if (prev) prev.disabled = idx === 0;
    if (next) next.disabled = idx === steps.length - 1;
    if (next) next.textContent = idx === steps.length - 2 ? 'Ver el modelo →' : 'Siguiente →';
  }

  const prevBtn = document.getElementById('expPrev');
  const nextBtn = document.getElementById('expNext');

  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (currentStep > 0) { currentStep--; renderStep(currentStep); }
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length - 1) { currentStep++; renderStep(currentStep); }
    else { document.getElementById('triangulo')?.scrollIntoView({ behavior: 'smooth' }); }
  });

  document.querySelectorAll('.exp-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      currentStep = parseInt(dot.dataset.step);
      renderStep(currentStep);
    });
  });

  renderStep(0);
}

/* ══════════════════════════════════════════════════
   12. INIT
══════════════════════════════════════════════════ */
function init() {
  // Añadir clases reveal a elementos
  document.querySelectorAll('.index-card, .met-block').forEach(el => {
    el.classList.add('reveal');
  });

  initNav();
  initHeroTriangle();
  initHeroExplainer();
  initTriangle();
  updatePositionPanel();
  updateContextReading();
  updateIUEAxis();
  initIndexCards();
  initCasos();
  initScrollReveal();

  // Héroe: animaciones de entrada
  document.querySelectorAll('.hero > *').forEach((el, i) => {
    el.classList.add('fade-up', `fade-up-delay-${i + 1}`);
  });
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
