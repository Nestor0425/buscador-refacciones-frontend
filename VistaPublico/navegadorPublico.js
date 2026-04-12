/**
 * CONFIGURACIÓN DE API (ENFOQUE SENIOR)
 * Blindaje dinámico para entorno Vercel/Producción y Local.
 */
const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
            || "https://buscador-refacciones-backend.onrender.com/api";

let modeloSeleccionado = "";
let resultadosActuales = [];
let tagsActivos = [];
let modoGlobal = false;
let cardsDOM = []; // Caché de elementos DOM para optimizar filtrado

/* ==========================================
   🔒 GESTIÓN DE SESIÓN Y SEGURIDAD
========================================== */
async function validarSesion() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.replace("index.html");
        return null;
    }

    try {
        const response = await fetch(`${API}/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Token expirado o inválido");

        const usuario = await response.json();
        const elementoUsuario = document.getElementById("usuarioActivo");
        if (elementoUsuario) elementoUsuario.textContent = usuario.nombre;

        return usuario;
    } catch (error) {
        console.error("🚫 Error de sesión:", error);
        localStorage.clear();
        window.location.replace("index.html");
        return null;
    }
}

function bloquearBotonAtras() {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => window.history.go(1);
}

/* ==========================================
   🚀 INICIALIZACIÓN UNIFICADA
========================================== */
document.addEventListener("DOMContentLoaded", async () => {
    const usuario = await validarSesion();
    if (!usuario) return;
    
    bloquearBotonAtras();
    initModalStatic(); // Preparamos el modal una sola vez

    // Registro de Eventos de Filtro
    const inputs = ["buscarTitulo", "buscarRef", "buscarModelo", "buscarPalabras"];
    inputs.forEach(id => document.getElementById(id)?.addEventListener("input", aplicarFiltros));
    
    document.getElementById("filtroTipo")?.addEventListener("change", aplicarFiltros);
    document.getElementById("filtroUnidad")?.addEventListener("change", aplicarFiltros);

    // Botón Global
    document.getElementById("btnTodasRefacciones")?.addEventListener("click", activarModoGlobal);

    // Gestión de Tags
    const inputTag = document.getElementById("inputTag");
    inputTag?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const valor = inputTag.value.trim().toLowerCase();
            if (valor && !tagsActivos.includes(valor)) {
                tagsActivos.push(valor);
                crearTagVisual(valor);
                aplicarFiltros();
            }
            inputTag.value = "";
        }
    });

    // Enlaces de máquinas
    document.querySelectorAll(".maquina-link").forEach(link => {
        link.addEventListener("click", (e) => seleccionarMaquina(e, link));
    });
});

/* ==========================================
   🔍 LÓGICA DE BÚSQUEDA Y FILTRADO
========================================== */
async function seleccionarMaquina(e, link) {
    e.preventDefault();
    modoGlobal = false;
    document.getElementById("formFiltros").style.display = "flex";
    
    tagsActivos = [];
    document.querySelectorAll("#contenedorTags .badge").forEach(t => t.remove());
    
    modeloSeleccionado = link.dataset.maquinamod;
    console.log("🛠️ Filtrando por modelo:", modeloSeleccionado);

    try {
        const res = await fetch(`${API}/refacciones-por-maquinamod?maquinamod=${encodeURIComponent(modeloSeleccionado)}`);
        resultadosActuales = await res.json();
        
        llenarSelects(resultadosActuales);
        actualizarTitulo();
        mostrarResultados(resultadosActuales);
    } catch (err) {
        console.error("❌ Error cargando máquina:", err);
    }
}

async function activarModoGlobal() {
    console.log("🌎 ACTIVANDO MODO GLOBAL");
    modoGlobal = true;
    document.getElementById("formFiltros").style.display = "flex";
    modeloSeleccionado = "";
    resultadosActuales = [];

    actualizarTitulo();
    await llenarSelectsGlobal();
    await aplicarFiltros();
}

async function aplicarFiltros() {
    const params = {
        tit: document.getElementById("buscarTitulo")?.value.toLowerCase().trim() || "",
        ref: document.getElementById("buscarRef")?.value.toLowerCase().trim() || "",
        modelo: document.getElementById("buscarModelo")?.value.toLowerCase().trim() || "",
        tipo: document.getElementById("filtroTipo")?.value || "",
        unidad: document.getElementById("filtroUnidad")?.value || "",
        palabras: tagsActivos.join(" ")
    };

    if (modoGlobal) {
        try {
            const query = new URLSearchParams(params).toString();
            const res = await fetch(`${API}/buscar-refacciones?${query}`);
            resultadosActuales = await res.json();
            actualizarSelectsDesdeResultados(resultadosActuales);
            mostrarResultados(resultadosActuales);
        } catch (error) {
            console.error("Error global:", error);
        }
        return;
    }

    // Filtrado Local
    const filtrados = resultadosActuales.filter(r => {
        const coincidenTags = tagsActivos.length === 0 || 
            tagsActivos.every(tag => (r.palclave || "").toLowerCase().includes(tag));
            
        return (String(r.nombreprod || "").toLowerCase().includes(params.tit)) &&
               (String(r.refinterna || "").toLowerCase().includes(params.ref)) &&
               (String(r.modelo || "").toLowerCase().includes(params.modelo)) &&
               (!params.tipo || r.tipoprod === params.tipo) &&
               (!params.unidad || r.unidad === params.unidad) &&
               coincidenTags;
    });

    actualizarSelectsDesdeResultados(filtrados);
    mostrarResultados(filtrados);
}

/* ==========================================
   🖼️ UI Y RENDERIZADO
========================================== */
function mostrarResultados(lista) {
    const cont = document.getElementById("resultados");
    if (!cont) return;

    cont.innerHTML = "";
    const fragment = document.createDocumentFragment();

    lista.forEach(r => {
        const card = document.createElement("div");
        card.className = "ref-card";
        card.innerHTML = `
            <div class="ref-img">
                <img src="${r.imagen || 'no-image.jpg'}" alt="${r.nombreprod}" onerror="this.src='no-image.jpg';">
            </div>
            <div class="ref-body">
                <h3 class="ref-title">${r.nombreprod}</h3>
                <div class="ref-modelo">Modelo: <strong>${r.modelo || '-'}</strong></div>
                <div class="ref-cantidad">Cant: <strong>${r.cantidad} ${r.unidad || ''}</strong></div>
                <div class="ref-ubicacion">📍 ${r.ubicacion || 'Sin ubicación'}</div>
                <div class="ref-actions">
                    <a href="detalle.html?id=${r.id}" class="btn-ver btn btn-primary btn-sm">Editar</a>
                    <button class="btn btn-secondary btn-sm" onclick="verDetallesModal(${r.id})">Detalles</button>
                </div>
            </div>`;
        fragment.appendChild(card);
    });

    cont.appendChild(fragment);
}

function actualizarTitulo() {
    const titulo = document.getElementById("tituloRefacciones");
    if (!titulo) return;

    titulo.className = "titulo-default"; 
    if (modoGlobal) {
        titulo.textContent = "Refacciones IEMCO";
    } else {
        titulo.textContent = `Refacciones IEMCO - ${modeloSeleccionado}`;
        const clases = ["aoki", "asb", "nissei", "sumitomo", "enlainadora", "molino", "pagani", "rapid"];
        const detectada = clases.find(c => modeloSeleccionado.toLowerCase().includes(c));
        if (detectada) titulo.classList.add(`titulo-${detectada}`);
    }
}

/* ==========================================
   📦 MODAL Y METADATA
========================================== */
function initModalStatic() {
    if (document.getElementById("modalDetalles")) return;
    const modalHTML = `
    <div class="modal fade" id="modalDetalles" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-fullscreen">
            <div class="modal-content border-0">
                <div class="modal-header text-white" style="background-color:#167d2b;">
                    <h5 class="modal-title fw-bold" id="m-header">Detalle</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4 d-flex flex-column flex-lg-row gap-4">
                    <img id="m-img" class="img-fluid rounded shadow zoom-img" style="max-height:450px; object-fit:contain;">
                    <div class="flex-grow-1">
                        <h3 id="m-nombre" class="fw-bold"></h3>
                        <div id="m-grid" class="row row-cols-md-2 g-3 mt-2"></div>
                        <div class="mt-4 p-3 bg-success bg-opacity-10 border rounded">
                            <div class="fw-bold text-success">Ubicación Actual</div>
                            <div id="m-ubi" class="fs-5 fw-semibold"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
}

async function verDetallesModal(id) {
    const ref = resultadosActuales.find(r => r.id == id);
    if (!ref) return;

    document.getElementById("m-header").textContent = ref.nombreprod;
    document.getElementById("m-nombre").textContent = ref.nombreprod;
    document.getElementById("m-img").src = ref.imagen || 'no-image.jpg';
    document.getElementById("m-ubi").textContent = ref.ubicacion || 'Sin ubicación';

    const fields = [
        ["Tipo", ref.tipoprod], ["Modelo", ref.modelo], 
        ["Ref. Interna", ref.refinterna], ["Palabra Clave", ref.palclave]
    ];
    
    document.getElementById("m-grid").innerHTML = fields
        .map(f => `<div class="col"><div class="text-secondary small">${f[0]}</div><div>${f[1] || '-'}</div></div>`)
        .join("");

    const myModal = new bootstrap.Modal(document.getElementById('modalDetalles'));
    myModal.show();
}

// Helpers de Selects
function llenarSelects(data) {
    const tipos = [...new Set(data.map(r => r.tipoprod).filter(Boolean))];
    const unidades = [...new Set(data.map(r => r.unidad).filter(Boolean))];
    renderSelectOptions("filtroTipo", tipos, "Todos los tipos");
    renderSelectOptions("filtroUnidad", unidades, "Todas las unidades");
}

function renderSelectOptions(id, list, placeholder) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `<option value="">${placeholder}</option>` + 
                   list.map(i => `<option value="${i}">${i}</option>`).join("");
}

