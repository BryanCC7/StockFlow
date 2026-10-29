/* ============================================================
   StockFlow — SPA en JavaScript vanilla
   Rutas hash, fetch a /api (mismo origen), render por plantillas.
   ============================================================ */
'use strict';

/* ----------------------------- Configuración ----------------------------- */

const API_BASE = window.location.origin + '/api';
const STOCK_MIN_KEY = 'stockflow.stockMinimo';
const DEFAULT_STOCK_MIN = 5;
const PAGE_SIZE_PRODUCTOS = 8;
const PAGE_SIZE_CLIENTES = 10;
const PAGE_SIZE_PEDIDOS = 10;

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/* -------------------------------- Iconos -------------------------------- */

const svgIcon = (paths, size = 18) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" ` +
  `stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  plus: svgIcon('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  minus: svgIcon('<path d="M5 12h14"/>'),
  pencil: svgIcon('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>', 16),
  trash: svgIcon('<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/>', 16),
  check: svgIcon('<path d="M20 6L9 17l-5-5"/>', 16),
  x: svgIcon('<path d="M18 6L6 18"/><path d="M6 6l12 12"/>', 16),
  eye: svgIcon('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>', 16),
  chevronLeft: svgIcon('<path d="M15 18l-6-6 6-6"/>', 15),
  chevronRight: svgIcon('<path d="M9 18l6-6-6-6"/>', 15),
  arrowLeft: svgIcon('<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>', 15),
  alert: svgIcon('<path d="M12 3l9.5 17H2.5L12 3z"/><path d="M12 9v5"/><path d="M12 17.5h.01"/>', 18),
  box: svgIcon('<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 7.5L12 12.5l8.7-5"/><path d="M12 12.5V21"/>', 18),
  truck: svgIcon('<path d="M1 4h12v11H1z"/><path d="M13 8h4l3 3v4h-7"/><circle cx="5.5" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/>', 18),
  clock: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 18),
  users: svgIcon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', 18),
  info: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>', 16),
  success: svgIcon('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>', 16)
};

/* --------------------------------- Utils -------------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(value) {
  return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function fmtCLP(value) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? Math.round(num) : 0;
  return '$' + new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(safe);
}

function fmtDate(value) {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return esc(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function fmtDateTime(value) {
  if (!value) return '—';
  const raw = String(value);
  const time = raw.length >= 16 ? raw.slice(11, 16) : '';
  return time ? `${fmtDate(raw)} · ${time}` : fmtDate(raw);
}

function localISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayLong() {
  try {
    return new Intl.DateTimeFormat('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());
  } catch {
    return localISO(new Date());
  }
}

function lastMonths(count) {
  const out = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    out.push({
      label: MESES_CORTOS[start.getMonth()],
      desde: localISO(start),
      hasta: localISO(end)
    });
  }
  return out;
}

function stockMinimoMap() {
  try {
    const raw = JSON.parse(localStorage.getItem(STOCK_MIN_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

function getStockMinimo(id) {
  const map = stockMinimoMap();
  const value = map[String(id)];
  return Number.isFinite(Number(value)) && value !== null && value !== '' ? Number(value) : DEFAULT_STOCK_MIN;
}

function setStockMinimo(id, value) {
  if (id === undefined || id === null) return;
  const map = stockMinimoMap();
  const num = Number(value);
  if (Number.isFinite(num) && num >= 0) map[String(id)] = Math.round(num);
  else delete map[String(id)];
  try {
    localStorage.setItem(STOCK_MIN_KEY, JSON.stringify(map));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '??';
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

/* ------------------------------- Cliente API ----------------------------- */

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function api(path, options = {}) {
  const { method = 'GET', body } = options;
  const init = { method, headers: {} };
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(API_BASE + path, init);
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica que la aplicación esté en ejecución.', 0, null);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }

  if (!response.ok) {
    const message = (data && (data.detail || data.message || data.title)) ||
      (text && text.slice(0, 300)) ||
      `Error ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

/* --------------------------------- Estado -------------------------------- */

const state = {
  productos: {
    page: 0,
    size: PAGE_SIZE_PRODUCTOS,
    nombre: '',
    categoria: '',
    precioMin: '',
    precioMax: '',
    total: 0,
    items: [],
    categorias: []
  },
  clientes: { page: 0, size: PAGE_SIZE_CLIENTES, nombre: '', total: 0, items: [], selectedId: null },
  pedidos: { page: 0, size: PAGE_SIZE_PEDIDOS, estado: '', fechaDesde: '', fechaHasta: '', total: 0, items: [] },
  nuevoPedido: { clienteId: '', busqueda: '', cart: {}, clientes: [], productos: [] },
  reportes: { rango: { desde: '', hasta: '' } }
};

/* ---------------------------- Toasts y modales --------------------------- */

function toast(message, type = 'success') {
  const root = $('#toastRoot');
  if (!root) return;
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  const icon = type === 'error' ? ICONS.alert : type === 'info' ? ICONS.info : ICONS.success;
  node.innerHTML = `${icon}<span>${esc(message)}</span>`;
  root.appendChild(node);
  window.setTimeout(() => {
    node.classList.add('hide');
    window.setTimeout(() => node.remove(), 220);
  }, 3000);
}

function showModal(innerHtml, wide = false) {
  const root = $('#modalRoot');
  if (!root) return;
  root.innerHTML = `<div class="modal-backdrop">
    <div class="modal${wide ? ' modal-wide' : ''}" role="dialog" aria-modal="true">${innerHtml}</div>
  </div>`;
  document.body.classList.add('modal-open');
  const firstInput = root.querySelector('input, select, textarea');
  if (firstInput) window.setTimeout(() => firstInput.focus(), 40);
}

function closeModal() {
  const root = $('#modalRoot');
  if (root) root.innerHTML = '';
  document.body.classList.remove('modal-open');
}

/* ------------------------------ Bloques UI ------------------------------- */

const loadingBlock = () => '<div class="loading"><span class="spinner"></span><span>Cargando…</span></div>';

const emptyInline = (message, icon = 'box') =>
  `<div class="empty">${ICONS[icon] || ICONS.box}<span>${esc(message)}</span></div>`;

const inlineError = (error) =>
  `<div class="banner banner-error">${ICONS.alert}<span>${esc(error && error.message ? error.message : 'No se pudo cargar la información.')}</span></div>`;

function errorState(error) {
  return `<div class="card error-state">
    ${ICONS.alert}
    <h2>Algo salió mal</h2>
    <p>${esc(error && error.message ? error.message : 'Error inesperado')}</p>
    <button class="btn btn-primary" type="button" data-action="reload">Reintentar</button>
  </div>`;
}

function estadoBadge(estado) {
  const value = String(estado || '').toUpperCase();
  const cls = value === 'CONFIRMADO' ? 'badge-success'
    : value === 'CANCELADO' ? 'badge-danger'
      : value === 'PENDIENTE' ? 'badge-warning'
        : 'badge-neutral';
  return `<span class="badge ${cls}">${esc(value || '—')}</span>`;
}

function statCard(key, label, icon, tone, value) {
  return `<article class="stat-card stat-${tone}">
    <div class="stat-icon">${ICONS[icon]}</div>
    <div>
      <p class="stat-label">${esc(label)}</p>
      <p class="stat-value" data-stat="${key}">${esc(value)}</p>
    </div>
  </article>`;
}

