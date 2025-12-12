# Konfiguration Inventar - Navigation

Die Ansicht *Konfiguration - Inventar* wird zur Verwaltung von Inventarobjekten wie Arbeitsabläufen, Zeitplänen usw. verwendet. 

- Der *Navigationsbereich* ermöglicht die Navigation nach Kennzeichnungen und Ordnern. Außerdem können Sie hier Operationen mit Inventarobjekten durchführen.
- Der *Objektbereich* enthält die Darstellung des entsprechenden Objekts, z.B. [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).

## Navigationsbereich

Der linke Bereich ist in Registerkarten gegliedert, die die Navigation von Ordnern und von Kennzeichnungen für Arbeitsabläufe und Jobs ermöglichen.

- die **Ordnernavigation** zeigt Inventarobjekte aus dem ausgewählten Ordner an.
- Auf den folgenden Registerkarten können Sie nach Kennzeichnungen filtern, um Arbeitsabläufe auszuwählen:
  - **Arbeitsablaufkennzeichnungen** werden in der Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows) auf Ebene des Arbeitsablaufs zugewiesen.
  - **Job-Kennzeichnungen** werden in der gleichen Ansicht auf Ebene des Jobs zugewiesen.

### Ordner

Standardmäßig werden *Systemordner* pro Objekttyp angezeigt. Benutzer können ihre eigenen Ordner auf jeder Hierarchieebene erstellen. Der gleiche Name *Benutzerordner* kann beliebig oft in verschiedenen Ebenen der Ordnerhierarchie vorkommen.

Die Ordnerhierarchie kennt die folgenden Ordnertypen:

- **Systemordner** enthalten die folgenden Objekttypen:
  - **Controller** Objekte werden an einen Controller und Agenten ausgerollt:
    - [Arbeitsabläufe](/configuration-inventory-workflows) enthalten Jobs und andere Arbeitsablauf-Anweisungen. Einzelheiten finden Sie unter [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows).
    - [Dateiauftragsquellen](/configuration-inventory-file-order-sources) werden für die Dateiüberwachung verwendet, um automatisch Arbeitsabläufe zu starten, wenn eine Datei in einem Verzeichnis eintrifft. Einzelheiten finden Sie unter [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching).
    - [Job-Ressourcen](/configuration-inventory-job-resources) werden verwendet, um die Konfiguration von Variablen zu zentralisieren, die in einer Reihe von Jobs wiederverwendet werden. Einzelheiten finden Sie unter [JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources).
    - [Notizbretter](/configuration-inventory-notice-boards) legen Abhängigkeiten zwischen Arbeitsabläufen fest. Weitere Informationen finden Sie unter [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards).
    - [Ressourcen-Sperren](/configuration-inventory-resource-locks) begrenzen die parallele Ausführung von Jobs und anderen Anweisungen. Einzelheiten finden Sie unter [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks).
  - **Automation** Objekte werden für die Automatisierung in JOC Cockpit verwendet:
    - [Skript-Bausteine](/configuration-inventory-script-includes) sind Skript-Bausteine, die in einer Reihe von Shell Jobs wiederverwendet werden können. Einzelheiten finden Sie unter [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes).
    - [Zeitpläne](/configuration-inventory-schedules) bestimmen den Zeitpunkt, zu dem die Ausführung von Aufträgen für Arbeitsabläufe beginnen soll. Ihnen werden ein oder mehrere Arbeitsabläufe und optional Auftragsvariablen zugewiesen, die von den Jobs im jeweiligen Arbeitsablauf verwendet werden. Sie machen von einem oder mehreren *Kalendern* Gebrauch. Einzelheiten finden Sie unter [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).
    - [Kalender](/configuration-inventory-calendars) geben die Tage an, an denen Auftragsstarts stattfinden können. Sie enthalten Regeln für wiederkehrende Tage und Listen von Tagen, die von *Zeitplänen* verwendet werden, um Aufträge für die Arbeitsablauf-Ausführung mit dem [Tagesplan](/daily-plan) zu erstellen. Details finden Sie unter [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).
    - [Job-Vorlagen](/configuration-inventory-job-templates) sind von den Job-Vorlagen des Benutzers oder von Java-Klassen, die mit JS7 ausgeliefert werden, verfügbar und können für alle Betriebssystemplattformen verwendet werden. Einzelheiten dazu finden Sie unter [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates).
    - [Berichte](/configuration-inventory-reports) fassen die Ergebnisse der Arbeitsablauf- und Job-Ausführung für bestimmte Zeiträume zusammen. Einzelheiten finden Sie unter [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports).
