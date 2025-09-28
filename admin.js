// Firebase Config (wie oben)
firebase.initializeApp(firebaseConfig);

// Admin Login
function adminLogin() {
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('admin-login').style.display = 'none';
      document.getElementById('admin-panel').style.display = 'block';
      loadOrders();
    })
    .catch(err => alert(err.message));
}

// Bestellungen laden
function loadOrders() {
  const dbRef = firebase.database().ref('orders');
  dbRef.on('value', snapshot => {
    const table = document.getElementById('orders-table');
    table.innerHTML = `<tr>
        <th>Kunde</th><th>Seitenart</th><th>Spannung</th><th>Abgabe</th>
        <th>Bespannt</th><th>Bezahlt</th><th>Abgerechnet</th><th>Bearbeiten</th></tr>`;
    const orders = snapshot.val();
    for(let id in orders){
      const o = orders[id];
      const row = table.insertRow();
      row.insertCell(0).innerText = o.user;
      row.insertCell(1).innerText = o.type;
      row.insertCell(2).innerText = o.tension;
      row.insertCell(3).innerText = o.pickup;
      row.insertCell(4).innerHTML = `<input type="checkbox" ${o.bespannt?'checked':''} onchange="updateOrder('${id}','bespannt',this.checked)">`;
      row.insertCell(5).innerHTML = `<input type="checkbox" ${o.bezahlt?'checked':''} onchange="updateOrder('${id}','bezahlt',this.checked)">`;
      row.insertCell(6).innerHTML = `<input type="checkbox" ${o.abgerechnet?'checked':''} onchange="updateOrder('${id}','abgerechnet',this.checked)">`;
      row.insertCell(7).innerHTML = `<button onclick="deleteOrder('${id}')">Löschen</button>`;
    }
  });
}

// Bestellung aktualisieren
function updateOrder(id, field, value) {
  firebase.database().ref('orders/'+id).update({[field]: value});
}

// Bestellung löschen
function deleteOrder(id) {
  if(confirm("Löschen?")) firebase.database().ref('orders/'+id).remove();
}
