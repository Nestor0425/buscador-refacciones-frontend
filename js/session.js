/**
 * SISTEMA DE GESTIÓN DE SESIÓN (ENFOQUE SENIOR)
 * Blindaje dinámico y persistencia robusta.
 */
(function () {
    // 1. BLINDAJE DE API: Sincronizado con el resto del proyecto
    const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
                || "https://buscador-refacciones-backend.onrender.com";

    /**
     * Valida la sesión de forma asíncrona y gestiona el estado global.
     */
    async function validarSesion() {
        const token = localStorage.getItem("token");
        const nombreElemento = document.getElementById("nombreUsuario");

        if (!token) {
            console.warn("⚠️ Sin token detectado, redirigiendo...");
            ejecutarLogoutLimpio();
            return null;
        }

        try {
            // Llamada al endpoint de identidad
            const response = await fetch(`${API}/me`, {
                method: 'GET',
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Sesión expirada o servidor no disponible");

            const data = await response.json();

            // Guardado seguro del objeto usuario completo
            localStorage.setItem("usuario", JSON.stringify(data));

            // Actualización de UI segura
            if (nombreElemento) {
                nombreElemento.textContent = data.nombre || 'Usuario';
            }

            return data;
        } catch (error) {
            console.error("❌ Fallo en validación de sesión:", error.message);
            ejecutarLogoutLimpio();
            return null;
        }
    }

    /**
     * Limpia el almacenamiento y redirige al inicio de forma atómica.
     */
    function ejecutarLogoutLimpio() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        // Evitamos bucles de redirección si ya estamos en index
        if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
            window.location.replace("index.html");
        }
    }

    /**
     * Configura el listener del botón de salida.
     */
    function configurarLogout() {
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                ejecutarLogoutLimpio();
            };
        }
    }

    /**
     * Recupera y parsea el usuario de forma segura.
     */
    function obtenerUsuario() {
        try {
            const usuarioStr = localStorage.getItem("usuario");
            return usuarioStr ? JSON.parse(usuarioStr) : null;
        } catch (e) {
            console.error("Error al parsear usuario de localStorage");
            return null;
        }
    }

    // Inicialización automática al cargar el DOM
    document.addEventListener("DOMContentLoaded", () => {
        validarSesion();
        configurarLogout();
    });

    // Exposición de API pública del módulo
    window.Sesion = {
        validar: validarSesion,
        logout: ejecutarLogoutLimpio,
        obtenerUsuario: obtenerUsuario
    };
})();