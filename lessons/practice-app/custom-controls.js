// Custom Dropdown
class CustomDropdown extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        .dropdown { position: relative; width: 220px; }
        .selected { border: 1px solid #1976d2; padding: 0.5em; border-radius: 4px; background: #fff; cursor: pointer; }
        .options { display: none; position: absolute; top: 110%; left: 0; right: 0; background: #fff; border: 1px solid #1976d2; border-radius: 0 0 4px 4px; z-index: 10; }
        .option { padding: 0.5em; cursor: pointer; }
        .option:hover { background: #e3f2fd; }
        .dropdown.open .options { display: block; }
      </style>
      <div class="dropdown">
        <div class="selected" tabindex="0">Select an option</div>
        <div class="options">
          <div class="option">Apple</div>
          <div class="option">Banana</div>
          <div class="option">Cherry</div>
        </div>
      </div>
    `;
    const dropdown = shadow.querySelector('.dropdown');
    const selected = shadow.querySelector('.selected');
    const options = shadow.querySelector('.options');
    selected.onclick = () => dropdown.classList.toggle('open');
    selected.onblur = () => setTimeout(()=>dropdown.classList.remove('open'), 200);
    options.querySelectorAll('.option').forEach(opt => {
      opt.onclick = () => {
        selected.textContent = opt.textContent;
        dropdown.classList.remove('open');
        this.setAttribute('value', opt.textContent);
      };
    });
  }
}
customElements.define('custom-dropdown', CustomDropdown);

// Multi-select Dropdown
class MultiSelectDropdown extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        .dropdown { position: relative; width: 240px; }
        .selected { border: 1px solid #388e3c; padding: 0.5em; border-radius: 4px; background: #fff; cursor: pointer; min-height: 1.5em; }
        .options { display: none; position: absolute; top: 110%; left: 0; right: 0; background: #fff; border: 1px solid #388e3c; border-radius: 0 0 4px 4px; z-index: 10; max-height: 160px; overflow-y: auto; }
        .option { padding: 0.5em; cursor: pointer; display: flex; align-items: center; }
        .option:hover { background: #e8f5e9; }
        .dropdown.open .options { display: block; }
        .tag { display: inline-block; background: #c8e6c9; color: #256029; border-radius: 2px; padding: 0 6px; margin: 0 2px; font-size: 0.95em; }
      </style>
      <div class="dropdown">
        <div class="selected" tabindex="0"></div>
        <div class="options">
          <div class="option"><input type="checkbox" value="Red"> Red</div>
          <div class="option"><input type="checkbox" value="Green"> Green</div>
          <div class="option"><input type="checkbox" value="Blue"> Blue</div>
          <div class="option"><input type="checkbox" value="Yellow"> Yellow</div>
        </div>
      </div>
    `;
    const dropdown = shadow.querySelector('.dropdown');
    const selected = shadow.querySelector('.selected');
    const options = shadow.querySelector('.options');
    selected.onclick = () => dropdown.classList.toggle('open');
    selected.onblur = () => setTimeout(()=>dropdown.classList.remove('open'), 200);
    const updateSelected = () => {
      const checked = Array.from(options.querySelectorAll('input:checked')).map(cb => cb.value);
      selected.innerHTML = checked.length ? checked.map(v=>`<span class="tag">${v}</span>`).join(' ') : 'Select colors';
      this.setAttribute('value', checked.join(','));
    };
    options.querySelectorAll('input').forEach(cb => {
      cb.onchange = updateSelected;
    });
    updateSelected();
  }
}
customElements.define('multi-select-dropdown', MultiSelectDropdown);

// Checkbox containing dropdown
class CheckboxDropdown extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        .container { display: flex; align-items: center; }
        .dropdown { margin-left: 1em; }
      </style>
      <div class="container">
        <input type="checkbox" id="cb-main">
        <label for="cb-main">Enable options</label>
        <select class="dropdown" disabled>
          <option value="">Choose...</option>
          <option value="A">Option A</option>
          <option value="B">Option B</option>
          <option value="C">Option C</option>
        </select>
      </div>
    `;
    const cb = shadow.getElementById('cb-main');
    const dd = shadow.querySelector('select');
    cb.onchange = () => { dd.disabled = !cb.checked; };
  }
}
customElements.define('checkbox-dropdown', CheckboxDropdown);
