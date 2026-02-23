// Дополнительный скрипт для чистого HTML-варианта.
// В режиме Vite/React основная логика реализована в src/App.tsx.

(function () {
  // Плавный скролл по якорям для ссылок с href="#..."
  document.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof HTMLAnchorElement)) return;
    const href = target.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const section = document.querySelector(href);
    if (!section) return;

    event.preventDefault();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Простейший IntersectionObserver для элементов с data-animate,
  // чтобы базовая анимация появления работала и без React-хука.
  if ("IntersectionObserver" in window) {
    const elements = document.querySelectorAll("[data-animate]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // Пометка, что демо-скрипт загружен
  console.debug("Golden Hammer demo script initialized");
})();
