# Konfiguration - Inventar - Operationen - Git - Repository klonen

Inventarobjekte können über Git Repositories ausgerollt werden, siehe [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration).

Dazu gehören auch Git-Operationen für Commit, Push und Pull von Objekten.

Git Repositories werden den Inventarordnern der obersten Ebene zugeordnet. 

- Die erste Operation besteht darin, ein entferntes Repository in ein lokales Repository zu klonen, das von JOC Cockpit verwaltet wird.
- Die Repositories von JOC Cockpit befinden sich im Dateisystemverzeichnis *\<jetty-base\>/resources/joc/repositories*. 
  - Das Unterverzeichnis *local* bezeichnet ein Repository, das für Objekte verwendet wird, die für eine JOC Cockpit Instanz lokal sind, z.B. Job-Ressourcen, die spezifische Einstellungen für eine Umgebung enthalten.
  - Das Unterverzeichnis *rollout* steht für ein Repository, das für Objekte verwendet wird, die in andere Umgebungen ausgerollt werden, z.B. Workflows, die in jeder Umgebung ohne Änderungen verwendet werden sollen.
  - Für die Zuordnung von Inventarobjekttypen zu Git-Repository-Typen siehe [Einstellungen - Git](/settings-git).
- Benutzer können über das Dateisystem auf die Repositories des JOC Cockpit zugreifen und einen Git-Client für verwandte Operationen verwenden, zum Beispiel für die Verwaltung von Zweigen.

Die Operation *Klonen* ist über das Bedienfeld *Navigation* verfügbar und wird für Ordner der obersten Ebene über das zugehörige 3-Punkte Aktionsmenü angeboten. Die Menühierarchie umfasst *Git Repository-&gt;Local|Rollout-&gt;Git-&gt;Clone*.

## Repository klonen

<img src="git-clone.png" alt="Git Clone Repository" width="400" height="130" />

Das Eingabefeld erwartet die zum Klonen verwendete Git-URL, zum Beispiel *git@github.com:sos-berlin/js7-demo-inventory-rollout.git*

- *git@* ist ein konstantes Präfix,
- *github.com* gibt den Hostnamen des Git-Servers an,
- *sos-berlin* ist der Eigentümer des Repository,
- *js7-demo-inventory-rollout* ist der Name des Repository,
- *.git* ist eine konstante Endung.

Die obigen Werte sind ein Beispiel. Bitte geben Sie Werte an, die dem gewünschten Git Server entsprechen.

## Referenzen

### Kontext-Hilfe

- [Abhängigkeitsmatrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
- [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration)
- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
