const prices = { gosen: 20, bg65: 20, bg80: 23, aerobite: 23, custom: 15 };

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

function updatePrice() {
  const type = document.getElementById('string-type').value;
  const price = prices[type];
  document.getElementById('total-price').innerText = `Preis: CHF ${price.toFixed(2)}`;
  updatePayment();
}

function updatePayment() {
  const type = document.getElementById('string-type').value;
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const price = prices[type];

  const link = document.getElementById('twint-link');
  const qr = document.getElementById('twint-qr');
  const paymentSection = document.getElementById('payment-section');

  if(payment === 'twint') {
    paymentSection.style.display = 'block';
    link.href = `https://www.twint.ch/payment?amount=${price.toFixed(2)}`;
    qr.src = `twint-qr-${price}.png`;
  } else {
    paymentSection.innerHTML = "<h3>Bitte bei Abholung bar bezahlen</h3>";
  }
}

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
}
