# Identitätsdienst-Blockliste

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identity Services](/identity-services).

Administrative Benutzerkonten können Konten von jedem Identitätsdienst zu einer Blockliste hinzufügen:

- Gesperrten Konten wird der Zugriff auf JOC Cockpit verweigert, sie werden nicht beim Identity Service Provider wie LDAP, OIDC usw. gesperrt.
- Gesperrte Konten bleiben in der Blockliste, bis sie von der Liste entfernt werden.

## Hinzufügen von Konten zur Blockliste

In der Unteransicht *Blockliste* können Sie Konten über die entsprechende Schaltfläche in der oberen rechten Ecke der Ansicht zur Blockliste hinzufügen.

Benutzerkonten können über die folgenden Unteransichten zur Blockliste hinzugefügt werden:

- [Audit Log - Failed Logins](/identity-service-faíled-logins): Wenn Konten identifiziert werden, bei denen die Anmeldung häufig fehlschlägt, kann dies auf einen Angriff hindeuten. Solche Konten können zur Blockierliste hinzugefügt werden.
- [Identity Service - Active Sessions](/identity-service-active-sessions) wenn Konten in aktiven Sitzungen als unerwünscht identifiziert werden, können sie zur Blockierliste hinzugefügt werden.

Beide Unteransichten ermöglichen das Hinzufügen einzelner Konten zur Blockliste und das Hinzufügen ausgewählter Konten in einer Massenoperation.

### Konten aus der Blockliste entfernen

In der Unteransicht *Blockliste* wird für jedes angezeigte Konto der Menüpunkt *Aktion aus Blockliste entfernen* angeboten.

Über die Schaltfläche *Aus Blockliste entfernen* in der oberen rechten Ecke der Unteransicht können Sie für ausgewählte Konten eine Massenoperation durchführen.

## Referenzen

### Kontexthilfe

- [Audit Log - Failed Logins](/identity-service-faíled-logins)
- [Identity Service - Active Sessions](/identity-service-active-sessions)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

