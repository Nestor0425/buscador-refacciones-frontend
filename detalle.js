/**
 * CONFIGURACIÓN DE API (ENFOQUE SENIOR)
 * Blindaje contra fallos de entorno y fallback automático.
 */
const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
            || "https://buscador-refacciones-backend.onrender.com";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const form = document.getElementById("form");

// Elementos de UI
const inputImagen = document.getElementById("imagen");
const inputImagenUrl = document.getElementById("imagenUrl");
const preview = document.getElementById("previewImagen");
const btnQuitar = document.getElementById("btnQuitarImagen");
const btnEliminarImagen = document.getElementById("btnEliminarImagen");

let imagenEliminada = false;
let valoresActuales = {};
let maquinasDisponibles = [];
let maquinasSeleccionadas = [];

/* ==========================================
   🚀 EJECUCIÓN INICIAL (OPTIMIZADA)
========================================== */
(async () => {
    try {
        // Cargamos el detalle primero para tener los valores de referencia
        await cargarDetalle();

        // Ejecutamos las peticiones de opciones en paralelo para ganar velocidad
        await Promise.all([
            cargarOpciones("/opciones/categorias", "categoriaprin"),
            cargarOpciones("/opciones/maquinamod", "maquinamod"),
            cargarOpciones("/opciones/maquinaesp", "maquinaesp"),
            cargarOpciones("/opciones/nummaquina", "nummaquina"),
            inicializarMaquinas()
        ]);
        
        console.log("✅ Sistema de edición inicializado correctamente");
    } catch (error) {
        console.error("❌ Error en la carga inicial:", error);
    }
})();

/* =========================
   CARGAR DETALLE REFACCIÓN
========================= */
async function cargarDetalle() {
    if (!id) return;
    const res = await fetch(`${API}/refacciones/${id}`);
    const r = await res.json();
    valoresActuales = r;

    Object.keys(r).forEach(key => {
        if (key === "imagen") return; // Protección: nunca tocar el input file

        const el = document.getElementById(key);
        if (el && el.tagName !== "SELECT") {
            el.value = r[key] ?? "";
        }
    });

    if (r.imagen) {
        preview.src = r.imagen;
        preview.style.display = "block";
        btnQuitar.style.display = "block";
    }
}

async function cargarOpciones(endpoint, selectId) {
    const res = await fetch(`${API}${endpoint}`);
    const data = await res.json();
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = `<option value="">-- Selecciona --</option>`;
    data.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.valor;
        opt.textContent = item.valor;
        select.appendChild(opt);
    });

    if (valoresActuales[selectId]) {
        select.value = valoresActuales[selectId];
    }
}

/* =========================
   GUARDAR CAMBIOS (UNIFICADO)
========================= */
form.addEventListener("submit", async e => {
    e.preventDefault();

    const fd = new FormData();

    // 1. Recolectar inputs estándar
    document.querySelectorAll("input:not([type=checkbox]):not([type=file]), textarea, select")
        .forEach(el => {
            if (el.id === "buscarMaquina") return;
            fd.append(el.id, el.value);
        });

    // 2. Manejo de Imágenes (Archivo o URL)
    if (inputImagen && inputImagen.files.length > 0) {
        fd.append("imagen", inputImagen.files[0]);
    }

    if (inputImagenUrl && inputImagenUrl.value.trim() !== "") {
        fd.append("imagenUrl", inputImagenUrl.value.trim());
    }

    if (imagenEliminada) {
        fd.append("eliminarImagen", "true");
    }

    // 3. Compatibilidad
    fd.append("compatibilidad", JSON.stringify(maquinasSeleccionadas));

    try {
        const res = await fetch(`${API}/refacciones/${id}`, {
            method: "PUT",
            body: fd
        });

        if (!res.ok) throw new Error("Error en la respuesta del servidor");

        alert("✅ Refacción actualizada correctamente");
        window.location.href = "refaUbi/refacconUbi.html";
    } catch (error) {
        console.error("❌ Error al guardar:", error);
        alert("❌ Error al guardar los cambios.");
    }
});

