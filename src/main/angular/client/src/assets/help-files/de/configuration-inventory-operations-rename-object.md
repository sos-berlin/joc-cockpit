# Konfiguration - Inventar - Operationen - Objekt umbenennen

Inventarobjekte können umbenannt oder verlagert werden. Dies gilt für Objekte, Benutzerordner oder beides. Zum Umbenennen von Benutzerordnern siehe [Konfiguration - Inventar - Operationen - Ordner umbenennen](/configuration-inventory-operations-rename-folder). 

Wenn Sie Objekte umbenennen, gelten die [Regeln zur Benennung von Objekten](/object-naming-rules).

Die Operation *Umbenennen* ist über den *Navigationsbereich* verfügbar und wird für Objekte und Benutzerordner über das zugehörige 3-Punkte Aktionsmenü angeboten.

<img src="rename-object.png" alt="Rename Object" width="400" height="125" />

## Objekt umbenennen

Benutzer können den Speicherort und den Namen eines Objekts ändern. Im Folgenden wird von einem Objekt ausgegangen, das sich im Ordner **/Test/User** befindet und den Namen **myWorkflow** trägt:

- Wenn der Objektname geändert wird, verbleibt das Objekt im angegebenen Ordner und wird auf den Status *Entwurf* gesetzt.
- Für den neuen Namen können Benutzer eine andere Ordnerhierarchie und einen anderen Objektnamen aus einem absoluten Pfad mit führendem Schrägstrich angeben, z.B. **/Test/Workflows/yourWorkflow**:
  - wenn der Ordner **/Test/Workflows** nicht existiert, wird er erstellt.
  - wird der Arbeitsablauf von **myWorkflow** in **yourWorkflow** umbenannt.
- Es kann ein relativer Pfad wie in **Workflows/yourWorkflow** angegeben werden:
  - der Ordner **Workflows** wird im aktuellen Ordner erstellt.
  - wird das Objekt umbenannt und befindet sich in **/Test/Users/Workflows/yourWorkflow**.
- Wenn der Objektordner geändert wird, aber nicht der Objektname, dann bleibt das Objekt im Status *ausgerollt*/*freigegeben*.

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
- [Konfiguration - Inventar - Operationen - Ordner umbenennen](/configuration-inventory-operations-rename-folder)
- [Regeln zur Benennung von Objekten](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
