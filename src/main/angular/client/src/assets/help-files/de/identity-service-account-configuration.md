# Identitätsdienste - Konfiguration Benutzerkonten

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identitätsdienste](/identity-services).

Für eine Reihe von Identitätsdiensten stehen die Operationen zum Hinzufügen, Aktualisieren und Löschen von Konten zur Verfügung, zum Beispiel für den [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service).

## Konfiguration Benutzerkonto

Für ein Konto sind die folgenden Eigenschaften verfügbar:

- **Konto** gibt das Konto an, das für die Anmeldung verwendet wird.
- **Kennwort** ist für den Identitätsdiensttyp *JOC* verfügbar. Das *Kennwort* wird durch eine Prüfsumme ersetzt, bevor es in der Datenbank gespeichert wird. Bei der Anmeldung wird eine ähnliche Prüfoperation durchgeführt, um Kennwörter zu vergleichen. 
  - Es kann ein individuelles *Kennwort* angegeben werden. Wenn Sie es leer lassen, wird das auf der Seite [Einstellungen - Identitätsdienste](/settings-identity-service) angegebene *initial_password* verwendet. Das *Kennwort* muss mit der Anforderung *minimum_password_length* von derselben Einstellungsseite übereinstimmen.
  - Unabhängig davon, welche Quelle für das *Kennwort* verwendet wird, muss der Benutzer bei der nächsten Anmeldung das *Kennwort* des Kontos ändern.
- **Kennwort bestätigen** wird verwendet, um ein individuell festgelegtes *Kennwort* zu wiederholen. Wenn die Eigenschaft *Kennswort* leer ist, muss auch die Eigenschaft *Kennwort bestätigen* leer sein.
- **Rollen** gibt die Liste der [Identitätsdienste - Rollen](/identity-service-roles) an, die dem Konto zugewiesen sind.
- **Kennwortänderung erzwingen** gibt an, ob das Benutzerkonto bei der nächsten Anmeldung sein *Kennwort* ändern muss. Die Kennwortänderung wird erzwungen, um zu verhindern, dass das individuell festgelegte *Kennwort* und das ursprüngliche *Kennwort* weiterhin verwendet werden.
- Für bestehende Konten sind folgende Eigenschaften verfügbar:
  - **Blockiert** gibt an, dass das Konto zur [Identitätsdienste - Sperrliste](/identity-service-blocklist) hinzugefügt werden soll und die Anmeldung verweigert wird.
  - **Deaktiviert** gibt an, dass das Konto inaktiv ist und ihm die Anmeldung verweigert wird.

## Referenzen

### Kontext-Hilfe

- [Einstellungen - Identitätsdienste](/settings-identity-service)
- [Identitätsdienste](/identity-services)
- [Identitätsdienste - Sperrliste](/identity-service-blocklist)
- [Identitätsdienste - Rollen](/identity-service-roles) 

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