- **Benutzerordner** werden vom Benutzer auf einer beliebigen Hierarchieebene erstellt. Jeder *Benutzerordner* enthält eine Reihe von *Systemordnern*.

#### Schnellsuche für Objekte

Rechts neben dem obersten Ordner im *Navigationsbereich* finden Sie ein Suchsymbol, mit dem Sie nach Inventarobjekten suchen können.

- Es müssen mindestens zwei Zeichen eingegeben werden, damit die *Schnellsuche* nach Objekten sucht, die mit den angegebenen Zeichen beginnen.
- Bei der *Schnellsuche* wird nicht zwischen Groß- und Kleinschreibung unterschieden und es wird nach rechts abgeschnitten.
- Die *Schnellsuche* gibt Objekte mit übereinstimmenden Namen pro Kategorie zurück, z.B. Arbeitsabläufe, Zeitpläne.
- Das Metazeichen \* kann als Platzhalter für null oder mehr Zeichen verwendet werden:
  - **test** findet die Objekte ***test**Initial*, *mein**Test***
  - **te\*st** findet die Objekte ***test**Initial*, ***te**rminate**St**illstand*

#### Papierkorb für Objekte

Wenn Inventarobjekte entfernt werden, werden sie in den Papierkorb gelegt. Der Papierkorb ermöglicht es, Objekte wiederherzustellen und Objekte dauerhaft zu löschen.

Der Papierkorb wird über das Papierkorbsymbol rechts neben dem obersten Ordner im *Navigationsbereich* geöffnet.

- Wenn Sie auf das Papierkorbsymbol klicken, wird die Anzeige auf die Objekte im Papierkorb umgeschaltet. Mit dem Zurück-Symbol können Sie von der Papierkorbansicht zur Inventaransicht zurückkehren.
- Die Ordnerstruktur des Papierkorbs ist die gleiche wie die der Inventarobjekte.
- Der Papierkorb bietet Aktionsmenüs pro Objekt und pro Ordner, um Objekte wiederherzustellen und dauerhaft zu löschen.

### Kennzeichnungen

Kennzeichnungen sind eine alternative Möglichkeit, um zwischen Inventarobjekten zu navigieren. Wenn Sie die Registerkarten *Kennz. Arbeitsablauf* oder *Kennz. Job* im *Navigationsbereich* aktivieren, zeigt der Bereich die Liste der verfügbaren Kennzeichnungen an.

Kennzeichnungen können über das Symbol + hinzugefügt werden. Es stehen Optionen für aufsteigende und absteigende Sortierung zur Verfügung. Die Anzeige von Kennzeichnungen in anderen Ansichten muss auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) aktiviert werden.

- Wenn Sie auf die entsprechende Kennzeichnung klicken, werden die Arbeitsabläufe angezeigt, denen die Kennzeichnung zugewiesen ist.
- Kennzeichnungen bieten die folgenden Operationen in ihrem 3-Punkte Aktionsmenü:
  - **Umbenennen** bietet die Möglichkeit, den Namen der Kennzeichnung zu ändern.
  - mit **Löschen** können Sie die Kennzeichnung und ihre Zuweisung zu Arbeitsabläufen und Jobs löschen.

## Operationen

Operationen sind für Ordner- und Objektebene über das 3-Punkte Aktionsmenü verfügbar, das im *Navigationsbereich* angezeigt wird.

### Operationen für Ordner

Operationen sind für *Systemordner* und *Benutzerordner* verfügbar.

Der Ordner der obersten Ebene / (Schrägstrich) bietet die folgenden Operationen:

