// =============================================================
// CORREO ARGENTINO — RED OPERATIVA NACIONAL
// script.js — Lógica de mapa interactivo, expansión y nodos
// =============================================================

// =============================================================
// 1. DATASET DE NODOS LOGÍSTICOS
// Tipos: 'CLOG' | 'DP' | 'Sorter' | 'Regional' | 'Sucursal'
// =============================================================
const nodosData = [

  // ====================================================
  // REGIÓN CUYO / NOA
  // ====================================================
  {
    id: "tucuman", nombre: "Tucumán", nombreCompleto: "CLOG Tucumán",
    tipo: "CLOG", provincia: "Tucumán",
    lat: -26.81, lng: -65.22,
    capacidad: "12.400 m²", piezasDia: "34.000", operatividad: "24 / 7",
    fotos: ["imagenes/cuyo-noa/Tucuman.jpg", "imagenes/cuyo-noa/Tucunan 1.jpg", "imagenes/cuyo-noa/Tucuman 2.jpg"],
    desc: "Hub principal del Noroeste Argentino (NOA), con conexión directa a Salta, Jujuy, Catamarca y Santiago del Estero."
  },
  {
    id: "mendoza", nombre: "Mendoza", nombreCompleto: "CLOG Mendoza",
    tipo: "CLOG", provincia: "Mendoza",
    lat: -32.89, lng: -68.84,
    capacidad: "14.200 m²", piezasDia: "29.000", operatividad: "24 / 7",
    fotos: ["imagenes/cuyo-noa/mendoza.jpg", "imagenes/cuyo-noa/mendoza 1.jpg", "imagenes/cuyo-noa/mendoza 2.jpg", "imagenes/cuyo-noa/Mendoza 3.jpg"],
    desc: "Cabecera logística de la Región Cuyo y punto de conexión bioceánico con el paso Cristo Redentor."
  },
  {
    id: "salta", nombre: "Salta", nombreCompleto: "CLOG Salta",
    tipo: "CLOG", provincia: "Salta",
    lat: -24.78, lng: -65.41,
    capacidad: "10.800 m²", piezasDia: "13.800", operatividad: "24 / 7",
    fotos: ["imagenes/cuyo-noa/Salta.jpg", "imagenes/cuyo-noa/Salta 1.jpg", "imagenes/cuyo-noa/Salta 2.jpg", "imagenes/cuyo-noa/Salta 3.jpg"],
    desc: "Nodo logístico regional del norte argentino, conectando Jujuy, Formosa y el corredor hacia Bolivia."
  },
  {
    id: "san_juan", nombre: "San Juan", nombreCompleto: "CLOG San Juan",
    tipo: "CLOG", provincia: "San Juan",
    lat: -31.54, lng: -68.54,
    capacidad: "8.500 m²", piezasDia: "11.400", operatividad: "L a S",
    fotos: ["imagenes/cuyo-noa/San Juan.jpg", "imagenes/cuyo-noa/San juan 1.jpg", "imagenes/cuyo-noa/San juan 2.jpg"],
    desc: "Centro de distribución regional para la provincia de San Juan y zonas precordilleranas."
  },
  {
    id: "san_luis", nombre: "San Luis", nombreCompleto: "CLOG San Luis",
    tipo: "CLOG", provincia: "San Luis",
    lat: -33.30, lng: -66.34,
    capacidad: "7.800 m²", piezasDia: "9.200", operatividad: "L a S",
    fotos: ["imagenes/cuyo-noa/San Luis.jpg", "imagenes/cuyo-noa/San Luis 1.jpg", "imagenes/cuyo-noa/San luis 2.jpg", "imagenes/cuyo-noa/San luis 3.jpg"],
    desc: "Nodo operativo de San Luis, articulando con Mendoza y Córdoba."
  },
  {
    id: "jujuy", nombre: "Jujuy", nombreCompleto: "CLOG Jujuy",
    tipo: "CLOG", provincia: "Jujuy",
    lat: -24.19, lng: -65.30,
    capacidad: "6.500 m²", piezasDia: "7.100", operatividad: "L a V",
    fotos: ["imagenes/cuyo-noa/Jujuy.jpg", "imagenes/cuyo-noa/Jujuy 1.jpg", "imagenes/cuyo-noa/Jujuy 2.jpg"],
    desc: "Centro logístico en la Puna juyeña con cobertura de la Quebrada de Humahuaca y puntos de frontera."
  },
  {
    id: "catamarca", nombre: "Catamarca", nombreCompleto: "CLOG Catamarca",
    tipo: "CLOG", provincia: "Catamarca",
    lat: -28.47, lng: -65.78,
    capacidad: "5.200 m²", piezasDia: "5.900", operatividad: "L a V",
    fotos: ["imagenes/cuyo-noa/Catamarca.jpg", "imagenes/cuyo-noa/Catamarca 1.jpg", "imagenes/cuyo-noa/Catamarca 2.jpg"],
    desc: "Nodo logístico provincial que cubre minería y agro en el oeste catamarqueño."
  },
  {
    id: "la_rioja", nombre: "La Rioja", nombreCompleto: "CLOG La Rioja",
    tipo: "CLOG", provincia: "La Rioja",
    lat: -29.41, lng: -66.86,
    capacidad: "4.800 m²", piezasDia: "5.400", operatividad: "L a V",
    fotos: ["imagenes/cuyo-noa/La Rioja.jpg", "imagenes/cuyo-noa/La Rioja 1.jpg", "imagenes/cuyo-noa/La Rioja 2.jpg"],
    desc: "Centro de operaciones provincial de La Rioja, distribución hacia valles y zonas rurales."
  },
  {
    id: "santiago_estero", nombre: "Santiago del Estero", nombreCompleto: "CLOG Santiago del Estero",
    tipo: "CLOG", provincia: "Santiago del Estero",
    lat: -27.78, lng: -64.27,
    capacidad: "6.200 m²", piezasDia: "9.800", operatividad: "L a S",
    fotos: ["imagenes/cuyo-noa/Santiago del Estero.jpg", "imagenes/cuyo-noa/Santiago del Estero 1.jpg", "imagenes/cuyo-noa/Santiago del Estero 2.jpg"],
    desc: "Nodo estratégico del Chaco Santiagueño, distribuye hacia el interior y conecta NOA con NEA."
  },

  // ====================================================
  // REGIÓN CENTRO / NEA
  // ====================================================
  {
    id: "cordoba", nombre: "Córdoba", nombreCompleto: "CLOG Córdoba",
    tipo: "CLOG", provincia: "Córdoba",
    lat: -31.42, lng: -64.18,
    capacidad: "18.500 m²", piezasDia: "48.500", operatividad: "24 / 7",
    fotos: ["imagenes/centro-nea/Cordoba frente.jpg", "imagenes/centro-nea/Cordoba 1.jpg", "imagenes/centro-nea/Cordoba 2.jpg"],
    desc: "Nodo neurálgico del Corredor Central. Distribuye hacia Cuyo, NOA y conecta con Buenos Aires y Rosario."
  },
  {
    id: "rosario", nombre: "Rosario", nombreCompleto: "CLOG Rosario",
    tipo: "CLOG", provincia: "Santa Fe",
    lat: -32.95, lng: -60.66,
    capacidad: "16.800 m²", piezasDia: "41.200", operatividad: "24 / 7",
    fotos: ["imagenes/centro-nea/Rosario Frente.jpg", "imagenes/centro-nea/Rosario 1.jpg", "imagenes/centro-nea/Rosario 2.jpg"],
    desc: "Plataforma multimodal en el eje fluvial e industrial de Santa Fe y Entre Ríos."
  },
  {
    id: "santa_fe", nombre: "Santa Fe", nombreCompleto: "CLOG Santa Fe",
    tipo: "CLOG", provincia: "Santa Fe",
    lat: -31.63, lng: -60.70,
    capacidad: "9.000 m²", piezasDia: "16.200", operatividad: "L a S",
    fotos: ["imagenes/centro-nea/Santa Fe Frente 2.jpg", "imagenes/centro-nea/Santa Fe 1.jpg", "imagenes/centro-nea/Santa fe 2.jpg", "imagenes/centro-nea/Santa Fe 3.jpg", "imagenes/centro-nea/Santa Fe 4.jpg"],
    desc: "Nodo logístico de la capital provincial de Santa Fe, con distribución al litoral."
  },
  {
    id: "parana", nombre: "Paraná", nombreCompleto: "CLOG Paraná",
    tipo: "CLOG", provincia: "Entre Ríos",
    lat: -31.74, lng: -60.52,
    capacidad: "8.500 m²", piezasDia: "10.800", operatividad: "L a S",
    fotos: ["imagenes/centro-nea/Parana Frente.jpg", "imagenes/centro-nea/Parana 1.jpg", "imagenes/centro-nea/Parana 2.jpg", "imagenes/centro-nea/Parana frente nave 2.jpg"],
    desc: "Centro operativo de Entre Ríos, articulando el litoral mesopotámico con Córdoba y AMBA."
  },
  {
    id: "rio_cuarto", nombre: "Río Cuarto", nombreCompleto: "CLOG Río Cuarto",
    tipo: "CLOG", provincia: "Córdoba",
    lat: -33.13, lng: -64.35,
    capacidad: "7.500 m²", piezasDia: "8.500", operatividad: "L a S",
    fotos: ["imagenes/centro-nea/Rio Cuarto Frente.jpg", "imagenes/centro-nea/Rio Cuarto 1.jpg", "imagenes/centro-nea/Rio cuarto 2.jpg", "imagenes/centro-nea/Rio cuarto 3.jpg"],
    desc: "Nodo logístico del sur de Córdoba, con distribución hacia La Pampa y San Luis."
  },
  {
    id: "villa_maria", nombre: "Villa María", nombreCompleto: "CLOG Villa María",
    tipo: "CLOG", provincia: "Córdoba",
    lat: -32.41, lng: -63.24,
    capacidad: "6.800 m²", piezasDia: "12.000", operatividad: "L a S",
    fotos: ["imagenes/centro-nea/Villa Maria Frente.jpg", "imagenes/centro-nea/Villa Maria 2.jpg", "imagenes/centro-nea/Villa Maria 3.jpg", "imagenes/centro-nea/Villa Maria 4.jpg"],
    desc: "Nodo estratégico del centro cordobés, articulando el corredor nacional hacia AMBA."
  },
  {
    id: "corrientes", nombre: "Corrientes", nombreCompleto: "CLOG Corrientes",
    tipo: "CLOG", provincia: "Corrientes",
    lat: -27.47, lng: -58.83,
    capacidad: "7.200 m²", piezasDia: "12.000", operatividad: "L a S",
    fotos: ["imagenes/centro-nea/Corrientes Frente.jpg", "imagenes/centro-nea/Corrientes 1.jpg", "imagenes/centro-nea/Corrientes 2.jpg", "imagenes/centro-nea/Corrientes 3.jpg"],
    desc: "Centro logístico del NEA, conectando el litoral mesopotámico con Chaco y Misiones."
  },
  {
    id: "resistencia", nombre: "Resistencia", nombreCompleto: "CLOG Resistencia",
    tipo: "CLOG", provincia: "Chaco",
    lat: -27.46, lng: -58.99,
    capacidad: "6.800 m²", piezasDia: "12.500", operatividad: "L a S",
    fotos: ["imagenes/centro-nea/Resistencia frente.jpg", "imagenes/centro-nea/Resistencia 1.jpg", "imagenes/centro-nea/Resistencia 2.jpg", "imagenes/centro-nea/Resistencia 3.jpg"],
    desc: "Nodo logístico de la capital del Chaco, con distribución hacia Formosa y el interior."
  },
  {
    id: "posadas", nombre: "Posadas", nombreCompleto: "CLOG Posadas",
    tipo: "CLOG", provincia: "Misiones",
    lat: -27.36, lng: -55.90,
    capacidad: "6.400 m²", piezasDia: "11.000", operatividad: "L a S",
    fotos: ["imagenes/centro-nea/Posadas Frente.jpg", "imagenes/centro-nea/Posadas 1.jpg", "imagenes/centro-nea/Posadas 2.jpg", "imagenes/centro-nea/Posadas 3.jpg"],
    desc: "Nodo logístico de Misiones, puerta de distribución hacia la Selva Misionera y frontera con Brasil."
  },

  // ====================================================
  // REGIÓN METRO / BUENOS AIRES / LA PAMPA
  // ====================================================
  {
    id: "bahia_blanca", nombre: "Bahía Blanca", nombreCompleto: "CLOG Bahía Blanca",
    tipo: "CLOG", provincia: "Buenos Aires",
    lat: -38.72, lng: -62.27,
    capacidad: "11.000 m²", piezasDia: "22.800", operatividad: "24 / 7",
    fotos: ["imagenes/metro-pba/Bahia Blanca.jpg", "imagenes/metro-pba/Bahia Blanca 1.jpg"],
    desc: "Puerta logística hacia la Patagonia y nodo de articulación con el sur bonaerense."
  },
  {
    id: "barracas", nombre: "Barracas", nombreCompleto: "CLOG Barracas",
    tipo: "CLOG", provincia: "Ciudad Autónoma de Buenos Aires",
    lat: -34.64, lng: -58.38,
    capacidad: "18.000 m²", piezasDia: "55.000", operatividad: "24 / 7",
    fotos: ["imagenes/metro-pba/Barracas.jpg", "imagenes/metro-pba/Barracas 1.jpg", "imagenes/metro-pba/Barracas 2.jpg", "imagenes/metro-pba/Barracas 3.jpg"],
    desc: "Centro logístico urbano en CABA, especializado en última milla para Capital Federal y GBA."
  },
  {
    id: "la_plata", nombre: "La Plata", nombreCompleto: "CLOG La Plata",
    tipo: "CLOG", provincia: "Buenos Aires",
    lat: -34.92, lng: -57.95,
    capacidad: "9.500 m²", piezasDia: "14.500", operatividad: "L a S",
    fotos: ["imagenes/metro-pba/La Plata.jpg", "imagenes/metro-pba/La Plata 1.jpg", "imagenes/metro-pba/La Plata 2.jpg", "imagenes/metro-pba/La Plata 3.jpg"],
    desc: "Centro de distribución de la capital bonaerense, cubriendo GBA Sur y la costa atlántica."
  },
  {
    id: "mar_del_plata", nombre: "Mar del Plata", nombreCompleto: "CLOG Mar del Plata",
    tipo: "CLOG", provincia: "Buenos Aires",
    lat: -38.00, lng: -57.56,
    capacidad: "9.500 m²", piezasDia: "19.400", operatividad: "24 / 7",
    fotos: ["imagenes/metro-pba/M del Plata.jpg", "imagenes/metro-pba/M del Plata 1.jpg", "imagenes/metro-pba/M del Plata 2.jpg"],
    desc: "Planta de distribución integral para la Costa Atlántica y el sudeste de la Provincia de Buenos Aires."
  },
  {
    id: "mercado_central", nombre: "Mercado Central", nombreCompleto: "Hub Mercado Central (Sorter)",
    tipo: "Sorter", provincia: "Buenos Aires",
    lat: -34.69, lng: -58.52,
    capacidad: "32.000 m²", piezasDia: "85.000", operatividad: "24 / 7",
    fotos: ["imagenes/metro-pba/Mercado Central.jpg", "imagenes/metro-pba/Mercado central 1.jpg", "imagenes/metro-pba/Mercado Central 2.jpg", "imagenes/metro-pba/Mercado Central 3.jpg", "imagenes/metro-pba/Mercado Central 4.jpg"],
    desc: "Gran hub logístico del GBA Oeste, adyacente al Mercado Central. Sorter de alta velocidad."
  },
  {
    id: "mercedes", nombre: "Mercedes", nombreCompleto: "CLOG Mercedes",
    tipo: "CLOG", provincia: "Buenos Aires",
    lat: -34.65, lng: -59.43,
    capacidad: "7.200 m²", piezasDia: "11.000", operatividad: "L a S",
    fotos: ["imagenes/metro-pba/Mercedes.jpg", "imagenes/metro-pba/Mercedes 1.jpg", "imagenes/metro-pba/Mercedes 2.jpg"],
    desc: "Nodo de distribución del GBA Oeste e interior bonaerense."
  },
  {
    id: "moreno", nombre: "Moreno", nombreCompleto: "CLOG Moreno",
    tipo: "CLOG", provincia: "Buenos Aires",
    lat: -34.63, lng: -58.79,
    capacidad: "8.500 m²", piezasDia: "18.000", operatividad: "24 / 7",
    fotos: ["imagenes/metro-pba/Moreno .jpg", "imagenes/metro-pba/Moreno 1.jpg", "imagenes/metro-pba/Moreno 2.jpg", "imagenes/metro-pba/Moreno 3.jpg"],
    desc: "Centro logístico del corredor Oeste del GBA con alta densidad de distribución urbana."
  },
  {
    id: "pergamino", nombre: "Pergamino", nombreCompleto: "CLOG Pergamino",
    tipo: "CLOG", provincia: "Buenos Aires",
    lat: -33.88, lng: -60.57,
    capacidad: "5.800 m²", piezasDia: "8.500", operatividad: "L a V",
    fotos: ["imagenes/metro-pba/Pergamino.jpg", "imagenes/metro-pba/Pergamino 1.jpg", "imagenes/metro-pba/Pergamino 2.jpg"],
    desc: "Nodo del norte bonaerense, articulando el agro con la cadena logística hacia AMBA."
  },
  {
    id: "quilmes", nombre: "Quilmes", nombreCompleto: "CLOG Quilmes",
    tipo: "CLOG", provincia: "Buenos Aires",
    lat: -34.72, lng: -58.25,
    capacidad: "9.000 m²", piezasDia: "22.000", operatividad: "24 / 7",
    fotos: ["imagenes/metro-pba/Quilmes .jpg", "imagenes/metro-pba/Quilmes 1.jpg", "imagenes/metro-pba/Quilmes 2.jpg", "imagenes/metro-pba/Quilmes 3.jpg", "imagenes/metro-pba/Quilmes 4.jpg"],
    desc: "Centro logístico del GBA Sur, cubriendo el corredor industrial del Riachuelo."
  },
  {
    id: "santa_rosa", nombre: "Santa Rosa", nombreCompleto: "CLOG Santa Rosa",
    tipo: "CLOG", provincia: "La Pampa",
    lat: -36.62, lng: -64.29,
    capacidad: "5.400 m²", piezasDia: "7.600", operatividad: "L a V",
    fotos: ["imagenes/metro-pba/Santa Rosa.jpg", "imagenes/metro-pba/Santa Rosa 1.jpg", "imagenes/metro-pba/Santa Rosa 3.jpg"],
    desc: "Nodo logístico de La Pampa, distribuyendo al interior pampeano y articulando con Córdoba."
  },
  {
    id: "vte_lopez", nombre: "Vicente López", nombreCompleto: "CLOG Vicente López",
    tipo: "CLOG", provincia: "Buenos Aires",
    lat: -34.52, lng: -58.47,
    capacidad: "6.500 m²", piezasDia: "14.000", operatividad: "L a S",
    fotos: ["imagenes/metro-pba/Vte. Lopez.jpg", "imagenes/metro-pba/Vte. Lopez 1.jpg", "imagenes/metro-pba/Vte. Lopez 2.jpg", "imagenes/metro-pba/Vte. Lopez 3.jpg"],
    desc: "Nodo logístico del corredor Norte del GBA, con acceso a Autopista Panamericana."
  },

  // ====================================================
  // REGIÓN SUR / PATAGONIA
  // ====================================================
  {
    id: "bariloche", nombre: "Bariloche", nombreCompleto: "CLOG Bariloche",
    tipo: "CLOG", provincia: "Río Negro",
    lat: -41.13, lng: -71.31,
    capacidad: "4.500 m²", piezasDia: "8.200", operatividad: "L a S",
    fotos: [
      "imagenes/sur/BARILOCHE_1.jpg",
      "imagenes/sur/BARILOCHE_2.jpg",
      "imagenes/sur/BARILOCHE_3.jpg",
      "imagenes/sur/BARILOCHE_4.jpg"
    ],
    desc: "Centro logístico andino patagónico, cabecera de distribución para la zona lacustre y cordillerana de Río Negro."
  },
  {
    id: "comodoro_rivadavia", nombre: "Comodoro Rivadavia", nombreCompleto: "CLOG Comodoro Rivadavia",
    tipo: "CLOG", provincia: "Chubut",
    lat: -45.87, lng: -67.50,
    capacidad: "6.000 m²", piezasDia: "9.500", operatividad: "24 / 7",
    fotos: [
      "imagenes/sur/COMODORO_RIVADAVIA_1.jpg",
      "imagenes/sur/COMODORO_RIVADAVIA_2.jpg",
      "imagenes/sur/COMODORO_RIVADAVIA_3.jpg",
      "imagenes/sur/COMODORO_RIVADAVIA_4.jpg",
      "imagenes/sur/COMODORO_RIVADAVIA_5.jpg",
      "imagenes/sur/COMODORO_RIVADAVIA_6.jpg"
    ],
    desc: "Hub logístico del Golfo San Jorge y la Patagonia Central, articulando Chubut con el norte santacruceño."
  },
  {
    id: "neuquen", nombre: "Neuquén", nombreCompleto: "CLOG Neuquén",
    tipo: "CLOG", provincia: "Neuquén",
    lat: -38.95, lng: -69.25,
    capacidad: "7.800 m²", piezasDia: "15.000", operatividad: "24 / 7",
    fotos: [
      "imagenes/sur/NEUQUEN_1.jpg",
      "imagenes/sur/NEUQUEN_2.jpg",
      "imagenes/sur/NEUQUEN_3.jpg",
      "imagenes/sur/NEUQUEN_4.jpg",
      "imagenes/sur/NEUQUEN_5.jpg",
      "imagenes/sur/NEUQUEN_6.jpg"
    ],
    desc: "Cabecera logística del Alto Valle, soporte operativo integral para el polo de desarrollo de Vaca Muerta."
  },
  {
    id: "rio_gallegos", nombre: "Río Gallegos", nombreCompleto: "CLOG Río Gallegos",
    tipo: "CLOG", provincia: "Santa Cruz",
    lat: -51.62, lng: -69.22,
    capacidad: "4.000 m²", piezasDia: "6.400", operatividad: "L a S",
    fotos: [
      "imagenes/sur/RIO_GALLEGOS_1.jpg",
      "imagenes/sur/RIO_GALLEGOS_2.jpg",
      "imagenes/sur/RIO_GALLEGOS_3.jpg",
      "imagenes/sur/RIO_GALLEGOS_4.jpg"
    ],
    desc: "Nodo logístico austral en Santa Cruz, articulación continental con Tierra del Fuego y pasos fronterizos."
  },
  {
    id: "trelew", nombre: "Trelew", nombreCompleto: "CLOG Trelew",
    tipo: "CLOG", provincia: "Chubut",
    lat: -43.25, lng: -65.31,
    capacidad: "5.500 m²", piezasDia: "6.500", operatividad: "L a S",
    fotos: [
      "imagenes/sur/TRELEW_1.jpg",
      "imagenes/sur/TRELEW_2.jpg",
      "imagenes/sur/TRELEW_3.jpg",
      "imagenes/sur/TRELEW_4.jpg",
      "imagenes/sur/TRELEW_5.jpg"
    ],
    desc: "Centro de distribución del valle inferior del Río Chubut y costa atlántica patagónica."
  }
];

