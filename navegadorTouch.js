/**
 * CONFIGURACIÓN DE API (ENFOQUE SENIOR)
 * Blindaje dinámico para entorno Vercel/Producción y Local.
 */
const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
            || "https://buscador-refacciones-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
    // Inicialización de eventos para enlaces de máquinas
    const linksMaquinas = document.querySelectorAll(".maquina-link");
    
    linksMaquinas.forEach(link => {
        link.addEventListener("click", async e => {
            e.preventDefault();

            const maquinaId = link.dataset.maquinaid;
            console.log("📱 BUSCANDO POR MAQUINA ID (Touch):", maquinaId);

            try {
                // Endpoint unificado para refacciones por máquina
                const res = await fetch(`${API}/refacciones-por-maquina/${maquinaId}`);
                
                if (!res.ok) throw new Error("Error en la respuesta del servidor");
                
                const data = await res.json();
                
                // Actualizamos la UI
                mostrarSeleccionada(data);
                mostrarResultados(data);
                
            } catch (error) {
                console.error("❌ Error en la búsqueda táctil:", error);
            }
        });
    });
});

/**
 * Actualiza el encabezado con el nombre de la máquina seleccionada.
 * Optimizada para evitar duplicidad de títulos.
 */
function mostrarSeleccionada(lista) {
    const titulo = document.getElementById("tituloMaquina");
    if (!titulo) return;

    if (!lista || lista.length === 0) {
        titulo.innerHTML = "<p>No hay refacciones para esta máquina</p>";
        return;
    }

    // Tomamos el nombre de la máquina del primer registro de forma segura
    const nombreMaquina = lista[0].maquinaesp || 'Máquina sin nombre';
    titulo.innerHTML = `<h1 class="h5 mb-0 fw-bold">${nombreMaquina}</h1>`;
}

/**
 * Renderiza las tarjetas de refacciones.
 * Optimizada con DocumentFragment para mejor rendimiento en móviles.
 */
function mostrarResultados(lista) {
    const cont = document.getElementById("resultados");
    if (!cont) {
        console.error("❌ No existe el contenedor #resultados");
        return;
    }

    // Limpieza rápida del contenedor
    cont.innerHTML = "";

    if (!lista || lista.length === 0) {
        cont.innerHTML = "<p class='text-muted p-3'>No hay refacciones disponibles.</p>";
        return;
    }

    // Uso de Fragment para evitar múltiples reflows del navegador
    const fragment = document.createDocumentFragment();

    lista.forEach(r => {
        const card = document.createElement("div");
        card.className = "card-refa";
        
        card.innerHTML = `
            <div class="img-wrap">
                <img src="${r.imagen || 'no-image.png'}" 
                     alt="${r.nombreprod}" 
                     onerror="this.src='no-image.png';">
                <span class="badge-ubi">${r.ubicacion || 'Sin ubicación'}</span>
            </div>
            <div class="info-refa">
                <h3>${r.nombreprod}</h3>
                <div class="datos">
                    <span>Ref: ${r.refinterna || '-'}</span>
                    <span><strong>${r.cantidad || 0}</strong> ${r.unidad || ''}</span>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });

    cont.appendChild(fragment);
}