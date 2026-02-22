const API = "https://buscador-refaccionesbackend.onrender.com";
let modeloSeleccionado = "";
let resultadosActuales = [];
let tagsActivos = [];
let modoGlobal = false;


document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("buscarTitulo")?.addEventListener("input", aplicarFiltros);
document.getElementById("buscarRef")?.addEventListener("input", aplicarFiltros);
  document.getElementById("buscarModelo")?.addEventListener("input", aplicarFiltros);
  document.getElementById("filtroTipo")?.addEventListener("change", aplicarFiltros);
  document.getElementById("filtroUnidad")?.addEventListener("change", aplicarFiltros);
  document.getElementById("buscarPalabras")
  ?.addEventListener("input", aplicarFiltros);

const inputTag = document.getElementById("inputTag");
const contenedorTags = document.getElementById("contenedorTags");

document.getElementById("btnTodasRefacciones")?.addEventListener("click", async () => {

  console.log("🌎 ACTIVANDO MODO GLOBAL");

  modoGlobal = true;
  modeloSeleccionado = "";
  resultadosActuales = [];

  // 🔥 Poner título por defecto
  const titulo = document.getElementById("tituloRefacciones");
  if (titulo) {
    titulo.textContent = "Refacciones IEMCO";
    titulo.className = "titulo-default"; // limpia otras clases
  }

  await llenarSelectsGlobal();

  // Lanza búsqueda inicial automáticamente
  await aplicarFiltros();
});




inputTag.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();

    const valor = inputTag.value.trim().toLowerCase();
    if (!valor) return;

    if (!tagsActivos.includes(valor)) {
      tagsActivos.push(valor);
      crearTagVisual(valor);
      aplicarFiltros();
    }

    inputTag.value = "";
  }
});

  document.querySelectorAll(".maquina-link").forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();

      modoGlobal = false;
      tagsActivos = [];
contenedorTags.querySelectorAll(".badge").forEach(t => t.remove());
      const maquinamod = link.dataset.maquinamod;
      modeloSeleccionado = maquinamod; // 🔥 guardamos el modelo

      console.log("BUSCANDO POR MODELO:", maquinamod);

      const res = await fetch(
        `${API}/refacciones-por-maquinamod?maquinamod=${encodeURIComponent(maquinamod)}`
      );

      const data = await res.json();
      console.log(data[0]);

      resultadosActuales = data; // 🔥 guardamos lo que vino del backend
 // 🔥 guardamos los datos
llenarSelects(data);       // 🔥 llenamos tipos y unidades dinámicamente


      actualizarTitulo(); // 🔥 actualizamos título
      mostrarResultados(data); // 🔥 mostramos resultados
    });
  });
});

// function actualizarTitulo() {
//   const titulo = document.getElementById("tituloRefacciones");
//   if (!titulo) return;

//   titulo.textContent = `Refacciones IEMCO - ${modeloSeleccionado}`;

//   // Limpia clases anteriores
//   titulo.classList.remove(
//     "titulo-default",
//     "titulo-aoki",
//     "titulo-asb",
//     "titulo-nissei",
//     "titulo-sumitomo",
//     "titulo-enlainadora",
//     "titulo-xhs-50kgs",
//     "titulo-pagani",
//     "titulo-rapid"
//   );

