# Konfiguration des Identitätsdienstkontos

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identity Services](/identity-services).

Für eine Reihe von Identitätsdiensten stehen die Operationen zum Hinzufügen, Aktualisieren und Löschen von Konten zur Verfügung, zum Beispiel für den [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service).

## Konto-Konfiguration

Für ein Konto sind die folgenden Eigenschaften verfügbar:

- **Konto** gibt das Konto an, das für die Anmeldung verwendet wird.
- **Passwort** ist für den Identitätsdiensttyp *JOC* verfügbar. Das *Passwort* wird mit einem Hashwert versehen, bevor es in der Datenbank gespeichert wird. Bei der Anmeldung wird eine ähnliche Hash-Operation durchgeführt, um Passwörter zu vergleichen. 
  - Es kann ein individuelles *Passwort* angegeben werden. Wenn Sie es leer lassen, wird das auf der Seite [Settings - Identity Service](/settings-identity-service) angegebene *initial_password* verwendet. Das *Passwort* muss mit der Anforderung *minimum_password_length* von derselben Einstellungsseite übereinstimmen.
  - Unabhängig davon, welche Quelle für das *Passwort* verwendet wird, muss der Benutzer bei der nächsten Anmeldung das *Passwort* des Kontos ändern.
- **Passwort bestätigen** wird verwendet, um ein individuell festgelegtes *Passwort* zu wiederholen. Wenn die Eigenschaft *Passwort* leer ist, muss auch die Eigenschaft *Kennwort bestätigen* leer sein.
- **Rollen** gibt die Liste der [Identity Service - Roles](/identity-service-roles) an, die dem Konto zugewiesen sind.
- **Passwortänderung erzwingen** gibt an, ob das Benutzerkonto bei der nächsten Anmeldung sein *Passwort* ändern muss. Die Passwortänderung wird erzwungen, um zu verhindern, dass das individuell festgelegte *Passwort* und das ursprüngliche *Passwort* weiterhin verwendet werden.
- Für bestehende Konten sind folgende Eigenschaften verfügbar:
  - **Blockiert** gibt an, dass das Konto zu [Identity Service - Blocklist](/identity-service-blocklist) hinzugefügt werden soll und der Zugriff verweigert wird.
  - **Deaktiviert** gibt an, dass das Konto inaktiv ist und ihm der Zugriff verweigert wird.

## Referenzen

### Kontexthilfe

- [Identity Service - Blocklist](/identity-service-blocklist)
- [Identity Service - Roles](/identity-service-roles) 
- [Identity Services](/identity-services)
- [Settings - Identity Service](/settings-identity-service)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

