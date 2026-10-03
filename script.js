// =============================================================
// CORREO ARGENTINO — RED OPERATIVA NACIONAL
// script.js — Lógica de mapa interactivo, expansión y nodos
// =============================================================

// =============================================================
// 1. DATASET DE NODOS LOGÍSTICOS
// Tipos: 'CLOG' | 'DP' | 'Sorter' | 'Regional' | 'Sucursal'
// =============================================================
// =============================================================
// 1. DATASET OFICIAL DE NODOS LOGÍSTICOS (CORREO ARGENTINO)
// Origen de datos: data/Analisis plantas Logisticas act..xlsx (Sheet 'plantas' + 'Resumen')
// =============================================================
const nodosData = (typeof NODOS_DATA_OFICIAL !== "undefined" && Array.isArray(NODOS_DATA_OFICIAL))
  ? NODOS_DATA_OFICIAL
  : [];

// Red federal de conexiones logísticas troncales
const redConexiones = (typeof RED_CONEXIONES_OFICIAL !== "undefined" && Array.isArray(RED_CONEXIONES_OFICIAL))
  ? RED_CONEXIONES_OFICIAL
  : [];

// =============================================================
// 2. ESTADO GLOBAL Y CONFIGURACIÓN MAPA LEAFLET
// =============================================================
let leafletMap = null;
let nodoActivo = null;
let mapaEstaExpandido = false;
let geoData = null;
let geojsonLayer = null;
let markersLayerGroup = null;
let clustersLayerGroup = null;

// Helper para buscar nodos por provincia
function buscarNodosPorProvincia(prov) {
  return nodosData.filter(n => n.provincia === prov);
}

// Bounding box inicial para Argentina continental (encuadre ceñido)
const BND_ARGENTINA = [
  [-55.1, -73.6],
  [-21.8, -53.6]
];

// Nodos del AMBA para agrupamiento inteligente en vistas nacionales/lejanas
const IDS_AMBA = ["dp2", "dp3", "dp4", "dp5", "dp6", "c14", "mer"];

// =============================================================
// 3. INICIALIZACIÓN DEL MAPA LEAFLET
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarMapaLeaflet();
  configurarBuscador();
  actualizarKPIs("nacional");
});

let mascaraExteriorLayer = null;

function inicializarMapaLeaflet() {
  const container = document.getElementById("mapa-leaflet");
  if (!container) return;

  // Crear mapa Leaflet sin controles de zoom por defecto (usamos los personalizados)
  leafletMap = L.map("mapa-leaflet", {
    zoomControl: false,
    attributionControl: true,
    minZoom: 4.4, // Evita alejar demasiado el mapa
    maxZoom: 19,
    bounceAtZoomLimits: true,
    maxBounds: [
      [-56.8, -75.5],
      [-21.2, -52.0]
    ],
    maxBoundsViscosity: 0.95
  });

  // Ajustar vista inicial para abarcar Argentina con encuadre óptimo
  leafletMap.fitBounds(BND_ARGENTINA, {
    padding: [8, 8]
  });

  // Fijar el zoom mínimo exactamente a la vista inicial de Argentina para que NO se pueda alejar más
  setTimeout(() => {
    if (leafletMap) {
      const zNacional = leafletMap.getZoom();
      leafletMap.setMinZoom(zNacional);
      actualizarEstadoBotonesZoom();
    }
  }, 100);

  // Crear paneles z-index dedicados para mantener capas perfectamente ordenadas
  leafletMap.createPane("mascaraPane");
  leafletMap.getPane("mascaraPane").style.zIndex = 350;
  leafletMap.getPane("mascaraPane").style.pointerEvents = "none";

  leafletMap.createPane("provinciasPane");
  leafletMap.getPane("provinciasPane").style.zIndex = 380;

  // Capa Base: CartoDB Positron con API Key oficial (estética limpia y sobria para Correo Argentino, sin marcas de agua)
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=cb1_47km_1_a9a7e15ee94d196eec40bf56", {
    maxZoom: 19,
    subdomains: "abcd",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>'
  }).addTo(leafletMap);

  // Capas de marcadores y clusters
  markersLayerGroup = L.layerGroup().addTo(leafletMap);
  clustersLayerGroup = L.layerGroup().addTo(leafletMap);

  // Capa GeoJSON de límites de provincias argentinas + máscara exterior
  cargarCapaProvincias();

  // Escuchar cambios de zoom para alternar entre vista clúster y vista detallada por calle/ciudad
  leafletMap.on("zoomend", () => {
    actualizarMarcadoresLeaflet();
    actualizarEstadoBotonesZoom();
  });

  // Click en mapa vacío deselecciona
  leafletMap.on("click", (e) => {
    if (!e.originalEvent || !e.originalEvent._markerClick) {
      deseleccionarTodo();
    }
  });

  // Renderizar marcadores iniciales
  actualizarMarcadoresLeaflet();

  // Resize observer para mantener el mapa adaptado al viewport o redimensionamiento
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      if (leafletMap) leafletMap.invalidateSize();
    });
    ro.observe(container);
  }
}

// =============================================================
// 4. MÁSCARA EXTERIOR (SOLO ARGENTINA VISIBLE) Y CAPA DE PROVINCIAS
// =============================================================
function cargarCapaProvincias() {
  const geojson = (typeof GEOJSON_ARGENTINA !== "undefined" && GEOJSON_ARGENTINA) ? GEOJSON_ARGENTINA : null;

  if (geojson) {
    aplicarMascaraYProvincias(geojson);
  } else {
    fetch("provincias.geojson")
      .then(r => r.json())
      .then(data => aplicarMascaraYProvincias(data))
      .catch(err => console.warn("No se cargó provincias.geojson:", err));
  }
}

function aplicarMascaraYProvincias(geojson) {
  crearMascaraExterior(geojson);
  dibujarProvincias(geojson);
}

