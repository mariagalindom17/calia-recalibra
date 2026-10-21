// Safe by default: the form does not pretend to save registrations if no backend is configured.
// POST is sent to /api/calia-interest on the same origin. Production requires CALIA_LEADS_WEBHOOK_URL
// and a reviewed privacy notice before public collection.
(() => {
  "use strict";
  const form = document.getElementById("calia-interest-form");
  if (!form) return;
  const output = document.getElementById("calia-form-status");
  const button = form.querySelector('button[type="submit"]');
  const originalButton = button.textContent;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    output.textContent = "";
    output.dataset.state = "";
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const name = form.elements.namedItem("nombre").value.trim();
    const email = form.elements.namedItem("email").value.trim();
    const consent = form.elements.namedItem("consentimiento").checked;
    const honeypot = form.elements.namedItem("company").value;
    if (!consent) {
      output.textContent = "Necesitamos tu consentimiento para enviarte información.";
      output.dataset.state = "error";
      return;
    }
    if (location.protocol === "file:") {
      output.textContent = "Esta vista local es una demostración. Los registros se habilitarán en el sitio publicado.";
      output.dataset.state = "error";
      return;
    }
    button.disabled = true;
    button.textContent = "Revisando el registro…";
    try {
      const response = await fetch(form.dataset.endpoint, {
        method: "POST", credentials: "same-origin",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({nombre: name, email, consentimiento: consent, company: honeypot})
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "El registro no está disponible. Inténtalo más adelante.");
      output.textContent = "Recibimos tu registro. Gracias por tu interés en Calia Lab.";
      output.dataset.state = "success";
      form.reset();
    } catch (error) {
      output.textContent = error && error.message ? error.message : "No pudimos enviar tus datos. Intenta de nuevo.";
      output.dataset.state = "error";
    } finally {
      button.disabled = false;
      button.textContent = originalButton;
    }
  });
})();