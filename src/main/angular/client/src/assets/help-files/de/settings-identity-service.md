# Einstellungen - Identitätsdienste

Die folgenden Einstellungen werden auf alle [Identitätsdienste](/identity-services) angewendet. Änderungen werden sofort wirksam.

Die Seite *Einstellungen* ist über das Symbol ![wheel icon](assets/images/wheel.png) in der Menüleiste zugänglich.

## Einstellungen: Identitätsdienste

### Einstellung: *idle\_session\_timeout*, Standard: *30*m

Gibt die maximale Dauer einer Leerlaufsitzung in JOC Cockpit in Minuten an.

- Wenn Benutzer für die angegebene Anzahl von Minuten inaktiv sind, läuft die Benutzersitzung ab und wird beendet. Benutzer können Anmeldedaten angeben und sich anmelden, um eine neue Benutzersitzung zu erstellen.
- Wenn die Lebensdauer eines von einem externen Identitätsdienst generierten Access Token von der maximalen Leerlaufzeit abweicht, versucht JOC Cockpit, das Access Token beim Identitätsdienst zu erneuern. Bei der Erneuerung eines Access Token muss der Benutzer seine Anmeldedaten nicht erneut eingeben.
- Identitätsdienste können die Lebensdauer von Access Token begrenzen (time to live) und sie können die Erneuerung von Access Token begrenzen (maximum time to live). Wenn ein Access Token nicht erneuert werden kann, wird die Benutzersitzung beendet und der Benutzer muss sich erneut anmelden.

### Einstellung: *initial\_password*, Standard: *initial*

Gibt das Initialkennwort an, das bei der Erstellung neuer Konten oder beim Zurücksetzen von Kennwörtern im [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) verwendet wird.

- Wenn ein Administrator mit JOC Cockpit Benutzerkonten hinzufügt und kein Kennwort angibt, wird das Initialkennwort verwendet. In der Regel lässt JOC Cockpit die Verwendung leerer Kennwörter nicht zu, sondern füllt sie aus dem *initial\_password*. Administratoren können das Initialkennwort anwenden oder ein individuelles Kennwort für das jeweilige Konto festlegen.
- Wenn Sie das Kennwort eines Benutzerkontos zurücksetzen, wird ein bestehendes Kennwort durch das *initial\_password* ersetzt.
- Unabhängig davon, ob das *initial\_password* oder ein individuelles Kennwort einem Benutzerkonto zugewiesen wird, muss das Kennwort bei der ersten Anmeldung vom Benutzer geändert werden. Dadurch wird sichergestellt, dass Benutzer das Initialkennwort nur für die erste Anmeldung verwenden können.

### Einstellung: *minimum\_password\_length*, Voreinstellung: *1*

Gibt die Mindestlänge für Kennwörter im JOC Identitätsdienst an.

Für alle angegebenen Kennwörter - einschließlich des *initial\_password* - wird die Mindestlänge angegeben.
Beachten Sie, dass die Anzahl der Zeichen und die Beliebigkeit der Zeichenauswahl Schlüsselfaktoren für sichere Kennwörter sind. Die Komplexität des Kennworts, die z.B. die Verwendung von Ziffern und Sonderzeichen verlangt, trägt nicht wesentlich zur Sicherheit des Kennworts bei, es sei denn, es handelt sich um kurze Kennwörter.

## Referenzen

### Kontext-Hilfe

- [Einstellungen](/settings)
- [Identitätsdienste](/identity-services)

### Product Knowledge Base

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
