# Verschlüsselungsschlüssel verwalten

 [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) bietet einen sicheren Weg, um die in Jobs verwendeten Geheimnisse zu verwalten. Benutzer können sensible Daten wie Kennwörter mit Hilfe asymmetrischer Schlüssel ver- und entschlüsseln.

Für die Ver- und Entschlüsselung werden asymmetrische private X.509-Schlüssel und -Zertifikate verwendet. Dazu gehören die folgenden Rollen:

- Sender: hat Zugriff auf das Zertifikat oder den öffentlichen Schlüssel des Empfängers und verschlüsselt ein *Geheimnis* auf der Grundlage des öffentlichen Schlüssels des Empfängers, der direkt verfügbar ist oder aus einem Zertifikat berechnet werden kann.
- Empfänger: hat Zugriff auf den privaten Schlüssel, der die Entschlüsselung des verschlüsselten *Geheimnisses* ermöglicht.

Für die Erstellung von Verschlüsselungsschlüsseln siehe [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys).

Zur Verwaltung von Chiffrierschlüsseln siehe [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys).

Der Prozess der Verschlüsselung funktioniert folgendermaßen:

<img src="encryption-process.png" alt="Encryption Process" width="750" height="240" />

Der Prozess der Entschlüsselung funktioniert so:

<img src="decryption-process.png" alt="Decryption Process" width="880" height="210" />

Die Seite *Verschlüsselungsschlüssel verwalten* dient der Verwaltung von Zertifikaten und der Angabe von Eigenschaften des Zertifikats.

## Liste von Zertifikaten

Vorhandene Verschlüsselungszertifikate werden in einer Liste angezeigt:

- **Aktionsmenü** bietet die Möglichkeit, den Zertifikatseintrag zu aktualisieren und zu löschen.
- **Zertifikat-Alias** ist der eindeutige Name, den Benutzer einem Zertifikat zuweisen.
- **Anzeigesymbol** ermöglicht das Anklicken des Symbols, um das entsprechende Zertifikat anzuzeigen.
- **Pfad zur Datei des privaten Schlüssels** gibt den Speicherort des privaten Schlüssels am zugehörigen Agenten an.

## Operationen für Zertifikate

Im oberen Teil des Bildschirms stehen Ihnen die folgenden Schaltflächen zur Verfügung:

- **Zertifikat hinzufügen** bietet das Hinzufügen eines Zertifikats durch Kopieren/Einfügen an. Details finden Sie unter [Verschlüsselungszertifikat verwalten](/encryption-manage-certificate).
- **Zertifikat importieren** ermöglicht das Hochladen einer Zertifikatsdatei.

In der *Liste der Zertifikate* werden die folgenden Operationen mit dem entsprechenden 3-Punkte Aktionsmenü angeboten:

- **Zertifikat aktualisieren** ermöglicht das Ändern des Zertifikatseintrags. Details finden Sie unter [Verschlüsselungszertifikat verwalten](/encryption-manage-certificate).
- **Zertifikat löschen** entfernt den Zertifikatseintrag.

## Referenzen

### Kontext-Hilfe

- [Verschlüsselungszertifikat verwalten](/encryption-manage-certificate)

### Product Knowledge Base

- [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  - [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  - [JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  - [JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  - [JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
- [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)
