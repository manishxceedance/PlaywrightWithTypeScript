class PracticeShadow extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        .shadow-box { border: 2px solid #4a90e2; padding: 16px; border-radius: 8px; background: #f5faff; }
        label { display: block; margin: 8px 0 4px; }
      </style>
      <div class="shadow-box">
        <label for="shadow-input">Shadow Input:</label>
        <input id="shadow-input" type="text" />
        <button id="shadow-btn">Shadow Button</button>
        <p id="shadow-msg" style="margin-top:10px;"></p>
      </div>
    `;
    shadow.getElementById('shadow-btn').onclick = () => {
      const val = shadow.getElementById('shadow-input').value;
      shadow.getElementById('shadow-msg').textContent = 'You typed: ' + val;
    };
  }
}
customElements.define('practice-shadow', PracticeShadow);
