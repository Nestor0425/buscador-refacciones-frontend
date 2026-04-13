// 🛠️ CONFIGURACIÓN DE API (ENFOQUE SENIOR)
const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
            || "https://buscador-refacciones-backend.onrender.com";

console.log("🚀 Sistema conectado a:", API);

document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");
    
    // 1. Verificación de sesión existente (MEJORADO)
    if (token) {
        try {
            const res = await fetch(`${API}/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const usuario = await res.json();
                if (usuario && usuario.id) {
                    // Solo redirigimos si no estamos ya en la página de destino
                    if (!window.location.pathname.includes("Nadd.html")) {
                        window.location.replace("Nadd.html");
                    }
                    return;
                }
            } else if (res.status === 401 || res.status === 403) {
                // Solo limpiamos si el servidor confirma explícitamente que el token no vale
                limpiarDatosSesion();
            }
        } catch (err) {
            // Si hay un error de red (CORS, servidor caído), NO limpiamos la sesión.
            // Esto evita que un parpadeo del internet saque al usuario.
            console.error("⚠️ Error de conexión al verificar sesión:", err);
        }
    }

    const form = document.getElementById("loginForm");
    if (!form) return;

    // 2. Lógica de inicio de sesión
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Feedback visual: deshabilitar botón para evitar múltiples clics
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        const correoInput = document.getElementById("email").value.trim();
        const passwordInput = document.getElementById("password").value;

        try {
            const response = await fetch(`${API}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: correoInput,
                    password: passwordInput 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.mensaje || "Credenciales incorrectas");
            }

            // 💾 Persistencia de sesión
            localStorage.setItem("token", data.token);
            localStorage.setItem("nombre", data.nombre || data.user?.nombre || "");
            localStorage.setItem("rol", data.rol || data.user?.rol || "");

            console.log("✅ Sesión iniciada correctamente");
            
            // Usamos replace para que el usuario no pueda volver atrás al login con el botón del navegador
            window.location.replace("Nadd.html");

        } catch (error) {
            alert(error.message);
            console.error("❌ Login Error:", error);
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});

/**
 * Función auxiliar para limpiar el almacenamiento de forma centralizada
 */
function limpiarDatosSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("nombre");
    localStorage.removeItem("rol");
    // Opcional: localStorage.clear(); para una limpieza total
}