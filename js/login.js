// 🛠️ CONFIGURACIÓN DE API (ENFOQUE SENIOR)
// Usamos una validación para evitar que el sitio explote si Vite no inyecta la variable.
const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
            || "https://buscador-refacciones-backend.onrender.com/api";

console.log("🚀 Sistema conectado a:", API);

document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");
    
    // Verificación de sesión existente al cargar la página
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
                // Si el token no es válido, limpiamos de forma centralizada
                limpiarDatosSesion();
            }
        } catch (err) {
            console.error("⚠️ Error verificando sesión:", err);
            limpiarDatosSesion();
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
                // Intentamos obtener el error real del backend si existe
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Credenciales incorrectas");
            }

            const data = await response.json();

            // 🔐 Guardamos sesión de forma segura
            localStorage.setItem("token", data.token);
            localStorage.setItem("nombre", data.nombre || "");
            localStorage.setItem("rol", data.rol || "");

            window.location.href = "Nadd.html";

        } catch (error) {
            alert(error.message || "Error al iniciar sesión");
            console.error("❌ Login Error:", error);
        }
    });
});

// Función auxiliar (DRY: Don't Repeat Yourself) para limpiar el storage
function limpiarDatosSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("nombre");
    localStorage.removeItem("rol");
}