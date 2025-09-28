<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Admin – Flame Bespannungsservice</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
</head>
<body>
  <h1>Admin Dashboard</h1>

  <div id="admin-login">
    <input type="email" id="admin-email" placeholder="Admin E-Mail">
    <input type="password" id="admin-password" placeholder="Passwort">
    <button onclick="adminLogin()">Login</button>
  </div>

  <div id="admin-panel" style="display:none;">
    <h2>Alle Bestellungen</h2>
    <table id="orders-table" border="1">
      <tr>
        <th>Kunde</th>
        <th>Seitenart</th>
        <th>Spannung</th>
        <th>Abgabe</th>
        <th>Bespannt</th>
        <th>Bezahlt</th>
        <th>Datum Bespannung</th>
        <th>Bearbeiten</th>
      </tr>
    </table>
  </div>

  <script src="admin.js"></script>
</body>
</html>
