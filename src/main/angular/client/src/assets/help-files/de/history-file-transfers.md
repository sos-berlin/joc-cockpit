# Dateiübertragungshistorie

Die Ansicht *Historie-&gt;Dateiübertragungen* fasst die Historie von Aufträgen für YADE Managed File Transfer Jobs zusammen.

Für die Protokollausgabe von Jobs zur Dateiübertragung siehe [Prozesshistorie](/history-tasks). Für die Historie von Aufträgen siehe [Auftragshistorie](/history-orders).

## Bereich: Historie

### Historie der Übertragungen

Die Anzeige ist gruppiert in einen Block für die gesamte Übertragung und in Blöcke für die Übertragung einzelner Dateien:

- **Status** zeigt an, ob eine Übertragung *erfolgreich* oder *gescheitert* war.
  - *Erfolg* bedeutet, dass alle Dateien der Übertragung erfolgreich verarbeitet wurden.
  - *Fehlgeschlagen* bedeutet, dass eine oder mehrere Dateien in der Übertragung mit Fehlern verarbeitet wurden.
- **Name des Profiles** ist der eindeutige Bezeichner eines Dateiübertragungsprofils.
- **Operation** gibt eine der Operationen *COPY*, *MOVE*, *REMOVE*, *GETLIST* an.
- **Arbeitsablauf** gibt den Arbeitsablauf an, den der Auftrag ausführt.
  - Wenn Sie auf den Namen des Arbeitsablaufs klicken, gelangen Sie zur Ansicht [Arbeitsabläufe](/workflows).
  - Wenn Sie auf das Bleistiftsymbol klicken, gelangen Sie zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).
- **Auftragskennung** ist die eindeutige Kennung, die einem Auftrag zugewiesen ist.
- **Gesamt** gibt die Anzahl der Dateien an, die in der Übertragung enthalten sind.

### Historie pro Datei

Eine Dateiübertragung kann eine beliebige Anzahl von Dateien umfassen. Die *Historie Dateiübertragung* zeigt den Übertragungsstatus pro Datei an, wenn Sie auf das Pfeil-nach-unten-Symbol klicken, das bei der Übertragung verfügbar ist:

Die angezeigten Informationen sind in den folgenden Blöcken gruppiert:

- **Quelle** zeigt die Quelle der Übertragung an.
- **Ziel** zeigt das Ziel der Übertragung an.
- **Absprung** zeigt die Verwendung eines Jump-Host zwischen Quelle und Ziel an. Ein *Jump*-Host wird verwendet, wenn die Dateiübertragung nicht direkt zwischen Quelle und Ziel durchgeführt werden kann, sondern einen Host in der DMZ für eingehende und ausgehende Operationen benötigt.

Details werden für *Host* *Quelle*, *Ziel* und *Absprung* angezeigt:

- **Host** gibt den Hostnamen oder die IP-Adresse des Servers an.
- **Konto** gibt das Benutzerkonto an, das für den Zugriff auf den Server verwendet wird.
- **Port** gibt den Port an, der für die Verbindung zum Server verwendet wird.
- **Protokoll** gibt das Dateiübertragungsprotokoll an, wie z.B. FTP, FTPS, SFTP, CIFS usw.

Für *Quelle* und *Ziel* werden die folgenden Details angezeigt:

- **Dateiname** zeigt den Namen der Datei an.
- **Dateipfad** zeigt den Verzeichnispfad der Datei an, einschließlich ihres Namens.
- **Status**
  - **TRANSFERRED** zeigt an, dass die Datei erfolgreich übertragen wurde, wenn sie mit den Operationen *COPY* oder *MOVE* verwendet wird.
  - **DELETED** zeigt an, dass die Datei gelöscht wurde, wenn die Operation *REMOVE* verwendet wurde.
  - **SKIPPED** zeigt an, dass die Datei von der Übertragung ausgeschlossen wurde, z.B. wenn sie mit der Operation *GETLIST* verwendet wird.
- **Größe** gibt die Anzahl der übertragenen Bytes an.
- **Prüfsumme** gibt einen MD5-Hash an, wenn die entsprechenden Optionen für die Übertragung verwendet wurden.

## Referenzen

### Kontext-Hilfe

- [Auftragshistorie](/history-orders)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Prozesshistorie](/history-tasks)

### Product Knowledge Base

- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)