//   // Detecta palabra y asigna color
//   if (modeloSeleccionado.toLowerCase().includes("aoki")) {
//     titulo.classList.add("titulo-aoki");
//   } else if (modeloSeleccionado.toLowerCase().includes("asb")) {
//     titulo.classList.add("titulo-asb");
//     } else if (modeloSeleccionado.toLowerCase().includes("nissei")) {
//       titulo.classList.add("titulo-nissei");
//     } else if (modeloSeleccionado.toLowerCase().includes("sumitomo")) {
//       titulo.classList.add("titulo-sumitomo");
//     } else if (modeloSeleccionado.toLowerCase().includes("enlainadora")) {
//       titulo.classList.add("titulo-enlainadora");
//     } else if (modeloSeleccionado.toLowerCase().includes("XHS-50KGS")) {
//       titulo.classList.add("titulo-xhs-50kgs");
//     } else if (modeloSeleccionado.toLowerCase().includes("molino")) {
//       titulo.classList.add("titulo-molino");
//     } else if (modeloSeleccionado.toLowerCase().includes("pagani")) {
//       titulo.classList.add("titulo-pagani");
//     } else if (modeloSeleccionado.toLowerCase().includes("rapid")) {
//       titulo.classList.add("titulo-rapid");
//   } else {
//     titulo.classList.add("titulo-default");
//   }
// }
function actualizarTitulo() {
  const titulo = document.getElementById("tituloRefacciones");
  if (!titulo) return;

  // 🔥 Si estamos en modo global, solo dejamos el título por defecto y salimos
  if (modoGlobal) {
    titulo.textContent = "Refacciones IEMCO";
    titulo.className = "titulo-default";
    return;
  }

  // Si no es global, mostramos el modelo seleccionado
  titulo.textContent = `Refacciones IEMCO - ${modeloSeleccionado}`;

  // Limpia clases anteriores
  titulo.classList.remove(
    "titulo-default",
    "titulo-aoki",
    "titulo-asb",
    "titulo-nissei",
    "titulo-sumitomo",
    "titulo-enlainadora",
    "titulo-xhs-50kgs",
    "titulo-molino",
    "titulo-pagani",
    "titulo-rapid"
  );

  // Detecta palabra y asigna color
  if (modeloSeleccionado.toLowerCase().includes("aoki")) {
    titulo.classList.add("titulo-aoki");
  } else if (modeloSeleccionado.toLowerCase().includes("asb")) {
    titulo.classList.add("titulo-asb");
  } else if (modeloSeleccionado.toLowerCase().includes("nissei")) {
    titulo.classList.add("titulo-nissei");
  } else if (modeloSeleccionado.toLowerCase().includes("sumitomo")) {
    titulo.classList.add("titulo-sumitomo");
  } else if (modeloSeleccionado.toLowerCase().includes("enlainadora")) {
    titulo.classList.add("titulo-enlainadora");
  } else if (modeloSeleccionado.toLowerCase().includes("xhs-50kgs")) {
    titulo.classList.add("titulo-xhs-50kgs");
  } else if (modeloSeleccionado.toLowerCase().includes("molino")) {
    titulo.classList.add("titulo-molino");
  } else if (modeloSeleccionado.toLowerCase().includes("pagani")) {
    titulo.classList.add("titulo-pagani");
  } else if (modeloSeleccionado.toLowerCase().includes("rapid")) {
    titulo.classList.add("titulo-rapid");
  } else {
    titulo.classList.add("titulo-default");
  }
}

// function mostrarResultados(lista) {
//   const cont = document.getElementById("resultados");
//   if (!cont) {
//     console.error("❌ No existe #resultados");
//     return;
//   }

//   cont.innerHTML = "";

//   if (lista.length === 0) {
//     cont.innerHTML = "<p>No hay refacciones</p>";
//     return;
//   }

//   cont.innerHTML = ""; // limpia antes, por salud mental

// lista.forEach(r => {
  
//   cont.innerHTML += `
//   <div class="ref-card">
    
//     <div class="ref-img">
//       <img src="${r.imagen || 'no-image.jpg'}"
//            alt="${r.nombreprod}"
//            onerror="this.onerror=null; this.src='no-image.jpg';">
//     </div>

//     <div class="ref-body">

//       <!-- NOMBRE (principal) -->
//       <h3 class="ref-title">${r.nombreprod}</h3>

//       <!-- MODELO -->
//       <div class="ref-modelo">
//         Modelo: <strong>${r.modelo || '-'}</strong>
//       </div>