function paginationHtml({ page, size, total, label, prevAction, nextAction }) {
  const from = total === 0 ? 0 : page * size + 1;
  const to = Math.min(total, (page + 1) * size);
  const totalPages = Math.max(1, Math.ceil(total / size));
  return `<div class="pagination">
    <span class="pagination-info">Mostrando ${from}-${to} de ${total} ${esc(label)}</span>
    <div class="pagination-controls">
      <button class="btn btn-ghost" type="button" data-action="${prevAction}" ${page <= 0 ? 'disabled' : ''}>
        ${ICONS.chevronLeft}<span>Anterior</span>
      </button>
      <button class="btn btn-ghost" type="button" data-action="${nextAction}" ${page >= totalPages - 1 ? 'disabled' : ''}>
        <span>Siguiente</span>${ICONS.chevronRight}
      </button>
    </div>
  </div>`;
}

/* -------------------------------- Router -------------------------------- */

const TITLES = {
  dashboard: 'Dashboard',
  productos: 'Productos',
  clientes: 'Clientes',
  pedidos: 'Pedidos',
  'pedidos/nuevo': 'Nuevo pedido',
  reportes: 'Reportes'
};

function currentRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  return raw || 'dashboard';
}

function setActiveNav(route) {
  const base = route.split('/')[0];
  $$('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === base);
    if (link.dataset.nav === base) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

async function router() {
  const route = currentRoute();
  setActiveNav(route);
  closeSidebar();
  closeModal();
  document.title = `${TITLES[route] || 'StockFlow'} — StockFlow`;

  const view = $('#view');
  if (!view) return;
  view.innerHTML = loadingBlock();
  window.scrollTo({ top: 0, behavior: 'auto' });

  const render = {
    dashboard: renderDashboard,
    productos: renderProductos,
    clientes: renderClientes,
    pedidos: renderPedidos,
    'pedidos/nuevo': renderNuevoPedido,
    reportes: renderReportes
  }[route];

  if (!render) {
    view.innerHTML = `<div class="card error-state">
      ${ICONS.alert}
      <h2>Página no encontrada</h2>
      <p>La ruta <strong>#/${esc(route)}</strong> no existe.</p>
      <a class="btn btn-primary" href="#/dashboard">Volver al dashboard</a>
    </div>`;
    return;
  }

  try {
    await render(view);
  } catch (error) {
    view.innerHTML = errorState(error);
  }
}

/* ------------------------------- Dashboard ------------------------------ */

async function renderDashboard(view) {
  view.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Hola, Camila. Este es el resumen de tu operación de hoy.</h1>
      </div>
    </div>

    <section class="stat-grid" aria-label="Métricas principales">
      ${statCard('productos', 'Total de productos', 'box', 'violet', '—')}
      ${statCard('confirmados', 'Órdenes entregadas', 'truck', 'emerald', '—')}
      ${statCard('pendientes', 'Pedidos pendientes', 'clock', 'amber', '—')}
      ${statCard('bajos', 'Productos con stock bajo', 'alert', 'red', '—')}
    </section>

    <div class="dash-grid">
      <section class="card">
        <div class="card-head">
          <div>
            <h2 class="card-title">Ventas por período</h2>
            <p class="card-sub">Últimos 6 meses</p>
          </div>
          <div class="card-total" id="ventasTotal"><span>Total</span>—</div>
        </div>
        <div id="ventasChart">${loadingBlock()}</div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <h2 class="card-title">Alertas de stock bajo</h2>
            <p class="card-sub">Stock igual o bajo el mínimo (${DEFAULT_STOCK_MIN} un.)</p>
          </div>
        </div>
        <div id="stockAlertas">${loadingBlock()}</div>
      </section>
    </div>

    <section class="card">
      <div class="card-head">
        <div>
          <h2 class="card-title">Últimos pedidos</h2>
          <p class="card-sub">Movimientos más recientes</p>
        </div>
        <a class="back-link" href="#/pedidos">Ver todos ${ICONS.chevronRight}</a>
      </div>
      <div id="ultimosPedidos">${loadingBlock()}</div>
    </section>
  `;

  loadDashboardMetrics();
  loadVentasChart();
  loadStockAlertas();
  loadUltimosPedidos();
}

async function loadDashboardMetrics() {
  const demo = { productos: 248, confirmados: 186, pendientes: 18, bajos: 3 };
  const keys = ['productos', 'confirmados', 'pendientes', 'bajos'];
  const results = await Promise.allSettled([
    api('/productos?size=1'),
    api('/pedidos?estado=CONFIRMADO&size=1'),
    api('/pedidos?estado=PENDIENTE&size=1'),
    api('/productos/stock-bajo?umbral=' + DEFAULT_STOCK_MIN)
  ]);

  const allFailed = results.every((r) => r.status === 'rejected');

  results.forEach((result, index) => {
    const el = document.querySelector(`[data-stat="${keys[index]}"]`);
    if (!el) return;
    if (result.status === 'fulfilled') {
      const value = index === 3
        ? (Array.isArray(result.value) ? result.value.length : 0)
        : Number(result.value && result.value.totalElements) || 0;
      el.textContent = new Intl.NumberFormat('es-CL').format(value);
    } else {
      el.textContent = allFailed ? String(demo[keys[index]]) : '—';
    }
  });

  if (allFailed) {
    const grid = document.querySelector('.stat-grid');
    if (grid) {
      grid.insertAdjacentHTML('afterend',
        `<div class="banner banner-info">${ICONS.info}<span>Mostrando datos de demostración: no se pudo conectar con la API.</span></div>`);
    }
  }
}

async function loadVentasChart() {
  const host = document.getElementById('ventasChart');
  if (!host) return;
  const months = lastMonths(6);
  const results = await Promise.allSettled(
    months.map((m) => api(`/reportes/ventas?desde=${m.desde}&hasta=${m.hasta}`))
  );

  let values = months.map((_, i) => (results[i].status === 'fulfilled'
    ? Number(results[i].value && results[i].value.totalVendido) || 0
    : null));
  let demo = false;
  let demoNote = '';

  if (values.every((v) => v === null)) {
    demo = true;
    demoNote = 'Datos de demostración (API no disponible).';
    values = [1250000, 980000, 1430000, 1120000, 1670000, 1510000];
  } else {
    values = values.map((v) => (v === null ? 0 : v));
    if (values.reduce((acc, v) => acc + v, 0) === 0) {
      demo = true;
      demoNote = 'Datos de demostración: no hay ventas registradas en los últimos 6 meses.';
      values = [1250000, 980000, 1430000, 1120000, 1670000, 1510000];
    }
  }

  const max = Math.max(...values, 1);
  const total = values.reduce((acc, v) => acc + v, 0);
  const bars = months.map((month, i) => {
    const height = Math.max(4, Math.round((values[i] / max) * 100));
    return `<div class="bar-col">
      <div class="bar-track">
        <div class="bar${values[i] === 0 ? ' muted' : ''}" style="height:${height}%" title="${esc(month.label)}: ${fmtCLP(values[i])}"></div>
      </div>
      <span class="bar-label">${esc(month.label)}</span>
    </div>`;
  }).join('');

  host.innerHTML = `<div class="chart"><div class="chart-bars">${bars}</div></div>
    ${demo ? `<p class="chart-note">${esc(demoNote)}</p>` : ''}`;

  const totalEl = document.getElementById('ventasTotal');
  if (totalEl) totalEl.innerHTML = `<span>Total</span>${fmtCLP(total)}`;
}

async function loadStockAlertas() {
  const host = document.getElementById('stockAlertas');
  if (!host) return;
  try {
    const items = await api('/productos/stock-bajo?umbral=' + DEFAULT_STOCK_MIN);
    if (!Array.isArray(items) || items.length === 0) {
      host.innerHTML = emptyInline('Sin alertas: todo el stock está sobre el mínimo.', 'success');
      return;
    }
    const rows = items.slice(0, 6).map((p) => `<tr>
      <td><span class="strong">${esc(p.nombre)}</span></td>
      <td class="num"><span class="pill pill-danger">${esc(p.stockActual)} un.</span></td>
      <td class="num">${getStockMinimo(p.id)} un.</td>
    </tr>`).join('');
    host.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr><th>Producto</th><th class="num">Stock actual</th><th class="num">Stock mínimo</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
  } catch (error) {
    host.innerHTML = inlineError(error);
  }
}

async function loadUltimosPedidos() {
  const host = document.getElementById('ultimosPedidos');
  if (!host) return;
  try {
    const data = await api('/pedidos?size=5&sort=fecha,desc');
    const items = (data && data.content) || [];
    if (!items.length) {
      host.innerHTML = emptyInline('Todavía no hay pedidos registrados.', 'box');
      return;
    }
    const rows = items.map((p) => {
      const unidades = (p.detalles || []).reduce((acc, d) => acc + (Number(d.cantidad) || 0), 0);
      return `<tr>
        <td class="mono">#${esc(p.id)}</td>
        <td><span class="strong">${esc(p.clienteNombre || '—')}</span></td>
        <td>${fmtDate(p.fecha)}</td>
        <td class="num">${unidades}</td>
        <td class="num">${fmtCLP(p.total)}</td>
        <td>${estadoBadge(p.estado)}</td>
      </tr>`;
    }).join('');
    host.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr>
        <th>Pedido</th><th>Cliente</th><th>Fecha</th>
        <th class="num">Unidades</th><th class="num">Total</th><th>Estado</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
  } catch (error) {
    host.innerHTML = inlineError(error);
  }
}

/* ------------------------------- Productos ------------------------------ */

async function ensureCategorias() {
  if (state.productos.categorias.length) return;
  try {
    const data = await api('/productos?size=200');
    const set = new Set(((data && data.content) || []).map((p) => p.categoria).filter(Boolean));
    state.productos.categorias = Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  } catch {
    state.productos.categorias = [];
  }
}

async function renderProductos(view) {
  await ensureCategorias();
  const s = state.productos;
  const opcionesCategoria = s.categorias
    .map((c) => `<option value="${esc(c)}"${c === s.categoria ? ' selected' : ''}>${esc(c)}</option>`)
    .join('');

  view.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Productos</h1>
        <p class="subtitle">Administra tu catálogo, precios y disponibilidad de inventarios.</p>
      </div>
      <button class="btn btn-primary" type="button" data-action="producto-nuevo">${ICONS.plus} Nuevo producto</button>
    </div>

    <section class="card">
      <form class="filters" id="productoFilters">
        <div class="field grow">
          <label for="fNombre">Buscar por nombre</label>
          <input class="input" id="fNombre" name="nombre" type="search" placeholder="Ej. Caf\u00e9 grano" value="${esc(s.nombre)}">
        </div>
        <div class="field">
          <label for="fCategoria">Categoría</label>
          <select class="select" id="fCategoria" name="categoria">
            <option value="">Todas</option>
            ${opcionesCategoria}
          </select>
        </div>
        <div class="field">
          <label for="fPrecioMin">Precio mín.</label>
          <input class="input" id="fPrecioMin" name="precioMin" type="number" min="0" step="1" placeholder="0" value="${esc(s.precioMin)}">
        </div>
        <div class="field">
          <label for="fPrecioMax">Precio máx.</label>
          <input class="input" id="fPrecioMax" name="precioMax" type="number" min="0" step="1" placeholder="999999" value="${esc(s.precioMax)}">
        </div>
        <div class="field field-actions">
          <button class="btn btn-primary" type="submit">Filtrar</button>
          <button class="btn btn-ghost" type="button" data-action="producto-limpiar">Limpiar</button>
        </div>
      </form>

      <div id="productosTable">${loadingBlock()}</div>
    </section>
  `;

  const form = document.getElementById('productoFilters');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      s.nombre = String(data.get('nombre') || '').trim();
      s.categoria = String(data.get('categoria') || '');
      s.precioMin = String(data.get('precioMin') || '');
      s.precioMax = String(data.get('precioMax') || '');
      s.page = 0;
      loadProductosTable();
    });
  }

  await loadProductosTable();
}

