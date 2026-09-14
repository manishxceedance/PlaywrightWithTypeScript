// Shared helper for all "Controls Practice" pages.
// Shows a status label so automated tests (and humans) can confirm an action succeeded.
function showStatus(elementId, message, isError) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('error', !!isError);
  el.style.display = 'block';
}