/* =========================
   GESTIÓN DE MÁQUINAS (MODAL)
========================= */
async function inicializarMaquinas() {
    // Cargas paralelas
    const [mRes, cRes] = await Promise.all([
        fetch(`${API}/maquinas`).then(r => r.json()),
        fetch(`${API}/refacciones/${id}/compatibles`).then(r => r.json())
    ]);

    maquinasDisponibles = mRes;
    maquinasSeleccionadas = (cRes.maquinas || []).map(mid => Number(mid));

    renderModal(maquinasDisponibles);
    renderChips();
}

function renderModal(lista) {
    const listaModal = document.getElementById("lista-maquinas-modal");
    if (!listaModal) return;
    listaModal.innerHTML = "";

    const grupos = {};
    lista.forEach(m => {
        const cat = m.categoriaprin || "OTROS";
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(m);
    });

    const accordion = document.createElement("div");
    accordion.className = "accordion";
    accordion.id = "accordionMaquinas";

    Object.keys(grupos).forEach((categoria, index) => {
        const collapseId = `collapse-${index}`;
        const headingId = `heading-${index}`;
        const maquinasHTML = grupos[categoria].map(m => {
            const checked = maquinasSeleccionadas.includes(Number(m.id)) ? "checked" : "";
            return `
                <div class="col-md-6 mb-2">
                    <div class="machine-item">
                        <input type="checkbox" value="${m.id}" ${checked}>
                        ${m.maquinamod || ""} ${m.maquinaesp || ""}
                    </div>
                </div>`;
        }).join("");

        const item = document.createElement("div");
        item.className = "accordion-item";
        item.innerHTML = `
            <h2 class="accordion-header" id="${headingId}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                    ${categoria.toUpperCase()} (${grupos[categoria].length})
                </button>
            </h2>
            <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#accordionMaquinas">
                <div class="accordion-body"><div class="row">${maquinasHTML}</div></div>
            </div>`;
        accordion.appendChild(item);
    });
    listaModal.appendChild(accordion);
}

// Evento de búsqueda en modal
document.addEventListener("input", e => {
    if (e.target.id === "buscarMaquina") {
        const texto = e.target.value.toLowerCase();
        const filtradas = maquinasDisponibles.filter(m => 
            `${m.maquinamod} ${m.maquinaesp}`.toLowerCase().includes(texto)
        );
        renderModal(filtradas);
    }
});

// Confirmar selección del modal
document.addEventListener("click", e => {
    if (e.target.id === "confirmarMaquinas") {
        const checks = document.querySelectorAll("#lista-maquinas-modal input:checked");
        maquinasSeleccionadas = Array.from(checks).map(c => Number(c.value));
        renderChips();
        bootstrap.Modal.getInstance(document.getElementById("modalMaquinas")).hide();
    }
});

function renderChips() {
    const cont = document.getElementById("lista-maquinas");
    if (!cont) return;
    cont.innerHTML = "";

    maquinasSeleccionadas.forEach(mid => {
        const maquina = maquinasDisponibles.find(m => m.id === mid);
        if (!maquina) return;
        cont.innerHTML += `
            <span class="compat-chip">
                ${maquina.maquinamod} ${maquina.maquinaesp}
                <button type="button" onclick="quitarMaquina(${mid})">
                    <i class="bi bi-x"></i>
                </button>
            </span>`;
    });
}

// EXPOSICIÓN GLOBAL para los onclick del HTML
window.quitarMaquina = function(mid) {
    maquinasSeleccionadas = maquinasSeleccionadas.filter(m => m !== mid);
    renderChips();
};

/* =========================
   GESTIÓN DE IMÁGENES
========================= */
btnEliminarImagen.addEventListener("click", async () => {
    if (!confirm("¿Eliminar imagen definitivamente del servidor?")) return;
    try {
        await fetch(`${API}/refacciones/${id}/imagen`, { method: "DELETE" });
        preview.src = "";
        preview.style.display = "none";
        imagenEliminada = true;
    } catch (err) { console.error(err); }
});

inputImagen.addEventListener("change", () => {
    const file = inputImagen.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
        btnQuitar.style.display = "block";
        imagenEliminada = false;
    }
});

btnQuitar.addEventListener("click", () => {
    preview.src = "";
    preview.style.display = "none";
    btnQuitar.style.display = "none";
    inputImagen.value = "";
});