// Rutas de conexión logística entre nodos principales
const redConexiones = [
  ["tucuman", "salta"],
  ["tucuman", "cordoba"],
  ["cordoba", "rosario"],
  ["cordoba", "mendoza"],
  ["cordoba", "rio_cuarto"],
  ["mendoza", "san_juan"],
  ["mendoza", "san_luis"],
  ["rosario", "mercado_central"],
  ["mercado_central", "quilmes"],
  ["mercado_central", "vte_lopez"],
  ["mercado_central", "mar_del_plata"],
  ["mercado_central", "bahia_blanca"],
  ["bahia_blanca", "neuquen"],
  ["bahia_blanca", "trelew"],
  ["trelew", "comodoro_rivadavia"],
  ["comodoro_rivadavia", "rio_gallegos"],
  ["neuquen", "bariloche"],
  ["rosario", "santa_fe"],
  ["santa_fe", "resistencia"],
  ["resistencia", "corrientes"],
  ["corrientes", "posadas"],
  ["parana", "santa_fe"]
];

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
const IDS_AMBA = ["barracas", "vicente_lopez", "moreno", "mercado_central", "quilmes", "mercedes", "la_plata"];

// =============================================================
// 3. INICIALIZACIÓN DEL MAPA LEAFLET
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarMapaLeaflet();
  configurarBuscador();
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
  // A zoom bajo (nacional), agrupamos para evitar que cualquier etiqueta se pise.
  // A zoom alto (ciudad/barrio), se desagrega completamente.
  let radioPixels = 0;
  if (zoomActual < 5.8) {
    radioPixels = 56; // Vista nacional: agrupa nodos cercanos (AMBA, Centro, Cuyo, NOA)
  } else if (zoomActual < 7.2) {
    radioPixels = 42; // Vista regional: subdivide en sub-clusters
  } else if (zoomActual < 8.8) {
    radioPixels = 26; // Vista inter-urbana: solo nodos muy próximos (ej. AMBA)
  } else {
    radioPixels = 0;  // Vista urbana / calle: todos los 28 nodos separados
  }

  // Agrupación por proximidad en píxeles de pantalla
  const clusters = [];
  const asignados = new Set();

  nodosData.forEach((nodo, i) => {
    if (asignados.has(nodo.id)) return;

    const clusterNodos = [nodo];
    asignados.add(nodo.id);

    if (radioPixels > 0) {
      const pt1 = leafletMap.latLngToContainerPoint([nodo.lat, nodo.lng]);

      nodosData.forEach((otro, j) => {
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

      const nombresList = clusterNodos.map(n => n.nombre).join(" · ");
      const clusterIcon = L.divIcon({
        className: "leaflet-cluster-icon",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        html: `
          <div class="clog-cluster-wrap" title="${clusterNodos.length} Nodos: ${nombresList}">
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
          <div class="clog-marker-wrap ${estaSel ? "seleccionado" : ""}" id="marker-${nodo.id}" data-id="${nodo.id}">
            <div class="clog-marker-dot"></div>
            <div class="clog-marker-pill">${nodo.nombre}</div>
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
  switch (region) {
    case "amba":
      leafletMap.flyTo([-34.63, -58.55], 10.5, { duration: 0.9 });
      break;
    case "centro":
      leafletMap.flyTo([-32.0, -63.5], 7, { duration: 0.9 });
      break;
    case "norte":
      leafletMap.flyTo([-26.8, -65.2], 6.5, { duration: 0.9 });
      break;
    case "cuyo":
      leafletMap.flyTo([-33.2, -68.8], 7, { duration: 0.9 });
      break;
    case "patagonia":
      leafletMap.flyTo([-46.0, -68.5], 5.5, { duration: 0.9 });
      break;
    case "nacional":
    default:
      zoomReset();
      break;
  }
}

// =============================================================
// 9. DETALLE DEL NODO AL HACER CLICK (POPUP CON FOTO)
// =============================================================
function abrirDetalleNodo(nodo, nodosHermano = null) {
  nodoActivo = nodo;

  const popup = document.getElementById("popup-nodo");
  document.getElementById("popup-nombre").textContent = nodo.nombreCompleto || nodo.nombre;
  document.getElementById("popup-ubicacion").textContent = `${nodo.provincia} · Red Logística Nacional`;
  document.getElementById("popup-badge-tipo").textContent = formatearTipoBadge(nodo.tipo);

  // Foto del nodo (o fallback a placeholder)
  const imgEl = document.getElementById("popup-img");
  const fotos = (nodo.fotos && nodo.fotos.length > 0) ? nodo.fotos : ["imagenes/placeholder.jpg"];
  fotoActualIdx = 0;
  imgEl.src = fotos[0];

  // Renderizar tira interactiva de miniaturas de fotos del nodo
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

  // Mostrar/ocultar flechas y contador según cantidad de fotos
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
        btn.textContent = h.nombre;
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

  // Estadísticas del nodo
  document.getElementById("popup-capacidad").textContent = nodo.capacidad || "8.500 m²";
  document.getElementById("popup-piezas").textContent = nodo.piezasDia || "15.000";
  document.getElementById("popup-estado").textContent = nodo.operatividad || "24 / 7";
  document.getElementById("popup-desc").textContent = nodo.desc || `Nodo operativo de Correo Argentino en la provincia de ${nodo.provincia}, preparado para cross-docking y clasificación de paquetería postal y comercial.`;
  document.getElementById("popup-cant-fotos").textContent = fotos.length;

  popup.classList.add("visible");
}

function formatearTipoBadge(tipo) {
  switch (tipo) {
    case "CLOG": return "Centro Logístico (CLOG)";
    case "DP": return "Planta de Distribución (DP)";
    case "Sorter": return "Sorter Automatizado";
    case "Regional": return "Nodo Regional";
    default: return "Sucursal Logística";
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
// 11. ACCESO RÁPIDO & FILTROS POR TIPO DE NODO
// =============================================================
function filtrarTipoNodo(tipo) {
  // Al hacer click en "Centros Logísticos" o "Sorters", expandimos el mapa y destacamos esos nodos
  expandirMapa(true);

  document.querySelectorAll(".marcador-g").forEach(el => {
    // Si queremos filtrar visualmente, podemos resaltar o parpadear
    el.style.opacity = "1";
  });
}

// Buscador en Topbar
function configurarBuscador() {
  const input = document.getElementById("global-search");
  if (!input) return;

  input.addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return;

    // Buscar coincidencia en nodos
    const match = nodosData.find(n => n.nombre.toLowerCase().includes(q) || n.provincia.toLowerCase().includes(q));
    if (match) {
      const p = proyecto(match.lng, match.lat);
      const contenedor = document.getElementById("mapa-contenedor");
      if (contenedor) {
        const rect = contenedor.getBoundingClientRect();
        escala = 2.2;
        panX = rect.width / 2 - p.x * escala;
        panY = rect.height / 2 - p.y * escala;
        aplicarTransformacion(true);
      }
    }
  });
}

// =============================================================
// 12. RESPONSIVE: ADAPTAR MAPA AL REDIMENSIONAR O CAMBIAR ZOOM
// =============================================================
let timerResize = null;
window.addEventListener("resize", () => {
  clearTimeout(timerResize);
  timerResize = setTimeout(() => {
    const contenedor = document.getElementById("mapa-contenedor");
    if (contenedor) {
      limitarPan(contenedor.getBoundingClientRect());
      aplicarTransformacion(false);
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
  } else if (seccion === "documentacion") {
    if (crumb) crumb.textContent = "Documentación";
  }

  // Cerrar sidebar en tablets/móviles tras seleccionar
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
// CUSTOM SELECT — Vista dropdown
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

    // Actualizar selección
    list.querySelectorAll(".custom-select-option").forEach(el => el.classList.remove("selected"));
    option.classList.add("selected");
    label.textContent = option.textContent.replace("✓ ", "");

    // Cerrar
    wrap.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  });

  // Cerrar al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  // Cerrar con Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && wrap.classList.contains("open")) {
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }
  });
})();