async function loadProductosTable() {
  const host = document.getElementById('productosTable');
  if (!host) return;
  const s = state.productos;
  host.innerHTML = loadingBlock();

  const params = new URLSearchParams({ page: String(s.page), size: String(s.size), sort: 'id,asc' });
  if (s.nombre) params.set('nombre', s.nombre);
  if (s.categoria) params.set('categoria', s.categoria);
  if (s.precioMin !== '') params.set('precioMin', s.precioMin);
  if (s.precioMax !== '') params.set('precioMax', s.precioMax);

  try {
    const data = await api('/productos?' + params.toString());
    s.items = (data && data.content) || [];
    s.total = Number(data && data.totalElements) || 0;

    if (!s.items.length) {
      host.innerHTML = emptyInline('No se encontraron productos con esos filtros.', 'box');
      return;
    }

    const rows = s.items.map((p) => {
      const minimo = getStockMinimo(p.id);
      const bajo = Number(p.stockActual) <= minimo;
      return `<tr>
        <td class="mono">#${esc(p.id)}</td>
        <td><span class="strong">${esc(p.nombre)}</span></td>
        <td><span class="chip">${esc(p.categoria || 'Sin categoría')}</span></td>
        <td class="num">${fmtCLP(p.precio)}</td>
        <td class="num">
          <span class="cell-stock">
            ${bajo ? '<span class="pill pill-danger">Stock bajo</span>' : ''}
            <span>${esc(p.stockActual)}</span>
          </span>
        </td>
        <td class="num">${minimo}</td>
        <td class="actions">
          <button class="icon-btn" type="button" data-action="producto-editar" data-id="${esc(p.id)}" title="Editar" aria-label="Editar ${esc(p.nombre)}">${ICONS.pencil}</button>
          <button class="icon-btn danger" type="button" data-action="producto-eliminar" data-id="${esc(p.id)}" title="Eliminar" aria-label="Eliminar ${esc(p.nombre)}">${ICONS.trash}</button>
        </td>
      </tr>`;
    }).join('');

    host.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr>
        <th>ID</th><th>Nombre</th><th>Categoría</th><th class="num">Precio CLP</th>
        <th class="num">Stock actual</th><th class="num">Stock mínimo</th><th class="actions">Acciones</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${paginationHtml({
      page: s.page, size: s.size, total: s.total, label: 'productos',
      prevAction: 'productos-prev', nextAction: 'productos-next'
    })}`;
  } catch (error) {
    host.innerHTML = inlineError(error);
  }
}

function openProductoModal(producto) {
  const isEdit = Boolean(producto);
  const minimo = isEdit ? getStockMinimo(producto.id) : DEFAULT_STOCK_MIN;
  const categorias = state.productos.categorias
    .map((c) => `<option value="${esc(c)}"></option>`).join('');

  showModal(`
    <form id="productoForm" class="form-grid" novalidate>
      <div class="modal-head">
        <h2>${isEdit ? 'Editar producto' : 'Nuevo producto'}</h2>
        <button class="icon-btn" type="button" data-close aria-label="Cerrar">${ICONS.x}</button>
      </div>
      <div class="form-body">
        <div class="field">
          <label for="pNombre">Nombre *</label>
          <input class="input" id="pNombre" name="nombre" maxlength="140" required
            value="${isEdit ? esc(producto.nombre) : ''}" placeholder="Ej. Café grano 1kg">
        </div>
        <div class="field">
          <label for="pCategoria">Categoría</label>
          <input class="input" id="pCategoria" name="categoria" maxlength="80" list="categoriasDisponibles"
            value="${isEdit ? esc(producto.categoria || '') : ''}" placeholder="Ej. Abarrotes">
          <datalist id="categoriasDisponibles">${categorias}</datalist>
        </div>
        <div class="row2">
          <div class="field">
            <label for="pPrecio">Precio CLP *</label>
            <input class="input" id="pPrecio" name="precio" type="number" min="1" step="1" required
              value="${isEdit ? Number(producto.precio) : ''}" placeholder="9990">
          </div>
          <div class="field">
            <label for="pStock">Stock actual *</label>
            <input class="input" id="pStock" name="stockActual" type="number" min="0" step="1" required
              value="${isEdit ? esc(producto.stockActual) : 0}">
          </div>
        </div>
        <div class="field">
          <label for="pMinimo">Stock mínimo (alerta)</label>
          <input class="input" id="pMinimo" name="stockMinimo" type="number" min="0" step="1" value="${esc(minimo)}">
          <p class="hint">La API no almacena este valor: se guarda en este navegador para calcular las alertas.</p>
        </div>
        <div class="banner banner-error" id="productoError" hidden></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" type="button" data-close>Cancelar</button>
        <button class="btn btn-primary" type="submit">${isEdit ? 'Guardar cambios' : 'Crear producto'}</button>
      </div>
    </form>
  `);

  const form = document.getElementById('productoForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errBox = document.getElementById('productoError');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn.textContent;
    if (errBox) errBox.hidden = true;

    const data = new FormData(form);
    const payload = {
      nombre: String(data.get('nombre') || '').trim(),
      categoria: String(data.get('categoria') || '').trim() || null,
      precio: Number(data.get('precio')),
      stockActual: Number(data.get('stockActual'))
    };

    if (!payload.nombre) {
      if (errBox) { errBox.textContent = 'El nombre es obligatorio.'; errBox.hidden = false; }
      return;
    }
    if (!Number.isFinite(payload.precio) || payload.precio <= 0) {
      if (errBox) { errBox.textContent = 'El precio debe ser mayor a 0.'; errBox.hidden = false; }
      return;
    }
    if (!Number.isFinite(payload.stockActual) || payload.stockActual < 0) {
      if (errBox) { errBox.textContent = 'El stock no puede ser negativo.'; errBox.hidden = false; }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando…';

    try {
      const saved = isEdit
        ? await api(`/productos/${producto.id}`, { method: 'PUT', body: payload })
        : await api('/productos', { method: 'POST', body: payload });

      const stockMin = Number(data.get('stockMinimo'));
      setStockMinimo((saved && saved.id) || (producto && producto.id), stockMin);

      closeModal();
      toast(isEdit ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.', 'success');
      if (!isEdit) {
        // Salta a la página donde queda el producto recién creado (orden id asc).
        state.productos.page = Math.floor(state.productos.total / state.productos.size);
        state.productos.categorias = [];
        await ensureCategorias();
        const select = document.getElementById('fCategoria');
        if (select) {
          select.innerHTML = '<option value="">Todas</option>' + state.productos.categorias
            .map((c) => `<option value="${esc(c)}"${c === state.productos.categoria ? ' selected' : ''}>${esc(c)}</option>`)
            .join('');
        }
      }
      await loadProductosTable();
    } catch (error) {
      if (errBox) { errBox.textContent = error.message; errBox.hidden = false; }
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}

async function eliminarProducto(id) {
  const producto = state.productos.items.find((p) => String(p.id) === String(id));
  const nombre = producto ? producto.nombre : `producto #${id}`;
  if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;

  try {
    await api(`/productos/${id}`, { method: 'DELETE' });
    toast('Producto eliminado.', 'success');
    if (state.productos.items.length === 1 && state.productos.page > 0) state.productos.page -= 1;
    await loadProductosTable();
  } catch (error) {
    toast(error.message, 'error');
  }
}

/* -------------------------------- Clientes ------------------------------ */

async function renderClientes(view) {
  const s = state.clientes;
  view.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Clientes</h1>
        <p class="subtitle">Toda la información de tus clientes y sus compras, en un solo lugar.</p>
      </div>
      <button class="btn btn-primary" type="button" data-action="cliente-nuevo">${ICONS.plus} Nuevo cliente</button>
    </div>

    <div class="split">
      <section class="card">
        <form class="filters" id="clienteFilters">
          <div class="field grow">
            <label for="cNombre">Buscar cliente</label>
            <input class="input" id="cNombre" name="nombre" type="search" placeholder="Nombre del cliente" value="${esc(s.nombre)}">
          </div>
          <div class="field field-actions">
            <button class="btn btn-primary" type="submit">Buscar</button>
            <button class="btn btn-ghost" type="button" data-action="clientes-limpiar">Limpiar</button>
          </div>
        </form>
        <div id="clientesTable">${loadingBlock()}</div>
      </section>

      <aside class="card panel" id="clientePanel" aria-live="polite">
        ${emptyInline('Selecciona un cliente para ver su historial de pedidos.', 'users')}
      </aside>
    </div>
  `;

  const form = document.getElementById('clienteFilters');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      s.nombre = String(data.get('nombre') || '').trim();
      s.page = 0;
      s.selectedId = null;
      loadClientesTable();
      resetClientePanel();
    });
  }

  await loadClientesTable();
}

function resetClientePanel() {
  const panel = document.getElementById('clientePanel');
  if (panel) panel.innerHTML = emptyInline('Selecciona un cliente para ver su historial de pedidos.', 'users');
}

async function loadClientesTable() {
  const host = document.getElementById('clientesTable');
  if (!host) return;
  const s = state.clientes;
  host.innerHTML = loadingBlock();

  const params = new URLSearchParams({ page: String(s.page), size: String(s.size), sort: 'nombre,asc' });
  if (s.nombre) params.set('nombre', s.nombre);

  try {
    const data = await api('/clientes?' + params.toString());
    s.items = (data && data.content) || [];
    s.total = Number(data && data.totalElements) || 0;

    if (!s.items.length) {
      host.innerHTML = emptyInline('No se encontraron clientes.', 'users');
      return;
    }

    const rows = s.items.map((c) => `<tr class="clickable${String(c.id) === String(s.selectedId) ? ' selected' : ''}"
        data-action="cliente-ver" data-id="${esc(c.id)}" tabindex="0">
      <td><span class="strong">${esc(c.nombre)}</span></td>
      <td>${esc(c.email || '—')}</td>
      <td>${esc(c.telefono || '—')}</td>
      <td class="muted">—</td>
    </tr>`).join('');

    host.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Dirección</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${paginationHtml({
      page: s.page, size: s.size, total: s.total, label: 'clientes',
      prevAction: 'clientes-prev', nextAction: 'clientes-next'
    })}`;
  } catch (error) {
    host.innerHTML = inlineError(error);
  }
}

