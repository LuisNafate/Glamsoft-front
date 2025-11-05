document.addEventListener("DOMContentLoaded", () => {

  // Efecto hover en las tarjetas
  const cards = document.querySelectorAll(".service-card");
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => card.classList.add("hovered"));
    card.addEventListener("mouseleave", () => card.classList.remove("hovered"));
  });

  // Sistema de valoración (si se agrega)
  const starsContainers = document.querySelectorAll(".stars");
  starsContainers.forEach(container => {
    const stars = container.querySelectorAll(".star");
    stars.forEach((star, index) => {
      star.addEventListener("click", () => {
        stars.forEach((s, i) => {
          s.classList.toggle("active", i <= index);
        });
      });
    });
  });

  // Botón de "Agendar"
  const agendarButtons = document.querySelectorAll(".agendar-btn");
  agendarButtons.forEach(button => {
    button.addEventListener("click", () => {
      alert("¡Gracias por tu interés! Un asesor te contactará para agendar tu cita 💅");
    });
  });
});
