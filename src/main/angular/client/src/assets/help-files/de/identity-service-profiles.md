# Identitätsdienst-Profile

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identity Services](/identity-services).

Für Benutzer, die sich mit einem Identitätsdienst anmelden, wird bei der ersten Anmeldung ein *Profil* für den entsprechenden Identitätsdienst erstellt.

- Wenn mehr als ein Identitätsdienst für die Anmeldung zur Verfügung steht, hat der Benutzer ein *Profil* bei jedem Identitätsdienst, bei dem eine erfolgreiche Anmeldung durchgeführt wurde.
- Das *Profil* wird von dem Konto erstellt, das mit der Einstellung *default_profile_account* auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) angegeben wurde. Standardmäßig wird das *Profil* des *Stammkontos* verwendet.
- die *Profile* werden gelöscht, wenn sie über einen längeren Zeitraum nicht verwendet werden. Die Seite [Settings - Cleanup Service](/settings-cleanup) legt den maximalen Zeitraum fest, für den ein *Profil* bestehen bleibt, wenn keine Anmeldung über das zugehörige Benutzerkonto erfolgt.

## Operationen für Profile

Die Unteransicht zeigt die Liste der aktiven *Profile* und das Datum der letzten Anmeldung an. Die folgenden Operationen sind für *Profile* einzeln verfügbar:

- Wenn Sie auf ein *Profil* klicken, gelangen Sie zur Unteransicht [Identity Service - Roles](/identity-service-roles), in der die vom jeweiligen *Profil* verwendeten Rollen angezeigt werden.
- Das Aktionsmenü eines *Profils* bietet die folgenden Operationen:
  - **Profileinstellungen löschen** setzt die [Profil - Einstellungen](/profile-preferences) auf ihre Standardeinstellungen zurück. Andere *Profil*-Einstellungen wie *Git-Verwaltung* und *Favoritenverwaltung* bleiben erhalten. Die Operation kann verwendet werden, um die Anwendung des *Profils* des Standardkontos zu erzwingen.
  - **Profil löschen** löscht das *Profil* des Benutzerkontos. Bei der nächsten Anmeldung des betreffenden Kontos wird ein neues *Profil* erstellt.

Benutzer können ein oder mehrere *Profile* auswählen, um die oben genannten Operationen für die ausgewählten *Profile* im Ganzen durchzuführen.

## Referenzen

### Kontexthilfe

- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Service - Accounts](/identity-service-accounts) 
- [Identity Service - Roles](/identity-service-roles) 
- [Identity Services](/identity-services)
- [Profil - Einstellungen](/profile-preferences) 
- [Settings - Cleanup Service](/settings-cleanup)
- [Einstellungen - JOC Cockpit](/settings-joc)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

