// document.addEventListener("DOMContentLoaded", async () => {

//   const token = localStorage.getItem("token");

//   // ❌ Si no hay token → fuera
//   if (!token) {
//     window.location.href = "index.html";
//     return;
//   }

//   try {
//     const response = await fetch("https://buscador-refaccionesbackend.onrender.com/me", {
//       method: "GET",
//       headers: {
//         "Authorization": "Bearer " + token
//       }
//     });

//     if (!response.ok) {
//       throw new Error("Token inválido");
//     }

//     const data = await response.json();

//     // 👤 Guardamos datos actualizados
//     localStorage.setItem("nombre", data.nombre);
//     localStorage.setItem("rol", data.rol);

//   } catch (error) {
//     console.error("Sesión inválida");

//     localStorage.clear();
//     window.location.replace = "index.html";
//   }

// });