async function llenarSelectsGlobal() {
    const res = await fetch(`${API}/refacciones-metadata`);
    const data = await res.json();
    renderSelectOptions("filtroTipo", data.tipos, "Todos los tipos");
    renderSelectOptions("filtroUnidad", data.unidades, "Todas las unidades");
}

function actualizarSelectsDesdeResultados(data) {
    // Esta función previene que los selects se limpien mientras el usuario filtra localmente
    const tipoPre = document.getElementById("filtroTipo").value;
    const unidadPre = document.getElementById("filtroUnidad").value;
    llenarSelects(data);
    document.getElementById("filtroTipo").value = tipoPre;
    document.getElementById("filtroUnidad").value = unidadPre;
}

function crearTagVisual(texto) {
    const cont = document.getElementById("contenedorTags");
    const input = document.getElementById("inputTag");
    const tag = document.createElement("span");
    tag.className = "badge bg-primary d-flex align-items-center gap-2 m-1";
    tag.innerHTML = `${texto} <span style="cursor:pointer">✕</span>`;
    tag.querySelector("span").onclick = () => {
        tagsActivos = tagsActivos.filter(t => t !== texto);
        tag.remove();
        aplicarFiltros();
    };
    cont.insertBefore(tag, input);
}

// Exponer funciones necesarias al objeto global
window.verDetallesModal = verDetallesModal;