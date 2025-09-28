const firebaseConfig = {
  apiKey: "AIzaSyDU7kEP21xWlS9jWpRlEbE97XbOa-LjUOA",
  authDomain: "flame-bespannungsservice.firebaseapp.com",
  databaseURL: "...",
  projectId: "flame-bespannungsservice",
  storageBucket: "flame-bespannungsservice.firebasestorage.app",
  messagingSenderId: "1039827014465",
  appId: "1:1039827014465:web:66d5688132434bdb17c7c0"
};
firebase.initializeApp(firebaseConfig);

const prices = { gosen: 20, bg65: 20, bg80: 23, aerobite: 23, custom: 15 };

// Prüfen, ob Firebase erreichbar ist
function checkFirebaseLimits() {
  const dbRef = firebase.database().ref('orders');
  dbRef.once('value')
    .then(() => {
      document.getElementById('login').style.display = 'block';
    })
    .catch(err => {
      if(err.code === 'PERMISSION_DENIED' || err.code === 'NETWORK_ERROR') {
        document.body.innerHTML = `
          <h1>Service momentan nicht verfügbar</h1>
          <p>Die Seite ist für Kunden vorübergehend gesperrt. Admins können weiterhin auf die Admin-Seite zugreifen.</p>
        `;
      } else console.error(err);
    });
}
checkFirebaseLimits();

// Login / Registrierung
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(user => showOrderForm())
    .catch(err => {
      if(err.code === 'auth/user-not-found') {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(user => showOrderForm())
          .catch(err => alert(err.message));
      } else alert(err.message);
    });
}

function showOrderForm() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('order-form').style.display = 'block';
  updatePrice();
  updatePayment();
  updateRacketCount();
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
    link.href = `#`; // Platzhalter
    qr.src = `images/twint-placeholder.png`;
  } else {
    paymentSection.innerHTML = "<h3>Bitte bei Abholung bar bezahlen</h3>";
  }
}

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

function updateRacketCount() {
  const dbRef = firebase.database().ref('orders');
  dbRef.once('value', snapshot => {
    const orders = snapshot.val();
    let count = 0;
    for(let id in orders) if(orders[id].bespannt) count++;
    document.getElementById('racket-count').innerText = count;
  });
}