- **Erneut Ausrollen** wird im Falle eines Journalverlusts verwendet, wenn der Speicher eines Controller gelöscht und der Controller initialisiert wird. Die Operation *rollt alle Objekte aus*, die zuvor auf einen Controller ausgerollt wurden. 
- **Abhängigkeiten aktualisieren** erstellt die interne Darstellung der Objektabhängigkeiten neu. Dies geschieht automatisch und wird beim Erstellen oder Löschen von Inventarobjekten und bei Änderungen von Objektnamen ausgelöst. Wenn Benutzer Grund zu der Annahme haben, dass die Abhängigkeiten nicht synchron sind, kann die Operation durchgeführt werden. Die Benutzer sollten bedenken, dass dies einige Zeit in Anspruch nehmen kann, etwa zwei Minuten bei einem Bestand von 5000 Objekten. Die Benutzer können jedoch mit JOC Cockpit weiterarbeiten, während die Abhängigkeiten aktualisiert werden.

#### Operationen für Systemordner

Die folgenden Operationen sind für *Systemordner* verfügbar:

- Operationen für Controller Objekte
  - *Arbeitsabläufe*
    - **Neu** erstellt einen Arbeitsablauf.
    - **Umbenennen** ermöglicht das Umbenennen eines Arbeitsablaufs. Objektabhängigkeiten werden berücksichtigt und referenzierende Inventarobjekte wie *Zeitpläne* und *Dateiauftragsquellen* erhalten den aktualisierten Namen. Der Arbeitsablauf und die referenzierenden Objekte werden auf den Status *Entwurf* gesetzt. Einzelheiten finden Sie unter [Ordner umbenennen](/configuration-inventory-operations-rename-folder).
    - **Kennzeichnungen verwalten** ermöglicht das Hinzufügen und Löschen von Kennzeichnungen zu/von Arbeitsabläufen im Ordner, siehe [Kennzeichnungen verwalten](/configuration-inventory-operations-manage-tags).
    - **Exportieren** ermöglicht die Erstellung einer Export-Archivdatei im .zip- oder .tar.gz-Format, die die Ordnerhierarchie und die JSON-Darstellung der Arbeitsabläufe enthält. Einzelheiten finden Sie unter [Ordner exportieren](/configuration-inventory-operations-export-folder).
    - **Git Repository** bietet die Integration mit einem Git Server. Arbeitsabläufe können an Git Repositories übergeben werden und können per pull & push synchronisiert werden. Einzelheiten finden Sie unter [Git - Clone Repository](/configuration-inventory-operations-git-clone).
    - **Änderung** bietet Funktionen für die Änderungsverwaltung von Arbeitsabläufen. Benutzer können einen Arbeitsablauf zu einer *Änderung* hinzufügen, die das gemeinsame Ausrollen und den Export von geänderten Objekten ermöglicht. Einzelheiten finden Sie unter [Änderungen](/changes).
    - **Ausrollen** macht Arbeitsabläufe für den Controller und die Agenten verfügbar. Die Arbeitsabläufe werden in den Status *Ausgerollt* versetzt. Einzelheiten finden Sie unter [Ordner ausrollen](/configuration-inventory-operations-deploy-folder).
    - **Zurückziehen** macht eine vorherige *Ausrollen* Operation rückgängig. Arbeitsabläufe werden auf den Status *Entwurf* gesetzt. Dies bedeutet, dass Aufträge für Arbeitsabläufe aus dem [Tagesplan](/daily-plan) entfernt werden. Objektabhängigkeiten werden berücksichtigt und referenzierende Objekte wie *Zeitpläne* und *Dateiauftragsquellen* werden ebenfalls zurückgenommen/zurückgezogen. Einzelheiten finden Sie unter [Ordner zurückziehen](/configuration-inventory-operations-revoke-folder).
    - **Entfernen** verschiebt Arbeitsabläufe in den Papierkorb. Entfernte Arbeitsabläufe können wiederhergestellt oder dauerhaft aus dem Papierkorb gelöscht werden. Einzelheiten hierzu finden Sie unter [Ordner entfernen](/configuration-inventory-operations-remove-folder).
    - mit **Entwurf löschen** wird die aktuelle Entwurfsversion von Arbeitsabläufen gelöscht. Wenn eine zuvor *ausgerollte* Version existiert, wird diese zur aktuellen Version des entsprechenden Arbeitsablaufs.
    - **Jobs aktualisieren aus Vorlagen** aktualisiert Jobs aus Arbeitsabläufen im ausgewählten *Systemordner* aus *Job-Vorlagen*, die sich in einem beliebigen Ordner befinden.
  - *Dateiauftragsquellen*, *Job-Ressourcen*, *Notizbretter*, *Ressourcen-Sperren* bieten ähnliche Funktionen wie *Arbeitsabläufe*.
