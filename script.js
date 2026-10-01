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
// 2. PROYECCIÓN MERCATOR CONFORME
// =============================================================
const VIEWBOX_W = 500;
const VIEWBOX_H = 900;

let proj = {
  scale: 1,
  minLngRad: 0,
  maxMerc: 0,
  offsetX: 0,
  offsetY: 0,
  toMerc: lat => {
    const r = Math.max(-85, Math.min(85, lat)) * Math.PI / 180;
    return Math.log(Math.tan(Math.PI / 4 + r / 2));
  }
};

function calcularProyeccion(geojson, w = VIEWBOX_W, h = VIEWBOX_H, padding = 16) {
  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  function scan(coord) {
    if (!Array.isArray(coord)) return;
    if (typeof coord[0] === "number" && typeof coord[1] === "number") {
      const lng = coord[0], lat = coord[1];
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    } else {
      coord.forEach(scan);
    }
  }

  geojson.features.forEach(f => {
    if (f.geometry && f.geometry.coordinates) scan(f.geometry.coordinates);
  });

  const minLngRad = minLng * Math.PI / 180;
  const maxLngRad = maxLng * Math.PI / 180;
  const maxMerc = proj.toMerc(maxLat);
  const minMerc = proj.toMerc(minLat);

  const deltaLng = maxLngRad - minLngRad;
  const deltaMerc = maxMerc - minMerc;

  const availW = w - 2 * padding;
  const availH = h - 2 * padding;

  const scale = Math.min(availW / deltaLng, availH / deltaMerc);
  const offsetX = padding + (availW - deltaLng * scale) / 2;
  const offsetY = padding + (availH - deltaMerc * scale) / 2;

  proj.scale = scale;
  proj.minLngRad = minLngRad;
  proj.maxMerc = maxMerc;
  proj.offsetX = offsetX;
  proj.offsetY = offsetY;
}

function proyecto(lng, lat) {
  const lngRad = lng * Math.PI / 180;
  const merc = proj.toMerc(lat);
  const x = (lngRad - proj.minLngRad) * proj.scale + proj.offsetX;
  const y = (proj.maxMerc - merc) * proj.scale + proj.offsetY;
  return { x, y };
}

function geoRingToPath(ring) {
  return ring.map((pt, i) => {
    const { x, y } = proyecto(pt[0], pt[1]);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ") + " Z";
}

function geomToPathD(geometry) {
  if (!geometry) return "";
  const parts = [];
  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach(ring => parts.push(geoRingToPath(ring)));
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach(poly =>
      poly.forEach(ring => parts.push(geoRingToPath(ring)))
    );
  }
  return parts.join(" ");
}

// =============================================================
// 3. ESTADO GLOBAL
// =============================================================
let geoData = null;
let nodoActivo = null;
let mapaEstaExpandido = false;

// Zoom & Pan state
let escala = 1;
let panX = 0;
let panY = 0;
let estaArrastrando = false;
let inicioX = 0, inicioY = 0;
let huboMovimiento = false;

// =============================================================
// 4. INICIALIZACIÓN
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  iniciarInteraccionPanZoom();
  configurarBuscador();
  cargarYConstruirMapa();
});

// =============================================================
// 5. CARGA DEL MAPA DESDE GEOJSON
// =============================================================
async function cargarYConstruirMapa() {
  const svg = document.getElementById("mapa-svg");

  try {
    if (typeof GEOJSON_ARGENTINA !== "undefined" && GEOJSON_ARGENTINA) {
      geoData = GEOJSON_ARGENTINA;
      renderizarMapaCompleto(svg, geoData);
      ajustarLabelsSegunZoom();
      renderizarNodos();
      return;
    }
    const resp = await fetch("provincias.geojson");
    if (!resp.ok) throw new Error("No se pudo cargar provincias.geojson");
    geoData = await resp.json();
    renderizarMapaCompleto(svg, geoData);
    ajustarLabelsSegunZoom();
    renderizarNodos();

  } catch (err) {
    console.error("Error al cargar mapa:", err);
    svg.innerHTML = `
      <text x="250" y="450" text-anchor="middle" fill="#002554" font-size="14" font-family="Plus Jakarta Sans, sans-serif">
        Cargando Mapa Operativo Nacional...
      </text>`;
  }
}



