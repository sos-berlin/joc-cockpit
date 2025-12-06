# Identitätsdienste - Sperrliste

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identitätsdienste](/identity-services).

Administrative Benutzerkonten können Konten von jedem Identitätsdienst zu einer Sperrliste hinzufügen:

- Gesperrten Konten wird der Zugriff auf JOC Cockpit verweigert, sie werden nicht beim Identitätsdienstanbieter wie LDAP, OIDC usw. gesperrt.
- Gesperrte Konten bleiben in der Sperrliste, bis sie von der Liste entfernt werden.

## Hinzufügen von Konten zur Sperrliste

In der Unteransicht *Sperrliste* können Sie Konten über die entsprechende Schaltfläche in der oberen rechten Ecke der Ansicht zur Sperrliste hinzufügen.

Benutzerkonten können über die folgenden Unteransichten zur Sperrliste hinzugefügt werden:

- [Prüfprotokoll - Fehlgeschlagene Anmeldungen](/identity-service-faíled-logins): Wenn Konten identifiziert werden, bei denen die Anmeldung häufig fehlschlägt, kann dies auf einen Angriff hindeuten. Solche Konten können zur Sperrliste hinzugefügt werden.
- [Identitätsdienste - Aktive Sitzungen](/identity-service-active-sessions): wenn Konten in aktiven Sitzungen als unerwünscht identifiziert werden, können sie zur Sperrliste hinzugefügt werden.

Beide Unteransichten ermöglichen das Hinzufügen einzelner Konten zur Sperrliste und das Hinzufügen ausgewählter Konten in einer Massenoperation.

### Konten aus der Sperrliste entfernen

In der Unteransicht *Sperrliste* wird für jedes angezeigte Konto der Aktionsmenüpunkt *Konto aus Sperrliste entfernen* angeboten.

Über die Schaltfläche *Aus Sperrliste entfernen* in der oberen rechten Ecke der Unteransicht können Sie für ausgewählte Konten eine Massenoperation durchführen.

## Referenzen

### Kontext-Hilfe

- [Identitätsdienste](/identity-services)
- [Identitätsdienste - Aktive Sitzungen](/identity-service-active-sessions)
- [Prüfprotokoll - Fehlgeschlagene Anmeldungen](/identity-service-faíled-logins)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