async function verCliente(id) {
  const panel = document.getElementById('clientePanel');
  if (!panel) return;

  state.clientes.selectedId = id;
  $$('#clientesTable tr[data-id]').forEach((row) => {
    row.classList.toggle('selected', String(row.dataset.id) === String(id));
  });

  panel.innerHTML = loadingBlock();

  try {
    const [cliente, pedidos] = await Promise.all([
      api(`/clientes/${id}`),
      api(`/clientes/${id}/pedidos`)
    ]);

    const lista = (Array.isArray(pedidos) ? pedidos : []).slice().sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    const totalGastado = lista
      .filter((p) => String(p.estado).toUpperCase() !== 'CANCELADO')
      .reduce((acc, p) => acc + (Number(p.total) || 0), 0);

    const items = lista.length
      ? `<ul class="order-list">${lista.map((p) => `<li>
          <div class="order-meta">
            <strong>Pedido #${esc(p.id)}</strong>
            <span>${fmtDateTime(p.fecha)}</span>
          </div>
          <div class="order-meta text-right">
            ${estadoBadge(p.estado)}
            <span class="order-amount">${fmtCLP(p.total)}</span>
          </div>
        </li>`).join('')}</ul>`
      : emptyInline('Este cliente todavía no tiene pedidos.', 'box');

    panel.innerHTML = `
      <div class="panel-head">
        <span class="avatar avatar-sm">${esc(initials(cliente.nombre))}</span>
        <div>
          <h2>${esc(cliente.nombre)}</h2>
          <p class="muted">${esc(cliente.email || 'Sin correo')}</p>
        </div>
      </div>
      <div class="panel-stats">
        <div><span>Total pedidos</span><strong>${lista.length}</strong></div>
        <div><span>Total gastado</span><strong>${fmtCLP(totalGastado)}</strong></div>
      </div>
      <p class="card-title-sm panel-section-title">Historial de pedidos</p>
      ${items}
    `;
  } catch (error) {
    panel.innerHTML = inlineError(error);
  }
}

