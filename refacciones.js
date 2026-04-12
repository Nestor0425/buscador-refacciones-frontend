// 🛠️ CONFIGURACIÓN DE API (ENFOQUE SENIOR)
// Blindaje contra 'import.meta' undefined y fallback automático a Render
const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
            || "https://buscador-refacciones-backend.onrender.com/api";

console.log("📦 Refacciones.js conectado a:", API);

let textoBusqueda = "";
let filtroStock = "";
let paginaActual = 1;
const LIMITE = 24;

/**
 * Carga los datos de la tabla desde el backend paginado.
 */
async function cargarTabla() {
  const contenedor = document.getElementById("cardsContainer");
  if (!contenedor) return; // Guard clause profesional
  
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
      // Mantenemos tu lógica de semaforización de stock
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
      const totalPaginas = Math.ceil(data.total / LIMITE) || 1;
      paginador.textContent = `Página ${paginaActual} / ${totalPaginas}`;
    }
  } catch (error) {
    console.error("❌ Error en cargarTabla:", error);
    contenedor.innerHTML = `<p class="empty">Error al conectar con el servidor</p>`;
  }
}

// 🌍 EXPOSICIÓN GLOBAL
// Al usar type="module", las funciones no son globales por defecto. 
// Las exponemos a 'window' para no romper tus 'onclick' en el HTML.

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
  })
  .then(res => {
    if (res.ok) {
      cargarTabla();
    } else {
      alert("Error al intentar eliminar el registro.");
    }
  })
  .catch(err => console.error("Error en eliminación:", err));
};

window.verDetalle = function(id) {
  window.location.href = `detalle.html?id=${id}`;
};

window.buscar = function() {
  const inputBusqueda = document.getElementById("busqueda");
  const selectStock = document.getElementById("filtroStock");
  
  textoBusqueda = inputBusqueda ? inputBusqueda.value.toLowerCase() : "";
  filtroStock = selectStock ? selectStock.value : "";
  paginaActual = 1;
  cargarTabla();
};

function obtenerClaseTitulo(maquina) {
  if (!maquina) return "titulo-default";
  const nombre = maquina.toLowerCase().trim().replace(/\s+/g, "-");
  return "titulo-" + nombre;
}

// Inicialización del DOM
document.addEventListener("DOMContentLoaded", cargarTabla);