- Operationen für Automation Objekte
  - **Freigeben** macht *Entwürfe* von Objekten verfügbar
    - zur Verwendung mit anderen Objekten, z.B. *Skript-Bausteine* werden beim nächsten Ausrollen von Arbeitsabläufen berücksichtigt, *Job-Vorlagen* können in referenzierenden Arbeitsabläufen aktualisiert werden.
    - zur Verwendung mit dem [Tagesplan](/daily-plan), z.B. *Zeitpläne* werden bei der Erstellung von Aufträgen berücksichtigt.
    - Einzelheiten finden Sie unter [Ordner freigeben](/configuration-inventory-operations-release-folder).
  - **Zurücknehmen** macht eine vorherige *Freigabe* Operation rückgängig. Die Inventarobjekte werden auf den Status *Entwurf* gesetzt. Dies bedeutet, dass *Zeitpläne* und *Kalender* vom [Tagesplan](/daily-plan) nicht berücksichtigt werden. Die Operation berücksichtigt Objektabhängigkeiten und ruft auch referenzierende Objekte zurück. Einzelheiten finden Sie unter [Ordner zurücknehmen](/configuration-inventory-operations-recall-folder).
  - **Vorlage auf Jobs anwenden** aktualisiert Jobs in Arbeitsabläufen, die sich in einem beliebigen Ordner befinden, der Verweise auf *Job-Vorlagen* enthält, die im ausgewählten *Systemordner* oder einem beliebigen Unterordner enthalten sind.
  - Weitere Operationen sind ähnlich wie bei *Operationen für Controller Objekte* verfügbar.

#### Operationen für Benutzerordner

*Benutzerordner* werden von Benutzern erstellt und enthalten eine Reihe von *Systemordnern*. Die folgenden Operationen werden angeboten:

- Operationen für alle Objekte
  - **Neu** erstellt das im Aktionsmenü angebotene Objekt: einen Ordner oder ein Inventarobjekt, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
  - **Ausschneiden** *schneidet* den Ordner, alle Unterordner und Inventarobjekte aus, um sie später an einer anderen Stelle in der Ordnerhierarchie einzufügen.
  - **Kopieren** *kopiert* den Ordner, alle Unterordner und Inventarobjekte, einschließlich referenzierter Inventarobjekte, die sich möglicherweise in anderen Ordnern befinden. Die Operation ist eine *tiefe Kopie*, die auf alle referenzierten Objekte wirkt.
  - bei der **Flachen Kopie** werden der Ordner, alle Unterordner und Inventarobjekte *kopiert*. Verweise auf Inventarobjekte in anderen Ordnern werden nicht berücksichtigt.
  - **Umbenennen** ermöglicht das Umbenennen des Ordners und der optional enthaltenen Inventarobjekte. Einzelheiten finden Sie unter [Ordner umbenennen](/configuration-inventory-operations-rename-folder).
  - **Kennzeichnungen verwalten** ermöglicht das Hinzufügen und Löschen von Kennzeichnungen zu/aus Arbeitsabläufen in der angegebenen Ordnerhierarchie, siehe [Kennzeichnungen verwalten](/configuration-inventory-operations-manage-tags).
  - **Exportieren** ermöglicht die Erstellung einer Export-Archivdatei im .zip- oder .tar.gz-Format, die die Ordnerhierarchie und die JSON-Darstellung der enthaltenen Inventarobjekte enthält. Einzelheiten finden Sie unter [Ordner exportieren](/configuration-inventory-operations-export-folder).
  - **Git Repository** bietet die Integration mit einem Git Server. Inventarobjekte können an Git Repositories übergeben werden und können mittels pull & push synchronisiert werden. Einzelheiten finden Sie unter [Git - Clone Repository](/configuration-inventory-operations-git-clone).
  - **Änderung** bietet Operationen zur Änderungsverwaltung von Inventarobjekten. Benutzer können Objekte wie Arbeitsabläufe zu einer *Änderung* hinzufügen, die ein gemeinsames Ausrollen und den Export von geänderten Objekten ermöglicht. Einzelheiten finden Sie unter [Änderungen](/changes).