function crearMascaraExterior(geojson) {
  if (mascaraExteriorLayer && leafletMap) {
    leafletMap.removeLayer(mascaraExteriorLayer);
  }

  // Anillo exterior gigantesco que cubre todo el hemisferio
  const worldOuter = [
    [-85.0511, -180],
    [85.0511, -180],
    [85.0511, 180],
    [-85.0511, 180],
    [-85.0511, -180]
  ];

  // Extraer todos los polígonos de Argentina como huecos (cutout holes)
  const huecos = [];
  geojson.features.forEach(f => {
    if (!f.geometry || !f.geometry.coordinates) return;
    if (f.geometry.type === "Polygon") {
      const ring = f.geometry.coordinates[0].map(pt => [pt[1], pt[0]]);
      huecos.push(ring);
    } else if (f.geometry.type === "MultiPolygon") {
      f.geometry.coordinates.forEach(poly => {
        const ring = poly[0].map(pt => [pt[1], pt[0]]);
        huecos.push(ring);
      });
    }
  });

  // Polígono invertido: tapa todos los países limítrofes y océanos con el color exacto del dashboard (#d0dcea)
  // dejando visible ÚNICAMENTE la geografía y ciudades de Argentina
  mascaraExteriorLayer = L.polygon([worldOuter, ...huecos], {
    pane: "mascaraPane",
    fillColor: "#d0dcea",
    fillOpacity: 1.0,
    stroke: true,
    color: "#8ca8cb",
    weight: 1.6,
    interactive: false
  }).addTo(leafletMap);
}

function dibujarProvincias(geojson) {
  if (geojsonLayer && leafletMap) {
    leafletMap.removeLayer(geojsonLayer);
  }

  geojsonLayer = L.geoJSON(geojson, {
    pane: "provinciasPane",
    style: {
      fillColor: "#002554",
      fillOpacity: 0.03,
      color: "#6b8eb6",
      weight: 1.2,
      opacity: 0.65
    },
    onEachFeature: (feature, layer) => {
      const nombre = feature.properties.name || feature.properties.nombre || "";
      layer.on({
        mouseover: (e) => {
          const l = e.target;
          l.setStyle({
            fillColor: "#002554",
            fillOpacity: 0.12,
            color: "#002554",
            weight: 1.8,
            opacity: 0.9
          });
        },
        mouseout: (e) => {
          if (geojsonLayer) geojsonLayer.resetStyle(e.target);
        },
        click: (e) => {
          if (e.originalEvent && e.originalEvent.target && e.originalEvent.target.blur) {
            e.originalEvent.target.blur();
          }
          if (e.target && e.target._path && e.target._path.blur) {
            e.target._path.blur();
          }
          if (leafletMap) {
            leafletMap.fitBounds(e.target.getBounds(), { padding: [30, 30], maxZoom: 9 });
          }
        }
      });
      if (nombre) {
        layer.bindTooltip(nombre, {
          permanent: false,
          direction: "center",
          className: "provincia-tooltip"
        });
      }
    }
  }).addTo(leafletMap);
}

