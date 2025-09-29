// ----------------- CONFIG -----------------
const firebaseConfig = {
  apiKey: "AIzaSyDU7kEP21xWlS9jWpRlEbE97XbOa-LjUOA",
  authDomain: "flame-bespannungsservice.firebaseapp.com",
  databaseURL: "https://flame-bespannungsservice-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "flame-bespannungsservice",
  storageBucket: "flame-bespannungsservice.firebasestorage.app",
  messagingSenderId: "1039827014465",
  appId: "1:1039827014465:web:66d5688132434bdb17c7c0"
};
// optional: E-Mail, die beim Registrieren automatisch Admin wird (z.B. deine)
const INITIAL_ADMIN_EMAIL = "luan.richard@gmx.ch";

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Hilfs: user role check
async function getUserRole(uid) {
  const snap = await db.ref(`users/${uid}/role`).once('value');
  return snap.val() || 'customer';
}

// ----------------- AUTH / UI -----------------
function showRegister() {
  document.getElementById('auth-box').style.display = 'none';
  document.getElementById('register-box').style.display = 'block';
}
function showLogin() {
  document.getElementById('register-box').style.display = 'none';
  document.getElementById('auth-box').style.display = 'block';
}

function login() {
  const email = (document.getElementById('email')||{}).value;
  const pass = (document.getElementById('password')||{}).value;
  if(!email || !pass) return alert("Bitte E-Mail und Passwort angeben");
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      // redirect to order page
      window.location.href = "order.html";
    })
    .catch(err => alert(err.message));
}

function register() {
  const email = (document.getElementById('r-email')||{}).value;
  const pass = (document.getElementById('r-password')||{}).value;
  const name = (document.getElementById('r-name')||{}).value || '';
  if(!email || !pass) return alert("E-Mail und Passwort angeben");
  auth.createUserWithEmailAndPassword(email, pass)
    .then(async cred => {
      const uid = cred.user.uid;
      // Rolle: wenn initial admin email, set admin role
      const role = (email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase()) ? 'admin' : 'customer';
      await db.ref(`users/${uid}`).set({
        email, name, role, contact: { phone: '' }
      });
      alert("Konto erstellt. Bitte melde dich an.");
      showLogin();
    })
    .catch(err => alert(err.message));
}

function resetPassword() {
  const email = (document.getElementById('email')||{}).value;
  if(!email) return alert("Bitte E-Mail eingeben");
  auth.sendPasswordResetEmail(email)
    .then(()=> alert("E-Mail zum Zurücksetzen gesendet."))
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut().then(()=> {
    window.location.href = "index.html";
  });
}

// ----------------- ORDER PAGE -----------------
const prices = { gosen:20, bg65:20, bg80:23, aerobite:23, custom:15 };

function ensureFirebase() {
  // Einfacher Connectivity-Check: liest orders once
  return db.ref('orders').once('value')
    .then(()=> true)
    .catch(err=>{
      console.error("Firebase unreachable:", err);
      return false;
    });
}

// Called on order.html load
async function initOrderPage() {
  const ok = await ensureFirebase();
  if(!ok) {
    document.body.innerHTML = `<div class="center-card"><h2>Service momentan nicht verfügbar</h2><p>Bitte später erneut versuchen. Admins können weiterhin das Admin-Panel nutzen.</p></div>`;
    return;
  }

  auth.onAuthStateChanged(user => {
    if(!user) {
      window.location.href = "index.html"; // nicht eingeloggt -> zurück
      return;
    }
    document.getElementById('user-email').innerText = user.email;
    updatePrice();
    updatePayment();
    updateRacketCount();
  });
}

function updatePrice() {
  const type = document.getElementById('string-type').value;
  const price = prices[type] || 0;
  document.getElementById('total-price').innerText = `Preis: CHF ${price.toFixed(2)}`;
}

function updatePayment() {
  const type = document.getElementById('string-type').value;
  const price = prices[type] || 0;
  const link = document.getElementById('twint-link');
  const qr = document.getElementById('twint-qr');

  // placeholders — ersetzen, wenn Twint-Link/QR erzeugt sind
  link.href = "#";
  qr.src = "images/twint-placeholder.png";
}

async function submitOrder() {
  const user = auth.currentUser;
  if(!user) return alert("Bitte einloggen.");

  const type = document.getElementById('string-type').value;
  const tension = document.getElementById('tension').value;
  const pickup = document.getElementById('pickup').value;
  const notes = document.getElementById('notes').value;
  const payment = document.querySelector('input[name="payment"]:checked').value;
  if(!type || !tension || !pickup) return alert("Bitte alle Pflichtfelder ausfüllen.");

  const price = prices[type] || 0;
  // erzeugen Order mit eindeutiger ID (push key)
  const ordersRef = db.ref('orders');
  const newRef = ordersRef.push();
  const orderId = newRef.key;

  const orderObj = {
    id: orderId,
    user: user.email,
    uid: user.uid,
    type, tension: parseFloat(tension),
    pickup, notes,
    payment,
    price,
    bespannt: false,
    bezahlt: payment === 'twint' ? false : true, // bar = sofort bezahlt (vor Ort)
    bespannDatum: null,
    abgerechnet: false,
    createdAt: Date.now()
  };

  await newRef.set(orderObj);
  // optional: create a simple receipt node
  await db.ref(`receipts/${orderId}`).set({
    orderId, user: user.email, price, createdAt: Date.now()
  });

  alert(`Bestellung aufgenommen. ID: ${orderId}\nDu erhältst eine Bestätigung in deinem Konto.`);
  updateRacketCount();
}

// Count bespannter Rackets
function updateRacketCount() {
  db.ref('orders').once('value').then(snap=>{
    const orders = snap.val()||{};
    let count = 0;
    Object.values(orders).forEach(o => { if(o.bespannt) count++; });
    const el = document.getElementById('racket-count');
    if(el) el.innerText = count;
  });
}

// ----------------- PROFILE PAGE -----------------
function initProfilePage() {
  auth.onAuthStateChanged(async user => {
    if(!user) { window.location.href = "index.html"; return; }
    const uid = user.uid;
    document.getElementById('p-email').value = user.email;
    const snap = await db.ref(`users/${uid}`).once('value');
    const data = snap.val() || {};
    document.getElementById('p-name').value = data.name || '';
    document.getElementById('p-phone').value = (data.contact && data.contact.phone) || '';
  });
}

function saveProfile() {
  const user = auth.currentUser;
  if(!user) return alert("Nicht eingeloggt");
  const uid = user.uid;
  const name = document.getElementById('p-name').value;
  const phone = document.getElementById('p-phone').value;
  db.ref(`users/${uid}`).update({ name, contact: { phone } })
    .then(()=> alert("Profil gespeichert"))
    .catch(err=> alert(err.message));
}

function sendPasswordReset() {
  const user = auth.currentUser;
  if(!user) return alert("Bitte einloggen und danach Passwort zurücksetzen per E-Mail");
  auth.sendPasswordResetEmail(user.email)
    .then(()=> alert("Passwort-Reset E-Mail gesendet"))
    .catch(err => alert(err.message));
}

// ----------------- UTIL -----------------
/* Diese Funktionen werden automatisch beim Laden der jeweiligen Seite aufgerufen:
 - index.html: keine spezielle init nötig
 - order.html: initOrderPage()
 - profile.html: initProfilePage()
*/
if(window.location.pathname.endsWith('order.html')) {
  window.addEventListener('DOMContentLoaded', initOrderPage);
}
if(window.location.pathname.endsWith('profile.html')) {
  window.addEventListener('DOMContentLoaded', initProfilePage);
}
