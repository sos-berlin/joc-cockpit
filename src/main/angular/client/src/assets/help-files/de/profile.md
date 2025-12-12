# Profil

Das *Profil* enthält Einstellungen, die für die Interaktion eines Benutzers mit JOC Cockpit relevant sind.

Es gibt ein *Basisprofil*, das in der Regel aus dem *root* Benutzerkonto stammt

- um die *Benutzerprofile* der Benutzerkonten bei der ersten Anmeldung mit Voreinstellungen zu füllen,
- um Einstellungen bereitzustellen, die für alle Benutzerkonten relevant sind, wenn JOC Cockpit in der *niedrigen* Sicherheitsstufe betrieben wird.

Benutzer können das *Basisprofil* über die Seite [Einstellungen - JOC Cockpit](/settings-joc) auf ein anderes Konto umstellen.

Benutzer sollten sich bewusst sein, dass inaktive Profile vom [Bereinigungsdienst](/service-cleanup) gelöscht werden.

Das *Benutzerprofil* ermöglicht die Verwaltung von Präferenzen und Einstellungen, die für den aktuellen Benutzer gelten.

Einzelheiten finden Sie unter [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles).

## Kennwort ändern

Wenn Sie auf den entsprechenden Link klicken, können Benutzer ihr Kennwort ändern, wenn unter [Identitätsdienste](/identity-services) ein Dienst vom Typ *JOC* aktiv ist, der für die aktuelle Anmeldung verwendet wurde.

- **Altes Kennwort** erwartet, dass das aktuell verwendete Kennwort angegeben wird.
- **Neues Kennwort** erwartet, dass das neue Kennwort angegeben wird.
    - Es ist eine Mindestlänge des Kennworts erforderlich, die mit [Einstellungen - Identitätsdienste](/settings-identity-service) konfiguriert wird.
    - Das *Alte Kennwort* und das *Neue Kennwort* müssen unterschiedlich sein.
- **Kennwort bestätigen** erwartet, dass das neue Kennwort zur Bestätigung angegeben wird.

## Abschnitte

Die Einstellungen für *Benutzerprofile* sind in den folgenden Abschnitten verfügbar:

- [Profil - Einstellungen](/profile-preferences)
- [Profil - Berechtigungen](/profile-permissions)
- [Profil - Verwaltung Signaturschlüssel](/profile-signature-key-management)
- [Profil - Verwaltung SSL Schlüssel](/profile-ssl-key-management)
- [Profil - Verwaltung Git](/profile-git-management)
- [Profil - Verwaltung Favoriten](/profile-favorite-management)

## Referenzen

### Kontext-Hilfe

- [Bereinigungsdienst](/service-cleanup)
- [Einstellungen - Identitätsdienste](/settings-identity-service)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Identitätsdienste](/identity-services)

### Product Knowledge Base

- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)
