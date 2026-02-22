const form = document.getElementById("loginForm");
localStorage.setItem("nombre", data.nombre);
localStorage.setItem("rol", data.rol);
localStorage.setItem("token", data.token);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch(
      "https://buscador-refaccionesbackend.onrender.com/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error en login");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", data.rol);
    localStorage.setItem("nombre", data.nombre);

    alert("Login exitoso 🚀");
    window.location.href = "Nadd.html";

  } catch (err) {
    alert(err.message);
  }
});