function openClienteModal() {
  showModal(`
    <form id="clienteForm" class="form-grid" novalidate>
      <div class="modal-head">
        <h2>Nuevo cliente</h2>
        <button class="icon-btn" type="button" data-close aria-label="Cerrar">${ICONS.x}</button>
      </div>
      <div class="form-body">
        <div class="field">
          <label for="clNombre">Nombre *</label>
          <input class="input" id="clNombre" name="nombre" maxlength="120" required placeholder="Ej. Ana Torres">
        </div>
        <div class="field">
          <label for="clEmail">Correo *</label>
          <input class="input" id="clEmail" name="email" type="email" maxlength="160" required placeholder="ana.torres@mail.cl">
        </div>
        <div class="field">
          <label for="clTelefono">Teléfono</label>
          <input class="input" id="clTelefono" name="telefono" maxlength="40" placeholder="+56911111111">
        </div>
        <div class="banner banner-error" id="clienteError" hidden></div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" type="button" data-close>Cancelar</button>
        <button class="btn btn-primary" type="submit">Crear cliente</button>
      </div>
    </form>
  `);

  const form = document.getElementById('clienteForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errBox = document.getElementById('clienteError');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (errBox) errBox.hidden = true;

    const data = new FormData(form);
    const payload = {
      nombre: String(data.get('nombre') || '').trim(),
      email: String(data.get('email') || '').trim(),
      telefono: String(data.get('telefono') || '').trim() || null
    };

    if (!payload.nombre || !payload.email) {
      if (errBox) { errBox.textContent = 'Nombre y correo son obligatorios.'; errBox.hidden = false; }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando…';

    try {
      const saved = await api('/clientes', { method: 'POST', body: payload });
      closeModal();
      toast('Cliente creado correctamente.', 'success');
      // Enfoca la búsqueda en el cliente recién creado para que quede visible en la tabla.
      state.clientes.nombre = saved && saved.nombre ? saved.nombre : '';
      state.clientes.page = 0;
      state.clientes.selectedId = saved && saved.id ? saved.id : null;
      const searchInput = document.getElementById('cNombre');
      if (searchInput) searchInput.value = state.clientes.nombre;
      await loadClientesTable();
      if (saved && saved.id) verCliente(saved.id);
    } catch (error) {
      if (errBox) { errBox.textContent = error.message; errBox.hidden = false; }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Crear cliente';
    }
  });
}

/* -------------------------------- Pedidos ------------------------------- */

async function renderPedidos(view) {
  const s = state.pedidos;
  view.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Pedidos</h1>
        <p class="subtitle">Gestiona los pedidos de tus clientes.</p>
      </div>
      <a class="btn btn-primary" href="#/pedidos/nuevo">${ICONS.plus} Nuevo pedido</a>
    </div>

    <section class="card">
      <form class="filters" id="pedidoFilters">
        <div class="field">
          <label for="fEstado">Estado</label>
          <select class="select" id="fEstado" name="estado">
            <option value="">Todos</option>
            <option value="PENDIENTE"${s.estado === 'PENDIENTE' ? ' selected' : ''}>Pendiente</option>
            <option value="CONFIRMADO"${s.estado === 'CONFIRMADO' ? ' selected' : ''}>Confirmado</option>
            <option value="CANCELADO"${s.estado === 'CANCELADO' ? ' selected' : ''}>Cancelado</option>
          </select>
        </div>
        <div class="field">
          <label for="fDesde">Desde</label>
          <input class="input" id="fDesde" name="fechaDesde" type="date" value="${esc(s.fechaDesde)}">
        </div>
        <div class="field">
          <label for="fHasta">Hasta</label>
          <input class="input" id="fHasta" name="fechaHasta" type="date" value="${esc(s.fechaHasta)}">
        </div>
        <div class="field field-actions">
          <button class="btn btn-primary" type="submit">Filtrar</button>
          <button class="btn btn-ghost" type="button" data-action="pedidos-limpiar">Limpiar</button>
        </div>
      </form>
      <div id="pedidosTable">${loadingBlock()}</div>
    </section>
  `;

  const form = document.getElementById('pedidoFilters');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      s.estado = String(data.get('estado') || '');
      s.fechaDesde = String(data.get('fechaDesde') || '');
      s.fechaHasta = String(data.get('fechaHasta') || '');
      s.page = 0;
      loadPedidosTable();
    });
  }

  await loadPedidosTable();
}

async function loadPedidosTable() {
  const host = document.getElementById('pedidosTable');
  if (!host) return;
  const s = state.pedidos;
  host.innerHTML = loadingBlock();

  const params = new URLSearchParams({ page: String(s.page), size: String(s.size), sort: 'fecha,desc' });
  if (s.estado) params.set('estado', s.estado);
  if (s.fechaDesde) params.set('fechaDesde', s.fechaDesde);
  if (s.fechaHasta) params.set('fechaHasta', s.fechaHasta);

  try {
    const data = await api('/pedidos?' + params.toString());
    s.items = (data && data.content) || [];
    s.total = Number(data && data.totalElements) || 0;

    if (!s.items.length) {
      host.innerHTML = emptyInline('No hay pedidos que coincidan con los filtros.', 'box');
      return;
    }

    const rows = s.items.map((p) => {
      return `<tr>
        <td class="mono">#${esc(p.id)}</td>
        <td><span class="strong">${esc(p.clienteNombre || '—')}</span></td>
        <td>${fmtDate(p.fecha)}</td>
        <td class="num">${fmtCLP(p.total)}</td>
        <td>${estadoBadge(p.estado)}</td>
        <td class="actions">
          <button class="icon-btn" type="button" data-action="pedido-detalle" data-id="${esc(p.id)}" title="Ver detalle" aria-label="Ver detalle del pedido ${esc(p.id)}">${ICONS.eye}</button>
        </td>
      </tr>`;
    }).join('');

    host.innerHTML = `<div class="table-wrap"><table class="table">
      <thead><tr>
        <th>ID</th><th>Cliente</th><th>Fecha</th><th class="num">Total</th><th>Estado</th><th class="actions">Acciones</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${paginationHtml({
      page: s.page, size: s.size, total: s.total, label: 'pedidos',
      prevAction: 'pedidos-prev', nextAction: 'pedidos-next'
    })}`;
  } catch (error) {
    host.innerHTML = inlineError(error);
  }
}

async function verPedido(id) {
  showModal(`
    <div class="modal-head">
      <h2>Pedido #${esc(id)}</h2>
      <button class="icon-btn" type="button" data-close aria-label="Cerrar">${ICONS.x}</button>
    </div>
    <div class="form-body" id="pedidoDetalle">${loadingBlock()}</div>
    <div class="modal-foot">
      <button class="btn btn-ghost" type="button" data-close>Cerrar</button>
    </div>
  `, true);

  const host = document.getElementById('pedidoDetalle');
  if (!host) return;

  try {
    const pedido = await api(`/pedidos/${id}`);
    const detalles = pedido.detalles || [];
    const rows = detalles.map((d) => `<tr>
      <td><span class="strong">${esc(d.productoNombre || '—')}</span></td>
      <td class="num">${esc(d.cantidad)}</td>
      <td class="num">${fmtCLP(d.precioUnitario)}</td>
      <td class="num">${fmtCLP(d.subtotal)}</td>
    </tr>`).join('');

    host.innerHTML = `
      <div class="panel-stats">
        <div><span>Cliente</span><strong>${esc(pedido.clienteNombre || '—')}</strong></div>
        <div><span>Fecha</span><strong>${fmtDateTime(pedido.fecha)}</strong></div>
        <div><span>Estado</span><strong>${estadoBadge(pedido.estado)}</strong></div>
        <div><span>Total</span><strong>${fmtCLP(pedido.total)}</strong></div>
      </div>
      ${detalles.length ? `<div class="table-wrap"><table class="table">
        <thead><tr><th>Producto</th><th class="num">Cantidad</th><th class="num">P. unitario</th><th class="num">Subtotal</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : emptyInline('Este pedido no tiene líneas de detalle.', 'box')}
    `;
  } catch (error) {
    host.innerHTML = inlineError(error);
  }
}

