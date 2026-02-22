(function () {

const API = "https://buscador-refaccionesbackend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.replace("index.html");
    return;
  }

  const nombreElemento = document.getElementById("nombreUsuario");

  // Mostrar nombre guardado si existe
  const nombreGuardado = localStorage.getItem("nombre");
  if (nombreGuardado && nombreElemento) {
    nombreElemento.textContent = nombreGuardado;
  }

  try {

    const response = await fetch(`${API}/me`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!response.ok) throw new Error();

    const data = await response.json();

    localStorage.setItem("nombre", data.nombre);

    if (nombreElemento) {
      nombreElemento.textContent = data.nombre;
    }

  } catch (error) {
    localStorage.clear();
    window.location.replace("index.html");
  }

});

})();