- Operationen für Controller Objekte
  - **Ausrollen** macht Objekte für den Controller und die Agenten verfügbar. Inventarobjekte werden in den Status *Ausgerollt* versetzt. Einzelheiten finden Sie unter [Ordner ausrollen](/configuration-inventory-operations-deploy-folder).
  - **Zurückziehen** macht eine vorherige *Ausrollen*-Operation rückgängig. Die Inventarobjekte werden in den Status *Entwurf* gesetzt. Dies bedeutet, dass Aufträge für Arbeitsabläufe aus dem [Tagesplan](/daily-plan) entfernt werden. Einzelheiten finden Sie unter [Ordner zurückziehen](/configuration-inventory-operations-revoke-folder).
  - **Neu validieren** prüft die Gültigkeit von Inventarobjekten, die z.B. nach dem Import von Objekten inkonsistent werden können.
  - **Synchronisieren** bringt den Status von Objekten mit dem Controller und dem Inventar auf den gleichen Stand:
    - mit *Synchronisieren des Controller* werden Inventarobjekte je nach ihrem Status *Ausgerollt* oder *Entwurf* an/von Controller und Agenten *ausgerollt* oder *zurückgezogen*. Die Operation kann im Fall eines Journalverlustes verwendet werden, wenn der Speicher eines Controller gelöscht und der Controller initialisiert wird.
    - mit *Synchronisieren des Inventars* werden Inventarobjekte in den Status *ausgerollt* oder *Entwurf* versetzt, je nach Verfügbarkeit des Objekts beim Controller.
- Operationen für Automation Objekte
  - **Freigeben** macht *Entwurf*-Objekte verfügbar
    - zur Verwendung mit anderen Objekten, z.B. *Skript-Bausteine* werden beim nächsten Ausrollen von Arbeitsabläufen berücksichtigt, *Job-Vorlagen* können in referenzierenden Arbeitsabläufen aktualisiert werden.
    - zur Verwendung mit dem [Tagesplan](/daily-plan), z.B. *Zeitpläne* werden bei der Erstellung von Aufträgen berücksichtigt.
    - Einzelheiten finden Sie unter [Ordner freigeben](/configuration-inventory-operations-release-folder).
  - **Zurückziehen** macht eine vorherige *Freigabe* Operation rückgängig. Die Inventarobjekte werden auf den Status *Entwurf* gesetzt. Dies bedeutet, dass *Zeitpläne* und *Kalender* im *Entwurf*-Zustand vom [Tagesplan](/daily-plan) nicht berücksichtigt werden. Einzelheiten finden Sie unter [Ordner zurücknehmen](/configuration-inventory-operations-recall-folder).
- Entfernungsoperationen
  - **Entfernen** verschiebt den Ordner, alle Unterordner und enthaltenen Objekte in den Papierkorb. Entfernte Inventarobjekte können wiederhergestellt oder dauerhaft aus dem Papierkorb gelöscht werden. Einzelheiten finden Sie unter [Ordner entfernen](/configuration-inventory-operations-remove-folder).
  - **Entwurf löschen** löscht die aktuelle Entwurfsversion der Objekte im Ordner und in den Unterordnern. Wenn eine zuvor *ausgerollte* oder *freigegebene* Version existiert, wird diese zur aktuellen Version des betreffenden Objekts.
