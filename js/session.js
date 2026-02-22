const API = "https://buscador-refaccionesbackend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.replace("index.html");
    return;
  }

  // 🔥 1️⃣ Mostrar nombre guardado INMEDIATAMENTE (si existe)
  const nombreGuardado = localStorage.getItem("nombre");
  const nombreElemento = document.getElementById("nombreUsuario");

  if (nombreGuardado && nombreElemento) {
    nombreElemento.textContent = nombreGuardado;
  }

  try {
    // 🔥 2️⃣ Validar sesión con backend
    const response = await fetch(`${API}/me`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!response.ok) {
      throw new Error("Token inválido");
    }

    const data = await response.json();

    // 🔥 3️⃣ Actualizar nombre desde backend
    localStorage.setItem("nombre", data.nombre);

    if (nombreElemento) {
      nombreElemento.textContent = data.nombre;
    }

  } catch (error) {
    localStorage.clear();
    window.location.replace("index.html");
  }

});