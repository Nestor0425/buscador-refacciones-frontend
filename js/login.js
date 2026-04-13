// 🛠️ CONFIGURACIÓN DE API (ENFOQUE SENIOR)
const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
            || "https://buscador-refacciones-backend.onrender.com";

console.log("🚀 Sistema conectado a:", API);

document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");
    
    // 1. Verificación de sesión existente al cargar la página
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
                limpiarDatosSesion();
            }
        } catch (err) {
            console.error("⚠️ Error verificando sesión:", err);
            limpiarDatosSesion();
        }
    }

    const form = document.getElementById("loginForm");
    if (!form) return;

    // 2. Lógica de inicio de sesión
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const correoInput = document.getElementById("email").value.trim();
        const passwordInput = document.getElementById("password").value;

        try {
            const response = await fetch(`${API}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // 🔐 BLINDAJE SENIOR: Enviamos ambos nombres de campo para asegurar 
                // compatibilidad total con el controlador del backend.
                body: JSON.stringify({ 
                    email: correoInput,    // Estándar para la base de datos
                    correo: correoInput,   // Alternativa por si el backend usa req.body.correo
                    password: passwordInput 
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Si el backend envía un mensaje específico lo usamos, si no, el genérico
                throw new Error(errorData.mensaje || errorData.message || "Credenciales incorrectas");
            }

            const data = await response.json();

            // 💾 Persistencia de sesión
            localStorage.setItem("token", data.token);
            localStorage.setItem("nombre", data.nombre || data.user?.nombre || "");
            localStorage.setItem("rol", data.rol || data.user?.rol || "");

            console.log("✅ Sesión iniciada correctamente");
            window.location.href = "Nadd.html";

        } catch (error) {
            alert(error.message);
            console.error("❌ Login Error:", error);
        }
    });
});

/**
 * Función auxiliar para limpiar el almacenamiento de forma centralizada (DRY)
 */
function limpiarDatosSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("nombre");
    localStorage.removeItem("rol");
}