//       <!-- CANTIDAD -->
//       <div class="ref-cantidad">
//         Cantidad: <strong>${r.cantidad} ${r.unidad || ''}</strong>
//       </div>

//       <!-- UBICACIÓN (DESTACADA) -->
//       <div class="ref-ubicacion">
//         📍 ${r.ubicacion || 'Sin ubicación'}
//       </div>

//       <div class="ref-actions">
//         <a href="detalle.html?id=${r.id}" class="btn-ver">Ver / Editar</a>
//       </div>

//     </div>
//   </div>
// `;

// });


// }


// async function aplicarFiltros() {

//   if (!resultadosActuales.length) return;

//   const ref = document.getElementById("buscarRef")?.value.toLowerCase().trim() || "";
//   const modelo = document.getElementById("buscarModelo")?.value.toLowerCase().trim() || "";
//   const tipo = document.getElementById("filtroTipo")?.value || "";
//   const unidad = document.getElementById("filtroUnidad")?.value || "";
  
//   if (modoGlobal) {

//     const params = new URLSearchParams({
//       ref,
//       modelo,
//       tipo,
//       unidad,
//       palabras
//     });

//     const res = await fetch(`${API}/buscar-refacciones?${params}`);
//     const data = await res.json();

//     mostrarResultados(data);
//     return;
//   }
  
//   const palabrasTexto = document.getElementById("buscarPalabras")?.value.toLowerCase().trim() || "";

//   const palabras = palabrasTexto
//     ? palabrasTexto.split(" ").filter(p => p.length > 0)
//     : [];

//   const filtrados = resultadosActuales.filter(r => {

//     const coincideRef =
//       !ref || String(r.refinterna || "").toLowerCase().includes(ref);

//     const coincideModelo =
//       !modelo || String(r.modelo || "").toLowerCase().includes(modelo);

//     const coincideTipo =
//       !tipo || r.tipoprod === tipo;

//     const coincideUnidad =
//       !unidad || r.unidad === unidad;

//     const coincidePalabras =
//   tagsActivos.length === 0 ||
//   tagsActivos.every(p =>
//     String(r.palclave || "").toLowerCase().includes(p)
//   );


//     return coincideRef &&
//            coincideModelo &&
//            coincideTipo &&
//            coincideUnidad &&
//            coincidePalabras;
//   });

//   mostrarResultados(filtrados);
// }
// ⚡ Arreglo global para guardar los elementos del DOM
let cardsDOM = [];

function mostrarResultados(lista) {
  const cont = document.getElementById("resultados");
  if (!cont) {
    console.error("❌ No existe #resultados");
    return;
  }

  // Si es la primera vez o la lista cambió completamente
  if (cardsDOM.length === 0 || cardsDOM.length !== lista.length) {
    cont.innerHTML = "";
    cardsDOM = [];

    const fragment = document.createDocumentFragment();

    lista.forEach(r => {
      const card = document.createElement("div");
      card.className = "ref-card";

      // Guardamos info de filtrado en atributos data
      card.dataset.refinterna = (r.refinterna || "").toLowerCase();
      card.dataset.modelo = (r.modelo || "").toLowerCase();
      card.dataset.tipoprod = r.tipoprod || "";
      card.dataset.unidad = r.unidad || "";
      card.dataset.palclave = (r.palclave || "").toLowerCase();

      card.innerHTML = `
        <div class="ref-img">
          <img src="${r.imagen || 'no-image.jpg'}" 
               alt="${r.nombreprod}" 
               onerror="this.onerror=null; this.src='no-image.jpg';">
        </div>
        <div class="ref-body">
          <h3 class="ref-title">${r.nombreprod}</h3>
          <div class="ref-modelo">Modelo: <strong>${r.modelo || '-'}</strong></div>
          <div class="ref-cantidad">Cantidad: <strong>${r.cantidad} ${r.unidad || ''}</strong></div>
          <div class="ref-ubicacion">📍 ${r.ubicacion || 'Sin ubicación'}</div>
          <div class="ref-actions">
            <a href="detalle.html?id=${r.id}" class="btn-ver">Ver / Editar</a>
          </div>
        </div>
      `;

      fragment.appendChild(card);
      cardsDOM.push(card); // guardamos en memoria
    });

    cont.appendChild(fragment);
  } else {
    // Si ya estaban generados, solo filtramos
    filtrarCards();
  }
}

