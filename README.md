# Flame Bespannungsservice

Kleines Projekt: Website + Admin-Dashboard für Badmintonbespannungen.

## Funktionen
- Kunden: Registrierung / Login, Bestellung aufgeben, Twint oder Barzahlung (Platzhalter)
- Profil: Name, Telefon speichern, Passwort zurücksetzen
- Admins: Bestellungen sehen, bearbeiten, löschen, Benutzer zu Admins machen
- Jede Bestellung: eindeutige ID, Preis, Zahlungsstatus, Bespannungsdatum
- Realtime Database (Firebase) & Authentication

## Deployment
- Dateien ins GitHub-Repo hochladen.
- Netlify (oder GitHub Pages) für Hosting.
- Firebase konfigurieren: Authentication (Email/Passwort) + Realtime Database.

## Hinweise
- Ersetze `firebaseConfig` in `script.js` und `admin.js`.
- Erstelle initialen Admin entweder direkt in Firebase Auth oder registriere mit `INITIAL_ADMIN_EMAIL`.
- Twint-Zahlungen: QR/Link später in `updatePayment()` einbauen / ersetzen.

## Lizenz
Komerzielle Nutzung nicht gestattet.