/* ----------------------------- Nuevo pedido ----------------------------- */

async function renderNuevoPedido(view) {
  state.nuevoPedido = { clienteId: '', busqueda: '', cart: {}, clientes: [], productos: [] };

  view.innerHTML = `
    <div class="page-head">
      <div>
        <a class="back-link" href="#/pedidos">${ICONS.arrowLeft}<span>Volver a pedidos</span></a>
        <h1>Nuevo pedido</h1>
        <p class="subtitle">Selecciona el cliente, agrega productos y registra el pedido.</p>
      </div>
    </div>

    <div class="order-grid">
      <div class="order-main">
        <section class="card">
          <h2 class="card-title-sm">1. Cliente</h2>
          <select class="select w-full" id="pedidoCliente" aria-label="Cliente">
            <option value="">Cargando clientes…</option>
          </select>
        </section>

        <section class="card">
          <h2 class="card-title-sm">2. Productos</h2>
          <input class="input w-full" id="productoBuscar" type="search"
            placeholder="Buscar producto por nombre o categoría…" aria-label="Buscar producto">
          <div class="picker" id="productoPicker">${loadingBlock()}</div>
        </section>

        <section class="card">
          <div class="card-head">
            <h2 class="card-title-sm mb-0">3. Productos del pedido</h2>
            <span class="muted" id="cartCount"></span>
          </div>
          <div id="carrito"></div>
        </section>
      </div>

      <aside class="card resumen">
        <h2 class="card-title">Resumen del pedido</h2>
        <div id="resumenBody"></div>
        <button class="btn btn-primary btn-block" type="button" data-action="registrar-pedido" id="registrarPedido" disabled>
          Registrar pedido
        </button>
        <div class="banner banner-error" id="pedidoError" hidden></div>
        <p class="hint mt-8">El stock se descuenta al registrar el pedido.</p>
      </aside>
    </div>
  `;

  const search = document.getElementById('productoBuscar');
  if (search) {
    search.addEventListener('input', () => {
      state.nuevoPedido.busqueda = search.value;
      renderPicker();
    });
  }

  const select = document.getElementById('pedidoCliente');
  if (select) {
    select.addEventListener('change', () => {
      state.nuevoPedido.clienteId = select.value;
      renderResumen();
    });
  }

  try {
    const [clientes, productos] = await Promise.all([
      api('/clientes?size=200&sort=nombre,asc'),
      api('/productos?size=200&sort=nombre,asc')
    ]);
    state.nuevoPedido.clientes = (clientes && clientes.content) || [];
    state.nuevoPedido.productos = (productos && productos.content) || [];
    renderClienteSelect();
    renderPicker();
    renderCarrito();
  } catch (error) {
    const picker = document.getElementById('productoPicker');
    if (picker) picker.innerHTML = inlineError(error);
    if (select) select.innerHTML = '<option value="">No se pudieron cargar los clientes</option>';
    const resumen = document.getElementById('resumenBody');
    if (resumen) resumen.innerHTML = inlineError(error);
  }
}

function renderClienteSelect() {
  const select = document.getElementById('pedidoCliente');
  if (!select) return;
  const np = state.nuevoPedido;
  if (!np.clientes.length) {
    select.innerHTML = '<option value="">No hay clientes registrados</option>';
    return;
  }
  select.innerHTML = '<option value="">Selecciona un cliente…</option>' +
    np.clientes.map((c) => `<option value="${esc(c.id)}">${esc(c.nombre)} · ${esc(c.email || 'sin correo')}</option>`).join('');
  select.value = np.clienteId;
}

function renderPicker() {
  const host = document.getElementById('productoPicker');
  if (!host) return;
  const np = state.nuevoPedido;

  if (!np.productos.length) {
    host.innerHTML = emptyInline('No hay productos disponibles.', 'box');
    return;
  }

  const query = np.busqueda.trim().toLowerCase();
  const list = np.productos.filter((p) => !query ||
    String(p.nombre || '').toLowerCase().includes(query) ||
    String(p.categoria || '').toLowerCase().includes(query));

  if (!list.length) {
    host.innerHTML = emptyInline('Sin resultados para tu búsqueda.', 'box');
    return;
  }

  host.innerHTML = list.slice(0, 80).map((p) => {
    const enCarrito = np.cart[p.id] ? np.cart[p.id].cantidad : 0;
    const disponible = Number(p.stockActual) - enCarrito;
    const disabled = disponible <= 0;
    return `<div class="picker-row">
      <div class="picker-info">
        <strong>${esc(p.nombre)}</strong>
        <span>${esc(p.categoria || 'Sin categoría')} · Stock ${esc(p.stockActual)}</span>
      </div>
      <span class="picker-price">${fmtCLP(p.precio)}</span>
      <button class="icon-btn" type="button" data-action="carrito-add" data-id="${esc(p.id)}"
        ${disabled ? 'disabled' : ''} title="${disabled ? 'Sin stock disponible' : 'Agregar al pedido'}"
        aria-label="Agregar ${esc(p.nombre)}">${ICONS.plus}</button>
    </div>`;
  }).join('');
}

