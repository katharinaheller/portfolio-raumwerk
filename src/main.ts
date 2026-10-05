const menu = document.querySelector<HTMLButtonElement>(".menu-toggle");
const nav = document.querySelector<HTMLElement>("#navigation");
function closeMenu() {
  menu?.setAttribute("aria-expanded", "false");
  nav?.classList.remove("open");
}
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("open", open);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMenu();
  }
});
nav
  ?.querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", closeMenu));
document
  .querySelectorAll<HTMLFormElement>("[data-demo-form]")
  .forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector<HTMLElement>(".form-status")!;
      const invalid = Array.from(
        form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          "input,textarea",
        ),
      ).find((el) => !el.checkValidity());
      if (invalid) {
        status.textContent =
          invalid.type === "email"
            ? "Bitte geben Sie eine gültige E-Mail-Adresse ein."
            : "Bitte füllen Sie alle Felder aus (Name: mindestens 2, Nachricht: mindestens 10 Zeichen).";
        invalid.setAttribute("aria-invalid", "true");
        invalid.focus();
        return;
      }
      status.textContent =
        "Vielen Dank! Ihre Demo-Anfrage wurde lokal geprüft. Es wurden keine Daten versendet.";
      form.reset();
    });
    form.addEventListener("input", (e) =>
      (e.target as HTMLElement).removeAttribute("aria-invalid"),
    );
  });
const container = document.getElementById("experience");
const button = document.querySelector<HTMLButtonElement>("#load-scene");
let startPromise: Promise<void> | undefined;
function startScene() {
  if (startPromise) return startPromise;
  startPromise = (async () => {
    if (button) {
      button.disabled = true;
      button.textContent = "Modell wird geladen …";
    }
    try {
      const { initScene } = await import("./scene");
      await initScene();
    } catch {
      const status = document.getElementById("scene-status");
      if (status)
        status.textContent =
          "Die 3D-Ansicht ist hier nicht verfügbar. Alle Projekte sind unten zugänglich.";
      if (button) {
        button.disabled = false;
        button.textContent = "3D erneut versuchen";
      }
      startPromise = undefined;
    }
  })();
  return startPromise;
}
button?.addEventListener("click", () => void startScene());
document.querySelectorAll<HTMLButtonElement>("[data-zone]").forEach((el) =>
  el.addEventListener("click", async () => {
    await startScene();
    window.dispatchEvent(
      new CustomEvent("raumwerk:zone", { detail: Number(el.dataset.zone) }),
    );
    document
      .querySelectorAll(".zone-controls button")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String((b as HTMLElement).dataset.zone === el.dataset.zone),
        ),
      );
    if (el.classList.contains("explore-project"))
      container?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
  }),
);
if (
  container &&
  !matchMedia("(prefers-reduced-motion:reduce)").matches &&
  innerWidth > 700
) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        window.setTimeout(() => void startScene(), 600);
        observer.disconnect();
      }
    },
    { rootMargin: "100px" },
  );
  observer.observe(container);
}