// =============================================================
// 6. RENDERIZADO DEL MAPA COMPLETO (PROVINCIAS + ETIQUETAS + NODOS)
// =============================================================
function renderizarMapaCompleto(svg, geojson) {
  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${VIEWBOX_W} ${VIEWBOX_H}`);

  // Calcular proyección conforme sobre las 24 provincias
  calcularProyeccion(geojson, VIEWBOX_W, VIEWBOX_H, 16);

  // --- Capa 1: Provincias Argentinas ---
  const gProvincias = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gProvincias.id = "g-provincias";
  svg.appendChild(gProvincias);

  geojson.features.forEach(feature => {
    const rawName = feature.properties.name || feature.properties.nombre || "";
    const d = geomToPathD(feature.geometry);
    if (!d) return;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "provincia-svg");
    path.dataset.nombre = rawName;
    path.addEventListener("click", (e) => {
      if (huboMovimiento) return;
      e.stopPropagation();
      if (path.classList.contains("seleccionada")) {
        deseleccionarTodo();
      } else {
        resaltarProvincia(path);
        seleccionarProvincia(rawName);
      }
    });
    gProvincias.appendChild(path);
  });

  // --- Capa 2: Etiquetas de nombres de provincias ---
  const gLabels = document.createElementNS("http://www.w3.org/2000/svg", "g");
  gLabels.id = "g-labels";
  svg.appendChild(gLabels);

  geojson.features.forEach(feature => {
    const rawName = feature.properties.name || feature.properties.nombre || "";
    if (!rawName) return;
    const bbox = feature.bbox;
    let cx, cy;
    if (bbox) {
      const pt = proyecto((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2);
      cx = pt.x; cy = pt.y;
    } else {
      try {
        const coords = feature.geometry.type === "Polygon"
          ? feature.geometry.coordinates[0]
          : feature.geometry.coordinates[0][0];
        let sumLng = 0, sumLat = 0, count = 0;
        coords.forEach(c => { sumLng += c[0]; sumLat += c[1]; count++; });
        const pt = proyecto(sumLng / count, sumLat / count);
        cx = pt.x; cy = pt.y;
      } catch (e) { return; }
    }
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", cx.toFixed(1));
    label.setAttribute("y", cy.toFixed(1));
    label.setAttribute("class", "label-provincia");
    label.textContent = rawName.toUpperCase();
    gLabels.appendChild(label);
  });

  // La capa de nodos se agrega por separado mediante renderizarNodos()
}

// =============================================================
// SISTEMA DE CLUSTERING Y MARCADORES DE NODOS
// =============================================================

/**
 * Agrupa únicamente nodos con cercanía extrema (específicamente AMBA en vista general).
 * A escala general (s < 1.8), los 5 nodos del AMBA se agrupan en un badge elegante "5 AMBA".
 * Al hacer zoom (s >= 1.8), se abren individualmente con etiquetas inteligentes sin pisarse.
 * Los nodos del interior del país se mantienen siempre visibles individualmente.
 */
/**
 * Agrupa nodos en círculos de cluster según cercanía visual en el nivel de zoom actual.
 * - En vista general o al achicar (zoom out), los nodos cercanos se consolidan en círculos
 *   con el número de CLOGs disponibles, evitando solapamientos de etiquetas.
 * - Al hacer zoom o hacer clic en el cluster, se separan y muestran sus etiquetas completas.
 */
function calcularClusters(nodos) {
  const s = escala;
  // Umbral en píxeles de pantalla: nodos a menos de 56px en pantalla se agrupan
  const UMBRAL_PX = 56;
  const umbralSVG = UMBRAL_PX / s;

  // A zoom profundo (s >= 3.6), todos los nodos del país se muestran individuales
  if (s >= 3.6) {
    return nodos.map(n => {
      const p = proyecto(n.lng, n.lat);
      return { nodos: [n], cx: p.x, cy: p.y };
    });
  }

  const visitados = new Set();
  const clusters = [];

  for (let i = 0; i < nodos.length; i++) {
    if (visitados.has(nodos[i].id)) continue;

    const n1 = nodos[i];
    const p1 = proyecto(n1.lng, n1.lat);
    const grupo = [n1];
    visitados.add(n1.id);

    let sumX = p1.x;
    let sumY = p1.y;

    for (let j = 0; j < nodos.length; j++) {
      if (i === j || visitados.has(nodos[j].id)) continue;
      const n2 = nodos[j];
      const p2 = proyecto(n2.lng, n2.lat);

      // Distancia entre el centroide acumulado del grupo y el nodo candidato
      const dist = Math.hypot(p2.x - sumX / grupo.length, p2.y - sumY / grupo.length);
      if (dist < umbralSVG) {
        visitados.add(n2.id);
        grupo.push(n2);
        sumX += p2.x;
        sumY += p2.y;
      }
    }

    clusters.push({
      nodos: grupo,
      cx: sumX / grupo.length,
      cy: sumY / grupo.length
    });
  }

  return clusters;
}

/**
 * Renderiza la capa de nodos y badges según el nivel de zoom actual.
 */
function renderizarNodos() {
  const svg = document.getElementById("mapa-svg");
  if (!svg) return;

  let gNodos = document.getElementById("g-nodos");
  if (gNodos) {
    gNodos.innerHTML = "";
  } else {
    gNodos = document.createElementNS("http://www.w3.org/2000/svg", "g");
    gNodos.id = "g-nodos";
    svg.appendChild(gNodos);
  }

  const s = escala;
  const clusters = calcularClusters(nodosData);

  clusters.forEach(cluster => {
    if (cluster.nodos.length > 1) {
      _renderCluster(cluster, gNodos, s);
    } else {
      _renderNodoSimple(cluster.nodos[0], gNodos, s);
    }
  });
}

/** Dibuja un cluster agrupado: Círculo moderno tipo cluster con el número de CLOGs */
function _renderCluster(cluster, parent, s) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "cluster-g");

  const k = Math.pow(Math.max(s, 0.6), 0.35);
  const count = cluster.nodos.length;

  // Radio del círculo según la cantidad de nodos agrupados
  const baseR = count >= 5 ? 16.0 : (count >= 3 ? 14.5 : 13.0);
  const R = baseR / k;

  // 1. Halo suave exterior
  const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  halo.setAttribute("cx", cluster.cx.toFixed(3));
  halo.setAttribute("cy", cluster.cy.toFixed(3));
  halo.setAttribute("r", (R + 4.5 / k).toFixed(3));
  halo.setAttribute("fill", "rgba(255, 210, 0, 0.28)");
  halo.setAttribute("pointer-events", "none");

  // 2. Círculo sólido principal (Azul institucional Correo con borde dorado)
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", cluster.cx.toFixed(3));
  circle.setAttribute("cy", cluster.cy.toFixed(3));
  circle.setAttribute("r", R.toFixed(3));
  circle.setAttribute("fill", "#002554");
  circle.setAttribute("stroke", "#FFD200");
  circle.setAttribute("stroke-width", (2.2 / k).toFixed(3));
  circle.setAttribute("class", "cluster-circle-bg");

  // 3. Número de nodos (grande, centrado, ultra legible)
  const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
  txt.setAttribute("x", cluster.cx.toFixed(3));
  txt.setAttribute("y", cluster.cy.toFixed(3));
  txt.setAttribute("text-anchor", "middle");
  txt.setAttribute("dominant-baseline", "central");
  txt.setAttribute("fill", "#FFD200");
  txt.setAttribute("font-family", "Inter, -apple-system, sans-serif");
  txt.setAttribute("font-weight", "900");
  txt.setAttribute("font-size", ((baseR * 0.9) / k).toFixed(3));
  txt.setAttribute("class", "cluster-text");
  txt.setAttribute("pointer-events", "none");
  txt.textContent = count;

  g.appendChild(halo);
  g.appendChild(circle);
  g.appendChild(txt);

  // Click en el cluster: hace zoom suave centrado para abrir y desplegar los nodos con etiquetas
  g.addEventListener("click", e => {
    if (huboMovimiento) return;
    e.stopPropagation();

    const contenedor = document.getElementById("mapa-contenedor");
    if (!contenedor) return;
    const rect = contenedor.getBoundingClientRect();

    const elemRect = g.getBoundingClientRect();
    const screenX = elemRect.left + elemRect.width / 2 - rect.left;
    const screenY = elemRect.top + elemRect.height / 2 - rect.top;

    // Zoom hacia el cluster: si tiene muchos nodos (como AMBA) salta a 3.6x, si tiene 2-3 salta a 2.3x
    const targetScale = count >= 4 ? Math.max(escala * 2.2, 3.6) : Math.max(escala * 1.8, 2.3);

    const mapX = (screenX - panX) / escala;
    const mapY = (screenY - panY) / escala;

    panX = rect.width / 2 - mapX * targetScale;
    panY = rect.height / 2 - mapY * targetScale;
    escala = Math.min(targetScale, 8.5);

    aplicarTransformacion(true);
  });

  parent.appendChild(g);
}

/** Dibuja un nodo individual con Pin nítido y Pill badge que protege el texto de pisadas */
function _renderNodoSimple(nodo, parent, s) {
  const p = proyecto(nodo.lng, nodo.lat);

  // Escala suavizada: a mayor zoom (s), los nodos y textos crecen visualmente en pantalla en vez de quedarse microscópicos
  const k = Math.pow(Math.max(s, 0.6), 0.35);

  // Dimensiones del puntito (nodo físico en el mapa)
  const DOT_R = 7.2 / k;
  const INNER_R = 3.2 / k;
  const GLOW_R = 12.0 / k;
  const SW = 1.8 / k;

  // Direcciones inteligentes calculadas para evitar solapamientos en áreas densas
  let dir = "right";
  if (nodo.id === "vte_lopez") dir = "top";
  else if (nodo.id === "moreno") dir = "left";
  else if (nodo.id === "mercado_central") dir = "bottom-left";
  else if (nodo.id === "quilmes") dir = "bottom-right";
  else if (nodo.id === "barracas") dir = "right";
  else if (nodo.id === "rio_cuarto") dir = "bottom";
  else if (nodo.id === "villa_maria") dir = "top";
  else if (nodo.id === "santa_fe") dir = "top";
  else if (nodo.id === "rosario") dir = "bottom";
  else if (nodo.id === "resistencia") dir = "top-left";
  else if (nodo.id === "corrientes") dir = "bottom-right";
  else if (nodo.id === "trelew") dir = "top";
  else if (nodo.id === "comodoro_rivadavia") dir = "bottom";

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "marcador-g");
  g.dataset.id = nodo.id;

  // Dimensiones de la etiqueta con el nombre del CLOG
  const nombreTexto = nodo.nombre;
  const charWidth = 6.2 / k;
  const pillW = (nombreTexto.length * charWidth + 14 / k);
  const pillH = 16.5 / k;
  const fontSize = 9.2 / k;
  const pillRadius = 4.5 / k;
  const gap = 5.0 / k;

  let pillX = p.x + DOT_R + gap;
  let pillY = p.y - pillH / 2;
  let textX = pillX + pillW / 2;
  let textY = p.y;

  if (dir === "left") {
    pillX = p.x - DOT_R - gap - pillW;
    pillY = p.y - pillH / 2;
    textX = pillX + pillW / 2;
    textY = p.y;
  } else if (dir === "top") {
    pillX = p.x - pillW / 2;
    pillY = p.y - DOT_R - gap - pillH;
    textX = p.x;
    textY = pillY + pillH / 2;
  } else if (dir === "bottom") {
    pillX = p.x - pillW / 2;
    pillY = p.y + DOT_R + gap;
    textX = p.x;
    textY = pillY + pillH / 2;
  } else if (dir === "bottom-left") {
    pillX = p.x - DOT_R - gap - pillW;
    pillY = p.y + DOT_R * 0.4 + gap;
    textX = pillX + pillW / 2;
    textY = pillY + pillH / 2;
  } else if (dir === "bottom-right") {
    pillX = p.x + DOT_R + gap;
    pillY = p.y + DOT_R * 0.4 + gap;
    textX = pillX + pillW / 2;
    textY = pillY + pillH / 2;
  } else if (dir === "top-left") {
    pillX = p.x - DOT_R - gap - pillW;
    pillY = p.y - DOT_R - gap - pillH * 0.5;
    textX = pillX + pillW / 2;
    textY = pillY + pillH / 2;
  }

  // --- Capa 1: Fondo del Pill (se dibuja primero para no tapar el puntito) ---
  const pillBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  pillBg.setAttribute("x", pillX.toFixed(3));
  pillBg.setAttribute("y", pillY.toFixed(3));
  pillBg.setAttribute("width", pillW.toFixed(3));
  pillBg.setAttribute("height", pillH.toFixed(3));
  pillBg.setAttribute("rx", pillRadius.toFixed(3));
  pillBg.setAttribute("ry", pillRadius.toFixed(3));
  pillBg.setAttribute("fill", "#ffffff");
  pillBg.setAttribute("stroke", "#c4d8ea");
  pillBg.setAttribute("stroke-width", (1.2 / k).toFixed(3));
  pillBg.setAttribute("class", "label-pill-bg");
  pillBg.setAttribute("pointer-events", "none");

  // Texto del nombre del CLOG (nítido, negrita institucional Correo Argentino)
  const labelTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
  labelTxt.setAttribute("x", textX.toFixed(3));
  labelTxt.setAttribute("y", textY.toFixed(3));
  labelTxt.setAttribute("text-anchor", "middle");
  labelTxt.setAttribute("dominant-baseline", "central");
  labelTxt.setAttribute("fill", "#002554");
  labelTxt.setAttribute("font-family", "Inter, -apple-system, sans-serif");
  labelTxt.setAttribute("font-size", fontSize.toFixed(3));
  labelTxt.setAttribute("font-weight", "800");
  labelTxt.setAttribute("class", "label-pill-text");
  labelTxt.setAttribute("pointer-events", "none");
  labelTxt.textContent = nombreTexto;

  g.appendChild(pillBg);
  g.appendChild(labelTxt);

  // --- Capa 2: Puntito del CLOG (se dibuja ENCIMA para garantizar 100% de visibilidad) ---
  // Halo exterior
  const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  halo.setAttribute("cx", p.x.toFixed(3));
  halo.setAttribute("cy", p.y.toFixed(3));
  halo.setAttribute("r", GLOW_R.toFixed(3));
  halo.setAttribute("fill", "rgba(0, 37, 84, 0.16)");

  // Círculo base (Verde institucional Correo)
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", p.x.toFixed(3));
  circle.setAttribute("cy", p.y.toFixed(3));
  circle.setAttribute("r", DOT_R.toFixed(3));
  circle.setAttribute("fill", "#008a38");
  circle.setAttribute("stroke", "#ffffff");
  circle.setAttribute("stroke-width", SW.toFixed(3));
  circle.setAttribute("class", "node-dot-core");

  // Centro amarillo institucional
  const centerDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  centerDot.setAttribute("cx", p.x.toFixed(3));
  centerDot.setAttribute("cy", p.y.toFixed(3));
  centerDot.setAttribute("r", INNER_R.toFixed(3));
  centerDot.setAttribute("fill", "#FFD200");
  centerDot.setAttribute("pointer-events", "none");

  g.appendChild(halo);
  g.appendChild(circle);
  g.appendChild(centerDot);

  g.addEventListener("click", e => {
    if (huboMovimiento) return;
    e.stopPropagation();
    document.querySelectorAll(".marcador-g").forEach(m => m.classList.remove("seleccionado"));
    g.classList.add("seleccionado");
    abrirDetalleNodo(nodo);
  });

  parent.appendChild(g);
}

/** Zoom suave hacia el centroide de un cluster */
function zoomHaciaCluster(cx, cy) {
  const contenedor = document.getElementById("mapa-contenedor");
  if (!contenedor) return;
  const rect = contenedor.getBoundingClientRect();

  const nuevaEscala = Math.min(escala * 2.5, 9);
  panX = rect.width / 2 - cx * nuevaEscala;
  panY = rect.height / 2 - cy * nuevaEscala;
  escala = nuevaEscala;

  aplicarTransformacion(true);
}

function obtenerClaseTipo(tipo) {
  switch (tipo) {
    case "CLOG": return "nodo-clog";
    case "DP": return "nodo-dp";
    case "Sorter": return "nodo-sorter";
    case "Regional": return "nodo-regional";
    default: return "nodo-sucursal";
  }
}

function resaltarProvincia(pathEl) {
  document.querySelectorAll(".provincia-svg").forEach(p => {
    p.classList.remove("seleccionada");
  });
  if (pathEl) {
    pathEl.classList.add("seleccionada");
  }
}

/** Deselecciona cualquier provincia o nodo activo y cierra popups */
function deseleccionarTodo() {
  document.querySelectorAll(".provincia-svg.seleccionada").forEach(p => {
    p.classList.remove("seleccionada");
  });
  document.querySelectorAll(".marcador-g.seleccionado").forEach(m => {
    m.classList.remove("seleccionado");
  });
  cerrarPopupNodo();
  const hint = document.querySelector(".mapa-hint-bottom span");
  if (hint) {
    hint.textContent = "Seleccioná un nodo en el mapa para ver su información.";
  }
}

function normalizarTexto(txt) {
  return (txt || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function buscarNodosPorProvincia(rawName) {
  const norm = normalizarTexto(rawName);
  return nodosData.filter(n => {
    const np = normalizarTexto(n.provincia);
    if (norm.includes("ciudad") || norm === "caba") {
      return np.includes("ciudad") || np.includes("caba") || n.id === "barracas";
    }
    if (norm === "buenos aires") {
      return np === "buenos aires";
    }
    return np === norm || np.includes(norm) || norm.includes(np);
  });
}

function seleccionarProvincia(rawName) {
  const nodos = buscarNodosPorProvincia(rawName);

  if (nodos.length > 0) {
    // Destacar en el mapa el/los marcadores correspondientes a esta provincia
    document.querySelectorAll(".marcador-g").forEach(m => {
      const match = nodos.some(n => n.id === m.dataset.id);
      if (match) m.classList.add("seleccionado");
      else m.classList.remove("seleccionado");
    });

    // Abrir ficha del nodo principal o primer nodo, sin saltar la pantalla a zonas vacías
    const principal = nodos.find(n => n.id === "mercado_central" || n.id === "cordoba" || n.id === "rosario" || n.id === "trelew") || nodos[0];
    abrirDetalleNodo(principal, nodos);

    const hint = document.querySelector(".mapa-hint-bottom span");
    if (hint) {
      hint.textContent = `${rawName}: ${nodos.length} centro(s) logístico(s) operativo(s).`;
    }
  } else {
    // Si la provincia no tiene CLOGs propios (ej. Formosa, Tierra del Fuego)
    cerrarPopupNodo();
    const hint = document.querySelector(".mapa-hint-bottom span");
    if (hint) {
      hint.textContent = `Provincia de ${rawName}: cobertura logística articulada mediante cabeceras regionales limítrofes.`;
    }
  }
}

// =============================================================
// 7. EXPANDIR / HACER GRANDE EL MAPA (OCULTAR SIDEBAR)
// =============================================================
function toggleExpandirMapa() {
  expandirMapa(!mapaEstaExpandido);
}

function expandirMapa(expandir) {
  mapaEstaExpandido = expandir;
  const dashboard = document.getElementById("dashboard-principal");
  const expandText = document.getElementById("expand-text");
  const expandIcon = document.getElementById("expand-icon");

  if (mapaEstaExpandido) {
    dashboard.classList.add("mapa-expandido");
    if (expandText) expandText.textContent = "Contraer mapa";
    if (expandIcon) expandIcon.textContent = "✕";

    // Scroll suave hacia el mapa si está arriba
    const mapaEl = document.getElementById("columna-mapa");
    if (mapaEl) {
      mapaEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } else {
    dashboard.classList.remove("mapa-expandido");
    if (expandText) expandText.textContent = "Ampliar mapa";
    if (expandIcon) expandIcon.textContent = "⛶";
  }
}

// =============================================================
// 8. INTERACCIÓN DE PAN (MOVER) Y ZOOM (CON RATÓN Y TOUCH)
// =============================================================
function aplicarTransformacion(conAnimacion = false) {
  const wrap = document.getElementById("mapa-wrap");
  if (!wrap) return;

  if (conAnimacion) {
    wrap.style.transition = "transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)";
  } else {
    wrap.style.transition = "none";
  }
  wrap.style.transform = `translate(${panX.toFixed(2)}px, ${panY.toFixed(2)}px) scale(${escala.toFixed(4)})`;

  // Actualizar etiquetas de provincias y re-renderizar nodos/clusters en tiempo real
  ajustarLabelsSegunZoom();
  renderizarNodos();
}

/**
 * Ajusta tamaño y opacidad de las etiquetas provinciales según el nivel de zoom.
 * Al hacer zoom en los nodos (escala >= 2.0), las provincias se atenúan para no competir con los nombres de los nodos.
 */
function ajustarLabelsSegunZoom() {
  const s = escala;
  const svg = document.getElementById("mapa-svg");
  if (!svg) return;

  const BASE_PROV = 6.4;
  const opacity = s >= 2.2 ? 0.10 : (s >= 1.6 ? 0.35 : 0.85);

  svg.querySelectorAll(".label-provincia").forEach(el => {
    el.style.fontSize = (BASE_PROV / s).toFixed(3) + "px";
    el.style.letterSpacing = (0.3 / s).toFixed(3) + "px";
    el.style.opacity = opacity;
  });
}


function zoomCentrado(factor) {
  const contenedor = document.getElementById("mapa-contenedor");
  if (!contenedor) return;

  const rect = contenedor.getBoundingClientRect();
  const mouseX = rect.width / 2;
  const mouseY = rect.height / 2;

  const mapX = (mouseX - panX) / escala;
  const mapY = (mouseY - panY) / escala;

  const nuevaEscala = Math.min(Math.max(escala * factor, 0.6), 9);
  panX = mouseX - mapX * nuevaEscala;
  panY = mouseY - mapY * nuevaEscala;
  escala = nuevaEscala;

  aplicarTransformacion(true);
}

function zoomIn() { zoomCentrado(1.3); }
function zoomOut() { zoomCentrado(1 / 1.3); }
function zoomReset() {
  escala = 1;
  panX = 0;
  panY = 0;
  aplicarTransformacion(true);
}

function iniciarInteraccionPanZoom() {
  const contenedor = document.getElementById("mapa-contenedor");
  if (!contenedor) return;

  // 1. Rueda del ratón (Wheel Zoom hacia el cursor)
  contenedor.addEventListener("wheel", e => {
    e.preventDefault();
    const rect = contenedor.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const mapX = (mouseX - panX) / escala;
    const mapY = (mouseY - panY) / escala;

    const factor = e.deltaY < 0 ? 1.15 : (1 / 1.15);
    const nuevaEscala = Math.min(Math.max(escala * factor, 0.6), 9);

    panX = mouseX - mapX * nuevaEscala;
    panY = mouseY - mapY * nuevaEscala;
    escala = nuevaEscala;

    aplicarTransformacion(false);
  }, { passive: false });

  // 2. Arrastre con el ratón (Pan / Drag)
  contenedor.addEventListener("mousedown", e => {
    if (e.button !== 0) return; // Solo clic izquierdo
    estaArrastrando = true;
    huboMovimiento = false;
    inicioX = e.clientX - panX;
    inicioY = e.clientY - panY;
    contenedor.classList.add("arrastrando");
  });

  window.addEventListener("mousemove", e => {
    if (!estaArrastrando) return;
    const dx = Math.abs(e.clientX - (inicioX + panX));
    const dy = Math.abs(e.clientY - (inicioY + panY));
    if (dx > 4 || dy > 4) {
      huboMovimiento = true;
    }
    panX = e.clientX - inicioX;
    panY = e.clientY - inicioY;
    aplicarTransformacion(false);
  });

  window.addEventListener("mouseup", () => {
    if (estaArrastrando) {
      estaArrastrando = false;
      contenedor.classList.remove("arrastrando");
      setTimeout(() => { huboMovimiento = false; }, 60);
    }
  });

  // Al hacer clic en el mapa:
  contenedor.addEventListener("click", e => {
    if (huboMovimiento) return;

    // Si hizo clic en controles o leyenda, ignorar
    if (e.target.closest(".btn-ctrl-mapa") || e.target.closest(".mapa-leyenda")) {
      return;
    }

    // Si hizo clic en un nodo, cluster o provincia, ellos manejan su evento
    if (e.target.closest(".marcador-g") || e.target.closest(".cluster-g") || e.target.closest(".provincia-svg")) {
      return;
    }

    // Si hizo clic en un lugar vacío del mapa (océano / fondo):
    // Desaparece el foco amarillo de la provincia y se deselecciona todo
    deseleccionarTodo();

    if (!mapaEstaExpandido) {
      expandirMapa(true);
    }
  });

  // 3. Touch Drag y Pinch-to-zoom
  let distInicialToque = 0;
  let escalaInicialToque = 1;
  let centroInicialToque = { x: 0, y: 0 };

  contenedor.addEventListener("touchstart", e => {
    if (e.touches.length === 1) {
      estaArrastrando = true;
      huboMovimiento = false;
      inicioX = e.touches[0].clientX - panX;
      inicioY = e.touches[0].clientY - panY;
    } else if (e.touches.length === 2) {
      estaArrastrando = false;
      huboMovimiento = true;
      const t1 = e.touches[0], t2 = e.touches[1];
      distInicialToque = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      escalaInicialToque = escala;
      const rect = contenedor.getBoundingClientRect();
      centroInicialToque = {
        x: (t1.clientX + t2.clientX) / 2 - rect.left,
        y: (t1.clientY + t2.clientY) / 2 - rect.top
      };
    }
  }, { passive: false });

  contenedor.addEventListener("touchmove", e => {
    e.preventDefault();
    if (e.touches.length === 1 && estaArrastrando) {
      huboMovimiento = true;
      panX = e.touches[0].clientX - inicioX;
      panY = e.touches[0].clientY - inicioY;
      aplicarTransformacion(false);
    } else if (e.touches.length === 2 && distInicialToque > 0) {
      huboMovimiento = true;
      const t1 = e.touches[0], t2 = e.touches[1];
      const distActual = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const factor = distActual / distInicialToque;
      const mouseX = centroInicialToque.x;
      const mouseY = centroInicialToque.y;
      const mapX = (mouseX - panX) / escala;
      const mapY = (mouseY - panY) / escala;

      const nuevaEscala = Math.min(Math.max(escalaInicialToque * factor, 0.6), 9);
      panX = mouseX - mapX * nuevaEscala;
      panY = mouseY - mapY * nuevaEscala;
      escala = nuevaEscala;
      aplicarTransformacion(false);
    }
  }, { passive: false });

  contenedor.addEventListener("touchend", () => {
    estaArrastrando = false;
    distInicialToque = 0;
    setTimeout(() => { huboMovimiento = false; }, 60);
  });
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
          imgEl.src = f;
          strip.querySelectorAll(".popup-thumb").forEach(t => t.classList.remove("activa"));
          thumb.classList.add("activa");
        };
        strip.appendChild(thumb);
      });
      strip.style.display = "flex";
    } else {
      strip.style.display = "none";
    }
  }

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
