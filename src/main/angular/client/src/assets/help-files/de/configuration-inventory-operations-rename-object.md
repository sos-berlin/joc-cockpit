# Konfiguration - Inventar - Vorgänge - Objekt umbenennen

Inventarobjekte können umbenannt oder verlagert werden. Dies gilt für Objekte, Benutzerordner oder beides. Zum Umbenennen von Benutzerordnern siehe [Configuration - Inventory - Operations - Rename Folder](/configuration-inventory-operations-rename-folder). 

Wenn Sie Objekte umbenennen, gilt [Object Naming Rules](/object-naming-rules).

Die Operation *Umbenennen* ist über das Bedienfeld *Navigation* verfügbar und wird für Objekte und Benutzerordner über das zugehörige 3-Punkte-Aktionsmenü angeboten.

<img src="rename-object.png" alt="Rename Object" width="400" height="125" />

## Objekt umbenennen

Benutzer können den Speicherort und den Namen eines Objekts ändern. Im Folgenden wird von einem Objekt ausgegangen, das sich im Ordner **/Test/Benutzer** befindet und den Namen **meinWorkflow** trägt:

- Wenn der Objektname geändert wird, verbleibt das Objekt im angegebenen Ordner und wird auf den Status Entwurf gesetzt.
- Für den neuen Namen können Benutzer eine andere Ordnerhierarchie und einen anderen Objektnamen aus einem absoluten Pfad mit führendem Schrägstrich angeben, z.B. **/Test/Workflows/IhrWorkflow**:
  - wenn der Ordner **/Test/Workflows** nicht existiert, wird er erstellt.
  - wird der Workflow von **meinWorkflow** in **IhrWorkflow** umbenannt.
- Es kann ein relativer Pfad wie in **Workflows/IhrWorkflow** angegeben werden:
  - der Ordner **Workflows** wird im aktuellen Ordner erstellt.
  - wird das Objekt umbenannt und befindet sich in **/Test/Users/Workflows/ihrWorkflow**.
- Wenn der Objektordner geändert wird, aber nicht der Objektname, dann bleibt das Objekt im Status bereitgestellt/freigegeben.

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

- [Configuration - Inventory - Operations - Rename Folder](/configuration-inventory-operations-rename-folder)
- [Dependency Matrix](/dependencies-matrix)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

