(function () {
  const search = document.querySelector('[data-step-search]');
  const entries = Array.from(document.querySelectorAll('[data-step-entry]'));
  const count = document.querySelector('[data-step-count]');

  if (!search || !count) return;

  function filterSteps() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;

    entries.forEach((entry) => {
      const matches = !query || entry.textContent.toLowerCase().includes(query);
      entry.hidden = !matches;
      if (matches) visible += 1;
    });

    document.querySelectorAll('[data-step-group]').forEach((group) => {
      group.hidden = !group.querySelector('[data-step-entry]:not([hidden])');
    });

    count.textContent = `${visible} of ${entries.length} steps shown`;
  }

  search.addEventListener('input', filterSteps);
  filterSteps();
})();