# Einstellungen - Identitätsdienst

Die folgenden Einstellungen werden auf alle [Identity Services](/identity-services) angewendet. Änderungen werden sofort wirksam.

Die Seite *Einstellungen* ist über das Symbol ![wheel icon](assets/images/wheel.png) in der Menüleiste zugänglich.

## Einstellungen für den Identitätsdienst

### Einstellung: *idle\_session\_timeout*, Standard: *30*m

Gibt die maximale Dauer einer Leerlaufsitzung in JOC Cockpit in Minuten an.

- Wenn Benutzer für die angegebene Anzahl von Minuten inaktiv sind, läuft die Benutzersitzung ab und wird beendet. Benutzer können Anmeldedaten angeben und sich anmelden, um eine neue Benutzersitzung zu erstellen.
- Wenn die Lebensdauer eines von einem externen Identitätsdienst bereitgestellten Zugriffstokens von der maximalen Leerlaufzeit abweicht, versucht das JOC Cockpit, das Zugriffstoken beim Identitätsdienst zu erneuern. Bei der Erneuerung eines Zugangstokens muss der Benutzer seine Anmeldedaten nicht erneut eingeben.
- Identitätsdienste können die Lebensdauer von Zugriffstoken begrenzen (time to live) und sie können die Erneuerung von Zugriffstoken begrenzen (maximum time to live). Wenn ein Zugriffstoken nicht erneuert werden kann, wird die Benutzersitzung beendet und der Benutzer muss sich erneut anmelden.

### Einstellung: *initial\_password*, Standard: *initial*

Gibt das anfängliche Passwort an, das bei der Erstellung neuer Konten oder beim Zurücksetzen von Passwörtern im [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) verwendet wird.

- Wenn ein Administrator mit dem JOC Cockpit Benutzerkonten hinzufügt und kein Passwort angibt, wird das Initialpasswort verwendet. In der Regel lässt das JOC Cockpit die Verwendung leerer Passwörter nicht zu, sondern füllt sie aus dem *initial\_password* auf. Administratoren können das Initialpasswort anwenden und ein individuelles Passwort für das jeweilige Konto festlegen.
- Wenn Sie das Passwort eines Benutzerkontos zurücksetzen, wird ein bestehendes Passwort durch das *initial\_password* ersetzt.
- Unabhängig davon, ob das *initial\_password* oder ein individuelles Passwort einem Benutzerkonto zugewiesen wird, muss das Passwort bei der ersten Anmeldung vom Benutzer geändert werden. Dadurch wird sichergestellt, dass Benutzer das ursprüngliche Passwort nur für die erste Anmeldung verwenden können.

### Einstellung: *minimum\_password\_length*, Voreinstellung: *1*

Gibt die Mindestlänge für Passwörter im JOC Identity Service an.

Für alle angegebenen Kennwörter - einschließlich des *initial\_password* - wird die Mindestlänge angegeben.
Beachten Sie, dass die Anzahl der Zeichen und die Beliebigkeit der Zeichenauswahl Schlüsselfaktoren für sichere Passwörter sind. Die Komplexität des Kennworts, die z.B. die Verwendung von Ziffern und Sonderzeichen erfordert, trägt nicht wesentlich zur Sicherheit des Kennworts bei, es sei denn, es handelt sich um kurze Kennwörter.

## Referenzen

### Kontext-Hilfe

- [Identity Services](/identity-services)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

