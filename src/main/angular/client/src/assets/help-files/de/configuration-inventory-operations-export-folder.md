# Konfiguration - Inventar - Operationen - Ordner exportieren

Das Exportieren von Objekten beinhaltet das Hinzufügen zu einer .zip oder .tar.gz Archivdatei, die zum Herunterladen angeboten wird. Dies gilt für Objekte aus den Systemordnern *Controller* und *Automation* und für Objekte in Benutzerordnern. Archivdateien können für den späteren Import in dieselbe oder eine andere JOC Cockpit Instanz verwendet werden.

Wenn Sie Objekte aus Ordnern exportieren, indem Sie die entsprechende *Exportieren* Operation aus dem 3-Punkte Aktionsmenü des Ordners verwenden, wird ein Popup-Fenster angezeigt, das Folgendes anbietet 

- **Dateiname** gibt den Namen der Archivdatei an.
- **Dateiformat** gibt entweder .zip oder .tar.gz für den Komprimierungstyp an.
- **Exporttyp** ist eine der folgenden Optionen
  - exportieren von *Einzelnen Objekten*
  - exportieren von *Ordnern*
  - exportieren von *Änderungen*
- **Filtertyp**
  - **Controller** berücksichtigt Objekte wie Arbeitsabläufe und Job-Ressourcen, die in *Controller* Systemordnern gespeichert sind.
  - **Automation** berücksichtigt Objekte wie Zeitpläne und Kalender, die in *Automation* Systemordnern gespeichert sind.
- **Filter**
  - **Nur gültige** beschränkt den Export auf gültige Objekte.
  - **Entwurf** schließt Objekte im Entwurfsstatus ein.
  - **Ausgerollt** umfasst Objekte wie Arbeitsabläufe und Job-Ressourcen im Status *ausgerollt*.
  - **Freigegeben** schließt Objekte wie Zeitpläne und Kalender im freigegebenen Status ein. 
  - **Relativen Pfad verwenden** gibt an, ob die Exportdatei die Ordnerhierarchie aus einem absoluten Pfad oder aus einem relativen Pfad enthält, der durch den ersten Ordner in der Hierarchie angegeben wird, für den der Export durchgeführt wird.
- **Rekursiv verarbeiten** ermöglicht das rekursive Hinzufügen von Objekten aus Unterordnern zum Exportarchiv.

## Exporttypen

Der **Exporttyp** ermöglicht die Auswahl einzelner Objekte, Objekte aus Ordnern und Objekte aus Änderungen.

### Einzelne Objekte exportieren

Mit dem *Exporttyp* können Sie einzelne Objekte aus der angezeigten Liste auswählen.

<img src="export-object.png" alt="Export Object" width="600" height="580" />

### Objekte aus Ordnern exportieren

Der *Exporttyp* bietet die Möglichkeit, den Export auf bestimmte Objekttypen wie Arbeitsabläufe oder Zeitpläne zu beschränken. Sie können die gewünschten Objekttypen auswählen, die der Export-Archivdatei hinzugefügt werden sollen.

<img src="export-folder.png" alt="Export Folder" width="600" height="580" />

### Exportieren von Objekten aus Änderungen

Unter *Exporttyp* können Sie eine Änderung aus der Liste [Änderungen](/changes) auswählen. Der Export beschränkt sich auf Objekte, die mit der Änderung verbunden sind.

<img src="export-change.png" alt="Export Change" width="600" height="320" />

## Abhängigkeiten einbeziehen

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Abhängigkeitsmatrix](/dependencies-matrix). Zum Beispiel ein Arbeitsablauf, der eine Job-Ressource und eine Ressourcen-Sperre referenziert; ein Zeitplan, der einen Kalender und einen oder mehrere Arbeitsabläufe referenziert.

Beim Exportieren von Objekten wird die Konsistenz des Inventars berücksichtigt, zum Beispiel:

- Wenn ein Arbeitsablauf auf eine Job-Ressource verweist, können sowohl der Arbeitsablauf als auch die Job-Ressource exportiert werden, auch wenn sie in anderen als dem ausgewählten Ordner gespeichert sind.
- Wenn ein Zeitplan auf einen Kalender verweist und exportiert werden soll, dann können sowohl der Zeitplan als auch der Kalender exportiert werden.

Die Benutzer steuern den konsistenten Export über die folgenden Optionen:

- **Abhängigkeiten einbeziehen**
  - wenn diese Option aktiviert ist, werden sowohl referenzierende als auch referenzierte Objekte in einem beliebigen Ordner berücksichtigt.
  - wenn diese Option nicht aktiviert ist, werden keine Abhängigkeiten berücksichtigt. Der Benutzer muss überprüfen, ob die verknüpften Objekte gültig und *ausgerollt*/*freigegeben* sind. Der Controller gibt Fehlermeldungen aus, wenn Objekte aufgrund inkonsistenten Ausrollens/Freigabe im Anschluss an den Import der Archivdatei fehlen.
  
## Referenzen

### Kontext-Hilfe

- [Abhängigkeitsmatrix](/dependencies-matrix)
- [Änderungen](/changes)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
