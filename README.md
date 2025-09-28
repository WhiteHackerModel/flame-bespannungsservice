# flame-bespannungsservice

<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Badmintonbespannungen</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Badmintonbespannungen</h1>

  <!-- Login -->
  <div id="login">
    <h2>Login / Registrieren</h2>
    <input type="email" id="email" placeholder="E-Mail">
    <input type="password" id="password" placeholder="Passwort">
    <button onclick="login()">Login / Registrieren</button>
  </div>

  <!-- Bestellformular -->
  <div id="order-form" style="display:none;">
    <h2>Bestelle deine Bespannung</h2>

    <label>Seitenart:</label>
    <select id="string-type" onchange="updatePrice()">
      <option value="gosen">Gosen (CHF 20)</option>
      <option value="bg65">BG65 (CHF 20)</option>
      <option value="bg80">BG80 (CHF 23)</option>
      <option value="aerobite">Aerobite (CHF 23)</option>
      <option value="custom">Eigene Auswahl (CHF 15)</option>
    </select>

    <label>Spannung (kg):</label>
    <input type="number" id="tension" min="8" max="16" step="0.2" value="12">

    <label>Abholdatum:</label>
    <input type="date" id="pickup">

    <label>Bemerkungen:</label>
    <input type="text" id="notes">

    <h3>Bezahloption:</h3>
    <input type="radio" id="twint" name="payment" value="twint" checked onchange="updatePayment()">
    <label for="twint">Twint</label><br>
    <input type="radio" id="cash" name="payment" value="cash" onchange="updatePayment()">
    <label for="cash">Barzahlung</label><br>

    <div id="payment-section">
      <h3>Twint-Zahlung:</h3>
      <a id="twint-link" href="#" target="_blank">
        <img id="twint-qr" src="twint-qr-code.png" alt="Twint QR" width="150">
      </a>
    </div>

    <button onclick="submitOrder()">Bestellen</button>

    <h3 id="total-price"></h3>
  </div>

  <script src="script.js"></script>
</body>
</html>

body { font-family: Arial, sans-serif; padding: 20px; }
h1, h2 { color: #2c3e50; }
input, select, button { display: block; margin: 10px 0; padding: 8px; width: 220px; }
button { cursor: pointer; background-color: #27ae60; color: white; border: none; }
#payment-section { margin-top: 15px; }
#twint-qr { display: block; margin-top: 10px; }

// Preise definieren
const prices = {
  gosen: 20,
  bg65: 20,
  bg80: 23,
  aerobite: 23,
  custom: 15
};

// Login-Funktion (Demo)
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if(email && password) {
    localStorage.setItem('user', email);
    document.getElementById('login').style.display = 'none';
    document.getElementById('order-form').style.display = 'block';
    updatePrice();
    updatePayment();
  } else {
    alert("Bitte E-Mail und Passwort eingeben");
  }
}

// Preis berechnen und anzeigen
function updatePrice() {
  const type = document.getElementById('string-type').value;
  const price = prices[type];
  document.getElementById('total-price').innerText = `Preis: CHF ${price.toFixed(2)}`;
  updatePayment();
}

// Zahlungslink / QR-Code aktualisieren
function updatePayment() {
  const type = document.getElementById('string-type').value;
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const price = prices[type];

  const link = document.getElementById('twint-link');
  const qr = document.getElementById('twint-qr');
  const paymentSection = document.getElementById('payment-section');

  if(payment === 'twint') {
    paymentSection.style.display = 'block';
    // Beispiel-Link anpassen (hier musst du den echten Twint-Link generieren)
    link.href = `https://www.twint.ch/payment?amount=${price.toFixed(2)}`;
    qr.src = `twint-qr-${price}.png`; // QR-Code Bild für Betrag anpassen
  } else {
    paymentSection.innerHTML = "<h3>Bitte bei Abholung bar bezahlen</h3>";
  }
}

// Formular absenden
function submitOrder() {
  const type = document.getElementById('string-type').value;
  const tension = document.getElementById('tension').value;
  const pickup = document.getElementById('pickup').value;
  const notes = document.getElementById('notes').value;
  const user = localStorage.getItem('user');
  const payment = document.querySelector('input[name="payment"]:checked').value;

  if(!user || !type || !tension || !pickup) {
    alert("Bitte alle Pflichtfelder ausfüllen");
    return;
  }

  let summary = `Bestellung von ${user}:\n`;
  summary += `Seitenart: ${type}\n`;
  summary += `Spannung: ${tension}kg\n`;
  summary += `Abholdatum: ${pickup}\n`;
  summary += `Bemerkungen: ${notes}\n`;
  summary += `Zahlung: ${payment === 'twint' ? 'Twint' : 'Barzahlung'}\n`;
  summary += `Preis: CHF ${prices[type].toFixed(2)}`;

  alert(summary);
  // Optional: Hier kannst du die Daten an Netlify Forms oder Google Sheets senden
}
