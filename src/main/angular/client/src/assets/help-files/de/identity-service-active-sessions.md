# Aktive Sitzungen des Identitätsdienstes

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identity Services](/identity-services).

Benutzer können Konten mit aktiven Sitzungen identifizieren, wenn sie die Ansicht *Identitätsdienste verwalten* über das Radsymbol in der Menüleiste aufrufen.

Aktive Sitzungen werden anhand des verwendeten Kontos, des für die Anmeldung verwendeten Identitätsdienstes und der verbleibenden Sitzungszeit angezeigt.

- JOC Cockpit begrenzt die Anzahl der Sitzungen pro Konto nicht.
- Die verbleibende Sitzungszeit wird durch die folgenden Faktoren begrenzt:
  - Die auf der Seite [Settings - Identity Service](/settings-identity-service) konfigurierte Einstellung *session_idle_timeout* begrenzt die maximale Dauer, die eine Sitzung ohne Benutzeraktivität aktiv bleiben kann.
  - Identitätsdienstleister wie OIDC und Keycloak können die maximale Dauer einer Benutzersitzung begrenzen.

## Operationen auf aktiven Sitzungen

Benutzer finden die folgenden Operationen für aktive Sitzungen:

- **Zur Blockliste hinzufügen** fügt das betreffende Konto zur [Identity Service - Blocklist](/identity-service-blocklist) hinzu, wodurch eine zukünftige Anmeldung verweigert wird. Die Operation beendet nicht die aktuelle Sitzung des Kontos.
- **Sitzung abbrechen** wird die aktuelle Sitzung des Kontos zwangsweise beenden. Dies hindert das Konto nicht daran, einen neuen Anmeldevorgang durchzuführen.
- **Alle Sitzungen für Konto abbrechen** beendet ähnlich wie *Sitzung abbrechen* alle Sitzungen des angegebenen Kontos.

Wenn Sie eine oder mehrere Sitzungen auswählen, dann ist die Operation *Sitzung abbrechen* über eine Massenoperation mit der entsprechenden Schaltfläche in der oberen rechten Ecke der Unteransicht verfügbar.

## Referenzen

### Kontext-Hilfe

- [Identity Service - Blocklist](/identity-service-blocklist)
- [Identity Services](/identity-services)
- [Settings - Identity Service](/settings-identity-service)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