function renderCarrito() {
  const host = document.getElementById('carrito');
  const countEl = document.getElementById('cartCount');
  if (!host) return;
  const np = state.nuevoPedido;
  const ids = Object.keys(np.cart);

  if (!ids.length) {
    host.innerHTML = emptyInline('Aún no agregaste productos. Usa el buscador de arriba.', 'box');
  } else {
    host.innerHTML = ids.map((id) => {
      const { producto, cantidad } = np.cart[id];
      return `<div class="cart-row">
        <div class="cart-info">
          <strong>${esc(producto.nombre)}</strong>
          <span>${fmtCLP(producto.precio)} c/u · Stock ${esc(producto.stockActual)}</span>
        </div>
        <div class="qty">
          <button type="button" data-action="carrito-dec" data-id="${esc(id)}" aria-label="Quitar una unidad">${ICONS.minus}</button>
          <span>${esc(cantidad)}</span>
          <button type="button" data-action="carrito-inc" data-id="${esc(id)}" aria-label="Agregar una unidad"
            ${cantidad >= Number(producto.stockActual) ? 'disabled' : ''}>${ICONS.plus}</button>
        </div>
        <span class="cart-subtotal">${fmtCLP(Number(producto.precio) * cantidad)}</span>
        <button class="icon-btn danger" type="button" data-action="carrito-remove" data-id="${esc(id)}" aria-label="Quitar ${esc(producto.nombre)}">${ICONS.trash}</button>
      </div>`;
    }).join('');
  }

  if (countEl) {
    const unidades = ids.reduce((acc, id) => acc + np.cart[id].cantidad, 0);
    countEl.textContent = ids.length ? `${ids.length} producto${ids.length === 1 ? '' : 's'} · ${unidades} un.` : '';
  }

  renderResumen();
}

function renderResumen() {
  const host = document.getElementById('resumenBody');
  const btn = document.getElementById('registrarPedido');
  if (!host) return;
  const np = state.nuevoPedido;
  const ids = Object.keys(np.cart);
  const subtotal = ids.reduce((acc, id) => acc + Number(np.cart[id].producto.precio) * np.cart[id].cantidad, 0);
  const unidades = ids.reduce((acc, id) => acc + np.cart[id].cantidad, 0);
  const cliente = np.clientes.find((c) => String(c.id) === String(np.clienteId));

  host.innerHTML = `
    <div class="resumen-line"><span>Cliente</span><strong>${cliente ? esc(cliente.nombre) : 'Sin seleccionar'}</strong></div>
    <div class="resumen-line"><span>Ítems</span><strong>${ids.length}</strong></div>
    <div class="resumen-line"><span>Unidades</span><strong>${unidades}</strong></div>
    <div class="resumen-line"><span>Subtotal</span><strong>${fmtCLP(subtotal)}</strong></div>
    <div class="resumen-total"><span>Total</span><strong>${fmtCLP(subtotal)}</strong></div>
  `;

  if (btn) btn.disabled = !np.clienteId || !ids.length;
}

function cartAdd(id) {
  const np = state.nuevoPedido;
  const producto = np.productos.find((p) => String(p.id) === String(id));
  if (!producto) return;
  const actual = np.cart[id] ? np.cart[id].cantidad : 0;

  if (actual >= Number(producto.stockActual)) {
    toast(`Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stockActual}).`, 'error');
    return;
  }

  np.cart[id] = { producto, cantidad: actual + 1 };
  renderCarrito();
  renderPicker();
}

function cartStep(id, delta) {
  const np = state.nuevoPedido;
  const entry = np.cart[id];
  if (!entry) return;
  const next = entry.cantidad + delta;

  if (next <= 0) {
    cartRemove(id);
    return;
  }
  if (next > Number(entry.producto.stockActual)) {
    toast(`Stock insuficiente para "${entry.producto.nombre}" (disponible: ${entry.producto.stockActual}).`, 'error');
    return;
  }

  entry.cantidad = next;
  renderCarrito();
  renderPicker();
}

function cartRemove(id) {
  delete state.nuevoPedido.cart[id];
  renderCarrito();
  renderPicker();
}

