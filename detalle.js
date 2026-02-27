
const API = "https://buscador-refaccionesbackend.onrender.com";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let valoresActuales = {};

/* =========================
   CARGAR DETALLE REFACCIÓN
========================= */
async function cargarDetalle() {
  const res = await fetch(`${API}/refacciones/${id}`);
  const r = await res.json();

  valoresActuales = r;

  Object.keys(r).forEach(key => {
    // ❌ NUNCA tocar input file
    if (key === "imagen") return;

    const el = document.getElementById(key);
    if (el && el.tagName !== "SELECT") {
      el.value = r[key] ?? "";
    }
  });

  // ✅ mostrar imagen si existe
  if (r.imagen) {
    const img = document.getElementById("preview-imagen");
    if (img) {
      img.src = r.imagen;
      img.style.display = "block";
    }
  }
}

/* =========================
   CARGAR OPCIONES SELECT
========================= */
async function cargarOpciones(endpoint, selectId) {
  const res = await fetch(`${API}${endpoint}`);
  const data = await res.json();

  const select = document.getElementById(selectId);
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
   GUARDAR CAMBIOS
========================= */
document.getElementById("form").addEventListener("submit", async e => {
  e.preventDefault();

  const fd = new FormData();

  document
    .querySelectorAll("input:not([type=checkbox]):not([type=file]), textarea, select")
    .forEach(el => {
  if (el.id === "buscarMaquina") return; // 🔥 excluir
  fd.append(el.id, el.value);
});


  const fileInput = document.getElementById("imagen");
  if (fileInput && fileInput.files.length > 0) {
    fd.append("imagen", fileInput.files[0]);
  }

  const imagenUrlInput = document.getElementById("imagenUrl");

if (imagenUrlInput && imagenUrlInput.value.trim() !== "") {
  fd.append("imagenUrl", imagenUrlInput.value.trim());
}

  
fd.append(
  "compatibilidad",
  JSON.stringify(maquinasSeleccionadas)
);
console.log("Compatibilidad a guardar:", maquinasSeleccionadas);

  const res = await fetch(`${API}/refacciones/${id}`, {
    method: "PUT",
    body: fd
  });

  if (!res.ok) {
    alert("❌ Error al guardar");
    return;
  }

  alert("✅ Refacción actualizada");
  window.location.href = "refaUbi/refacconUbi.html";
});

/* =========================
   EJECUCIÓN ORDENADA
========================= */
(async () => {
  await cargarDetalle();

  await cargarOpciones("/opciones/categorias", "categoriaprin");
  await cargarOpciones("/opciones/maquinamod", "maquinamod");
  await cargarOpciones("/opciones/maquinaesp", "maquinaesp");
await cargarOpciones("/opciones/nummaquina", "nummaquina");

  // await cargarMaquinasCompatibles();
  await inicializarMaquinas();

})();

function renderCompatibles(maquinas) {
  const cont = document.getElementById("lista-maquinas");
  cont.innerHTML = "";

  maquinas.forEach(m => {
    cont.innerHTML += `
      <div class="compat-chip">
        ${m.nombre}
        <button onclick="quitarMaquina(${m.id})">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;
  });
}


let maquinasDisponibles = [];
let maquinasSeleccionadas = [];

/* =========================
   CARGAR MAQUINAS EN MODAL
========================= */
async function inicializarMaquinas() {
  // Traer todas las máquinas
  maquinasDisponibles = await fetch(`${API}/maquinas`)
    .then(r => r.json());

  // Traer compatibles actuales
  const resp = await fetch(`${API}/refacciones/${id}/compatibles`)
    .then(r => r.json());

  maquinasSeleccionadas = (resp.maquinas || []).map(id => Number(id));


  renderModal(maquinasDisponibles);
  renderChips();
}


function renderModal(lista) {
  console.log(lista);

  const listaModal = document.getElementById("lista-maquinas-modal");
  if (!listaModal) return;

  listaModal.innerHTML = "";

  const grupos = {};

  // Agrupar por categoría
  lista.forEach(m => {
    const categoria = m.categoriaprin || "OTROS";

    if (!grupos[categoria]) {
      grupos[categoria] = [];
    }

    grupos[categoria].push(m);
  });

  // Crear accordion principal
  const accordion = document.createElement("div");
  accordion.className = "accordion";
  accordion.id = "accordionMaquinas";

  let index = 0;

  Object.keys(grupos).forEach(categoria => {
    const collapseId = `collapse-${index}`;
    const headingId = `heading-${index}`;

    const maquinasHTML = grupos[categoria].map(m => {
      const checked = maquinasSeleccionadas.includes(Number(m.id)) ? "checked" : "";

      return `
        <div class="col-md-6 mb-2">
          <div class="machine-item">
            <input type="checkbox"
                   value="${m.id}"
                   data-categoria="${m.categoriaprin}"
                   ${checked}>
            ${m.maquinamod || ""} ${m.maquinaesp || ""}
          </div>
        </div>
      `;
    }).join("");

    const item = document.createElement("div");
    item.className = "accordion-item";

    item.innerHTML = `
      <h2 class="accordion-header" id="${headingId}">
        <button class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#${collapseId}">
          ${categoria.toUpperCase()} (${grupos[categoria].length})
        </button>
      </h2>
      <div id="${collapseId}"
           class="accordion-collapse collapse"
           data-bs-parent="#accordionMaquinas">
        <div class="accordion-body">
          <div class="row">
            ${maquinasHTML}
          </div>
        </div>
      </div>
    `;

    accordion.appendChild(item);
    index++;
  });

  listaModal.appendChild(accordion);
}
/* =========================
   BUSCADOR MODAL
========================= */
document.addEventListener("input", e => {
  if (e.target.id === "buscarMaquina") {
    const texto = e.target.value.toLowerCase();

    const filtradas = maquinasDisponibles.filter(m =>
      `${m.maquinamod} ${m.maquinaesp}`
        .toLowerCase()
        .includes(texto)
    );

    renderModal(filtradas);
  }
});

/* =========================
   CONFIRMAR SELECCIÓN
========================= */
document.addEventListener("click", e => {
  if (e.target.id === "confirmarMaquinas") {
    const checks = document.querySelectorAll(
      "#lista-maquinas-modal input:checked"
    );

    maquinasSeleccionadas = Array.from(checks)
      .map(c => Number(c.value));

    renderChips();

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalMaquinas")
    );
    modal.hide();
  }
});

/* =========================
   RENDER CHIPS
========================= */
function renderChips() {
  const cont = document.getElementById("lista-maquinas");
  if (!cont) return;

  cont.innerHTML = "";

  maquinasSeleccionadas.forEach(id => {
    const maquina = maquinasDisponibles.find(m => m.id === id);
    if (!maquina) return;

    cont.innerHTML += `
      <span class="compat-chip">
        ${maquina.maquinamod} ${maquina.maquinaesp}
        <button onclick="quitarMaquina(${id})">
          <i class="bi bi-x"></i>
        </button>
      </span>
    `;
  });
}

function quitarMaquina(id) {
  maquinasSeleccionadas =
    maquinasSeleccionadas.filter(m => m !== id);

  renderChips();
}

btnEliminarImagen.addEventListener("click", async () => {
  if (!confirm("¿Eliminar imagen?")) return;

  await fetch(`/refacciones/${id}/imagen`, {
    method: "DELETE"
  });

  location.reload();
});