// ⚡ Función para filtrar sin reconstruir el DOM
function filtrarCards() {
  const tit = (document.getElementById("buscarTitulo")?.value || "").toLowerCase().trim();
  const ref = (document.getElementById("buscarRef")?.value || "").toLowerCase().trim();
  const modelo = (document.getElementById("buscarModelo")?.value || "").toLowerCase().trim();
  const tipo = document.getElementById("filtroTipo")?.value || "";
  const unidad = document.getElementById("filtroUnidad")?.value || "";
  const palabras = tagsActivos.map(t => t.toLowerCase());

  cardsDOM.forEach(card => {
    const coincideTitulo = !tit || card.dataset.nombreprod.includes(tit);
    const coincideRef = !ref || card.dataset.refinterna.includes(ref);
    const coincideModelo = !modelo || card.dataset.modelo.includes(modelo);
    const coincideTipo = !tipo || card.dataset.tipoprod === tipo;
    const coincideUnidad = !unidad || card.dataset.unidad === unidad;
    const coincidePalabras = palabras.length === 0 || palabras.every(p => card.dataset.palclave.includes(p));

    card.style.display = (coincideTitulo && coincideRef && coincideModelo && coincideTipo && coincideUnidad && coincidePalabras) ? "block" : "none";
  });
}

async function aplicarFiltros() {

  console.log("🔥 aplicarFiltros ejecutado");
  console.log("modoGlobal:", modoGlobal);

  const tit = document.getElementsById("buscarTitulo")?.value.toLowerCase().trim() || "";
  const ref = document.getElementById("buscarRef")?.value.toLowerCase().trim() || "";
  const modelo = document.getElementById("buscarModelo")?.value.toLowerCase().trim() || "";
  const tipo = document.getElementById("filtroTipo")?.value || "";
  const unidad = document.getElementById("filtroUnidad")?.value || "";

  // 🔥 SOLO usamos tagsActivos como fuente real
  const palabrasActivas = tagsActivos.map(t => t.toLowerCase());

  // =========================
  // 🌎 MODO GLOBAL
  // =========================
  if (modoGlobal) {

    try {

      const params = new URLSearchParams({
        tit,
        ref,
        modelo,
        tipo,
        unidad,
        palabras: palabrasActivas.join(" ") // 🔥 ahora sí manda los tags reales
      });

      const res = await fetch(`${API}/buscar-refacciones?${params}`);
      const data = await res.json();

      console.log("Total registros global:", data.length);

      resultadosActuales = data;

actualizarSelectsDesdeResultados(data);
mostrarResultados(data);


    } catch (error) {
      console.error("Error en búsqueda global:", error);
      mostrarResultados([]);
    }

    return;
  }

  // =========================
  // 🖥 MODO LOCAL (MÁQUINA ESPECÍFICA)
  // =========================

  if (!resultadosActuales || resultadosActuales.length === 0) {
    console.log("⚠ No hay datos locales cargados");
    return;
  }

  const filtrados = resultadosActuales.filter(r => {

    const coincideTitulo =
      !tit || String(r.nombreprod || "").toLowerCase().includes(tit);

    const coincideRef =
      !ref || String(r.refinterna || "").toLowerCase().includes(ref);

    const coincideModelo =
      !modelo || String(r.modelo || "").toLowerCase().includes(modelo);

    const coincideTipo =
      !tipo || r.tipoprod === tipo;

    const coincideUnidad =
      !unidad || r.unidad === unidad;

    // 🔥 versión robusta para palclave tipo "valvula, aire, acero"
    const palabrasRegistro = String(r.palclave || "")
      .toLowerCase()
      .split(",")
      .map(p => p.trim());

    const coincidePalabras =
      palabrasActivas.length === 0 ||
      palabrasActivas.every(tag =>
        palabrasRegistro.some(pal => pal.includes(tag))
      );

    return coincideTitulo &&
           coincideRef &&
           coincideModelo &&
           coincideTipo &&
           coincideUnidad &&
           coincidePalabras;
  });

  console.log("Total registros local:", filtrados.length);

  actualizarSelectsDesdeResultados(filtrados);
mostrarResultados(filtrados);

}




