# flame-bespannungsservice

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if(email && password) {
    localStorage.setItem('user', email);  // speichert Email lokal
    document.getElementById('login').style.display = 'none';
    document.getElementById('order-form').style.display = 'block';
  } else {
    alert("Bitte E-Mail und Passwort eingeben");
  }
}

<div id="login">
  <input type="email" id="email" placeholder="E-Mail">
  <input type="password" id="password" placeholder="Passwort">
  <button onclick="login()">Login / Registrieren</button>
</div>

<div id="order-form" style="display:none;">
  <h2>Bestelle deine Bespannung</h2>
  <label>Saitenart:</label>
  <select id="string-type">
    <option>Nylon</option>
    <option>Multifilament</option>
    <option>Hybrid</option>
  </select>

  <label>Spannung / Gewicht:</label>
  <select id="tension">
    <option>10kg</option>
    <option>11kg</option>
    <option>12kg</option>
  </select>

  <label>Abholdatum:</label>
  <input type="date" id="pickup">

  <label>Bemerkungen:</label>
  <input type="text" id="notes">

  <h3>Twint-Zahlung:</h3>
  <a href="DEIN_TWINT_LINK" target="_blank">
    <img src="twint-qr-code.png" alt="Twint QR">
  </a>

  <button onclick="submitOrder()">Bestellen</button>
</div>

function submitOrder() {
  const stringType = document.getElementById('string-type').value;
  const tension = document.getElementById('tension').value;
  const pickup = document.getElementById('pickup').value;
  const notes = document.getElementById('notes').value;
  const user = localStorage.getItem('user');

  if(!user || !stringType || !tension || !pickup) {
    alert("Bitte alle Pflichtfelder ausfüllen");
    return;
  }

  alert(`Danke für deine Bestellung, ${user}!`);
  // Optional: Daten an Netlify Forms oder Google Sheets senden
}
