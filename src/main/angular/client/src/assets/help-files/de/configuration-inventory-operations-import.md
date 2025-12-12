# Konfiguration - Inventar - Operationen - Importieren

Das Importieren von Objekten beinhaltet dass Hinzufügen aus einer .zip oder .tar.gz Archivdatei in das JOC Cockpit Inventar.

Dies bezieht sich auf Objekte der *Controller* und *Automation* Systemordner auf auf Objekte aus Benutzerordnern. Die Objekte können aus derselben oder einer anderen JOC Cockpit Instanz importiert werden.

Falls unterschiedliche JOC Cockpit Versionen für Exportieren und Importieren verwendet werden, kann der Import in eine neuere Version erfolgen, der Import in zurückliegende Versionen wird abgelehnt.

Beim Importieren von Objekten mit der *Import* Operation aus der gleichnamig beschrifteten Schaltfläche in der rechten oberen Ecke des Fensters, wird folgendes Pop-up Fenster angezeigt:

- **Ordner** benennt den Inventarordner, in den Objecte importiert werden. 
  - Falls der Ordner nicht existiert, wird er angelegt. Mehrere Ordner können durch Schrägstrich (/) getrennt angegeben werden, z.B. */a/b/c*.
  - Die Ordnerhiearchie der Archivdatei wird dem Inventarordner angehängt.
- **Dateiformat** benennt das .zip oder .tar.gz Format.
- **Überschreiben** vereinbart, das vorhandene Objekte mit demselben Namen überschrieben werden.
  - Im JOC Cockpit Inventare sind Objektnamen eindeutig pro Objekttype wie Arbeitsabläufe, Zeitpläne etc. 
- **Kennzeichnung überschreiben** vereinbart, dass Kennzeichnungen vorhandener Objecte wie Arbeitsabläufe von Kennzeichnungen aus der Archivdatei überschrieben werden,
- **Objectnamen** bietet Optionen an sofern die *Überschreiben* Option nicht gewählt wurde:
  - **Ignore if exists**: The object will not be imported. An existing object with the same name remains in place.
  - **Add Prefix**: A prefix is specified that will be prepended any imported objects, separated by an additional dash.
  - **Add Suffix**: A suffix is specified that will be appended any imported objects, separated by an additional dash.
- **File Name**: Users can drag&amp;drop a file or can use the *choose files for upload* option to select a file for import.
  
## Referenzen

### Kontext-Hilfe

- [Abhängigkeitsmatrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
