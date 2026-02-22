(function () {

const API = "https://buscador-refaccionesbackend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");
  const nombreElemento = document.getElementById("nombreUsuario");

  // 🔐 Si no hay token → fuera
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

    // ✅ Actualizamos nombre directo del backend
    if (nombreElemento) {
      nombreElemento.textContent = data.nombre;
    }

  } catch (error) {
    localStorage.clear();
    window.location.replace("index.html");
  }

});

})();

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.replace("index.html");
    });
  }
});