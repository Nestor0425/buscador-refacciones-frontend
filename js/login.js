// LISTO
const API = "https://buscador-refacciones-backend.onrender.com/api";

document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");
  if (token) {
    try {
      const res = await fetch(`${API}/me`, {
        headers: { "Authorization": "Bearer " + token }
      });

      if (res.ok) {
        const usuario = await res.json();
        if (usuario && usuario.id) {
          window.location.href = "Nadd.html";
          return;
        }
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("nombre");
        localStorage.removeItem("rol");
      }
    } catch (err) {
      console.error("Error verificando sesión:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("nombre");
      localStorage.removeItem("rol");
    }
  }

  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correo, password })
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await response.json();

      // 🔐 Guardamos sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("nombre", data.nombre || "");
      localStorage.setItem("rol", data.rol || "");

      window.location.href = "Nadd.html";

    } catch (error) {
      alert("Error al iniciar sesión");
      console.error(error);
    }
  });

});