// =============================================================
// 5. RENDERIZADO DINÁMICO DE MARCADORES Y CLUSTERS LEAFLET
// =============================================================
function actualizarMarcadoresLeaflet() {
  if (!leafletMap || !markersLayerGroup || !clustersLayerGroup) return;

  markersLayerGroup.clearLayers();
  clustersLayerGroup.clearLayers();

  const zoomActual = leafletMap.getZoom();

  // Radio de agrupación en píxeles de pantalla según el nivel de zoom:
  let radioPixels = 0;
  if (zoomActual < 5.8) {
    radioPixels = 54; // Vista nacional: agrupa nodos cercanos (AMBA, Centro, Cuyo, NOA)
  } else if (zoomActual < 7.2) {
    radioPixels = 38; // Vista regional: subdivide en sub-clusters
  } else if (zoomActual < 8.8) {
    radioPixels = 24; // Vista inter-urbana: solo nodos muy próximos (ej. AMBA)
  } else {
    radioPixels = 0;  // Vista urbana / calle: todas las 36 plantas separadas
  }

  // Filtrado según tipo si hay filtro activo (CLOG, CDP, CTP, Sorter)
  const listaNodos = tipoFiltroActivo
    ? nodosData.filter(n => {
        if (tipoFiltroActivo === "CLOG") return n.tipo === "CLOG";
        if (tipoFiltroActivo === "CDP") return n.tipo === "CDP" || n.tipo === "DP";
        if (tipoFiltroActivo === "CTP") return n.tipo === "CTP";
        if (tipoFiltroActivo === "Sorter") return n.tipo === "Sorter";
        return true;
      })
    : nodosData;

  // Agrupación por proximidad en píxeles de pantalla
  const clusters = [];
  const asignados = new Set();

  listaNodos.forEach((nodo, i) => {
    if (asignados.has(nodo.id)) return;

    const clusterNodos = [nodo];
    asignados.add(nodo.id);

    if (radioPixels > 0) {
      const pt1 = leafletMap.latLngToContainerPoint([nodo.lat, nodo.lng]);

      listaNodos.forEach((otro, j) => {
        if (i === j || asignados.has(otro.id)) return;
        const pt2 = leafletMap.latLngToContainerPoint([otro.lat, otro.lng]);
        const dist = Math.hypot(pt1.x - pt2.x, pt1.y - pt2.y);
        if (dist < radioPixels) {
          clusterNodos.push(otro);
          asignados.add(otro.id);
        }
      });
    }

    clusters.push(clusterNodos);
  });

  // Renderizar cada cluster o nodo individual
  clusters.forEach(clusterNodos => {
    if (clusterNodos.length > 1) {
      // Centroide del cluster
      const avgLat = clusterNodos.reduce((s, n) => s + n.lat, 0) / clusterNodos.length;
      const avgLng = clusterNodos.reduce((s, n) => s + n.lng, 0) / clusterNodos.length;

      const nombresList = clusterNodos.map(n => `[${n.cod}] ${n.nombre}`).join(" · ");
      const clusterIcon = L.divIcon({
        className: "leaflet-cluster-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        html: `
          <div class="clog-cluster-wrap" title="${clusterNodos.length} Plantas: ${nombresList}">
            ${clusterNodos.length}
          </div>
        `
      });

      const clusterMarker = L.marker([avgLat, avgLng], { icon: clusterIcon, zIndexOffset: 250 });
      clusterMarker.on("click", (e) => {
        if (e.originalEvent) e.originalEvent._markerClick = true;
        const bounds = L.latLngBounds(clusterNodos.map(n => [n.lat, n.lng]));
        // Acercar suavemente hacia los nodos del cluster para desagruparlos
        leafletMap.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: Math.max(leafletMap.getZoom() + 2, 8.5),
          duration: 0.8
        });
      });
      clustersLayerGroup.addLayer(clusterMarker);

    } else {
      // Nodo individual
      const nodo = clusterNodos[0];
      const estaSel = nodoActivo && nodoActivo.id === nodo.id;

      const markerIcon = L.divIcon({
        className: "leaflet-clog-icon",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        html: `
          <div class="clog-marker-wrap tipo-${nodo.tipo.toLowerCase()} ${estaSel ? "seleccionado" : ""}" id="marker-${nodo.id}" data-id="${nodo.id}">
            <div class="clog-marker-dot"></div>
            <div class="clog-marker-pill">
              <span class="pill-name">${nodo.nombre}</span>
              <span class="pill-cod">${nodo.cod}</span>
            </div>
          </div>
        `
      });

      const m = L.marker([nodo.lat, nodo.lng], { icon: markerIcon, zIndexOffset: estaSel ? 500 : 100 });
      m.on("click", (e) => {
        if (e.originalEvent) e.originalEvent._markerClick = true;
        seleccionarEsteNodo(nodo);
      });

      markersLayerGroup.addLayer(m);
    }
  });
}

function seleccionarEsteNodo(nodo) {
  nodoActivo = nodo;

  // Actualizar clases de los elementos en el DOM
  document.querySelectorAll(".clog-marker-wrap").forEach(el => {
    if (el.getAttribute("data-id") === nodo.id) {
      el.classList.add("seleccionado");
    } else {
      el.classList.remove("seleccionado");
    }
  });

  // Si estamos en un zoom muy bajo y clickean en el nodo, acercar ligeramente
  if (leafletMap && leafletMap.getZoom() < 8) {
    leafletMap.flyTo([nodo.lat, nodo.lng], 10, { duration: 0.6 });
  }

  abrirDetalleNodo(nodo);
}

function deseleccionarTodo() {
  nodoActivo = null;
  cerrarPopupNodo();
  document.querySelectorAll(".clog-marker-wrap.seleccionado").forEach(el => el.classList.remove("seleccionado"));
}

// =============================================================
// 6. CONTROLES DE ZOOM FLOTANTES (+, -, ↺, Centrar)
// =============================================================
function zoomIn() {
  if (leafletMap) leafletMap.zoomIn();
}

function zoomOut() {
  if (leafletMap && leafletMap.getZoom() > leafletMap.getMinZoom()) {
    leafletMap.zoomOut();
  }
}

function zoomReset() {
  if (leafletMap) {
    leafletMap.flyToBounds(BND_ARGENTINA, {
      padding: [8, 8],
      duration: 0.8
    });
  }
}

function actualizarEstadoBotonesZoom() {
  const btnOut = document.getElementById("btn-zoom-out");
  if (!btnOut || !leafletMap) return;
  const atMin = leafletMap.getZoom() <= (leafletMap.getMinZoom() || 4.4);
  if (atMin) {
    btnOut.style.opacity = "0.38";
    btnOut.style.cursor = "not-allowed";
    btnOut.setAttribute("disabled", "true");
  } else {
    btnOut.style.opacity = "1";
    btnOut.style.cursor = "pointer";
    btnOut.removeAttribute("disabled");
  }
}

// =============================================================
// 7. EXPANDIR / CONTRAER MAPA
// =============================================================
function toggleExpandirMapa() {
  expandirMapa(!mapaEstaExpandido);
}

function expandirMapa(expandir) {
  mapaEstaExpandido = expandir;
  const colSidebar = document.getElementById("columna-sidebar");
  const colMapa = document.getElementById("columna-mapa");
  const banner = document.getElementById("banner-mapa-ampliado");
  const btnToggle = document.getElementById("btn-toggle-expand");
  const expandText = document.getElementById("expand-text");
  const expandIcon = document.getElementById("expand-icon");
  const dashPrincipal = document.getElementById("dashboard-principal");

  if (expandir) {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('activo'));
    const linkMapa = document.querySelector('.sidebar-link[onclick*="mapa"]');
    if (linkMapa) linkMapa.classList.add('activo');
    if (dashPrincipal) dashPrincipal.classList.add("mapa-expandido");
    if (colSidebar) colSidebar.classList.add("sidebar-oculto");
    if (colMapa) colMapa.classList.add("mapa-pantalla-completa");
    if (banner) banner.classList.add("visible");
    if (btnToggle) btnToggle.classList.add("expandido");
    if (expandText) expandText.textContent = "Contraer mapa";
    if (expandIcon) expandIcon.textContent = "✕";
  } else {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('activo'));
    const linkInicio = document.querySelector('.sidebar-link[onclick*="inicio"]');
    if (linkInicio) linkInicio.classList.add('activo');
    if (dashPrincipal) dashPrincipal.classList.remove("mapa-expandido");
    if (colSidebar) colSidebar.classList.remove("sidebar-oculto");
    if (colMapa) colMapa.classList.remove("mapa-pantalla-completa");
    if (banner) banner.classList.remove("visible");
    if (btnToggle) btnToggle.classList.remove("expandido");
    if (expandText) expandText.textContent = "Ampliar mapa";
    if (expandIcon) expandIcon.textContent = "⛶";
  }

  // Notificar a Leaflet mientras dura la transición CSS para un reflow fluido y reajustar minZoom
  let repeticiones = 0;
  const timer = setInterval(() => {
    if (leafletMap) {
      leafletMap.invalidateSize();
      const zOpt = leafletMap.getBoundsZoom(BND_ARGENTINA, false, [8, 8]);
      leafletMap.setMinZoom(zOpt);
      actualizarEstadoBotonesZoom();
    }
    repeticiones++;
    if (repeticiones > 10) clearInterval(timer);
  }, 50);
}

// =============================================================
// 8. CENTRADO EN REGIONES
// =============================================================
function centrarEnRegion(region) {
  if (!leafletMap) return;
  if (!region || region === "nacional") {
    zoomReset();
    return;
  }
  const nodosRegion = nodosData.filter(n => n.regionKey === region);
  if (nodosRegion.length > 0) {
    const bounds = L.latLngBounds(nodosRegion.map(n => [n.lat, n.lng]));
    leafletMap.flyToBounds(bounds, {
      padding: [45, 45],
      maxZoom: region === "amba" ? 11 : (region === "pba" ? 8 : 7.5),
      duration: 0.85
    });
  } else {
    zoomReset();
  }
}

// =============================================================
// KPI CALCULATION AND AGGREGATION FROM EXCEL DATASET
// =============================================================
function actualizarKPIs(regionKey = "nacional") {
  let filtrados = nodosData;
  if (regionKey && regionKey !== "nacional") {
    filtrados = nodosData.filter(n => n.regionKey === regionKey);
  }

  const cantNodos = filtrados.length;
  const totPiezas = filtrados.reduce((s, n) => s + (n.volumenTotalNum || 0), 0);
  const totVenta = filtrados.reduce((s, n) => s + (parseNumero(n.volumenVenta) || 0), 0);
  const totJuris = filtrados.reduce((s, n) => s + (parseNumero(n.volumenJurisdiccion) || 0), 0);
  const totDotacion = filtrados.reduce((s, n) => s + (n.dotacionTotal || 0), 0);
  const totAuxiliares = filtrados.reduce((s, n) => s + (n.dotacionAuxiliares || 0), 0);
  const totM2 = filtrados.reduce((s, n) => s + (n.capacidadM2 || 0), 0);

  const cantClog = filtrados.filter(n => n.tipo === "CLOG").length;
  const cantCtp = filtrados.filter(n => n.tipo === "CTP").length;
  const cantCdp = filtrados.filter(n => n.tipo === "CDP").length;
  const cantSorter = filtrados.filter(n => n.tipo === "Sorter").length;

  const elPiezas = document.getElementById("kpi-piezas");
  const elPiezasSub = document.getElementById("kpi-piezas-sub");
  const elNodos = document.getElementById("kpi-nodos");
  const elNodosSub = document.getElementById("kpi-nodos-sub");
  const elDotacion = document.getElementById("kpi-dotacion");
  const elDotacionSub = document.getElementById("kpi-dotacion-sub");
  const elSuperficie = document.getElementById("kpi-superficie");
  const elSuperficieSub = document.getElementById("kpi-superficie-sub");
  const elSorters = document.getElementById("kpi-sorters");
  const elSortersSub = document.getElementById("kpi-sorters-sub");
  const elVehiculos = document.getElementById("kpi-vehiculos");
  const elVehiculosSub = document.getElementById("kpi-vehiculos-sub");

  if (elPiezas) elPiezas.textContent = totPiezas > 0 ? totPiezas.toLocaleString("es-AR") : "S/D";
  if (elPiezasSub) {
    if (totVenta > 0 && totJuris > 0) {
      elPiezasSub.textContent = `${Math.round(totVenta / 1000)}k Venta + ${Math.round(totJuris / 1000)}k Jurisdicción`;
    } else {
      elPiezasSub.textContent = "Volumen operativo verificado";
    }
  }
  if (elNodos) elNodos.textContent = cantNodos.toString();
  if (elNodosSub) {
    elNodosSub.textContent = regionKey === "nacional" ? "100% Cobertura Federal" : `Región: ${filtrados[0]?.region || regionKey}`;
  }
  if (elDotacion) elDotacion.textContent = totDotacion.toLocaleString("es-AR");
  if (elDotacionSub) elDotacionSub.textContent = `${totAuxiliares.toLocaleString("es-AR")} auxiliares operativos`;
  if (elSuperficie) elSuperficie.textContent = `${totM2.toLocaleString("es-AR")} m²`;
  if (elSuperficieSub) elSuperficieSub.textContent = "Almacenaje y naves";
  if (elSorters) elSorters.textContent = `${cantClog} CLOGs`;
  if (elSortersSub) elSortersSub.textContent = `${cantCtp} CTP · ${cantCdp} CDP · ${cantSorter} Sorter`;
  if (elVehiculos) elVehiculos.textContent = regionKey === "nacional" ? "36 Rutas" : `${cantNodos * 2} Rutas`;
  if (elVehiculosSub) elVehiculosSub.textContent = "Red interconectada";
}

function parseNumero(v) {
  if (!v) return 0;
  if (typeof v === "number") return v;
  const clean = v.toString().replace(/\./g, "").replace(",", ".").trim();
  if (clean.includes(" a ")) {
    const parts = clean.split(" a ");
    return (parseFloat(parts[0]) + parseFloat(parts[1])) / 2 || 0;
  }
  return parseFloat(clean) || 0;
}

// =============================================================
// 9. DETALLE DEL NODO AL HACER CLICK (POPUP CON FOTO)
// =============================================================
function abrirDetalleNodo(nodo, nodosHermano = null) {
  nodoActivo = nodo;

  const popup = document.getElementById("popup-nodo");
  if (!popup) return;

  // Header info
  const elNombre = document.getElementById("popup-nombre");
  if (elNombre) elNombre.textContent = nodo.nombreCompleto || nodo.nombre;

  const elCodPill = document.getElementById("popup-cod-pill");
  if (elCodPill) elCodPill.textContent = nodo.cod || "";

  const elBadgeCod = document.getElementById("popup-badge-cod");
  if (elBadgeCod) elBadgeCod.textContent = nodo.cod || "";

  const elUbicacion = document.getElementById("popup-ubicacion");
  if (elUbicacion) elUbicacion.textContent = `${nodo.provincia} · ${nodo.region}`;

  const elDomicilio = document.getElementById("popup-domicilio");
  if (elDomicilio) elDomicilio.textContent = nodo.domicilio || "Dirección operativa central";

  const elBadgeTipo = document.getElementById("popup-badge-tipo");
  if (elBadgeTipo) elBadgeTipo.textContent = formatearTipoBadge(nodo.tipo);

  // Foto del nodo (o fallback a placeholder)
  const imgEl = document.getElementById("popup-img");
  const fotos = (nodo.fotos && nodo.fotos.length > 0) ? nodo.fotos : ["imagenes/placeholder.jpg"];
  fotoActualIdx = 0;
  if (imgEl) imgEl.src = fotos[0];

  // Tira de miniaturas
  const strip = document.getElementById("popup-galeria-strip");
  const arrowPrev = document.getElementById("popup-arrow-prev");
  const arrowNext = document.getElementById("popup-arrow-next");
  const counter = document.getElementById("popup-foto-counter");

  if (strip) {
    strip.innerHTML = "";
    if (fotos.length > 1) {
      fotos.forEach((f, idx) => {
        const thumb = document.createElement("img");
        thumb.src = f;
        thumb.className = `popup-thumb ${idx === 0 ? "activa" : ""}`;
        thumb.alt = `Foto ${idx + 1} de ${nodo.nombre}`;
        thumb.onclick = (e) => {
          e.stopPropagation();
          fotoActualIdx = idx;
          actualizarFotoPopup(fotos);
        };
        strip.appendChild(thumb);
      });
      strip.style.display = "flex";
    } else {
      strip.style.display = "none";
    }
  }

  if (arrowPrev) arrowPrev.style.display = fotos.length > 1 ? "flex" : "none";
  if (arrowNext) arrowNext.style.display = fotos.length > 1 ? "flex" : "none";
  if (counter) counter.textContent = fotos.length > 1 ? `1 / ${fotos.length}` : "";

  // Selector de nodos si la provincia tiene múltiples nodos
  const pillsCont = document.getElementById("popup-nodos-pills");
  if (pillsCont) {
    pillsCont.innerHTML = "";
    const hermanos = nodosHermano || buscarNodosPorProvincia(nodo.provincia);
    if (hermanos && hermanos.length > 1) {
      hermanos.forEach(h => {
        const btn = document.createElement("button");
        btn.className = `popup-nodo-pill-btn ${h.id === nodo.id ? "activa" : ""}`;
        btn.textContent = `${h.cod ? `[${h.cod}] ` : ""}${h.nombre}`;
        btn.onclick = (e) => {
          e.stopPropagation();
          abrirDetalleNodo(h, hermanos);
        };
        pillsCont.appendChild(btn);
      });
      pillsCont.style.display = "flex";
    } else {
      pillsCont.style.display = "none";
    }
  }

  // 3 Stats Principales
  const elCap = document.getElementById("popup-capacidad");
  if (elCap) elCap.textContent = nodo.capacidad || "S/D";

  const elPiezas = document.getElementById("popup-piezas");
  if (elPiezas) elPiezas.textContent = nodo.piezasDia || "S/D";

  const elPiezasLbl = document.getElementById("popup-piezas-lbl");
  if (elPiezasLbl) elPiezasLbl.textContent = "Promedio diario";

  const elPiezasSub = document.getElementById("popup-piezas-sub");
  if (elPiezasSub) {
    const vVta = nodo.volumenVenta ? `${nodo.volumenVenta} Venta` : "";
    const vJur = nodo.volumenJurisdiccion ? `${nodo.volumenJurisdiccion} Jurisdicción` : "";
    if (vVta && vJur) {
      elPiezasSub.textContent = `${vVta} · ${vJur}`;
      elPiezasSub.style.display = "block";
    } else if (nodo.ingresoEnvios && nodo.ingresoEnvios.diarioMaquinable) {
      const maq = Math.round(nodo.ingresoEnvios.diarioMaquinable);
      const noMaq = Math.round(nodo.ingresoEnvios.diarioNoMaquinable || 0);
      elPiezasSub.textContent = `${maq.toLocaleString('es-AR')} Maq. · ${noMaq.toLocaleString('es-AR')} No Maq.`;
      elPiezasSub.style.display = "block";
    } else {
      elPiezasSub.textContent = "Envíos / día";
      elPiezasSub.style.display = "block";
    }
  }

  const elDot = document.getElementById("popup-dotacion");
  if (elDot) elDot.textContent = nodo.dotacionTotal ? `${nodo.dotacionTotal} pers.` : "S/D";

  const elDotLbl = document.getElementById("popup-dotacion-lbl");
  if (elDotLbl) {
    elDotLbl.textContent = nodo.dotacionAuxiliares ? `${nodo.dotacionAuxiliares} auxiliares` : "Dotación operativa";
  }

  const elEstado = document.getElementById("popup-estado");
  if (elEstado) elEstado.textContent = nodo.operatividad || "24 / 7";

  // Turnos Reales del Excel (Total de personal sin discriminar jerárquicos / auxiliares)
  const tNoche = nodo.turnos?.noche;
  const tManana = nodo.turnos?.manana;
  const tTarde = nodo.turnos?.tarde;

  function formatDotacionTurno(t) {
    if (!t) return "0 personas";
    const jer = parseInt(t.jerarquico, 10) || 0;
    const aux = parseInt(t.auxiliares, 10) || 0;
    const tot = jer + aux;
    return `${tot} personas`;
  }

  const elNocheF = document.getElementById("turno-noche-franja");
  const elNocheD = document.getElementById("turno-noche-dot");
  if (elNocheF) elNocheF.textContent = (tNoche?.franja && tNoche.franja.toLowerCase() !== "no hay" && tNoche.franja.toLowerCase() !== "no" && tNoche.franja.toLowerCase() !== "no tiene") ? tNoche.franja : "Sin turno noche";
  if (elNocheD) elNocheD.textContent = formatDotacionTurno(tNoche);

  const elMananaF = document.getElementById("turno-manana-franja");
  const elMananaD = document.getElementById("turno-manana-dot");
  if (elMananaF) elMananaF.textContent = (tManana?.franja && tManana.franja.toLowerCase() !== "no hay" && tManana.franja.toLowerCase() !== "no") ? tManana.franja : "Sin turno mañana";
  if (elMananaD) elMananaD.textContent = formatDotacionTurno(tManana);

  const elTardeF = document.getElementById("turno-tarde-franja");
  const elTardeD = document.getElementById("turno-tarde-dot");
  if (elTardeF) elTardeF.textContent = (tTarde?.franja && tTarde.franja.toLowerCase() !== "no hay" && tTarde.franja.toLowerCase() !== "no" && tTarde.franja !== "0") ? tTarde.franja : "Sin turno tarde";
  if (elTardeD) elTardeD.textContent = formatDotacionTurno(tTarde);

  // Procesos
  function updateProcBadge(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    const activo = val && val !== "0" && val !== "no" && val.toLowerCase() !== "no hay";
    el.classList.toggle("inactivo", !activo);
    if (activo && val !== "si" && val !== "1") {
      el.title = `Dotación / puestos asignados: ${val}`;
    }
  }
  updateProcBadge("proc-cdp", nodo.procesos?.cdp);
  updateProcBadge("proc-ctp", nodo.procesos?.ctp);
  updateProcBadge("proc-ptapta", nodo.procesos?.ptaPta);
  updateProcBadge("proc-clasif", nodo.procesos?.clasificacion);

  // Responsables e Inmueble
  const elJefePlanta = document.getElementById("popup-jefe-planta");
  if (elJefePlanta) elJefePlanta.textContent = nodo.responsables?.jefePlanta || "No especificado";

  const elJefeNodo = document.getElementById("popup-jefe-nodo");
  if (elJefeNodo) elJefeNodo.textContent = nodo.responsables?.jefeNodo || "No especificado";

  const elInmueble = document.getElementById("popup-inmueble");
  if (elInmueble) {
    elInmueble.textContent = nodo.inmueble?.alquilada ? `Alquilada (${nodo.inmueble.alquilada})` : "Inmueble Operativo / Propio";
  }

  const elAlmacen = document.getElementById("popup-almacenamiento");
  if (elAlmacen) {
    const detalles = [nodo.inmueble?.almacenamiento, nodo.inmueble?.racks, nodo.inmueble?.seguridad].filter(Boolean);
    elAlmacen.textContent = detalles.length > 0 ? detalles.join(" · ") : "Estándar operativo";
  }

  // 1. Ingreso de envíos (Maquinable vs No Maquinable vs Última Milla)
  const secIngresos = document.getElementById("popup-ingresos-section");
  if (secIngresos) {
    const ing = nodo.ingresoEnvios;
    if (ing && (ing.impoMensual > 0 || ing.ingresoMensualUltimaMilla > 0)) {
      const elMaq = document.getElementById("pop-ing-maq");
      const elMaqSub = document.getElementById("pop-ing-maq-sub");
      const elNoMaq = document.getElementById("pop-ing-nomaq");
      const elNoMaqSub = document.getElementById("pop-ing-nomaq-sub");
      const elUm = document.getElementById("pop-ing-um");
      const elUmSub = document.getElementById("pop-ing-um-sub");

      // Tarjeta 1: Columna H (Ingreso promedio diario maquinable)
      const valMaq = Math.round(ing.diarioMaquinable || 0);
      if (elMaq) elMaq.textContent = `${valMaq.toLocaleString("es-AR")} / día`;
      if (elMaqSub) elMaqSub.textContent = ing.impoMensualMaquinable ? `${Math.round(ing.impoMensualMaquinable).toLocaleString("es-AR")} mensual` : "";

      // Tarjeta 2: Columna I (Ingreso promedio diario no maquinable)
      const valNoMaq = Math.round(ing.diarioNoMaquinable || 0);
      if (elNoMaq) elNoMaq.textContent = `${valNoMaq.toLocaleString("es-AR")} / día`;
      if (elNoMaqSub) elNoMaqSub.textContent = ing.impoMensualNoMaquinable ? `${Math.round(ing.impoMensualNoMaquinable).toLocaleString("es-AR")} mensual` : "";

      // Tarjeta 3: Columna J (Ingreso promedio diario última milla)
      const valUm = Math.round(ing.diarioUltimaMilla || 0);
      if (elUm) elUm.textContent = `${valUm.toLocaleString("es-AR")} / día`;
      if (elUmSub) elUmSub.textContent = ing.ingresoMensualUltimaMilla ? `${Math.round(ing.ingresoMensualUltimaMilla).toLocaleString("es-AR")} mensual` : "";

      secIngresos.style.display = "block";
    } else {
      secIngresos.style.display = "none";
    }
  }


  // 3. Líneas de Transporte Conectadas
  const secTrans = document.getElementById("popup-transportes-section");
  if (secTrans) {
    const rutas = nodo.transportes || [];
    if (rutas.length > 0) {
      const elCant = document.getElementById("pop-trans-cant");
      const elList = document.getElementById("popup-transportes-list");
      if (elCant) elCant.textContent = rutas.length;
      if (elList) {
        elList.innerHTML = rutas.slice(0, 15).map(r => `
          <div class="popup-tr-chip">
            <div>
              <strong>${r.linea}</strong>
              <span style="font-size:11px;color:#64748b;margin-left:6px;">${r.frecuencia || "LUN A VIE"}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:11px;color:#002554;font-weight:700;">${r.horarioLlegada || "-"}</span>
              <span class="tr-badge">${r.tipoServicio || "TR"}</span>
            </div>
          </div>
        `).join("");
        if (rutas.length > 15) {
          elList.innerHTML += `<div style="font-size:11.5px;color:#64748b;text-align:center;padding-top:4px;">+ ${rutas.length - 15} líneas adicionales en analytics</div>`;
        }
      }
      secTrans.style.display = "block";
    } else {
      secTrans.style.display = "none";
    }
  }

  // Descripción
  const elDesc = document.getElementById("popup-desc");
  if (elDesc) elDesc.textContent = nodo.desc || `Nodo operativo oficial de Correo Argentino en la provincia de ${nodo.provincia}.`;

  const elCantFotos = document.getElementById("popup-cant-fotos");
  if (elCantFotos) elCantFotos.textContent = fotos.length;

  popup.classList.add("visible");
}

function formatearTipoBadge(tipo) {
  switch (tipo) {
    case "CLOG": return "Centro Logístico (CLOG)";
    case "CDP": return "Centro de Paquetería (CDP)";
    case "CTP": return "Centro de Tratamiento (CTP)";
    case "Sorter": return "Hub Sorter Automatizado";
    default: return "Planta Operativa";
  }
}

function cerrarPopupNodo() {
  document.getElementById("popup-nodo").classList.remove("visible");
}

function cerrarPopupNodoOverlay(e) {
  if (e.target.id === "popup-nodo") {
    deseleccionarTodo();
  }
}

// Actualiza la imagen principal del popup, el thumbnail activo y el contador
function actualizarFotoPopup(fotos) {
  const imgEl = document.getElementById("popup-img");
  const strip = document.getElementById("popup-galeria-strip");
  const counter = document.getElementById("popup-foto-counter");

  if (imgEl) {
    imgEl.style.opacity = "0";
    imgEl.style.transition = "opacity 0.18s ease";
    setTimeout(() => {
      imgEl.src = fotos[fotoActualIdx];
      imgEl.style.opacity = "1";
    }, 100);
  }

  if (strip) {
    strip.querySelectorAll(".popup-thumb").forEach((t, i) => {
      t.classList.toggle("activa", i === fotoActualIdx);
      if (i === fotoActualIdx) t.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  }

  if (counter) counter.textContent = `${fotoActualIdx + 1} / ${fotos.length}`;
}

function popupFotoAnterior(e) {
  if (e) e.stopPropagation();
  if (!nodoActivo) return;
  const fotos = nodoActivo.fotos || ["imagenes/placeholder.jpg"];
  fotoActualIdx = (fotoActualIdx - 1 + fotos.length) % fotos.length;
  actualizarFotoPopup(fotos);
}

function popupFotoSiguiente(e) {
  if (e) e.stopPropagation();
  if (!nodoActivo) return;
  const fotos = nodoActivo.fotos || ["imagenes/placeholder.jpg"];
  fotoActualIdx = (fotoActualIdx + 1) % fotos.length;
  actualizarFotoPopup(fotos);
}

// =============================================================
// 10. MODAL DE GALERÍA EN PANTALLA COMPLETA
// =============================================================
let fotoActualIdx = 0;

function abrirGaleriaDesdePopup() {
  if (!nodoActivo) return;
  fotoActualIdx = 0;
  actualizarVistaGaleria();
  document.getElementById("modal-galeria").classList.add("visible");
}

function cerrarGaleria() {
  document.getElementById("modal-galeria").classList.remove("visible");
}

function cerrarGaleriaOverlay(e) {
  if (e.target.id === "modal-galeria") {
    cerrarGaleria();
  }
}

function fotoAnterior() {
  if (!nodoActivo) return;
  const fotos = nodoActivo.fotos || ["imagenes/placeholder.jpg"];
  fotoActualIdx = (fotoActualIdx - 1 + fotos.length) % fotos.length;
  actualizarVistaGaleria();
}

function fotoSiguiente() {
  if (!nodoActivo) return;
  const fotos = nodoActivo.fotos || ["imagenes/placeholder.jpg"];
  fotoActualIdx = (fotoActualIdx + 1) % fotos.length;
  actualizarVistaGaleria();
}

function actualizarVistaGaleria() {
  const fotos = (nodoActivo && nodoActivo.fotos && nodoActivo.fotos.length) ? nodoActivo.fotos : ["imagenes/placeholder.jpg"];
  document.getElementById("gal-img").src = fotos[fotoActualIdx];
  document.getElementById("gal-titulo").textContent = nodoActivo ? (nodoActivo.nombreCompleto || nodoActivo.nombre) : "Fotografía de Instalaciones";
  document.getElementById("gal-sub").textContent = nodoActivo ? `${nodoActivo.provincia} · ${nodoActivo.tipo}` : "";
  document.getElementById("gal-contador").textContent = `Foto ${fotoActualIdx + 1} de ${fotos.length}`;
}

// Teclado para galería y popup
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    cerrarGaleria();
    cerrarPopupNodo();
  }
  const modalGal = document.getElementById("modal-galeria");
  if (modalGal && modalGal.classList.contains("visible")) {
    if (e.key === "ArrowLeft") fotoAnterior();
    if (e.key === "ArrowRight") fotoSiguiente();
  }
});

// =============================================================
// 11. FILTRO INTERACTIVO POR TIPO DE PLANTA EN EL MAPA
// =============================================================
let tipoFiltroActivo = null;

function filtrarTipoNodo(tipo) {
  if (!tipo || tipo === "TODAS" || tipoFiltroActivo === tipo) {
    tipoFiltroActivo = null; // Muestra todas
  } else {
    tipoFiltroActivo = tipo;
  }

  // 1. Actualizar clases visuales de los botones de filtro
  document.querySelectorAll(".btn-filtro-tipo").forEach(btn => {
    const btnTipo = btn.getAttribute("data-tipo");
    if (!tipoFiltroActivo && btnTipo === "TODAS") {
      btn.classList.add("activo");
    } else if (tipoFiltroActivo && btnTipo === tipoFiltroActivo) {
      btn.classList.add("activo");
    } else {
      btn.classList.remove("activo");
    }
  });

  // 2. Actualizar badge de estado
  const statusEl = document.getElementById("filtro-tipo-status");
  if (statusEl) {
    if (!tipoFiltroActivo) {
      statusEl.textContent = `Mostrando todas (${nodosData.length} plantas)`;
    } else {
      const cant = nodosData.filter(n => {
        if (tipoFiltroActivo === "CLOG") return n.tipo === "CLOG";
        if (tipoFiltroActivo === "CDP") return n.tipo === "CDP" || n.tipo === "DP";
        if (tipoFiltroActivo === "CTP") return n.tipo === "CTP";
        if (tipoFiltroActivo === "Sorter") return n.tipo === "Sorter";
        return true;
      }).length;
      statusEl.textContent = `Filtrando: ${cant} plantas tipo ${tipoFiltroActivo}`;
    }
  }

  // 3. Renderizar marcadores filtrados en el mapa
  actualizarMarcadoresLeaflet();

  // 4. Centrar y encuadrar el mapa en los nodos resultantes
  if (tipoFiltroActivo && leafletMap) {
    const matches = nodosData.filter(n => {
      if (tipoFiltroActivo === "CLOG") return n.tipo === "CLOG";
      if (tipoFiltroActivo === "CDP") return n.tipo === "CDP" || n.tipo === "DP";
      if (tipoFiltroActivo === "CTP") return n.tipo === "CTP";
      if (tipoFiltroActivo === "Sorter") return n.tipo === "Sorter";
      return true;
    });

    if (matches.length > 0) {
      if (matches.length === 1) {
        leafletMap.flyTo([matches[0].lat, matches[0].lng], 11, { duration: 0.85 });
      } else {
        const bounds = L.latLngBounds(matches.map(n => [n.lat, n.lng]));
        leafletMap.flyToBounds(bounds, { padding: [45, 45], maxZoom: 9, duration: 0.85 });
      }
    }
  } else if (leafletMap) {
    zoomReset();
  }
}

// Descarga directa del dataset oficial en formato CSV
function descargarCSVOficial() {
  if (typeof NODOS_DATA_OFICIAL === "undefined" || !NODOS_DATA_OFICIAL.length) return;
  let csv = "Codigo,Planta,Tipo,Provincia,Region,Volumen_Diario,Superficie_m2,Dotacion_Total,Auxiliares,Jefe_Planta,Jefe_Nodo\n";
  NODOS_DATA_OFICIAL.forEach(p => {
    const row = [
      `"${p.cod}"`,
      `"${p.nombreCompleto || p.nombre}"`,
      `"${p.tipo}"`,
      `"${p.provincia}"`,
      `"${p.region}"`,
      p.volumenTotalNum || 0,
      p.capacidadM2 || 0,
      p.dotacionTotal || 0,
      p.dotacionAuxiliares || 0,
      `"${p.responsables?.jefePlanta || ''}"`,
      `"${p.responsables?.jefeNodo || ''}"`
    ];
    csv += row.join(",") + "\n";
  });
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "correo_argentino_plantas_dataset.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =============================================================
// BUSCADOR GLOBAL INTERACTIVO
// =============================================================
function configurarBuscador() {
  const input = document.getElementById("global-search");
  const dropdown = document.getElementById("search-results-dropdown");
  const clearBtn = document.getElementById("search-clear-btn");
  if (!input) return;

  function filtrarResultados(q) {
    if (!q) {
      if (dropdown) dropdown.classList.remove("visible");
      if (clearBtn) clearBtn.style.display = "none";
      return;
    }
    if (clearBtn) clearBtn.style.display = "flex";

    const matches = nodosData.filter(n => {
      const txt = `${n.cod} ${n.nombre} ${n.nombreCompleto} ${n.provincia} ${n.ubicacion} ${n.domicilio}`.toLowerCase();
      return txt.includes(q);
    });

    if (dropdown) {
      if (matches.length === 0) {
        dropdown.innerHTML = `<div style="padding:12px 14px; font-size:12.5px; color:#8fa4bd; text-align:center;">No se encontraron plantas para "${q}"</div>`;
      } else {
        dropdown.innerHTML = matches.slice(0, 8).map(m => `
          <div class="search-result-item" onclick="seleccionarPlantaDesdeBuscador('${m.id}')">
            <div class="sres-left">
              <span class="sres-name">${m.nombreCompleto || m.nombre}</span>
              <span class="sres-sub">${m.provincia} · ${m.ubicacion || ''}</span>
            </div>
            <span class="sres-cod">${m.cod}</span>
          </div>
        `).join("");
      }
      dropdown.classList.add("visible");
    }
  }

  input.addEventListener("input", e => {
    filtrarResultados(e.target.value.toLowerCase().trim());
  });

  input.addEventListener("focus", e => {
    if (e.target.value.trim()) {
      filtrarResultados(e.target.value.toLowerCase().trim());
    }
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".header-search-wrap") && dropdown) {
      dropdown.classList.remove("visible");
    }
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      limpiarBuscador();
    } else if (e.key === "Enter") {
      const q = input.value.toLowerCase().trim();
      const match = nodosData.find(n => `${n.cod} ${n.nombre} ${n.nombreCompleto} ${n.provincia}`.toLowerCase().includes(q));
      if (match) {
        seleccionarPlantaDesdeBuscador(match.id);
      }
    }
  });
}

function limpiarBuscador() {
  const input = document.getElementById("global-search");
  const dropdown = document.getElementById("search-results-dropdown");
  const clearBtn = document.getElementById("search-clear-btn");
  if (input) input.value = "";
  if (dropdown) dropdown.classList.remove("visible");
  if (clearBtn) clearBtn.style.display = "none";
}

function seleccionarPlantaDesdeBuscador(id) {
  const nodo = nodosData.find(n => n.id === id);
  if (!nodo) return;
  limpiarBuscador();
  seleccionarEsteNodo(nodo);
}

// =============================================================
// 12. RESPONSIVE: ADAPTAR MAPA AL REDIMENSIONAR O CAMBIAR ZOOM
// =============================================================
let timerResize = null;
window.addEventListener("resize", () => {
  clearTimeout(timerResize);
  timerResize = setTimeout(() => {
    const contenedor = document.getElementById("mapa-contenedor");
    if (contenedor && leafletMap) {
      leafletMap.invalidateSize();
    }
  }, 120);
});

// =============================================================
// 13. SIDEBAR IZQUIERDO: SELECCIÓN Y TOGGLE
// =============================================================
function seleccionarNavSidebar(el, seccion) {
  document.querySelectorAll(".sidebar-link").forEach(link => link.classList.remove("activo"));
  if (el) el.classList.add("activo");

  const crumb = document.getElementById("header-crumb-text");

  if (seccion === "inicio") {
    expandirMapa(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (crumb) crumb.textContent = "Panel General";
  } else if (seccion === "mapa") {
    expandirMapa(true);
    if (crumb) crumb.textContent = "Mapeo Nacional";
  } else if (seccion === "indicadores") {
    expandirMapa(false);
    const sec = document.querySelector(".card-seccion");
    if (sec) sec.scrollIntoView({ behavior: "smooth" });
    if (crumb) crumb.textContent = "Indicadores Operativos";
  }

  const sidebar = document.getElementById("sidebar-izq");
  if (sidebar && window.innerWidth <= 992) {
    sidebar.classList.remove("sidebar-abierto");
  }
}

function toggleSidebarMenu() {
  const sidebar = document.getElementById("sidebar-izq");
  if (sidebar) sidebar.classList.toggle("sidebar-abierto");
}

// =============================================================
// CUSTOM SELECT — Vista dropdown con filtro de región
// =============================================================
(function () {
  const wrap = document.getElementById("custom-vista-wrap");
  const btn  = document.getElementById("custom-vista-btn");
  const list = document.getElementById("custom-vista-list");
  const label = document.getElementById("custom-vista-label");
  if (!wrap || !btn || !list) return;

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    const isOpen = wrap.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen);
  });

  list.addEventListener("click", function (e) {
    const option = e.target.closest(".custom-select-option");
    if (!option) return;

    list.querySelectorAll(".custom-select-option").forEach(el => el.classList.remove("selected"));
    option.classList.add("selected");
    label.textContent = option.textContent.replace("✓ ", "");

    const val = option.getAttribute("data-value");
    actualizarKPIs(val);
    centrarEnRegion(val);

    wrap.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && wrap.classList.contains("open")) {
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }
  });
})();

// Soporte para navegación con hash (#mapa, #indicadores) desde otras páginas
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash;
  if (hash === "#mapa") {
    setTimeout(() => {
      const mapaBtn = document.querySelector('.sidebar-link[onclick*="mapa"]');
      if (mapaBtn) seleccionarNavSidebar(mapaBtn, 'mapa');
    }, 150);
  } else if (hash === "#indicadores") {
    setTimeout(() => {
      const indBtn = document.querySelector('.sidebar-link[onclick*="indicadores"]');
      if (indBtn) seleccionarNavSidebar(indBtn, 'indicadores');
    }, 150);
  }
});

