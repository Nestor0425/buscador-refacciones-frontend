document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("https://buscador-refaccionesbackend.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo, password })
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }

    const data = await response.json();

    // ✅ AQUÍ sí existe data
    localStorage.setItem("token", data.token);
    localStorage.setItem("nombre", data.nombre);
    localStorage.setItem("rol", data.rol);

    window.location.href = "Nadd.html";

  } catch (error) {
    alert("Error al iniciar sesión");
    console.error(error);
  }
});