async function registrarPedido() {
  const np = state.nuevoPedido;
  const errBox = document.getElementById('pedidoError');
  const btn = document.getElementById('registrarPedido');
  if (errBox) errBox.hidden = true;

  if (!np.clienteId) {
    showPedidoError('Selecciona un cliente antes de registrar el pedido.');
    return;
  }

  const items = Object.keys(np.cart).map((id) => ({
    productoId: Number(np.cart[id].producto.id),
    cantidad: np.cart[id].cantidad
  }));

  if (!items.length) {
    showPedidoError('Agrega al menos un producto al pedido.');
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Registrando…'; }

  try {
    const pedido = await api('/pedidos', {
      method: 'POST',
      body: { clienteId: Number(np.clienteId), items }
    });
    toast(`Pedido #${pedido && pedido.id ? pedido.id : ''} registrado correctamente.`, 'success');
    state.pedidos.page = 0;
    state.pedidos.estado = '';
    state.pedidos.fechaDesde = '';
    state.pedidos.fechaHasta = '';
    window.location.hash = '#/pedidos';
  } catch (error) {
    showPedidoError(error.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Registrar pedido'; }
  }
}

function showPedidoError(message) {
  const errBox = document.getElementById('pedidoError');
  if (!errBox) { toast(message, 'error'); return; }
  errBox.textContent = message;
  errBox.hidden = false;
}

/* -------------------------------- Reportes ------------------------------ */

async function renderReportes(view) {
  const hoy = new Date();
  const desde = `${hoy.getFullYear()}-01-01`;
  const hasta = localISO(hoy);
  state.reportes.rango = { desde, hasta };

  view.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Reportes</h1>
        <p class="subtitle">Genera reportes para la toma de decisiones.</p>
      </div>
    </div>

    <div class="section-stack">
      <section class="card">
        <div class="card-head">
          <div>
            <h2 class="card-title">Reporte de ventas</h2>
            <p class="card-sub">Pedidos confirmados y pendientes en el rango seleccionado.</p>
          </div>
        </div>

        <form class="filters" id="reporteVentasForm">
          <div class="field">
            <label for="rDesde">Desde</label>
            <input class="input" id="rDesde" name="desde" type="date" value="${desde}" required>
          </div>
          <div class="field">
            <label for="rHasta">Hasta</label>
            <input class="input" id="rHasta" name="hasta" type="date" value="${hasta}" required>
          </div>
          <div class="field field-actions">
            <button class="btn btn-primary" type="submit">Generar</button>
          </div>
        </form>

        <div id="reporteVentas">${loadingBlock()}</div>
      </section>

      <section class="card">
        <div class="card-head">
          <div>
            <h2 class="card-title">Reporte de inventario</h2>
            <p class="card-sub">Valorización del stock actual y productos bajo el mínimo.</p>
          </div>
          <button class="btn btn-ghost" type="button" data-action="reporte-inventario">Generar</button>
        </div>
        <div id="reporteInventario">${loadingBlock()}</div>
      </section>
    </div>
  `;

  const form = document.getElementById('reporteVentasForm');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      state.reportes.rango = {
        desde: String(data.get('desde') || ''),
        hasta: String(data.get('hasta') || '')
      };
      loadReporteVentas();
    });
  }

  loadReporteVentas();
  loadReporteInventario();
}

async function loadReporteVentas() {
  const host = document.getElementById('reporteVentas');
  if (!host) return;
  const { desde, hasta } = state.reportes.rango;

  if (!desde || !hasta) {
    host.innerHTML = emptyInline('Selecciona un rango de fechas y presiona Generar.', 'box');
    return;
  }
  if (desde > hasta) {
    host.innerHTML = `<div class="banner banner-error">${ICONS.alert}<span>La fecha "desde" no puede ser posterior a "hasta".</span></div>`;
    return;
  }

  host.innerHTML = loadingBlock();

  try {
    const data = await api(`/reportes/ventas?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`);
    const items = (data && data.porProducto) || [];

    const rows = items.map((v) => `<tr>
      <td><span class="strong">${esc(v.productoNombre || '—')}</span></td>
      <td class="num">${esc(v.cantidadVendida)}</td>
      <td class="num">${fmtCLP(v.montoVendido)}</td>
    </tr>`).join('');

    host.innerHTML = `
      <div class="report-grid">
        <div class="report-tile"><span>Total pedidos</span><strong>${esc(data.numeroPedidos)}</strong></div>
        <div class="report-tile"><span>Total vendido</span><strong>${fmtCLP(data.totalVendido)}</strong></div>
        <div class="report-tile"><span>Productos vendidos</span><strong>${items.length}</strong></div>
      </div>
      <p class="report-range">Período: ${fmtDate(data.desde || desde)} — ${fmtDate(data.hasta || hasta)}</p>
      ${items.length ? `<div class="table-wrap mt-12"><table class="table">
        <thead><tr><th>Producto</th><th class="num">Cantidad vendida</th><th class="num">Monto vendido</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : emptyInline('No hay ventas registradas en este período.', 'box')}
    `;
  } catch (error) {
    host.innerHTML = inlineError(error);
  }
}

async function loadReporteInventario() {
  const host = document.getElementById('reporteInventario');
  if (!host) return;
  host.innerHTML = loadingBlock();

  try {
    const data = await api(`/reportes/inventario?umbral=${DEFAULT_STOCK_MIN}`);
    const items = (data && data.items) || [];

    const rows = items.map((i) => `<tr>
      <td><span class="strong">${esc(i.nombre)}</span></td>
      <td><span class="chip">${esc(i.categoria || 'Sin categoría')}</span></td>
      <td class="num">
        <span class="cell-stock">
          ${i.bajoStock ? '<span class="pill pill-danger">Stock bajo</span>' : ''}
          <span>${esc(i.stock)}</span>
        </span>
      </td>
      <td class="num">${getStockMinimo(i.productoId)}</td>
      <td class="num">${fmtCLP(i.valorizacion)}</td>
    </tr>`).join('');

    host.innerHTML = `
      <div class="report-grid">
        <div class="report-tile"><span>Productos</span><strong>${esc(data.totalProductos)}</strong></div>
        <div class="report-tile"><span>Stock total</span><strong>${esc(data.stockTotal)} un.</strong></div>
        <div class="report-tile"><span>Valorización total</span><strong>${fmtCLP(data.valorizacionTotal)}</strong></div>
      </div>
      ${items.length ? `<div class="table-wrap"><table class="table">
        <thead><tr>
          <th>Producto</th><th>Categoría</th><th class="num">Stock actual</th>
          <th class="num">Stock mínimo</th><th class="num">Valor stock</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : emptyInline('No hay productos en el inventario.', 'box')}
    `;
  } catch (error) {
    host.innerHTML = inlineError(error);
  }
}

/* ------------------------------ Acciones UI ----------------------------- */

async function handleAction(action, element) {
  const id = element.dataset.id;

  switch (action) {
    /* Productos */
    case 'producto-nuevo':
      openProductoModal(null);
      break;
    case 'producto-editar': {
      const producto = state.productos.items.find((p) => String(p.id) === String(id));
      if (producto) openProductoModal(producto);
      break;
    }
    case 'producto-eliminar':
      await eliminarProducto(id);
      break;
    case 'producto-limpiar':
      state.productos = {
        ...state.productos,
        page: 0, nombre: '', categoria: '', precioMin: '', precioMax: ''
      };
      await renderProductos($('#view'));
      break;
    case 'productos-prev':
      if (state.productos.page > 0) {
        state.productos.page -= 1;
        await loadProductosTable();
      }
      break;
    case 'productos-next': {
      const s = state.productos;
      if ((s.page + 1) * s.size < s.total) {
        s.page += 1;
        await loadProductosTable();
      }
      break;
    }

    /* Clientes */
    case 'cliente-nuevo':
      openClienteModal();
      break;
    case 'cliente-ver':
      await verCliente(id);
      break;
    case 'clientes-limpiar':
      state.clientes = { ...state.clientes, page: 0, nombre: '', selectedId: null };
      await renderClientes($('#view'));
      break;
    case 'clientes-prev':
      if (state.clientes.page > 0) {
        state.clientes.page -= 1;
        await loadClientesTable();
      }
      break;
    case 'clientes-next': {
      const s = state.clientes;
      if ((s.page + 1) * s.size < s.total) {
        s.page += 1;
        await loadClientesTable();
      }
      break;
    }

    /* Pedidos */
    case 'pedido-detalle':
      await verPedido(id);
      break;
    case 'pedidos-limpiar':
      state.pedidos = { ...state.pedidos, page: 0, estado: '', fechaDesde: '', fechaHasta: '' };
      await renderPedidos($('#view'));
      break;
    case 'pedidos-prev':
      if (state.pedidos.page > 0) {
        state.pedidos.page -= 1;
        await loadPedidosTable();
      }
      break;
    case 'pedidos-next': {
      const s = state.pedidos;
      if ((s.page + 1) * s.size < s.total) {
        s.page += 1;
        await loadPedidosTable();
      }
      break;
    }

    /* Nuevo pedido */
    case 'carrito-add':
      cartAdd(id);
      break;
    case 'carrito-inc':
      cartStep(id, 1);
      break;
    case 'carrito-dec':
      cartStep(id, -1);
      break;
    case 'carrito-remove':
      cartRemove(id);
      break;
    case 'registrar-pedido':
      await registrarPedido();
      break;

    /* Reportes */
    case 'reporte-inventario':
      await loadReporteInventario();
      break;

    /* Error de página */
    case 'reload':
      await router();
      break;

    default:
      break;
  }
}

/* ----------------------------- Eventos globales ------------------------- */

function onDocumentClick(event) {
  const backdrop = event.target.closest('.modal-backdrop');
  if (backdrop && event.target === backdrop) {
    closeModal();
    return;
  }

  const closeBtn = event.target.closest('[data-close]');
  if (closeBtn) {
    closeModal();
    return;
  }

  const target = event.target.closest('[data-action]');
  if (!target) return;
  if (target.tagName === 'TR' && event.target.closest('button')) return;

  handleAction(target.dataset.action, target).catch((error) => {
    toast(error && error.message ? error.message : 'Ocurrió un error inesperado.', 'error');
  });
}

function onGlobalSearchKeydown(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  const query = event.target.value.trim();
  const route = currentRoute();

  if (route.startsWith('clientes')) {
    state.clientes.nombre = query;
    state.clientes.page = 0;
    state.clientes.selectedId = null;
    if (route === 'clientes') renderClientes($('#view'));
    else window.location.hash = '#/clientes';
    return;
  }

  state.productos.nombre = query;
  state.productos.page = 0;
  if (route === 'productos') renderProductos($('#view'));
  else window.location.hash = '#/productos';
}

function toggleSidebar() {
  const open = document.body.classList.toggle('sidebar-open');
  const btn = document.getElementById('menuBtn');
  if (btn) btn.setAttribute('aria-expanded', String(open));
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
  const btn = document.getElementById('menuBtn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

/* --------------------------------- Init --------------------------------- */

function init() {
  const todayEl = document.getElementById('today');
  if (todayEl) todayEl.textContent = todayLong();

  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) menuBtn.addEventListener('click', toggleSidebar);

  const overlay = document.getElementById('overlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);

  const search = document.getElementById('globalSearch');
  if (search) search.addEventListener('keydown', onGlobalSearchKeydown);

  $$('.nav-item').forEach((link) => link.addEventListener('click', closeSidebar));

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Enter') {
      const row = event.target.closest('tr[data-action]');
      if (row) {
        event.preventDefault();
        handleAction(row.dataset.action, row).catch((error) => {
          toast(error && error.message ? error.message : 'Ocurrió un error inesperado.', 'error');
        });
      }
    }
  });

  window.addEventListener('hashchange', () => { router(); });

  router();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
