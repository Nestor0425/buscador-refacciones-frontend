console.log("Script.js cargado correctamente");
const API_URL = "https://buscador-refaccionesbackend.onrender.com";

fetch("https://buscador-refaccionesbackend.onrender.com/health")
  .then(res => res.json())
  .then(data => {
    console.log("RESPUESTA BACKEND:", data);
  })
  .catch(err => {
    console.error("ERROR:", err);
  });

  const statusDiv = document.getElementById("backend-status");

fetch("https://buscador-refaccionesbackend.onrender.com/health")
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

  async function mostrarUltimaActualizacion() {
  const elemento = document.getElementById("ultimaActualizacion");

  try {
    const res = await fetch("https://buscador-refaccionesbackend.onrender.com/refacciones");
    const data = await res.json();

    if (data.length === 0) {
      elemento.textContent = "No hay registros aún";
      return;
    }

    // Suponiendo que cada refacción tiene 'updated_at' o 'created_at'
    const ultima = data.reduce((max, r) => {
      const fecha = new Date(r.updated_at || r.created_at);
      return fecha > max ? fecha : max;
    }, new Date(0));

    // Formateo legible, ejemplo: Hoy, 10:45 AM
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

// Llamar la función al cargar la página
mostrarUltimaActualizacion();

async function mostrarTotalRefacciones() {
  const elemento = document.getElementById("totalRefacciones");

  try {
    const res = await fetch("https://buscador-refaccionesbackend.onrender.com/refacciones");
    const data = await res.json();

    // Total de registros
    const total = data.length;

    // Mostrar en la tarjeta con formato de miles
    elemento.textContent = `${total.toLocaleString()} Refacciones`;

  } catch (err) {
    elemento.textContent = "Error al obtener total";
    console.error(err);
  }
}

// Llamar la función al cargar la página
mostrarTotalRefacciones();


async function mostrarUltimosProductos() {
  const nombreElem = document.getElementById("ultimoProducto");
  const etiquetasElem = document.getElementById("ultimasEtiquetas");

  try {
    const res = await fetch("https://buscador-refaccionesbackend.onrender.com/refacciones");
    const data = await res.json();

    if (!data.length) {
      nombreElem.textContent = "No hay refacciones";
      return;
    }

    // Ordenar por id descendente (últimos agregados)
    const ultimos = data.sort((a, b) => b.id - a.id).slice(0, 1); // mostrar solo el último
    const ultimo = ultimos[0];

    // Nombre del último producto
    nombreElem.textContent = ultimo.nombreprod || "Sin nombre";

    // Limpiar badges
    etiquetasElem.innerHTML = "";

    // Si tiene etiquetas, generar badges
    if (ultimo.palclave) {
      const etiquetas = ultimo.palclave.split(","); // separar por coma si hay varias
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

// Llamar al cargar la página
mostrarUltimosProductos();
