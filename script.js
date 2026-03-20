console.log("Script.js cargado correctamente");

// ✅ Usar variable de Vercel si existe
const API_URL = window.API_URL || "https://buscador-refacciones-backend.onrender.com";

// 🔹 Health check
fetch(`${API_URL}/health`)
  .then(res => res.json())
  .then(data => {
    console.log("RESPUESTA BACKEND:", data);
  })
  .catch(err => {
    console.error("ERROR:", err);
  });

const statusDiv = document.getElementById("backend-status");

fetch(`${API_URL}/health`)
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      statusDiv.innerHTML = `
        <p style="color:green;">Backend Conectado</p>
        <p style="color:green;">Base de datos Conectada</p>
        <p>Hora servidor: ${data.time}</p>
      `;
    } else {
      statusDiv.innerHTML = "Backend respondió, pero algo falló";
    }
  })
  .catch(err => {
    statusDiv.innerHTML = "No se pudo conectar al backend";
    console.error(err);
  });

// 🔹 Última actualización
async function mostrarUltimaActualizacion() {
  const elemento = document.getElementById("ultimaActualizacion");

  try {
    const res = await fetch(`${API_URL}/refacciones`);
    const data = await res.json();

    if (data.length === 0) {
      elemento.textContent = "No hay registros aún";
      return;
    }

    const ultima = data.reduce((max, r) => {
      const fecha = new Date(r.updated_at || r.created_at);
      return fecha > max ? fecha : max;
    }, new Date(0));

    const ahora = new Date();
    let texto = "";

    if (ultima.toDateString() === ahora.toDateString()) {
      texto = `Hoy, ${ultima.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else {
      texto = ultima.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    }

    elemento.textContent = texto;

  } catch (err) {
    elemento.textContent = "Error al obtener actualización";
    console.error(err);
  }
}

mostrarUltimaActualizacion();

// 🔹 Total de refacciones
async function mostrarTotalRefacciones() {
  const elemento = document.getElementById("totalRefacciones");

  try {
    const res = await fetch(`${API_URL}/refacciones`);
    const data = await res.json();

    const total = data.length;
    elemento.textContent = `${total.toLocaleString()} Refacciones`;

  } catch (err) {
    elemento.textContent = "Error al obtener total";
    console.error(err);
  }
}

mostrarTotalRefacciones();

// 🔹 Últimos productos
async function mostrarUltimosProductos() {
  const nombreElem = document.getElementById("ultimoProducto");
  const etiquetasElem = document.getElementById("ultimasEtiquetas");

  try {
    const res = await fetch(`${API_URL}/refacciones`);
    const data = await res.json();

    if (!data.length) {
      nombreElem.textContent = "No hay refacciones";
      return;
    }

    const ultimos = data.sort((a, b) => b.id - a.id).slice(0, 1);
    const ultimo = ultimos[0];

    nombreElem.textContent = ultimo.nombreprod || "Sin nombre";
    etiquetasElem.innerHTML = "";

    if (ultimo.palclave) {
      const etiquetas = ultimo.palclave.split(",");
      etiquetas.forEach(et => {
        const span = document.createElement("span");
        span.className = "badge bg-light text-dark border rounded-pill px-3";
        span.textContent = et.trim();
        etiquetasElem.appendChild(span);
      });
    }

  } catch (err) {
    nombreElem.textContent = "Error al cargar";
    console.error(err);
  }
}

mostrarUltimosProductos();

// 🔹 Cargar logs
async function cargarLogs() {
  const res = await fetch(`${API_URL}/logs-db`);
  const logs = await res.json();

  const tabla = document.getElementById("tablaLogs");
  tabla.innerHTML = "";

  logs.forEach(log => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${new Date(log.created_at).toLocaleString()}</td>
      <td>${log.level}</td>
      <td>${log.message}</td>
      <td>${log.route || ""}</td>
      <td>${log.data ? JSON.stringify(log.data) : ""}</td>
    `;
    tabla.appendChild(fila);
  });
}

cargarLogs();