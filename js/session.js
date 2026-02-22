document.addEventListener("DOMContentLoaded", () => {
  const nombre = localStorage.getItem("nombre");
  const token = localStorage.getItem("token");

  // 🔐 Si no hay token → fuera
  if (!token) {
    window.location.href = "index.html"; // tu login
    return;
  }

  // 👤 Mostrar nombre
  if (nombre) {
    document.getElementById("nombreUsuario").textContent = nombre;
  }
});

const btnLogout = document.getElementById("btnLogout");

btnLogout.addEventListener("click", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

  try {
    await fetch("https://buscador-refaccionesbackend.onrender.com/logout", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token
      }
    });
  } catch (err) {
    console.error("Error cerrando sesión");
  }

  // 🔥 Limpiar almacenamiento
  localStorage.removeItem("token");
  localStorage.removeItem("nombre");
  localStorage.removeItem("rol");

  // 🔁 Volver al login
  window.location.href = "index.html";
});