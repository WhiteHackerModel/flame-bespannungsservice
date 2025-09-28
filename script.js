// Firebase Config (ersetze DEIN_API_KEY etc. mit deinen Daten)
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT.firebaseapp.com",
  databaseURL: "https://DEIN_PROJECT.firebaseio.com",
  projectId: "DEIN_PROJECT",
  storageBucket: "DEIN_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
firebase.initializeApp(firebaseConfig);

const prices = { gosen: 20, bg65: 20, bg80: 23, aerobite: 23, custom: 15 };

// Login / Registrierung
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(user => showOrderForm(user.user.uid))
    .catch(err => {
      if(err.code === 'auth/user-not-found') {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(user => showOrderForm(user.user.uid))
          .catch(err => alert(err.message));
      } else alert(err.message);
    });
}

function showOrderForm(uid) {
  document.getElementById('login').style.display = 'none';
  document.getElementById('order-form').style.display = 'block';
  updatePrice();
  updatePayment();
  updateRacketCount();
}

// Preis aktualisieren
function updatePrice() {
  const type = document.getElementById('string-type').value;
  const price = prices[type];
  document.getElementById('total-price').innerText = `Preis: CHF ${price.toFixed(2)}`;
  updatePayment();
}

// Zahlungsoption
function updatePayment() {
  const type = document.getElementById('string-type').value;
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const price = prices[type];

  const link = document.getElementById('twint-link');
  const qr = document.getElementById('twint-qr');
  const paymentSection = document.getElementById('payment-section');

  if(payment === 'twint') {
    paymentSection.style.display = 'block';
    link.href = `#`; // Platzhalter, später echten Twint-Link einfügen
    qr.src = `images/twint-placeholder.png`;
  } else {
    paymentSection.innerHTML = "<h3>Bitte bei Abholung bar bezahlen</h3>";
  }
}

// Bestellung absenden
function submitOrder() {
  const user = firebase.auth().currentUser.email;
  const type = document.getElementById('string-type').value;
  const tension = document.getElementById('tension').value;
  const pickup = document.getElementById('pickup').value;
  const notes = document.getElementById('notes').value;
  const payment = document.querySelector('input[name="payment"]:checked').value;

  if(!type || !tension || !pickup) return alert("Alle Felder ausfüllen");

  const dbRef = firebase.database().ref('orders');
  dbRef.push({
    user, type, tension, pickup, notes,
    payment,
    bespannt: false,
    bezahlt: payment==='twint'?false:true,
    bespannDatum: null,
    abgerechnet: false,
    timestamp: Date.now()
  }).then(() => alert("Bestellung erfolgreich!"));

  updateRacketCount();
}

// Anzahl bespannter Rackets anzeigen
function updateRacketCount() {
  const dbRef = firebase.database().ref('orders');
  dbRef.once('value', snapshot => {
    const orders = snapshot.val();
    let count = 0;
    for(let id in orders) if(orders[id].bespannt) count++;
    document.getElementById('racket-count').innerText = count;
  });
}
