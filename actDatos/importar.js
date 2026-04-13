/**
 * CONFIGURACIÓN DE API (ENFOQUE SENIOR)
 * Blindaje dinámico para entorno Vercel/Producción y Local.
 */
const API = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
            || "https://buscador-refacciones-backend.onrender.com";

let excelActual = null;

/* ==========================================
   📊 ANÁLISIS DE EXCEL (PREVIEW)
========================================== */
async function subirExcel() {
    const fileInput = document.getElementById("excelFile");
    const file = fileInput.files[0];
    const estado = document.getElementById("estado");
    const tabla = document.getElementById("tablaPreview");

    if (!file) {
        estado.textContent = "❌ Selecciona un archivo Excel";
        return;
    }

    excelActual = file;
    const formData = new FormData();
    formData.append("file", file);

    estado.textContent = "⏳ Analizando Excel...";

    try {
        // Usamos la constante API blindada
        const res = await fetch(`${API}/preview-excel`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Error en el servidor");

        const data = await res.json();
        
        // Optimización Senior: Usar un string acumulador para evitar 
        // múltiples renders pesados en el DOM
        let htmlRows = "";

        if (!data.nuevos || data.nuevos.length === 0) {
            htmlRows = `<tr><td colspan="4">No hay refacciones nuevas</td></tr>`;
        } else {
            data.nuevos.forEach(r => {
                htmlRows += `
                    <tr>
                        <td>${r.nombreProd || "N/A"}</td>
                        <td>${r.refInterna || "N/A"}</td>
                        <td>${r.cantidad || 0}</td>
                        <td>${r.ubicacion || ""}</td>
                    </tr>`;
            });
        }

        tabla.innerHTML = htmlRows;
        estado.textContent = `🆕 Nuevos: ${data.nuevos?.length || 0} | 🔄 A actualizar: ${data.actualizar?.length || 0}`;

    } catch (err) {
        console.error("❌ Error en preview:", err);
        estado.textContent = "❌ Error al analizar Excel";
    }
}

/* ==========================================
   💾 CONFIRMACIÓN DE IMPORTACIÓN
========================================== */
async function confirmarImportacion() {
    if (!excelActual) {
        alert("Primero carga un Excel");
        return;
    }

    const estado = document.getElementById("estado");
    const formData = new FormData();
    formData.append("file", excelActual);

    estado.textContent = "⏳ Importando datos...";

    try {
        const res = await fetch(`${API}/importar-excel`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Fallo en la importación");

        const data = await res.json();

        if (data.ok) {
            estado.textContent = `✅ Importado | Insertados: ${data.insertados} | Actualizados: ${data.actualizados}`;
            // Limpiamos el input después de éxito
            document.getElementById("excelFile").value = "";
            excelActual = null;
        } else {
            estado.textContent = "❌ Error al importar: " + (data.message || "Fallo desconocido");
        }
    } catch (err) {
        console.error("❌ Error en importación:", err);
        estado.textContent = "❌ Error al conectar con el servidor";
    }
}

// Exponer funciones al objeto window para que el HTML (módulos) pueda verlas
window.subirExcel = subirExcel;
window.confirmarImportacion = confirmarImportacion;