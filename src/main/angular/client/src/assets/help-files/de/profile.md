# Profil

Das *Profil* enthält Einstellungen, die für die Interaktion eines Benutzers mit JOC Cockpit relevant sind.

Es gibt ein *Basisprofil*, das in der Regel von dem *Stammkonto* stammt, das verwendet wird

- um die *Benutzerprofile* der Benutzerkonten bei der ersten Anmeldung aufzufüllen,
- um Einstellungen bereitzustellen, die für alle Benutzerkonten relevant sind, wenn JOC Cockpit in der *niedrigen* Sicherheitsstufe betrieben wird.

Benutzer können das *Basisprofil* über die Seite [Einstellungen - JOC Cockpit](/settings-joc) auf ein anderes Konto umstellen.

Benutzer sollten sich bewusst sein, dass inaktive Profile von [Cleanup Service](/service-cleanup) gelöscht werden.

Das *Benutzerprofil* ermöglicht die Verwaltung von Präferenzen und Einstellungen, die für den aktuellen Benutzer gelten.

Einzelheiten finden Sie unter [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles).

## Passwort ändern

Wenn Sie auf den entsprechenden Link klicken, können Benutzer ihr Passwort ändern, wenn unter [Identity Services](/identity-services) ein Dienst vom Typ *JOC* aktiv ist, der für die aktuelle Anmeldung verwendet wurde.

- **Altes Passwort** erwartet, dass das aktuell verwendete Passwort angegeben wird.
- **Neues Passwort** erwartet, dass das neue Passwort angegeben wird.
    - Es ist eine Mindestlänge des Kennworts erforderlich, die mit [Settings - Identity Service](/settings-identity-service) konfiguriert wird.
    - Das *Alte Passwort* und das *Neue Passwort* müssen unterschiedlich sein.

## Profilabschnitte

Die Einstellungen für *Benutzerprofile* sind in den folgenden Abschnitten verfügbar:

- [Profil - Einstellungen](/profile-preferences)
- [Profile - Permissions](/profile-permissions)
- [Profile - Signature Key Management](/profile-signature-key-management)
- [Profile - SSL Key Management](/profile-ssl-key-management)
- [Profile - Git Management](/profile-git-management)
- [Profile - Favorite Management](/profile-favorite-management)

## Referenzen

### Kontext-Hilfe

- [Cleanup Service](/service-cleanup)
- [Identity Services](/identity-services)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Settings - Identity Service](/settings-identity-service)

### Product Knowledge Base

- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)

