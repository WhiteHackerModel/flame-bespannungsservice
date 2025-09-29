// Admin JS benutzt dieselbe firebaseConfig wie script.js
// Stelle sicher, dass firebase.initializeApp(firebaseConfig) bereits in script.js
// oder du kopierst firebaseConfig & initialisierung hier als Sicherheit.

async function adminInit() {
  auth.onAuthStateChanged(async user => {
    if(!user) { window.location.href = "index.html"; return; }
    const role = await getUserRole(user.uid);
    if(role !== 'admin') {
      document.body.innerHTML = `<div class="center-card"><h2>Kein Admin</h2><p>Du hast keine Admin-Rechte.</p></div>`;
      return;
    }
    document.getElementById('admin-info').innerText = `Angemeldet als ${user.email} (Admin)`;
    loadOrders();
  });
}

function loadOrders() {
  const tableBody = document.querySelector('#orders-table tbody');
  db.ref('orders').on('value', snap => {
    const orders = snap.val() || {};
    tableBody.innerHTML = '';
    Object.keys(orders).reverse().forEach(id => { // neueste zuerst
      const o = orders[id];
      const tr = document.createElement('tr');

      const formatDate = ts => ts ? new Date(ts).toLocaleString() : '';
      tr.innerHTML = `
        <td>${o.id}</td>
        <td>${o.user || o.uid}</td>
        <td>${o.type}</td>
        <td>${o.tension}</td>
        <td><input type="checkbox" ${o.bespannt ? 'checked' : ''} onchange="toggleOrder('${id}','bespannt',this.checked)"></td>
        <td><input type="checkbox" ${o.bezahlt ? 'checked' : ''} onchange="toggleOrder('${id}','bezahlt',this.checked)"></td>
        <td><input type="date" value="${o.bespannDatum ? o.bespannDatum.split('T')[0] : ''}" onchange="setBespannDatum('${id}', this.value)"></td>
        <td>${formatDate(o.createdAt)}</td>
        <td>
          <button onclick="deleteOrder('${id}')">Löschen</button>
          <button onclick="openEdit('${id}')">Edit</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  });
}

function toggleOrder(id, field, value) {
  db.ref(`orders/${id}`).update({ [field]: value })
    .then(()=> console.log("Updated", id, field, value))
    .catch(err=> alert(err.message));
  // optional: update racket count for all users
  updateRacketCount();
}

function setBespannDatum(id, datestr) {
  // store as ISO date string
  const val = datestr ? datestr : null;
  db.ref(`orders/${id}`).update({ bespannDatum: val })
    .catch(err=> alert(err.message));
}

function deleteOrder(id) {
  if(!confirm("Wirklich löschen?")) return;
  db.ref(`orders/${id}`).remove()
    .then(()=> alert("Gelöscht"))
    .catch(err=> alert(err.message));
}

function openEdit(id) {
  // einfache Edit-Prompt (kannst du später erweitern)
  db.ref(`orders/${id}`).once('value').then(snap=>{
    const o = snap.val();
    const newNotes = prompt("Bemerkungen ändern:", o.notes || '');
    if(newNotes !== null) db.ref(`orders/${id}`).update({ notes: newNotes });
  });
}

// Promote user by email => find user uid in /users by email and set role admin
function promoteByEmail() {
  const email = document.getElementById('promote-email').value;
  if(!email) return alert("E-Mail angeben");
  db.ref('users').orderByChild('email').equalTo(email).once('value').then(snap=>{
    const users = snap.val();
    if(!users) return alert("Benutzer nicht gefunden");
    const uid = Object.keys(users)[0];
    db.ref(`users/${uid}`).update({ role: 'admin' })
      .then(()=> alert(`${email} ist jetzt Admin`))
      .catch(err=> alert(err.message));
  });
}

// Start admin init on admin.html load
if(window.location.pathname.endsWith('admin.html')) {
  window.addEventListener('DOMContentLoaded', adminInit);
}