function llenarSelects(data) {
  const selectTipo = document.getElementById("filtroTipo");
  const selectUnidad = document.getElementById("filtroUnidad");

  // limpiar excepto la primera opción
  selectTipo.innerHTML = `<option value="">Todos los tipos</option>`;
  selectUnidad.innerHTML = `<option value="">Todas las unidades</option>`;

  const tiposUnicos = [...new Set(data.map(r => r.tipoprod).filter(Boolean))];
  const unidadesUnicas = [...new Set(data.map(r => r.unidad).filter(Boolean))];

  tiposUnicos.forEach(tipo => {
    selectTipo.innerHTML += `<option value="${tipo}">${tipo}</option>`;
  });

  unidadesUnicas.forEach(unidad => {
    selectUnidad.innerHTML += `<option value="${unidad}">${unidad}</option>`;
  });
}

function crearTagVisual(texto) {

  const tag = document.createElement("span");
  tag.className = "badge bg-primary d-flex align-items-center";
  tag.style.gap = "6px";
  tag.textContent = texto;

  const btn = document.createElement("span");
  btn.textContent = "✕";
  btn.style.cursor = "pointer";

  btn.onclick = function() {
    tagsActivos = tagsActivos.filter(t => t !== texto);
    tag.remove();
    aplicarFiltros();
  };

  tag.appendChild(btn);

  contenedorTags.insertBefore(tag, inputTag);
}

async function llenarSelectsGlobal() {
  const res = await fetch(`${API}/refacciones-metadata`);
  const data = await res.json();

  const selectTipo = document.getElementById("filtroTipo");
  const selectUnidad = document.getElementById("filtroUnidad");

  selectTipo.innerHTML = `<option value="">Todos los tipos</option>`;
  selectUnidad.innerHTML = `<option value="">Todas las unidades</option>`;

  data.tipos.forEach(t => {
    selectTipo.innerHTML += `<option value="${t}">${t}</option>`;
  });

  data.unidades.forEach(u => {
    selectUnidad.innerHTML += `<option value="${u}">${u}</option>`;
  });
}

function actualizarSelectsDesdeResultados(data) {

  const selectTipo = document.getElementById("filtroTipo");
  const selectUnidad = document.getElementById("filtroUnidad");

  const tipoSeleccionado = selectTipo.value;
  const unidadSeleccionada = selectUnidad.value;

  const tiposUnicos = [...new Set(data.map(r => r.tipoprod).filter(Boolean))];
  const unidadesUnicas = [...new Set(data.map(r => r.unidad).filter(Boolean))];

  selectTipo.innerHTML = `<option value="">Todos los tipos</option>`;
  selectUnidad.innerHTML = `<option value="">Todas las unidades</option>`;

  tiposUnicos.forEach(tipo => {
    selectTipo.innerHTML += `<option value="${tipo}">${tipo}</option>`;
  });

  unidadesUnicas.forEach(unidad => {
    selectUnidad.innerHTML += `<option value="${unidad}">${unidad}</option>`;
  });

  // Restaurar selección si todavía existe
  if (tiposUnicos.includes(tipoSeleccionado)) {
    selectTipo.value = tipoSeleccionado;
  }

  if (unidadesUnicas.includes(unidadSeleccionada)) {
    selectUnidad.value = unidadSeleccionada;
  }
}


