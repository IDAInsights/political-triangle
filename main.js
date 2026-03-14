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
    desc: 'Alto control civil (IAEc elevado) con economía parcialmente liberalizada (IAEe moderado). Asimetría estructural.',
    indices: { iac: 78, iaee: 55 },
  },
  {
    id: 'venezuela',
    label: 'Venezuela',
    periodo: '2010s',
    iae: 72,
    iue: -65,
    color: '#E07B20',
    zona: 'Autoritarismo izquierdista',
    desc: 'Expansión estatal con proyecto homogeneizador económico. Alta presencia del aparato civil y económico.',
    indices: { iac: 65, iaee: 70 },
  },
  {
    id: 'iran',
    label: 'Irán',
    periodo: 'actual',
    iae: 75,
    iue: 80,
    color: '#8B1A1A',
    zona: 'Teocracia autoritaria',
    desc: 'Estado con fuerte orientación religiosa particularista. Alto control civil con legitimación teológica.',
    indices: { iac: 78, iaee: 50 },
  },
  {
    id: 'somalia',
    label: 'Somalia',
    periodo: '1990s',
    iae: 8,
    iue: 0,
    color: '#888',
    zona: 'Estado fallido',
    desc: 'Colapso del Estado. IAE cercano a 0: el monopolio de la violencia se fragmenta entre actores no estatales.',
    indices: { iac: 10, iaee: 5 },
  },
  {
    id: 'suecia_80',
    label: 'Suecia',
    periodo: '1980s',
    iae: 62,
    iue: -55,
    color: '#0F6E5A',
    zona: 'Social democracia plena',
    desc: 'Modelo de Estado de bienestar en su punto de mayor expansión. Alto alcance con orientación redistributiva.',
    indices: { iac: 22, iaee: 68 },
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

  // Modo especialista
  toggle.addEventListener('click', () => {
    state.expertMode = !state.expertMode;
    document.body.classList.toggle('expert-mode', state.expertMode);
    modeLabel.textContent = state.expertMode ? 'Modo público' : 'Modo especialista';
    // Actualizar cards de índices
    updateIndexCards();
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

  // Actualizar punto desde sliders
  function updateFromSliders() {
    state.iae = parseInt(iaeSlider.value, 10);
    state.iue = parseInt(iueSlider.value, 10);
    iaeValEl.textContent = state.iae;
    iueValEl.textContent = state.iue >= 0 ? '+' + state.iue : state.iue;
    renderUserPoint();
    updatePositionPanel();
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

    // Sincronizar sliders
    iaeSlider.value = state.iae;
    iueSlider.value = state.iue;
    iaeValEl.textContent = state.iae;
    iueValEl.textContent = state.iue >= 0 ? '+' + state.iue : state.iue;

    renderUserPoint();
    updatePositionPanel();
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
  // Vértices: A(250,30) C(60,430) F(440,430)
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
    item.innerHTML = `
      <span class="caso-dot" style="background:${caso.color}"></span>
      <div class="caso-info">
        <div class="caso-name">
          ${caso.label}
          <span class="caso-period">${caso.periodo}</span>
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
  });

  function activateCaso(id) {
    state.activeCaso = id;
    // Resaltar en lista
    document.querySelectorAll('.caso-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });
    // Resaltar en SVG
    document.querySelectorAll('.caso-point').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });
  }
}

/* ══════════════════════════════════════════════════
   9. TARJETAS DE ÍNDICES — toggle individual
══════════════════════════════════════════════════ */
function initIndexCards() {
  document.querySelectorAll('.index-card').forEach(card => {
    const toggle = card.querySelector('.card-toggle');
    const technical = card.querySelector('.card-technical');
    if (!toggle || !technical) return;

    toggle.addEventListener('click', () => {
      const isHidden = technical.hidden;
      technical.hidden = !isHidden;
      toggle.textContent = isHidden ? 'Ocultar fórmula ↑' : 'Ver fórmula ↓';
    });
  });
}

function updateIndexCards() {
  // En modo especialista, las tarjetas técnicas se muestran via CSS
  // Solo actualizamos el texto del toggle
  document.querySelectorAll('.card-toggle').forEach(btn => {
    btn.textContent = state.expertMode ? '' : 'Ver fórmula ↓';
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

    <!-- Triángulo base -->
    <polygon points="210,30 40,370 380,370"
      fill="url(#heroGrad)"
      stroke="#C8C5BC"
      stroke-width="1.5"/>

    <!-- Zonas de color suave -->
    <polygon points="210,30 40,370 125,370 155,220"
      fill="#4A90D9" fill-opacity="0.08"/>
    <polygon points="210,30 380,370 295,370 265,220"
      fill="#8B1A1A" fill-opacity="0.08"/>
    <polygon points="125,370 295,370 210,200"
      fill="#555" fill-opacity="0.06"/>

    <!-- Líneas de referencia internas -->
    <line x1="210" y1="30" x2="210" y2="370" stroke="#C8C5BC" stroke-width="0.5" stroke-dasharray="3 4"/>
    <line x1="125" y1="200" x2="295" y2="200" stroke="#C8C5BC" stroke-width="0.5" stroke-dasharray="3 4"/>

    <!-- Etiquetas de vértice -->
    <circle cx="210" cy="30" r="5" fill="#4A90D9"/>
    <circle cx="40" cy="370" r="5" fill="#C0392B"/>
    <circle cx="380" cy="370" r="5" fill="#8B1A1A"/>

    <text x="210" y="18" text-anchor="middle"
      font-family="DM Sans, sans-serif" font-size="11" fill="#6B6A65">Anarquía</text>
    <text x="20" y="388" text-anchor="start"
      font-family="DM Sans, sans-serif" font-size="11" fill="#6B6A65">Comunismo</text>
    <text x="400" y="388" text-anchor="end"
      font-family="DM Sans, sans-serif" font-size="11" fill="#6B6A65">Fascismo</text>

    <!-- Etiquetas de zona -->
    <text x="210" y="145" text-anchor="middle"
      font-family="DM Sans, sans-serif" font-size="10" fill="#A8A7A2"
      letter-spacing="0.06em">LIBERALISMO</text>
    <text x="210" y="290" text-anchor="middle"
      font-family="DM Sans, sans-serif" font-size="10" fill="#A8A7A2"
      letter-spacing="0.06em">INTERVENCIONISMO</text>

    <!-- Algunos puntos de regímenes -->
    <circle cx="210" cy="145" r="6" fill="#1B5C9E" fill-opacity="0.8"/>
    <text x="222" y="149" font-family="DM Sans, sans-serif" font-size="9" fill="#3D3C38">Noruega</text>

    <circle cx="196" cy="185" r="6" fill="#2874A6" fill-opacity="0.8"/>
    <text x="208" y="189" font-family="DM Sans, sans-serif" font-size="9" fill="#3D3C38">EE.UU.</text>

    <circle cx="225" cy="268" r="6" fill="#C0392B" fill-opacity="0.8"/>
    <text x="237" y="272" font-family="DM Sans, sans-serif" font-size="9" fill="#3D3C38">China</text>

    <circle cx="138" cy="290" r="6" fill="#E07B20" fill-opacity="0.8"/>
    <text x="150" y="294" font-family="DM Sans, sans-serif" font-size="9" fill="#3D3C38">Venezuela</text>

    <!-- Eje IUE inferior -->
    <text x="65" y="358" text-anchor="middle"
      font-family="DM Sans, sans-serif" font-size="9" fill="#A8A7A2">← Progresista</text>
    <text x="355" y="358" text-anchor="middle"
      font-family="DM Sans, sans-serif" font-size="9" fill="#A8A7A2">Conservador →</text>
  </svg>`;
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
  initTriangle();
  updatePositionPanel();
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
