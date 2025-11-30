# Konfiguration - Inventar - Vorgänge - Ordner umbenennen

Inventarobjekte können umbenannt oder verlagert werden. Dies gilt für Objekte, Ordner oder beides. Zum Umbenennen von Objekten siehe [Configuration - Inventory - Operations - Rename Object](/configuration-inventory-operations-rename-object). 

Für das Umbenennen von Ordnern gilt [Object Naming Rules](/object-naming-rules).

Die Operation *Umbenennen* ist über das Bedienfeld *Navigation* verfügbar und wird für Objekte und Ordner über das zugehörige 3-Punkte-Aktionsmenü angeboten.

Wenn Sie einen Benutzerordner umbenennen, haben Sie die Möglichkeit, den Ordnernamen zu ändern und die Namen der enthaltenen Objekte rekursiv zu ändern.

## Ordner umbenennen

<img src="rename-folder.png" alt="Rename Folder" width="400" height="150" />

Benutzer können den Speicherort und den Namen eines Ordners ändern. Im Folgenden wird von dem Ordner **myWorkflows** ausgegangen, der sich in der Ordnerhierarchie **/Test/Users** befindet:

- Wenn der Ordnername geändert wird, bleibt der Ordner in der angegebenen Ordnerhierarchie.
- Für den neuen Namen können Benutzer eine andere Ordnerhierarchie aus einem absoluten Pfad mit führendem Schrägstrich angeben, z.B. **/Test/IhreWorkflows**:
  - wenn der Ordner **/Test/yourWorkflows** nicht existiert, wird er erstellt.
  - wird der Ordner von **meineWorkflows** in **IhreWorkflows** umbenannt.
- Es kann ein relativer Pfad wie in **Workflows/IhreWorkflows** angegeben werden:
  - der Ordner **IhreWorkflows** wird im aktuellen Ordner erstellt.
  - wird der Ordner umbenannt und befindet sich nun in **/Test/Benutzer/Workflows/ihreWorkflows**.

Änderungen am Namen oder am Speicherort von Ordnern lassen die enthaltenen Objekte im Status bereitgestellt/freigegeben.

## Objekte rekursiv umbenennen

<img src="rename-folder-object.png" alt="Rename Folder Objects Recursively" width="400" height="180" />

Benutzer können die Namen von Objekten, die in einem Ordner und in Unterordnern enthalten sind, rekursiv ändern.

- **Suchen** erwartet eine Zeichenkette, die in den Objektnamen nachgeschlagen wird.
- **Ersetzen** erwartet eine Zeichenkette, die die gesuchte Zeichenkette ersetzt.

Änderungen an Objektnamen setzen enthaltene Objekte auf den Status Entwurf.

## Abhängigkeiten

Inventarobjekte sind durch Abhängigkeiten miteinander verbunden, siehe [Dependency Matrix](/dependencies-matrix). Zum Beispiel ein Workflow, der eine Job Resource und eine Resource Lock referenziert; ein Schedule, der einen Kalender und einen oder mehrere Workflows referenziert.

Bei der Umbenennung von Objekten wird die Konsistenz berücksichtigt und referenzierende Objekte werden aktualisiert und z.B. auf den Status Entwurf gesetzt:

- Wenn eine Job Resource umbenannt wird, die von einem Workflow referenziert wird, dann 
  - wird der Workflow aktualisiert, um den geänderten Namen wiederzugeben,
  - wird der Workflow in den Entwurfsstatus versetzt,
  - eine spätere *Deploy*-Operation wird die gemeinsame Bereitstellung beider Objekte erzwingen.
- Wenn ein Workflow umbenannt wird, der von einem Zeitplan referenziert wird, dann
  - wird der Zeitplan aktualisiert, um den geänderten Namen wiederzugeben,
  - wird der Zeitplan auf den Status Entwurf gesetzt,
  - ein späterer *Deploy*-Vorgang für den Workflow schließt einen *Release*-Vorgang für den Zeitplan ein und umgekehrt.

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Operations - Rename Object](/configuration-inventory-operations-rename-object)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

