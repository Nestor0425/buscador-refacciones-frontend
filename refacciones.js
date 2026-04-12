console.log("Refacciones.js cargado correctamente");
const API = "https://buscador-refacciones-backend.onrender.com/api";

let textoBusqueda = "";
let filtroStock = "";

let paginaActual = 1;
const LIMITE = 24;

async function cargarTabla() {
  const contenedor = document.getElementById("cardsContainer");
  if (!contenedor) return; // Guard clause para evitar errores si el DOM no está listo
  
  contenedor.innerHTML = `<p class="empty">Cargando...</p>`;

  try {
    const res = await fetch(
      `${API}/refacciones-paginadas?page=${paginaActual}&limit=${LIMITE}&search=${textoBusqueda}&stock=${filtroStock}`
    );

    const data = await res.json();
    contenedor.innerHTML = "";

    if (!data.rows || data.rows.length === 0) {
      contenedor.innerHTML = `<p class="empty">Sin refacciones</p>`;
      return;
    }

    data.rows.forEach(r => {
      // Mantenemos tu lógica original de stock
      const stockClass = r.cantidad === 0 ? "zero" : r.cantidad < 5 ? "low" : "ok";

      const card = document.createElement("div");
      card.className = "ref-card";

      card.innerHTML = `
        <div class="ref-img">
          <img 
            src="${r.imagen || 'no-image.jpg'}"
            alt="${r.nombreprod || 'Sin nombre'}"
            onerror="this.onerror=null; this.src='no-image.jpg';"
          />
        </div>
        <div class="ref-body">
          <h3 class="ref-title ${obtenerClaseTitulo(r.maquina)}">
            ${r.nombreprod || "Sin nombre"}
          </h3>
          <div class="ref-modelo">Ref: <strong>${r.refinterna || "-"}</strong></div>
          <div class="ref-modelo">Modelo: <strong>${r.modelo || "-"}</strong></div>
          <div class="ref-cantidad ${stockClass}">
            Cantidad: <strong>${r.cantidad || 0} ${r.unidad || ""}</strong>
          </div>
          <div class="ref-ubicacion">📍 ${r.ubicacion || "Sin ubicación"}</div>
          <div class="ref-actions">
            <button onclick="verDetalle(${r.id})" class="btn-ver">Editar</button>
            <button onclick="eliminar(${r.id})" class="btn-ver" style="background:#dc2626;">Eliminar</button>
          </div>
        </div>
      `;
      contenedor.appendChild(card);
    });

    const paginador = document.getElementById("pagina");
    if (paginador) {
      paginador.textContent = `Página ${paginaActual} / ${Math.ceil(data.total / LIMITE)}`;
    }
  } catch (error) {
    console.error("Error en cargarTabla:", error);
    contenedor.innerHTML = `<p class="empty">Error al conectar con el servidor</p>`;
  }
}

// EXPOSICIÓN GLOBAL: Necesario para que los 'onclick' del HTML funcionen
window.next = function() {
  paginaActual++;
  cargarTabla();
};

window.prev = function() {
  if (paginaActual > 1) {
    paginaActual--;
    cargarTabla();
  }
};

window.eliminar = function(id) {
  if (!confirm("¿Borrar esta refacción?")) return;
  fetch(`${API}/refacciones/${id}`, {
    method: "DELETE"
  }).then(() => cargarTabla());
};

window.verDetalle = function(id) {
  window.location.href = `detalle.html?id=${id}`;
};

window.buscar = function() {
  textoBusqueda = document.getElementById("busqueda").value.toLowerCase();
  filtroStock = document.getElementById("filtroStock").value;
  paginaActual = 1;
  cargarTabla();
};

function obtenerClaseTitulo(maquina) {
  if (!maquina) return "titulo-default";
  const nombre = maquina.toLowerCase().replace(/\s+/g, "-");
  return "titulo-" + nombre;
}

// Eliminamos el bloque duplicado que tenías al final, ya que 'r' no existe ahí.
// La lógica ya está integrada dentro del forEach arriba.

// Ejecución inicial
document.addEventListener("DOMContentLoaded", cargarTabla);