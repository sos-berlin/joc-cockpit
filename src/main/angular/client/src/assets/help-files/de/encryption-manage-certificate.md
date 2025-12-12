# Verschlüsselungszertifikat verwalten

 [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) bietet eine sichere Methode für den Umgang mit Geheimnissen, die in Jobs verwendet werden. Benutzer können sensible Daten wie Kennwörter mit Hilfe asymmetrischer Schlüssel ver- und entschlüsseln.

Einzelheiten finden Sie unter [Verschlüsselungsschlüssel verwalten](/encryption-manage-keys).

Die Seite *Verschlüsselungszertifikat verwalten* dient zur Angabe der Eigenschaften eines Zertifikats.

## Zertifikat

Die folgenden Eigenschaften werden für ein Zertifikat angegeben:

- **Zertifikat-Alias** ist der eindeutige Name, den ein Benutzer einem Zertifikat zuweist. Der Name kann vom Benutzer frei gewählt werden. Das Zertifikat und die Eigenschaften werden mit einer Job-Ressource unter dem angegebenen Namen gespeichert.
- **Zertifikat** ermöglicht das Kopieren/Einfügen eines Zertifikats im PEM-Format. Ein Zertifikat kann wie folgt aussehen:

<pre>
-----BEGIN ZERTIFIKAT-----
MIIB9TCCAZqgAwIBAgIJAIFT2KH9txb9MAoGCCqGSM49BAMCMFgxCzAJBgNVBAYT
AkRFMQ8wDQYDVQQIDAZCZXJsaW4xDzANBgNVBAcMBkJlcmxpbjEMMAoGA1UECgwD
U09TMQswCQYDVQQLDAJJVDEMMAoGA1UEAwwDSlM3MB4XDTI0MDYyNzA5MzU0MloX
DTI5MDYyNjA5MzU0MlowWDELMAkGA1UEBhMCREUxDzANBgNVBAgMBkJlcmxpbjEP
MA0GA1UEBwwGQmVybGluMQwwCgYDVQQKDANTT1MxCzAJBgNVBAsMAklUMQwwCgYD
VQQDDANKUzcwVjAQBgcqhkjOPQIBBgUrgQQACgNCAATBF6yXinah6K/x2TikPNaT
447gK2SxCH8vgO5NygZzUonzhaGOK5n1jktvhhmxmrn5V4VSHMC0NzU6O87nUKpA
o1AwTjAdBgNVHQ4EFgQUcovwh3OMrSXjP02VHG5cj03xHxswHwYDVR0jBBgwFoAU
covwh3OMrSXjP02VHG5cj03xHxswDAYDVR0TBAUwAwEB/zAKBggqhkjOPQQDAgNJ
ADBGAiEAwjGLIhLfV0q/cOYVAnXSZ+jWp8Og/lG5YdvtLcj9CD0CIQCK8O4wURQj
SbNCv0bJswLadTFEcz8ZoYP7alXJzj9FQQ== 
-----END ZERTIFIKAT-----
</pre>

- **Pfad zur Datei des privaten Schlüssels** gibt den Speicherort des privaten Schlüssels am zugehörigen Agenten an.
- **Job-Ressource Ordner** gibt den Inventarordner an, in dem die Job-Ressource, die das Zertifikat enthält, gespeichert werden soll. Eine Ordnerhierarchie kann mit Schrägstrichen wie in /a/b/c angegeben werden. Nicht existierende Ordner werden erstellt.

## Operationen für das Zertifikat

Die folgenden Operationen sind über Links verfügbar:

- **Nutzung des Zertifikats durch Agenten** zeigt den *Agentennamen* und die URL der Agenten an, denen das Zertifikat zugewiesen wurde. 
- **Zertifikat an Agenten zuweisen** bietet die Auswahl von Standalone Agenten  und Cluster Agenten, denen das Zertifikat zugewiesen wird. Die Benutzer müssen darauf achten, dass der betreffende Agent die Datei mit dem privaten Schlüssel an dem mit der Eigenschaft *Pfad zur Datei mit dem privaten Schlüssel* angegebenen Speicherrt aufbewahrt. Benutzer können Agenten auswählen, die den privaten Schlüssel kennen.
- mit **Verschlüsselungstest** können Sie eine Testverschlüsselung durchführen:
  - Wenn Sie auf den Link klicken, öffnet sich das Eingabefeld *Klartext*, in das Sie eine Zeichenfolge wie *Geheimnis* eingeben können.
  - Rechts neben dem Eingabefeld wird das Verschlüsselungssymbol angeboten. Wenn Sie auf das Symbol klicken, wird das *Verschlüsselungsergebnis* entsprechend angezeigt.

## Referenzen

### Kontext-Hilfe

- [Verschlüsselungsschlüssel verwalten](/encryption-manage-keys)

### Product Knowledge Base

- [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  - [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  - [JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  - [JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  - [JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
- [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)
