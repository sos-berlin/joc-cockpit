# Profil - Verwaltung Signaturschlüssel

Die Registerkarte *Profil - Verwaltung Signaturschlüssel* enthält das Signierzertifikat, das für das Ausrollen von Arbeitsabläufen und Job-Ressourcen verwendet wird.

- Wenn JOC Cockpit auf der Sicherheitsstufe *niedrig* betrieben wird, wird das Signierzertifikat mit dem *root* Konto gespeichert und beim Ausrollen von Objekten mit einem beliebigen Benutzerkontos verwendet.
- Wenn JOC Cockpit mit der Sicherheitsstufe *mittel* betrieben wird, wird das Signierzertifikat individuell mit dem Benutzerkonto gespeichert und für die Ausroll-Operationen des entsprechenden Benutzerkontos verwendet.
- Wenn JOC Cockpit mit der Sicherheitsstufe *hoch* betrieben wird, wird das Signierzertifikat außerhalb von JOC Cockpit gespeichert und die Registerkarte *Verwaltung Signaturschlüssel* ist nicht verfügbar.

Einzelheiten finden Sie unter [JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management).

<img src="profile-signature-key-management.png" alt="Signature Key Management" width="800" height="75" />

## Zertifikat signieren

JS7 wird mit einem Standard Signaturzertifikat ausgeliefert. Benutzer sollten die Gültigkeitsdauer des Zertifikats beachten. Neuere Zertifikate werden mit JS7 Versionen ca. sechs Monate vor Ablauf des Zertifikats ausgeliefert. Anstatt JS7 zu aktualisieren, können Benutzer ein neueres Zertifikat hochladen, das unter [JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment) verfügbar wird.

Benutzer können ihr eigenes Signierzertifikat erstellen:

- von einer privaten Zertifizierungsstelle (CA) oder einer öffentlichen CA. Die Verwendung einer privaten CA wird unter [JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates) erklärt.
- von der eingebauten CA, die mit JOC Cockpit geliefert wird.

Wenn Sie eine private oder öffentliche Zertifizierungsstelle verwenden, muss das Zertifikat der Stammzertifizierungsstelle oder das Zertifikat der Zwischenzertifizierungsstelle, das zum Signieren des Signierzertifikats verwendet wurde, den Controller Instanzen und Agenten Instanzen zur Verfügung gestellt werden. Das Zertifikat muss in einer Datei im PEM-Format verfügbar sein, die sich im Verzeichnis *./config/private/trusted-x509-keys* des Controller und des Agenten befindet.

## Operationen für Signierzertifikate

Die folgenden Operationen werden angeboten:

- **Zeigen** ist verfügbar, wenn Sie auf das Symbol rechts neben der Gültigkeitsdauer klicken. Dadurch werden der private Schlüssel und das Signierzertifikat angezeigt.
- **Aktualisieren** ruft ein Popup-Fenster auf, in dem Sie einen aktualisierten privaten Schlüssel und ein aktualisiertes Signierzertifikat einfügen können.
- **Importieren** ruft ein Popup-Fenster auf, in dem Sie den privaten Schlüssel und das Signierzertifikat hochladen können.
- **Generieren** ruft ein Popup-Fenster auf, in dem der private Schlüssel und das Signierzertifikat von der integrierten Zertifizierungsstelle generiert werden.
  - Benutzer sollten überprüfen, ob auf der Registerkarte [Profil - Verwaltung SSL Schlüssel](/profile-ssl-key-management) ein gültiges Root-CA-Zertifikat oder Zwischenzertifikat vorhanden ist.
  - Bei der Schlüsselgenerierung sollten Sie die Option *SSL CA verwenden* wählen, um die eingebaute CA beim Erstellen und Signieren eines neuen Signierzertifikats zu verwenden.
- mit **Löschen** entfernen Sie den privaten Schlüssel und das Signierzertifikat. In den Sicherheitsstufen *niedrig* und *mittel* verhindert dies, dass Arbeitsabläufe und Auftragsressourcen ausgerollt werden können.

## Referenzen

### Kontext-Hilfe

- [Profil](/profile)
- [Profil - Verwaltung SSL Schlüssel](/profile-ssl-key-management)

### Product Knowledge Base

- [JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates)
- [JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment)
- [JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management)
