# Konfiguration - Inventar - Operationen - Ordner umbenennen

Inventarobjekte können umbenannt oder verlagert werden. Dies gilt für Objekte, Ordner oder beides. Zum Umbenennen von Objekten siehe [Konfiguration - Inventar - Operationen - Objekt umbenennen](/configuration-inventory-operations-rename-object). 

Für das Umbenennen von Ordnern gelten die [Regeln zur Benennung von Objekten](/object-naming-rules).

Die Operation *Umbenennen* ist über im *Navigationsbereich* verfügbar und wird für Objekte und Ordner über das zugehörige 3-Punkte Aktionsmenü angeboten.

Wenn Sie einen Benutzerordner umbenennen, haben Sie die Möglichkeit, den Ordnernamen zu ändern und die Namen der enthaltenen Objekte rekursiv zu ändern.

## Ordner umbenennen

<img src="rename-folder.png" alt="Rename Folder" width="400" height="150" />

Benutzer können den Speicherort und den Namen eines Ordners ändern. Im Folgenden wird von dem Ordner **myWorkflows** ausgegangen, der sich in der Ordnerhierarchie **/Test/Users** befindet:

- Wenn der Ordnername geändert wird, bleibt der Ordner in der angegebenen Ordnerhierarchie.
- Für den neuen Namen können Benutzer eine andere Ordnerhierarchie aus einem absoluten Pfad mit führendem Schrägstrich angeben, z.B. **/Test/yourWorkflows**:
  - wenn der Ordner **/Test/yourWorkflows** nicht existiert, wird er erstellt.
  - wird der Ordner von **myWorkflows** in **yourWorkflows** umbenannt.
- Es kann ein relativer Pfad wie in **Workflows/yourWorkflows** angegeben werden:
  - der Ordner **yourWorkflows** wird im aktuellen Ordner erstellt.
  - wird der Ordner umbenannt und befindet sich nun in **/Test/User/Workflows/yourWorkflows**.

Änderungen am Namen oder am Speicherort von Ordnern belassen die enthaltenen Objekte im Status *ausgerollt*/*freigegeben*.

## Objekte rekursiv umbenennen

<img src="rename-folder-object.png" alt="Rename Folder Objects Recursively" width="400" height="180" />

Benutzer können die Namen von Objekten, die in einem Ordner und in Unterordnern enthalten sind, rekursiv ändern.

- **Suchen** erwartet eine Zeichenkette, die in den Objektnamen nachgeschlagen wird.
- **Ersetzen** erwartet eine Zeichenkette, die die gesuchte Zeichenkette ersetzt.

Änderungen an Objektnamen setzen enthaltene Objekte auf den Status *Entwurf*.

## Abhängigkeiten

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Abhängigkeitsmatrix](/dependencies-matrix). Zum Beispiel ein Arbeitsablauf, der eine Job-Ressource und eine Ressourcen-Sperre referenziert; ein Zeitplan, der einen Kalender und einen oder mehrere Arbeitsabläufe referenziert.

Bei der Umbenennung von Objekten wird die Konsistenz des Inventars berücksichtigt und referenzierende Objekte werden aktualisiert und z.B. auf den Status *Entwurf* gesetzt:

- Wenn eine Job-Ressource umbenannt wird, die von einem Arbeitsablauf referenziert wird, dann 
  - wird der Arbeitsablauf aktualisiert, um den geänderten Namen wiederzugeben,
  - wird der Arbeitsablauf in den Entwurfsstatus versetzt,
  - eine spätere *Ausrollen* Operation wird das gemeinsame Ausrollen beider Objekte erzwingen.
- Wenn ein Arbeitsablauf umbenannt wird, der von einem Zeitplan referenziert wird, dann
  - wird der Zeitplan aktualisiert, um den geänderten Namen wiederzugeben,
  - wird der Zeitplan auf den Status *Entwurf* gesetzt,
  - eine spätere Operation *Ausrollen* für den Arbeitsablauf schließt eine Operation *Freigabe* für den Zeitplan ein und umgekehrt.

## Referenzen

### Kontext-Hilfe

- [Abhängigkeitsmatrix](/dependencies-matrix)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Operationen - Objekt umbenennen](/configuration-inventory-operations-rename-object)
- [Tagesplan](/daily-plan)
- [Regeln zur Benennung von Objekten](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