- Operationen für Job-Vorlagen
  - **Jobs aus Vorlagen aktualisieren** aktualisiert Jobs in Arbeitsabläufen, die sich in einem beliebigen Ordner befinden, der Verweise auf *Job-Vorlagen* enthält, die zum ausgewählten *Benutzerordner* oder einem beliebigen Unterordner gehören.
  - **Vorlage auf Jobs anwenden** aktualisiert Jobs in Arbeitsabläufen, die sich im ausgewählten *Benutzerordner* befinden, anhand von *Job-Vorlagen*, die sich in einem beliebigen Ordner befinden.

### Operationen für Objekte

Die folgenden Operationen werden für einzelne Inventarobjekte angeboten:

- Alle Objekte
  - mit **Ausschneiden** wird das Objekt *ausgeschnitten*, um es später an einer anderen Stelle in der Ordnerhierarchie einzufügen.
  - **Kopieren** *kopiert* das Objekt, um es später einzufügen.
  - mit **Umbenennen** können Sie den Namen des Objekts ändern. Objektabhängigkeiten werden dabei berücksichtigt und referenzierende Inventarobjekte erhalten den aktualisierten Namen. Das umbenannte Objekt und die referenzierenden Objekte werden in den Status *Entwurf* versetzt. Einzelheiten finden Sie unter [Objekt umbenennen](/configuration-inventory-operations-rename-object).
  - **Ändern** bietet Operationen zur Änderungsverwaltung von Inventarobjekten. Benutzer können Objekte wie z.B. Arbeitsabläufe, die sich in der Entwicklung befinden, zu einer *Änderung* hinzufügen, die das gemeinsame Ausrollen und den Export von geänderten Objekten ermöglicht. Einzelheiten finden Sie unter [Änderungen](/changes).
  - **Abhängigkeiten anzeigen** zeigt die Liste der referenzierenden Objekte und der referenzierten Objekte an. Ein Arbeitsablauf kann beispielsweise Verweise auf Job-Ressourcen enthalten und kann von *Zeitplänen* oder *Dateiauftragsquellen* referenziert werden.
  - **Neuer Entwurf** erstellt eine Entwurfsversion aus einer zuvor *ausgerollten* oder *freigegebenen* Version des Objekts.
  - JSON-Operationen
    - **JSON Format anzeigen** zeigt das JSON Format des Inventarobjekts an.
    - **JSON Format bearbeiten** bietet die Möglichkeit, ein Objekt direkt in seinem JSON Format zu ändern.
    - **JSON Format herunterladen** lädt das Objekt im JSON-Speicherformat in eine .json-Datei herunter.
    - **JSON Format hochladen** bietet das Hochladen einer .json-Datei an, die das Objekt ersetzen wird.
  - Löschoperationen
    - **Entfernen** verschiebt das Objekt in den Papierkorb. Entfernte Inventarobjekte können wiederhergestellt oder dauerhaft aus dem Papierkorb gelöscht werden. Einzelheiten finden Sie unter [Objekt entfernen](/configuration-inventory-operations-remove-object).
    - mit **Entwurf löschen** wird die aktuelle Entwurfsversion des Objekts gelöscht. Wenn eine zuvor *ausgerollte* oder *freigegebene* Version existiert, wird diese zur aktuellen Version des Objekts gemacht.
- Controller Objekte
  - **Kennzeichnungen verwalten** ist für Arbeitsabläufe verfügbar und ermöglicht das Hinzufügen und Löschen von Kennzeichnungen zum/vom Arbeitsablauf.
  - mit **Ausrollen** wird das Objekt für den Controller und die Agenten verfügbar gemacht. Das Objekt wird in den Status *Ausgerollt* versetzt. Beim Ausrollen werden Objektabhängigkeiten von referenzierten und referenzierenden Inventarobjekten berücksichtigt. Einzelheiten finden Sie unter [Objekt ausrollen](/configuration-inventory-operations-deploy-object).
  - **Zurückziehen** macht eine vorherige *Ausroll*-Operation rückgängig. Das Objekt wird auf den Status *Entwurf* gesetzt. Für die Verwendung mit Arbeitsabläufen bedeutet dies, dass Aufträge aus dem [Tagesplan](/daily-plan) entfernt werden. Details finden Sie unter [Objekt zurückziehen](/configuration-inventory-operations-revoke-object).
