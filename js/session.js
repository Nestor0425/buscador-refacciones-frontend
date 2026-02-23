(function () {

const API = "https://buscador-refaccionesbackend.onrender.com";

async function validarSesion() {

  const token = localStorage.getItem("token");
  const nombreElemento = document.getElementById("nombreUsuario");

  if (!token) {
    window.location.replace("index.html");
    return;
  }

  try {
    const response = await fetch(`${API}/me`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!response.ok) throw new Error();

    const data = await response.json();

    if (nombreElemento) {
      nombreElemento.textContent = data.nombre;
    }

  } catch (error) {
    console.log("Token inválido");
    localStorage.removeItem("token");
    window.location.replace("index.html");
  }

}

function configurarLogout() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("index.html");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  validarSesion();
  configurarLogout();
});

})();