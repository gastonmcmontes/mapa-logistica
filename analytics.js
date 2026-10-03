// =============================================================
// CORREO ARGENTINO — ANALYTICS & ESTADÍSTICAS LOGÍSTICAS
// Controlador de gráficos con Chart.js y datos oficiales del Excel
// =============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Verificación de datos oficiales
  if (typeof NODOS_DATA_OFICIAL === "undefined" || !NODOS_DATA_OFICIAL.length) {
    console.error("No se encontró el dataset oficial NODOS_DATA_OFICIAL");
    return;
  }

  // Paleta de colores oficial Correo Argentino
  const COLOR_AZUL_DARK   = "#002554";
  const COLOR_AZUL_MID    = "#004b99";
  const COLOR_AZUL_LIGHT  = "#2a75d3";
  const COLOR_AMARILLO    = "#FFD200";
  const COLOR_AMARILLO_DK = "#e6be00";
  const COLOR_CYAN        = "#0096c7";
  const COLOR_PURPLE      = "#6366f1";
  const COLOR_ORANGE      = "#f97316";
  const COLOR_GREEN       = "#10b981";
  const COLOR_RED         = "#ef4444";

  // Instancias de Chart.js
  let chartTopVolumen = null;
  let chartCuotaRegion = null;
  let chartComposicion = null;
  let chartSuperficie = null;
  let chartTurnos = null;
  let chartProcesos = null;
  let chartOptimizacion = null;
  let chartPuestos = null;
  let chartIngresosMaq = null;

  // Estado actual
  let currentRegion = "nacional";
  let currentSearch = "";
  let sortColumn = "volumenTotalNum";
  let sortDirection = "desc";

  // Estado del transporte
  let currentTransportService = "TODOS";
  let currentTransportSearch = "";

  // Mapeo de Regiones
  const REGIONES_INFO = {
    "nacional":  { nombre: "Nacional (36 plantas)", key: "nacional" },
    "amba":      { nombre: "Metropolitana / AMBA", key: "amba" },
    "pba":       { nombre: "PBA / La Pampa", key: "pba" },
    "centro":    { nombre: "Centro / NEA", key: "centro" },
    "cuyo":      { nombre: "Cuyo / NOA", key: "cuyo" },
    "patagonia": { nombre: "Patagonia / Sur", key: "patagonia" }
  };

  // Función de filtrado por región
  function getFilteredData(regionKey) {
    if (!regionKey || regionKey === "nacional") {
      return [...NODOS_DATA_OFICIAL];
    }
    return NODOS_DATA_OFICIAL.filter(n => n.regionKey === regionKey);
  }

  // =============================================================
  // Generador de curva SVG suave para el sparkline dinámico de volumen
  function calcularRutaSparkline(valores, w = 140, h = 28) {
    if (!valores || valores.length === 0) {
      return `M 0,${h - 4} L ${w},${h - 4}`;
    }

    const minVal = Math.min(...valores);
    const maxVal = Math.max(...valores);
    const rango = (maxVal - minVal) || 1;

    // Rango visual Y (7px arriba para que no toque el texto, 24px abajo)
    const yMin = 7;
    const yMax = h - 4;

    const puntos = valores.map((v, idx) => {
      const x = (idx / (valores.length - 1 || 1)) * w;
      const norm = (v - minVal) / rango;
      const y = yMax - (norm * (yMax - yMin));
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    });

    if (puntos.length === 1) {
      return `M 0,${puntos[0].y} L ${w},${puntos[0].y}`;
    }

    let d = `M ${puntos[0].x},${puntos[0].y}`;
    for (let i = 0; i < puntos.length - 1; i++) {
      const p0 = puntos[i];
      const p1 = puntos[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }

    return d;
  }

  // =============================================================
  // 1. ACTUALIZAR TARJETAS KPI
  // =============================================================
  function actualizarKPIs(regionKey) {
    const data = getFilteredData(regionKey);

    const totalPlantas = data.length;
    const totalVolumen = data.reduce((acc, n) => acc + (n.volumenTotalNum || 0), 0);
    const totalVenta = data.reduce((acc, n) => acc + (parseFloat(String(n.volumenVenta || "0").replace(/[^0-9.-]/g, "")) || 0), 0);
    const totalJurisdiccion = data.reduce((acc, n) => acc + (parseFloat(String(n.volumenJurisdiccion || "0").replace(/[^0-9.-]/g, "")) || 0), 0);
    const totalDotacion = data.reduce((acc, n) => acc + (n.dotacionTotal || 0), 0);
    const totalAuxiliares = data.reduce((acc, n) => acc + (n.dotacionAuxiliares || 0), 0);
    const totalM2 = data.reduce((acc, n) => acc + (n.capacidadM2 || 0), 0);

    const elVol = document.getElementById("akpi-volumen");
    const elVolSub = document.getElementById("akpi-volumen-sub");
    if (elVol) elVol.textContent = totalVolumen.toLocaleString("es-AR");
    if (elVolSub) elVolSub.textContent = `${totalVenta.toLocaleString("es-AR")} Vta · ${totalJurisdiccion.toLocaleString("es-AR")} Jur.`;

    // Actualizar gráfico de fondo (sparkline dinámico según las plantas de la región)
    const volumenes = data.map(n => n.volumenTotalNum || 0);
    const sparkD = calcularRutaSparkline(volumenes, 140, 28);
    const elSpark = document.getElementById("sparkline-path");
    const elArea = document.getElementById("sparkline-area");
    if (elSpark) elSpark.setAttribute("d", sparkD);
    if (elArea) elArea.setAttribute("d", `${sparkD} L 140,28 L 0,28 Z`);

    const elPlantas = document.getElementById("akpi-plantas");
    const elPlantasSub = document.getElementById("akpi-plantas-sub");
    if (elPlantas) elPlantas.textContent = totalPlantas;
    if (elPlantasSub) {
      const clogs = data.filter(n => n.tipo === "CLOG").length;
      const sorters = data.filter(n => n.tipo === "Sorter" || n.tipo === "SORTER").length;
      const cdps = data.filter(n => n.tipo === "CDP").length;
      const ctps = data.filter(n => n.tipo === "CTP").length;
      elPlantasSub.textContent = `${clogs} CLOG · ${sorters} Sorter · ${cdps} CDP · ${ctps} CTP`;
    }

    const elDot = document.getElementById("akpi-dotacion");
    const elDotSub = document.getElementById("akpi-dotacion-sub");
    if (elDot) elDot.textContent = totalDotacion.toLocaleString("es-AR");
    if (elDotSub) elDotSub.textContent = `${totalAuxiliares.toLocaleString("es-AR")} aux. operativos`;

    const elM2 = document.getElementById("akpi-superficie");
    const elM2Sub = document.getElementById("akpi-superficie-sub");
    if (elM2) elM2.textContent = `${totalM2.toLocaleString("es-AR")} m²`;
    if (elM2Sub) {
      const promM2 = totalPlantas ? Math.round(totalM2 / totalPlantas) : 0;
      elM2Sub.textContent = `Promedio ${promM2.toLocaleString("es-AR")} m² / planta`;
    }

    // Turno con mayor dotación
    let tn = 0, tm = 0, tt = 0;
    data.forEach(n => {
      const t = n.turnos || {};
      const jn = parseInt(t.noche?.jerarquico || 0) || 0;
      const an = parseInt(t.noche?.auxiliares || 0) || 0;
      const jm = parseInt(t.manana?.jerarquico || 0) || 0;
      const am = parseInt(t.manana?.auxiliares || 0) || 0;
      const jt = parseInt(t.tarde?.jerarquico || 0) || 0;
      const at = parseInt(t.tarde?.auxiliares || 0) || 0;
      tn += (jn + an);
      tm += (jm + am);
      tt += (jt + at);
    });

    const maxTurno = Math.max(tn, tm, tt);
    let nombreMax = "Mañana";
    if (maxTurno === tn) nombreMax = "Noche";
    if (maxTurno === tt) nombreMax = "Tarde";

    const elTurno = document.getElementById("akpi-turno");
    const elTurnoSub = document.getElementById("akpi-turno-sub");
    if (elTurno) elTurno.textContent = `Turno ${nombreMax}`;
    if (elTurnoSub) elTurnoSub.textContent = `${maxTurno} pers. (${totalDotacion ? Math.round((maxTurno / totalDotacion) * 100) : 0}%)`;

    // Productividad
    const elProd = document.getElementById("akpi-productividad");
    const elProdSub = document.getElementById("akpi-productividad-sub");
    if (elProd) {
      const ratio = totalDotacion ? Math.round(totalVolumen / totalDotacion) : 0;
      elProd.textContent = `${ratio.toLocaleString("es-AR")} env/p`;
    }
    if (elProdSub) elProdSub.textContent = "Capacidad media por operario";
  }

  // =============================================================
  // 2. CONFIGURACIÓN Y ACTUALIZACIÓN DE GRÁFICOS
  // =============================================================
  Chart.defaults.font.family = "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = "#556987";
  Chart.defaults.plugins.tooltip.backgroundColor = "#002554";
  Chart.defaults.plugins.tooltip.titleColor = "#FFD200";
  Chart.defaults.plugins.tooltip.titleFont = { weight: "bold", size: 13 };
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;

  function inicializarGraficos() {
    const data = getFilteredData(currentRegion);

    // ---------------------------------------------------------
    // Gráfico 1: Top 10 Plantas por Volumen
    // ---------------------------------------------------------
    const ctxTop = document.getElementById("chart-top-volumen")?.getContext("2d");
    if (ctxTop) {
      const top10 = [...data]
        .sort((a, b) => (b.volumenTotalNum || 0) - (a.volumenTotalNum || 0))
        .slice(0, 10);

      chartTopVolumen = new Chart(ctxTop, {
        type: "bar",
        data: {
          labels: top10.map(p => `${p.cod} - ${p.nombre}`),
          datasets: [{
            label: "Envíos Diarios Totales",
            data: top10.map(p => p.volumenTotalNum || 0),
            backgroundColor: top10.map((_, i) => i === 0 ? COLOR_AMARILLO : COLOR_AZUL_DARK),
            borderRadius: 6,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` Volumen: ${ctx.parsed.y.toLocaleString("es-AR")} envíos/día`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { maxRotation: 45, minRotation: 20 }
            },
            y: {
              beginAtZero: true,
              grid: { color: "#edf2f7" },
              ticks: {
                callback: v => v >= 1000 ? `${(v / 1000).toLocaleString("es-AR")}k` : v
              }
            }
          }
        }
      });
    }

    // ---------------------------------------------------------
    // Gráfico 2: Cuota de Volumen por Región
    // ---------------------------------------------------------
    const ctxCuota = document.getElementById("chart-cuota-region")?.getContext("2d");
    if (ctxCuota) {
      const volPorRegion = {
        "AMBA": 0,
        "PBA / La Pampa": 0,
        "Centro / NEA": 0,
        "Cuyo / NOA": 0,
        "Patagonia / Sur": 0
      };

      NODOS_DATA_OFICIAL.forEach(n => {
        const v = n.volumenTotalNum || 0;
        if (n.regionKey === "amba") volPorRegion["AMBA"] += v;
        else if (n.regionKey === "pba") volPorRegion["PBA / La Pampa"] += v;
        else if (n.regionKey === "centro") volPorRegion["Centro / NEA"] += v;
        else if (n.regionKey === "cuyo") volPorRegion["Cuyo / NOA"] += v;
        else if (n.regionKey === "patagonia") volPorRegion["Patagonia / Sur"] += v;
      });

      chartCuotaRegion = new Chart(ctxCuota, {
        type: "doughnut",
        data: {
          labels: Object.keys(volPorRegion),
          datasets: [{
            data: Object.values(volPorRegion),
            backgroundColor: [COLOR_AMARILLO, COLOR_AZUL_DARK, COLOR_CYAN, COLOR_ORANGE, COLOR_PURPLE],
            borderWidth: 2,
            borderColor: "#ffffff"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const val = ctx.parsed;
                  const total = Object.values(volPorRegion).reduce((a, b) => a + b, 0);
                  const pct = total ? ((val / total) * 100).toFixed(1) : 0;
                  return ` ${ctx.label}: ${val.toLocaleString("es-AR")} (${pct}%)`;
                }
              }
            }
          },
          cutout: "68%"
        }
      });
    }

    // ---------------------------------------------------------
    // Gráfico 3: Venta vs Jurisdicción
    // ---------------------------------------------------------
    const ctxComp = document.getElementById("chart-composicion-envios")?.getContext("2d");
    if (ctxComp) {
      const regiones = ["amba", "pba", "centro", "cuyo", "patagonia"];
      const labels = ["AMBA", "PBA", "Centro", "Cuyo/NOA", "Sur"];
      const vtas = [];
      const jurs = [];

      regiones.forEach(rk => {
        const nodosReg = NODOS_DATA_OFICIAL.filter(n => n.regionKey === rk);
        const v = nodosReg.reduce((acc, n) => acc + (parseFloat(String(n.volumenVenta || "0").replace(/[^0-9.-]/g, "")) || 0), 0);
        const j = nodosReg.reduce((acc, n) => acc + (parseFloat(String(n.volumenJurisdiccion || "0").replace(/[^0-9.-]/g, "")) || 0), 0);
        vtas.push(v);
        jurs.push(j);
      });

      chartComposicion = new Chart(ctxComp, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Venta Directa",
              data: vtas,
              backgroundColor: COLOR_AZUL_MID,
              borderRadius: 4
            },
            {
              label: "Jurisdicción",
              data: jurs,
              backgroundColor: COLOR_AMARILLO,
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 12 } },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString("es-AR")} envíos`
              }
            }
          },
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: {
              stacked: true,
              beginAtZero: true,
              grid: { color: "#edf2f7" },
              ticks: { callback: v => v >= 1000 ? `${(v / 1000).toLocaleString("es-AR")}k` : v }
            }
          }
        }
      });
    }

    // ---------------------------------------------------------
    // Gráfico 4: Superficie vs Dotación
    // ---------------------------------------------------------
    const ctxSup = document.getElementById("chart-superficie-dotacion")?.getContext("2d");
    if (ctxSup) {
      const regiones = ["amba", "pba", "centro", "cuyo", "patagonia"];
      const labels = ["AMBA", "PBA", "Centro", "Cuyo/NOA", "Sur"];
      const sup = [];
      const dot = [];

      regiones.forEach(rk => {
        const nodosReg = NODOS_DATA_OFICIAL.filter(n => n.regionKey === rk);
        sup.push(nodosReg.reduce((acc, n) => acc + (n.capacidadM2 || 0), 0));
        dot.push(nodosReg.reduce((acc, n) => acc + (n.dotacionTotal || 0), 0));
      });

      chartSuperficie = new Chart(ctxSup, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              type: "bar",
              label: "Superficie (m²)",
              data: sup,
              backgroundColor: "rgba(0, 37, 84, 0.8)",
              yAxisID: "y",
              borderRadius: 4
            },
            {
              type: "line",
              label: "Dotación (pers.)",
              data: dot,
              borderColor: COLOR_ORANGE,
              backgroundColor: COLOR_ORANGE,
              borderWidth: 3,
              pointRadius: 5,
              yAxisID: "y1"
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top" } },
          scales: {
            x: { grid: { display: false } },
            y: {
              type: "linear",
              display: true,
              position: "left",
              grid: { color: "#edf2f7" },
              ticks: { callback: v => v >= 1000 ? `${(v / 1000).toLocaleString("es-AR")}k m²` : `${v} m²` }
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              beginAtZero: true,
              grace: "10%",
              grid: { drawOnChartArea: false },
              ticks: { callback: v => `${v} pers.` }
            }
          }
        }
      });
    }

    // ---------------------------------------------------------
    // Gráfico 5: Turnos
    // ---------------------------------------------------------
    const ctxTurnos = document.getElementById("chart-distribucion-turnos")?.getContext("2d");
    if (ctxTurnos) {
      let tn = 0, tm = 0, tt = 0;
      data.forEach(n => {
        const t = n.turnos || {};
        tn += (parseInt(t.noche?.jerarquico || 0) || 0) + (parseInt(t.noche?.auxiliares || 0) || 0);
        tm += (parseInt(t.manana?.jerarquico || 0) || 0) + (parseInt(t.manana?.auxiliares || 0) || 0);
        tt += (parseInt(t.tarde?.jerarquico || 0) || 0) + (parseInt(t.tarde?.auxiliares || 0) || 0);
      });

      chartTurnos = new Chart(ctxTurnos, {
        type: "pie",
        data: {
          labels: ["Turno Noche", "Turno Mañana", "Turno Tarde"],
          datasets: [{
            data: [tn, tm, tt],
            backgroundColor: ["#5a3bc2", "#0077b6", "#d97706"],
            borderWidth: 2,
            borderColor: "#ffffff"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12, padding: 14 } },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const val = ctx.parsed;
                  const total = tn + tm + tt;
                  const pct = total ? Math.round((val / total) * 100) : 0;
                  return ` ${ctx.label}: ${val} personas (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }

    // ---------------------------------------------------------
    // Gráfico 6: Procesos
    // ---------------------------------------------------------
    const ctxProc = document.getElementById("chart-procesos-tipos")?.getContext("2d");
    if (ctxProc) {
      const counts = {
        "CDP Paquetería": data.filter(n => n.procesos?.cdp && n.procesos.cdp !== "0" && n.procesos.cdp !== "no").length,
        "CTP Postal": data.filter(n => n.procesos?.ctp && n.procesos.ctp !== "0" && n.procesos.ctp !== "no").length,
        "Planta a Planta": data.filter(n => n.procesos?.ptaPta && n.procesos.ptaPta !== "0" && n.procesos.ptaPta !== "no").length,
        "Clasificación": data.filter(n => n.procesos?.clasificacion && n.procesos.clasificacion !== "0" && n.procesos.clasificacion !== "no").length
      };

      chartProcesos = new Chart(ctxProc, {
        type: "bar",
        data: {
          labels: Object.keys(counts),
          datasets: [{
            label: "Plantas con Proceso Activo",
            data: Object.values(counts),
            backgroundColor: [COLOR_AZUL_MID, COLOR_CYAN, COLOR_PURPLE, COLOR_AMARILLO],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: {
              beginAtZero: true,
              max: data.length,
              grid: { color: "#edf2f7" },
              ticks: { stepSize: 5 }
            }
          }
        }
      });
    }

    // ---------------------------------------------------------
    // Gráfico 7: Optimización Regional (Sheet 6 - Imagen 2 Full-Width)
    // ---------------------------------------------------------
    const ctxOptReg = document.getElementById("chart-optimizacion-regional")?.getContext("2d");
    if (ctxOptReg) {
      chartOptimizacion = new Chart(ctxOptReg, {
        type: "bar",
        data: {
          labels: ["Patagonia / SUR", "CUYO / NOA", "CENTRO / NEA", "PBA / LA PAMPA"],
          datasets: [
            {
              label: "Auxiliares operativos actuales",
              data: [105, 212, 224, 107],
              backgroundColor: "#002554",
              borderRadius: 5,
              barPercentage: 0.72,
              categoryPercentage: 0.65
            },
            {
              label: "Personal necesario (operación)",
              data: [89, 150, 178, 81],
              backgroundColor: "#10b981",
              borderRadius: 5,
              barPercentage: 0.72,
              categoryPercentage: 0.65
            },
            {
              label: "Personal a reubicar (excedente)",
              data: [16, 62, 46, 26],
              backgroundColor: "#ef4444",
              borderRadius: 5,
              barPercentage: 0.72,
              categoryPercentage: 0.65
            }
          ]
        },
        plugins: [
          {
            id: "barValueLabels",
            afterDatasetsDraw(chart) {
              const { ctx } = chart;
              ctx.save();
              ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "bottom";
              chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar, index) => {
                  const val = dataset.data[index];
                  ctx.fillStyle = dataset.backgroundColor;
                  ctx.fillText(val, bar.x, bar.y - 4);
                });
              });
              ctx.restore();
            }
          }
        ],
        options: {
          indexAxis: "x",
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 4,
              right: 10,
              left: 4,
              bottom: 4
            }
          },
          plugins: {
            legend: {
              display: true,
              position: "top",
              align: "end",
              maxHeight: 90,
              labels: {
                usePointStyle: true,
                pointStyle: "rectRounded",
                boxWidth: 10,
                boxHeight: 10,
                padding: 12,
                font: { family: "Plus Jakarta Sans, sans-serif", size: 11, weight: "700" },
                color: "#334155"
              }
            },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y} personas`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 260,
              grid: { color: "#f1f5f9" },
              ticks: { stepSize: 50, font: { size: 11, family: "Plus Jakarta Sans, sans-serif" }, color: "#64748b" }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 12, weight: "800", family: "Plus Jakarta Sans, sans-serif" }, color: "#0f172a" }
            }
          }
        }
      });

      // Asegurar renderizado correcto y completo de la leyenda tras carga de fuentes/layout
      requestAnimationFrame(() => {
        chartOptimizacion.resize();
        chartOptimizacion.update("none");
      });
      setTimeout(() => {
        chartOptimizacion.resize();
        chartOptimizacion.update("none");
      }, 100);
    }

    // ---------------------------------------------------------
    // Gráfico 8: Puestos Operativos vs Reubicación (Doughnut - Imagen 1)
    // ---------------------------------------------------------
    const ctxPuestos = document.getElementById("chart-puestos-operativos")?.getContext("2d");
    if (ctxPuestos) {
      chartPuestos = new Chart(ctxPuestos, {
        type: "doughnut",
        data: {
          labels: ["Manipulación de paquetes", "Expedición / Transporte", "Personal a reubicar (otros)"],
          datasets: [{
            data: [78, 42, 30],
            backgroundColor: ["#004b99", "#f59e0b", "#ef4444"],
            borderWidth: 3,
            borderColor: "#ffffff",
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => {
                  const val = ctx.parsed;
                  const pct = Math.round((val / 150) * 100);
                  return ` ${ctx.label}: ${val} personas (${pct}%)`;
                }
              }
            }
          },
          cutout: "68%"
        }
      });
    }

    // ---------------------------------------------------------
    // Gráfico 9: Ingreso de Envíos Maquinables vs No Maquinables (Sheets 2 a 5)
    // ---------------------------------------------------------
    const ctxIngMaq = document.getElementById("chart-ingresos-maquinables")?.getContext("2d");
    if (ctxIngMaq) {
      const plantasConIngreso = NODOS_DATA_OFICIAL
        .filter(n => n.ingresoEnvios && n.ingresoEnvios.impoMensual > 0)
        .sort((a, b) => b.ingresoEnvios.impoMensual - a.ingresoEnvios.impoMensual)
        .slice(0, 12);

      chartIngresosMaq = new Chart(ctxIngMaq, {
        type: "bar",
        data: {
          labels: plantasConIngreso.map(p => `${p.cod} (${p.nombre})`),
          datasets: [
            {
              label: "Maquinable (Sorter Mecánico)",
              data: plantasConIngreso.map(p => p.ingresoEnvios.impoMensualMaquinable || 0),
              backgroundColor: "#0284c7",
              borderRadius: 4
            },
            {
              label: "No Maquinable (Manual / Irregular)",
              data: plantasConIngreso.map(p => p.ingresoEnvios.impoMensualNoMaquinable || 0),
              backgroundColor: "#f59e0b",
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { boxWidth: 12 } },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString("es-AR")} envíos/mes`
              }
            }
          },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { maxRotation: 35, minRotation: 20 } },
            y: {
              stacked: true,
              beginAtZero: true,
              grid: { color: "#edf2f7" },
              ticks: { callback: v => v >= 1000 ? `${(v / 1000).toLocaleString("es-AR")}k` : v }
            }
          }
        }
      });
    }
  }

  // =============================================================
  // 3. ACTUALIZAR GRÁFICOS AL CAMBIAR DE REGIÓN
  // =============================================================
  function actualizarGraficosRegion(regionKey) {
    const data = getFilteredData(regionKey);

    // 1. Top 10
    if (chartTopVolumen) {
      const top10 = [...data]
        .sort((a, b) => (b.volumenTotalNum || 0) - (a.volumenTotalNum || 0))
        .slice(0, 10);
      chartTopVolumen.data.labels = top10.map(p => `${p.cod} - ${p.nombre}`);
      chartTopVolumen.data.datasets[0].data = top10.map(p => p.volumenTotalNum || 0);
      chartTopVolumen.data.datasets[0].backgroundColor = top10.map((_, i) => i === 0 ? COLOR_AMARILLO : COLOR_AZUL_DARK);
      chartTopVolumen.update();
    }

    // 5. Turnos
    if (chartTurnos) {
      let tn = 0, tm = 0, tt = 0;
      data.forEach(n => {
        const t = n.turnos || {};
        tn += (parseInt(t.noche?.jerarquico || 0) || 0) + (parseInt(t.noche?.auxiliares || 0) || 0);
        tm += (parseInt(t.manana?.jerarquico || 0) || 0) + (parseInt(t.manana?.auxiliares || 0) || 0);
        tt += (parseInt(t.tarde?.jerarquico || 0) || 0) + (parseInt(t.tarde?.auxiliares || 0) || 0);
      });
      chartTurnos.data.datasets[0].data = [tn, tm, tt];
      chartTurnos.update();
    }

    // 6. Procesos
    if (chartProcesos) {
      const counts = [
        data.filter(n => n.procesos?.cdp && n.procesos.cdp !== "0" && n.procesos.cdp !== "no").length,
        data.filter(n => n.procesos?.ctp && n.procesos.ctp !== "0" && n.procesos.ctp !== "no").length,
        data.filter(n => n.procesos?.ptaPta && n.procesos.ptaPta !== "0" && n.procesos.ptaPta !== "no").length,
        data.filter(n => n.procesos?.clasificacion && n.procesos.clasificacion !== "0" && n.procesos.clasificacion !== "no").length
      ];
      chartProcesos.data.datasets[0].data = counts;
      chartProcesos.options.scales.y.max = data.length || 10;
      chartProcesos.update();
    }
  }

  // =============================================================
  // 4. TABLA DE DETALLE ANALÍTICO DE PLANTAS
  // =============================================================
  function renderTabla() {
    const tbody = document.getElementById("analytics-table-body");
    const countEl = document.getElementById("table-count-label");
    if (!tbody) return;

    let data = getFilteredData(currentRegion);

    // Filtro por texto de búsqueda
    if (currentSearch.trim()) {
      const q = currentSearch.toLowerCase().trim();
      data = data.filter(p =>
        (p.nombre && p.nombre.toLowerCase().includes(q)) ||
        (p.cod && p.cod.toLowerCase().includes(q)) ||
        (p.provincia && p.provincia.toLowerCase().includes(q)) ||
        (p.tipo && p.tipo.toLowerCase().includes(q)) ||
        (p.responsables?.jefePlanta && p.responsables.jefePlanta.toLowerCase().includes(q))
      );
    }

    // Ordenamiento
    data.sort((a, b) => {
      let va = a[sortColumn];
      let vb = b[sortColumn];

      if (sortColumn === "responsables") {
        va = a.responsables?.jefePlanta || "";
        vb = b.responsables?.jefePlanta || "";
      }

      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();

      if (va < vb) return sortDirection === "asc" ? -1 : 1;
      if (va > vb) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    if (countEl) {
      countEl.textContent = `Mostrando ${data.length} de ${NODOS_DATA_OFICIAL.length} plantas`;
    }

    tbody.innerHTML = "";
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:#64748b;">No se encontraron plantas para los filtros seleccionados.</td></tr>`;
      return;
    }

    data.forEach(p => {
      const tr = document.createElement("tr");

      let tipoClass = "tipo-clog-badge";
      if (p.tipo === "Sorter" || p.tipo === "SORTER") tipoClass = "tipo-sorter-badge";
      if (p.tipo === "CDP") tipoClass = "tipo-cdp-badge";
      if (p.tipo === "CTP") tipoClass = "tipo-ctp-badge";

      tr.innerHTML = `
        <td><span class="table-pill-cod">${p.cod}</span></td>
        <td><strong>${p.nombreCompleto || p.nombre}</strong></td>
        <td><span class="table-pill-tipo ${tipoClass}">${p.tipo}</span></td>
        <td>${p.provincia} (${p.region})</td>
        <td><strong>${(p.volumenTotalNum || 0).toLocaleString("es-AR")}</strong></td>
        <td>${(p.capacidadM2 || 0).toLocaleString("es-AR")} m²</td>
        <td>${p.dotacionTotal || 0} pers.</td>
        <td>${p.responsables?.jefePlanta || "S/D"}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Ordenamiento de tabla por clic en cabecera
  document.querySelectorAll(".analytics-table th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-sort");
      if (sortColumn === col) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortColumn = col;
        sortDirection = "desc";
      }

      document.querySelectorAll(".analytics-table th[data-sort]").forEach(el => {
        el.classList.remove("sorted-asc", "sorted-desc");
      });
      th.classList.add(sortDirection === "asc" ? "sorted-asc" : "sorted-desc");

      renderTabla();
    });
  });

  // Buscador de tabla de plantas
  const searchInput = document.getElementById("table-search");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      currentSearch = e.target.value;
      renderTabla();
    });
  }

  // =============================================================
  // 5. TABLA Y FILTROS DE RED DE TRANSPORTE
  // =============================================================
  function renderTablaTransporte() {
    const tbody = document.getElementById("transporte-table-body");
    const infoEl = document.getElementById("transporte-filter-info");
    if (!tbody) return;

    const red = (typeof TRANSPORTE_RED_OFICIAL !== "undefined" && Array.isArray(TRANSPORTE_RED_OFICIAL))
      ? TRANSPORTE_RED_OFICIAL
      : [];

    let filtered = red;

    // Filtro por servicio
    if (currentTransportService !== "TODOS") {
      filtered = filtered.filter(t => t.tipoServicio && t.tipoServicio.toUpperCase().includes(currentTransportService.toUpperCase()));
    }

    // Filtro por texto
    if (currentTransportSearch.trim()) {
      const q = currentTransportSearch.toLowerCase().trim();
      filtered = filtered.filter(t =>
        (t.linea && t.linea.toLowerCase().includes(q)) ||
        (t.codPlanta && t.codPlanta.toLowerCase().includes(q)) ||
        (t.dependencia && t.dependencia.toLowerCase().includes(q)) ||
        (t.region && t.region.toLowerCase().includes(q)) ||
        (t.provincia && t.provincia.toLowerCase().includes(q))
      );
    }

    if (infoEl) {
      infoEl.textContent = `Mostrando ${filtered.length} de ${red.length} líneas de servicio`;
    }

    tbody.innerHTML = "";
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:24px;color:#64748b;">No se encontraron líneas de transporte para los filtros seleccionados.</td></tr>`;
      return;
    }

    // Limitamos la vista a las primeras 100 para fluidez en DOM, o render completo
    filtered.slice(0, 120).forEach(t => {
      const tr = document.createElement("tr");

      let srvClass = "srv-adic";
      const s = (t.tipoServicio || "").toUpperCase();
      if (s.includes("LTC")) srvClass = "srv-ltc";
      else if (s.includes("BUE")) srvClass = "srv-bue";
      else if (s.includes("ATP")) srvClass = "srv-atp";
      else if (s.includes("LTN")) srvClass = "srv-ltn";

      tr.innerHTML = `
        <td><strong>${t.linea}</strong></td>
        <td><span class="table-pill-cod">${t.codPlanta}</span> ${t.dependencia || ""}</td>
        <td>${t.region}</td>
        <td><span class="chip-servicio ${srvClass}">${t.tipoServicio || "TR"}</span></td>
        <td>${t.frecuencia || "LUN A VIE"}</td>
        <td>${t.horarioLlegada || "-"}</td>
        <td>${t.horarioSalida || "-"}</td>
        <td>${t.tiempoOperacion || "-"}</td>
        <td>${t.distanciaKm ? `${t.distanciaKm} km` : "-"}</td>
        <td><strong>${t.capacidadBodega || "-"}</strong></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Configuración de chips de filtro de transporte
  const chipsCont = document.getElementById("transporte-filtros-servicio");
  if (chipsCont) {
    chipsCont.addEventListener("click", e => {
      const chip = e.target.closest(".trans-chip");
      if (!chip) return;
      chipsCont.querySelectorAll(".trans-chip").forEach(c => c.classList.remove("activo"));
      chip.classList.add("activo");
      currentTransportService = chip.getAttribute("data-servicio");
      renderTablaTransporte();
    });
  }

  const transSearch = document.getElementById("transporte-search");
  if (transSearch) {
    transSearch.addEventListener("input", e => {
      currentTransportSearch = e.target.value;
      renderTablaTransporte();
    });
  }

  // =============================================================
  // 6. EXPORTAR CSV
  // =============================================================
  const btnExport = document.getElementById("btn-exportar-csv");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const data = getFilteredData(currentRegion);
      let csv = "Codigo,Planta,Tipo,Provincia,Region,Volumen_Total,Volumen_Venta,Volumen_Jurisdiccion,Superficie_M2,Dotacion_Total,Auxiliares,Jefe_Planta,Jefe_Nodo\n";

      data.forEach(p => {
        const fila = [
          `"${p.cod}"`,
          `"${p.nombreCompleto || p.nombre}"`,
          `"${p.tipo}"`,
          `"${p.provincia}"`,
          `"${p.region}"`,
          p.volumenTotalNum || 0,
          p.volumenVentaNum || 0,
          p.volumenJurisdiccionNum || 0,
          p.capacidadM2 || 0,
          p.dotacionTotal || 0,
          p.dotacionAuxiliares || 0,
          `"${p.responsables?.jefePlanta || ''}"`,
          `"${p.responsables?.jefeNodo || ''}"`
        ];
        csv += fila.join(",") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `correo_argentino_analytics_${currentRegion}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // =============================================================
  // 7. CUSTOM SELECT (VISTA DE REGIÓN)
  // =============================================================
  const wrap = document.getElementById("custom-vista-wrap");
  const btn  = document.getElementById("custom-vista-btn");
  const list = document.getElementById("custom-vista-list");
  const label = document.getElementById("custom-vista-label");

  if (wrap && btn && list) {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const isOpen = wrap.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen);
    });

    list.addEventListener("click", e => {
      const option = e.target.closest(".custom-select-option");
      if (!option) return;

      list.querySelectorAll(".custom-select-option").forEach(el => el.classList.remove("selected"));
      option.classList.add("selected");
      if (label) label.textContent = option.textContent;

      const val = option.getAttribute("data-value");
      currentRegion = val;

      actualizarKPIs(val);
      actualizarGraficosRegion(val);
      renderTabla();

      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("click", e => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // =============================================================
  // 8. INTERACCIÓN DE PESTAÑAS (FILTRADO DE SECCIONES SIN SCROLL)
  // =============================================================
  const tabs = document.querySelectorAll(".analytics-tab");
  const sectionBlocks = document.querySelectorAll(".analytics-section-block");

  tabs.forEach(tab => {
    tab.addEventListener("click", e => {
      e.preventDefault();

      const targetTab = tab.getAttribute("data-tab");
      if (!targetTab) return;

      // 1. Cambiar estado visual de las pestañas
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // 2. Si es 'indicadores', mostramos TODO el tablero
      //    Si es otra pestaña, mostramos únicamente la sección correspondiente
      sectionBlocks.forEach(sec => {
        const secType = sec.getAttribute("data-tab-section");
        if (targetTab === "indicadores") {
          sec.style.display = "";
        } else if (secType === targetTab) {
          sec.style.display = "";
        } else {
          sec.style.display = "none";
        }
      });

      // 3. Reajustar gráficos Chart.js en la vista visible
      setTimeout(() => {
        if (chartOptimizacion) {
          chartOptimizacion.resize();
          chartOptimizacion.update("none");
        }
        window.dispatchEvent(new Event("resize"));
      }, 50);
    });
  });

  // 9. Interacción con filas de tabla regional del resumen ejecutivo
  document.querySelectorAll(".opt-table-compact tbody tr").forEach((tr, idx) => {
    tr.style.cursor = "pointer";
    tr.addEventListener("click", () => {
      const regKeys = ["patagonia", "cuyo", "centro", "pba"];
      const key = regKeys[idx];
      if (key) {
        const targetOpt = list?.querySelector(`.custom-select-option[data-value="${key}"]`);
        if (targetOpt) targetOpt.click();
      }
    });
  });

  // Inicialización completa
  actualizarKPIs("nacional");
  inicializarGraficos();
  renderTabla();
  renderTablaTransporte();

  // Asegurar renderizado nítido de etiquetas y leyendas al completar carga de tipografía
  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (chartOptimizacion) {
        chartOptimizacion.resize();
        chartOptimizacion.update("none");
      }
    });
  }
});