- Automation Objekte
  - **Freigeben** macht *Entwürfe* für Objekte verfügbar
    - für die Verwendung mit anderen Objekten, z.B. *Skript-Bausteine* werden beim nächsten Ausrollen von Arbeitsabläufen berücksichtigt, *Job-Vorlagen* können in referenzierenden Arbeitsabläufen aktualisiert werden.
    - für die Verwendung mit dem [Tagesplan](/daily-plan), z.B. *Zeitpläne* werden bei der Erstellung von Aufträgen berücksichtigt.
    - Einzelheiten finden Sie unter [Objekt freigeben](/configuration-inventory-operations-release-object).
  - **Zurücknehmen** macht eine vorherige *Freigabe* Operation rückgängig. Die Inventarobjekte werden auf den Status *Entwurf* gesetzt. Dies bedeutet, dass *Zeitpläne* und *Kalender* vom [Tagesplan](/daily-plan) nicht berücksichtigt werden. Einzelheiten finden Sie unter [Objekt zurücknehmen](/configuration-inventory-operations-recall-object).

## Referenzen

### Kontext-Hilfe

- [Änderungen](/changes)
- [Tagesplan](/daily-plan)
- [Regeln zur Benennung von Objekten](/object-naming-rules)
- Controller Objekte
  - [Arbeitsabläufe](/configuration-inventory-workflows)
  - [Dateiauftragsquellen](/configuration-inventory-file-order-sources)
  - [Job-Ressourcen](/configuration-inventory-job-resources)
  - [Notizbretter](/configuration-inventory-notice-boards)
    - [Ressourcen - Notizbretter](/resources-notice-boards)
  - [Ressourcen-Sperren](/configuration-inventory-resource-locks)
    - [Ressourcen - Ressourcen-Sperren](/resources-resource-locks)
- Automation Objekte
  - [Skript-Bausteine](/configuration-inventory-script-includes)
  - [Zeitpläne](/configuration-inventory-schedules)
  - [Kalender](/configuration-inventory-calendars)
  - [Job-Vorlagen](/configuration-inventory-job-templates)
  - [Berichte](/configuration-inventory-reports)
- Operationen für Objekte
  - [Objekt ausrollen](/configuration-inventory-operations-deploy-object)
  - [Objekt zurückziehen](/configuration-inventory-operations-revoke-object)
  - [Objekt freigeben](/configuration-inventory-operations-release-object)
  - [Objekt zurücknehmen](/configuration-inventory-operations-recall-object)
  - [Objekt entfernen](/configuration-inventory-operations-remove-object)
  - [Objekt umbenennen](/configuration-inventory-operations-rename-object)
- Operationen für Benutzerordner
  - [Ordner ausrollen](/configuration-inventory-operations-deploy-folder)
  - [Ordner zurückziehen](/configuration-inventory-operations-revoke-folder)
  - [Ordner freigeben](/configuration-inventory-operations-release-folder)
  - [Ordner zurücknehmen](/configuration-inventory-operations-recall-folder)
  - [Ordner entfernen](/configuration-inventory-operations-remove-folder)
  - [Ordner umbenennen](/configuration-inventory-operations-rename-folder)
  - [Ordner exportieren](/configuration-inventory-operations-export-folder)
  - [Git - Clone Repository](/configuration-inventory-operations-git-clone)
  - [Kennzeichnungen verwalten](/configuration-inventory-operations-manage-tags)

### Product Knowledge Base

- Controller Objekte
  - [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
  - [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
  - [JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources)
  - [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)
- Automation Objekte
  - [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)
  - [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
  - [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
    - [JS7 - Management of Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Calendars)
  - [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)
