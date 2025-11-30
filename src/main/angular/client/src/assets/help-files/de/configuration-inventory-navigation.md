# Konfiguration Inventar - Navigation

Die Ansicht *Konfiguration - Inventar* wird zur Verwaltung von Inventarobjekten wie Workflows, Zeitplänen usw. verwendet. 

- Das *Navigationsfeld* ermöglicht die Navigation nach Tags und Ordnern. Außerdem können Sie hier Operationen mit Inventarobjekten durchführen.
- Der *Objektbereich* enthält die Darstellung des entsprechenden Objekts, z.B. [Configuration - Inventory - Workflows](/configuration-inventory-workflows).

## Navigationsleiste

Das linke Panel ist in Registerkarten gegliedert, die die Navigation von Ordnern und von Tags für Workflows und Jobs ermöglichen.

- die **Ordnernavigation** zeigt Inventarobjekte aus dem ausgewählten Ordner an.
- Auf den folgenden Registerkarten können Sie nach Tags filtern, um Workflows auszuwählen:
  - **Workflow-Tags** werden in der Ansicht [Configuration - Inventory - Workflows](/configuration-inventory-workflows) auf Workflow-Ebene zugewiesen.
  - **Job-Tags** werden in der gleichen Ansicht auf Job-Ebene zugewiesen.

### Ordner

Standardmäßig werden *Inventarordner* pro Planungsobjekttyp angezeigt. Benutzer können ihre eigenen Ordner auf jeder Hierarchietiefe erstellen. Der gleiche Name *Benutzerordner* kann beliebig oft in verschiedenen Ebenen der Ordnerhierarchie vorkommen.

Die Ordnerhierarchie kennt die folgenden Ordnertypen:

- **Inventarordner** enthalten die folgenden Objekttypen:
  - **Controller** Objekte werden an einen Controller und Agenten verteilt:
    - [Workflows](/configuration-inventory-workflows) enthalten Jobs und andere Workflow-Anweisungen. Einzelheiten finden Sie unter [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows).
    - [File Order Sources](/configuration-inventory-file-order-sources) werden für die Datei-Überwachung verwendet, um automatisch Workflows zu starten, wenn eine Datei in einem Verzeichnis ankommt. Einzelheiten finden Sie unter [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching).
    - [Job Resources](/configuration-inventory-job-resources) werden verwendet, um die Konfiguration von Variablen zu zentralisieren, die in einer Reihe von Jobs wiederverwendet werden. Einzelheiten finden Sie unter [JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources).
    - [Notice Boards](/configuration-inventory-notice-boards) abhängigkeiten zwischen Workflows festlegen. Weitere Informationen finden Sie unter [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards).
    - [Resource Locks](/configuration-inventory-resource-locks) die parallele Ausführung von Jobs und anderen Anweisungen begrenzen. Einzelheiten finden Sie unter [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks).
  - **Automation** Objekte werden für die Automatisierung in JOC Cockpit verwendet:
    - [Script Includes](/configuration-inventory-script-includes) sind Codeschnipsel, die in einer Reihe von Shell Jobs wiederverwendet werden können. Einzelheiten finden Sie unter [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes).
    - [Schedules](/configuration-inventory-schedules) bestimmen den Zeitpunkt, zu dem die Ausführung von Aufträgen für Workflows beginnen soll. Ihnen werden ein oder mehrere Workflows und optional Auftragsvariablen zugewiesen, die von den Jobs im jeweiligen Workflow verwendet werden. Sie machen von einem oder mehreren *Kalendern* Gebrauch. Einzelheiten finden Sie unter [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules).
    - [Calendars](/configuration-inventory-calendars) geben die Tage an, an denen Planungsereignisse stattfinden können. Sie enthalten Regeln für wiederkehrende Tage und Listen von Tagen, die von *Schedules* verwendet werden, um Aufträge für die Workflow-Ausführung mit dem [Daily Plan](/daily-plan) zu erstellen. Details finden Sie unter [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).
    - [Job Templates](/configuration-inventory-job-templates) werden von den Job-Vorlagen des Benutzers oder von Java-Klassen, die mit JS7 ausgeliefert werden, bereitgestellt und können für alle Betriebssystemplattformen verwendet werden. Einzelheiten dazu finden Sie unter [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates).
    - [Reports](/configuration-inventory-reports) fassen Sie die Ergebnisse der Workflow- und Job-Ausführung für bestimmte Zeiträume zusammen. Einzelheiten finden Sie unter [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports).
- **Benutzerordner** werden vom Benutzer auf einer beliebigen Hierarchietiefe erstellt. Jeder *Benutzerordner* enthält eine Reihe von *Inventarordnern*.

#### Objekt Schnellsuche

Rechts neben dem obersten Ordner in der *Navigationsleiste* finden Sie ein Suchsymbol, mit dem Sie nach Inventarobjekten suchen können.

- Es müssen mindestens zwei Zeichen eingegeben werden, damit die Schnellsuche nach Objekten sucht, die mit den angegebenen Zeichen beginnen.
- Bei der Schnellsuche wird nicht zwischen Groß- und Kleinschreibung unterschieden und es wird nach rechts abgeschnitten.
- Die Schnellsuche gibt Objekte mit übereinstimmenden Namen pro Kategorie zurück, z.B. Workflows, Zeitpläne.
- Das Metazeichen \* kann als Platzhalter für null oder mehr Zeichen verwendet werden:
  - **test** findet die Objekte ***test**Initial*, *mein**Test***
  - **te\*st** findet die Objekte ***test**Initial*, ***te**rminate**St**illstand*

#### Objekt-Papierkorb

Wenn Inventarobjekte entfernt werden, werden sie in den Papierkorb gelegt. Der Papierkorb ermöglicht es, Objekte wiederherzustellen und Objekte dauerhaft zu löschen.

Der Papierkorb wird über das Papierkorbsymbol rechts neben dem obersten Ordner in der *Navigationsleiste* geöffnet.

- Wenn Sie auf das Papierkorbsymbol klicken, wird die Anzeige auf die Objekte im Papierkorb umgeschaltet. Mit dem Zurück-Symbol können Sie von der Papierkorbansicht zur Inventaransicht zurückkehren.
- Die Ordnerstruktur des Papierkorbs ist die gleiche wie die der Inventarobjekte.
- Der Papierkorb bietet Aktionsmenüs pro Objekt und pro Ordner, um Objekte wiederherzustellen und dauerhaft zu löschen.

### Tags

Tags sind eine alternative Möglichkeit, um zwischen Inventarobjekten zu navigieren. Wenn Sie die Registerkarten *Workflow-Tags* oder "Job-Tags* im *Navigationspanel* aktivieren, zeigt das Panel die Liste der verfügbaren Tags an.

Tags können über das Symbol + hinzugefügt werden. Es stehen Optionen für aufsteigende und absteigende Sortierung zur Verfügung. Die Anzeige von Tags in anderen Ansichten muss auf der Seite [Settings - JOC Cockpit](/settings-joc) aktiviert werden.

- Wenn Sie auf das entsprechende Tag klicken, werden die Workflows angezeigt, denen das Tag zugewiesen ist.
- Tags bieten die folgenden Operationen in ihrem 3-Punkte-Aktionsmenü:
  - **Umbenennen** bietet die Möglichkeit, den Namen des Tags zu ändern.
  - mit **Löschen** können Sie das Tag und seine Zuweisung zu Workflows und Jobs löschen.

## Operationen

Operationen sind auf Ordner- und Objektebene über das 3-Punkte-Aktionsmenü verfügbar, das über das *Navigationsfeld* angezeigt wird.

### Operationen auf Ordnerebene

Operationen sind für *Inventarordner* und *Benutzerordner* verfügbar.

Der Ordner der obersten Ebene / (Schrägstrich) bietet die folgenden Operationen:

- **Redeploy** wird im Falle eines Journalverlusts verwendet, wenn der Speicher eines Controllers gelöscht und der Controller initialisiert wird. Die Operation *verteilt* alle Objekte, die zuvor auf einem Controller verteilt wurden. 
- **Abhängigkeiten aktualisieren** erstellt die interne Darstellung der Objektabhängigkeiten neu. Dies geschieht automatisch und wird bei der Erstellung oder Löschung von Inventarobjekten und bei Änderungen von Objektnamen ausgelöst. Wenn Benutzer Grund zu der Annahme haben, dass die Abhängigkeiten nicht synchron sind, kann der Vorgang durchgeführt werden. Die Benutzer sollten bedenken, dass dies einige Zeit in Anspruch nehmen wird, etwa drei Minuten bei einem Bestand von 5000 Objekten. Die Benutzer können jedoch mit JOC Cockpit weiterarbeiten, während die Abhängigkeiten aktualisiert werden.

#### Operationen im Inventarordner

Die folgenden Operationen sind für *Inventarisierungsordner* verfügbar:

- Operationen für Controller-Objekte
  - *Workflows*
    - **Neu** erstellt einen Workflow.
    - **Umbenennen** ermöglicht das Umbenennen eines Workflows. Objektabhängigkeiten werden berücksichtigt und referenzierende Bestandsobjekte wie *Schedules* und *File Order Sources* erhalten den aktualisierten Namen. Der Workflow und die referenzierenden Objekte werden auf den Status *Entwurf* gesetzt. Einzelheiten finden Sie unter [Rename Folder](/configuration-inventory-operations-rename-folder).
    - **Tags verwalten** ermöglicht das Hinzufügen und Löschen von Tags zu/von Workflows im Ordner, siehe [Manage Tags](/configuration-inventory-operations-manage-tags).
    - **Exportieren** ermöglicht die Erstellung einer Export-Archivdatei im .zip- oder .tar.gz-Format, die die Ordnerhierarchie und die JSON-Darstellung der Workflows enthält. Einzelheiten finden Sie unter [Export Folder](/configuration-inventory-operations-export-folder).
    - **Git Repository** bietet die Integration mit einem Git Server. Workflows können an Git Repositories übergeben werden und können gezogen und gepusht werden. Einzelheiten finden Sie unter [Git - Clone Repository](/configuration-inventory-operations-git-clone).
    - **Ändern** bietet Funktionen für die Änderungsverwaltung von Workflows. Benutzer können einen im Aufbau befindlichen Workflow zu einem *Change* hinzufügen, der die gemeinsame Bereitstellung und den Export von geänderten Objekten ermöglicht. Einzelheiten finden Sie unter [Changes](/changes).
    - **Deploy** macht Workflows für den Controller und die Agenten verfügbar. Die Workflows werden in den Status *Engagiert* versetzt. Einzelheiten finden Sie unter [Deploy Folder](/configuration-inventory-operations-deploy-folder).
    - **Revoke** macht eine vorherige *Deploy* Operation rückgängig. Workflows werden auf den Status *Entwurf* gesetzt. Dies bedeutet, dass Aufträge für Workflows aus der [Daily Plan](/daily-plan) entfernt werden. Objektabhängigkeiten werden berücksichtigt und referenzierende Objekte wie *Schedules* und *File Order Sources* werden ebenfalls widerrufen/zurückgerufen. Einzelheiten finden Sie unter [Revoke Folder](/configuration-inventory-operations-revoke-folder).
    - **Entfernen** verschiebt Workflows in den Papierkorb. Entfernte Workflows können wiederhergestellt oder dauerhaft aus dem Papierkorb gelöscht werden. Einzelheiten hierzu finden Sie unter [Remove Folder](/configuration-inventory-operations-remove-folder).
    - mit **Entwurf zurücksetzen** wird die aktuelle Entwurfsversion von Workflows gelöscht. Wenn eine zuvor *eingesetzte* Version existiert, wird diese zur aktuellen Version des entsprechenden Workflows.
    - **Aufträge aus Vorlagen aktualisieren** aktualisiert Aufträge aus Workflows im ausgewählten *Inventarordner* aus *Auftragsvorlagen*, die sich in einem beliebigen Ordner befinden.
  - *Auftragsquellen*, *Auftragsressourcen*, *Aushangtafeln*, *Ressourcensperren* bieten ähnliche Funktionen wie *Workflows*.
- Operationen mit Automatisierungsobjekten
  - **Freigeben** macht *Entwürfe* von Objekten verfügbar
    - zur Verwendung mit anderen Objekten, z.B. *Script Includes* wird bei der nächsten Bereitstellung von Workflows berücksichtigt, *Job Templates* können in referenzierenden Workflows aktualisiert werden.
    - zur Verwendung mit [Daily Plan](/daily-plan), z.B. *Schedules* werden bei der Erstellung von Aufträgen berücksichtigt.
    - details finden Sie unter [Release Folder](/configuration-inventory-operations-release-folder).
  - **Rückruf** macht eine vorherige *Freigabe* Operation rückgängig. Die Bestandsobjekte werden auf den Status *Entwurf* gesetzt. Dies bedeutet, dass *Schedules* und *Calendars* von [Daily Plan](/daily-plan) nicht berücksichtigt werden. Die Operation berücksichtigt Objektabhängigkeiten und ruft auch referenzierende Objekte zurück. Einzelheiten finden Sie unter [Recall Folder](/configuration-inventory-operations-recall-folder).
  - **Vorlage auf Jobs anwenden** aktualisiert Jobs in Workflows, die sich in einem beliebigen Ordner befinden, der Verweise auf *Job-Vorlagen* enthält, die im ausgewählten *Inventarordner* oder einem beliebigen Unterordner enthalten sind.
  - Weitere Operationen sind ähnlich wie bei *Operationen auf Controller-Objekten* verfügbar.

#### Operationen für Benutzerordner

*Benutzerordner* werden von Benutzern erstellt und enthalten eine Reihe von *Inventarordnern*. Die folgenden Operationen werden angeboten:

- Operationen mit allen Objekten
  - **Neu** erstellt das im Aktionsmenü angebotene Objekt: einen Ordner oder ein Inventarobjekt, siehe [Object Naming Rules](/object-naming-rules).
  - **Ausschneiden** *schneidet* den Ordner, alle Unterordner und Inventarobjekte aus, um sie später an einer anderen Stelle in der Ordnerhierarchie einzufügen.
  - **Kopieren** *kopiert* den Ordner, alle Unterordner und Inventarobjekte, einschließlich referenzierter Inventarobjekte, die sich möglicherweise in anderen Ordnern befinden. Der Vorgang ist eine *tiefe Kopie*, die auf alle referenzierten Objekte wirkt.
  - bei der **Flachen Kopie** werden der Ordner, alle Unterordner und Inventarobjekte *kopiert*. Verweise auf Inventarobjekte in anderen Ordnern werden nicht berücksichtigt.
  - **Umbenennen** ermöglicht das Umbenennen des Ordners und der optional enthaltenen Inventarobjekte. Einzelheiten finden Sie unter [Rename Folder](/configuration-inventory-operations-rename-folder).
  - **Tags verwalten** ermöglicht das Hinzufügen und Löschen von Tags zu/aus Workflows in der angegebenen Ordnerhierarchie, siehe [Manage Tags](/configuration-inventory-operations-manage-tags).
  - **Exportieren** ermöglicht die Erstellung einer Export-Archivdatei im .zip- oder .tar.gz-Format, die die Ordnerhierarchie und die JSON-Darstellung der enthaltenen Inventarobjekte enthält. Einzelheiten finden Sie unter [Export Folder](/configuration-inventory-operations-export-folder).
  - **Git Repository** bietet die Integration mit einem Git Server. Inventarobjekte können an Git Repositories übergeben werden und können gezogen und gepusht werden. Einzelheiten finden Sie unter [Git - Clone Repository](/configuration-inventory-operations-git-clone).
  - **Ändern** bietet Operationen zur Änderungsverwaltung von Inventarobjekten. Benutzer können Objekte wie Workflows, die sich im Aufbau befinden, zu einer *Änderung* hinzufügen, die eine gemeinsame Bereitstellung und den Export von geänderten Objekten ermöglicht. Einzelheiten finden Sie unter [Changes](/changes).
- Operationen mit Controller-Objekten
  - **Deploy** macht Objekte für den Controller und die Agenten verfügbar. Inventarobjekte werden in den Status *Einsatz* versetzt. Einzelheiten finden Sie unter [Deploy Folder](/configuration-inventory-operations-deploy-folder).
  - **Rückgängig machen** macht eine vorherige *Einsatz*-Operation rückgängig. Die Inventarobjekte werden in den Status *Entwurf* gesetzt. Dies bedeutet, dass Aufträge für Workflows aus dem [Daily Plan](/daily-plan) entfernt werden. Einzelheiten finden Sie unter [Revoke Folder](/configuration-inventory-operations-revoke-folder).
  - **Revalidieren** prüft die Gültigkeit von Inventarobjekten, die z.B. nach dem Import von Objekten inkonsistent werden können.
  - **Synchronisieren** bringt den Status von Planungsobjekten mit dem Controller und dem Inventar auf den gleichen Stand:
    - mit *Synchronisieren mit Controller* werden Inventarobjekte je nach ihrem *Einsatz*- oder *Entwurfsstatus* an/von Controller und Agenten *verteilt* oder *zurückgenommen*. Dieser Vorgang kann im Falle eines Journalverlustes verwendet werden, wenn der Speicher eines Controllers gelöscht und der Controller initialisiert wird.
    - mit *Synchronize to Inventory* werden Inventarobjekte in den Status *deployed* oder *draft* versetzt, je nach Verfügbarkeit des Objekts beim Controller.
- Operationen mit Automatisierungsobjekten
  - **Freigeben** macht *Entwurf*-Objekte verfügbar
    - zur Verwendung mit anderen Objekten, z.B. *Script Includes* werden bei der nächsten Bereitstellung von Workflows berücksichtigt, *Job Templates* können in referenzierenden Workflows aktualisiert werden.
    - zur Verwendung mit [Daily Plan](/daily-plan), z.B. *Schedules* werden bei der Erstellung von Aufträgen berücksichtigt.
    - details finden Sie unter [Release Folder](/configuration-inventory-operations-release-folder).
  - **Rückruf** macht eine vorherige *Freigabe* Operation rückgängig. Die Bestandsobjekte werden auf den Status *Entwurf* gesetzt. Dies bedeutet, dass *Entwürfe* und *Kalender* von [Daily Plan](/daily-plan) nicht berücksichtigt werden. Einzelheiten finden Sie unter [Recall Folder](/configuration-inventory-operations-recall-folder).
- Entfernungsoperationen
  - **Entfernen** verschiebt den Ordner, alle Unterordner und enthaltenen Objekte in den Papierkorb. Entfernte Inventarobjekte können wiederhergestellt oder dauerhaft aus dem Papierkorb gelöscht werden. Einzelheiten finden Sie unter [Remove Folder](/configuration-inventory-operations-remove-folder).
  - **Entwurf zurücksetzen** löscht die aktuelle Entwurfsversion der Objekte im Ordner und in den Unterordnern. Wenn eine zuvor *eingesetzte* oder *freigegebene* Version existiert, wird diese zur aktuellen Version des betreffenden Objekts.
- Operationen mit Auftragsvorlagen
  - **Jobs aus Vorlagen aktualisieren** aktualisiert Jobs in Workflows, die sich in einem beliebigen Ordner befinden, der Verweise auf *Job-Vorlagen* enthält, die zum ausgewählten *Benutzerordner* oder einem beliebigen Unterordner gehören.
  - **Vorlage auf Jobs anwenden** aktualisiert Jobs in Workflows, die sich im ausgewählten *Benutzerordner* befinden, anhand von *Jobvorlagen*, die sich in einem beliebigen Ordner befinden.

### Operationen auf Objektebene

Die folgenden Operationen werden für einzelne Inventarobjekte angeboten:

- Alle Objekte
  - mit **Ausschneiden** wird das Objekt *ausgeschnitten*, um es später an einer anderen Stelle in der Ordnerhierarchie einzufügen.
  - **Kopieren** *kopiert* das Objekt, um es später einzufügen.
  - mit **Umbenennen** können Sie den Namen des Objekts ändern. Objektabhängigkeiten werden dabei berücksichtigt und referenzierende Inventarobjekte erhalten den aktualisierten Namen. Das umbenannte Objekt und die referenzierenden Objekte werden in den Status *Entwurf* versetzt. Einzelheiten finden Sie unter [Rename Object](/configuration-inventory-operations-rename-object).
  - **Ändern** bietet Operationen zur Änderungsverwaltung von Inventarobjekten. Benutzer können Objekte wie z.B. Workflows, die sich in der Entwicklung befinden, zu einer *Änderung* hinzufügen, die die gemeinsame Bereitstellung und den Export von geänderten Objekten ermöglicht. Einzelheiten finden Sie unter [Changes](/changes).
  - **Abhängigkeiten anzeigen** zeigt die Liste der referenzierenden Objekte und der referenzierten Objekte an. Ein Workflow kann beispielsweise Verweise auf Job-Ressourcen enthalten und kann von *Schedules* oder *File Order Sources* referenziert werden.
  - **Neuer Entwurf** erstellt eine Entwurfsversion aus einer zuvor *eingesetzten* oder *freigegebenen* Version des Objekts.
  - JSON-Operationen
    - **JSON anzeigen** zeigt das JSON-Speicherformat des Bestandsobjekts an.
    - **JSON bearbeiten** bietet die Möglichkeit, ein Objekt direkt aus seinem JSON-Speicherformat heraus zu ändern.
    - **JSON herunterladen** lädt das Objekt im JSON-Speicherformat in eine .json-Datei herunter.
    - **JSON hochladen** bietet das Hochladen einer .json-Datei an, die das Objekt ersetzen wird.
  - Entfernungsoperationen
    - **Entfernen** verschiebt das Objekt in den Papierkorb. Entfernte Inventarobjekte können wiederhergestellt oder dauerhaft aus dem Papierkorb gelöscht werden. Einzelheiten finden Sie unter [Remove Object](/configuration-inventory-operations-remove-object).
    - mit **Entwurf zurücksetzen** wird die aktuelle Entwurfsversion des Objekts gelöscht. Wenn eine zuvor *eingesetzte* oder *freigegebene* Version existiert, wird diese zur aktuellen Version des Objekts gemacht.
- Controller-Objekte
  - **Tags verwalten** ist für Workflows verfügbar und ermöglicht das Hinzufügen und Löschen von Tags zum/vom Workflow.
  - mit **Deploy** wird das Objekt für den Controller und die Agenten verfügbar gemacht. Das Objekt wird in den Status *Engagiert* versetzt. Bei der Bereitstellung werden Objektabhängigkeiten von referenzierten und referenzierenden Inventarobjekten berücksichtigt. Einzelheiten finden Sie unter [Deploy Object](/configuration-inventory-operations-deploy-object).
  - **Rückgängig** macht eine vorherige *Einsatz*-Operation rückgängig. Das Objekt wird auf den Status *Entwurf* gesetzt. Für die Verwendung mit Workflows bedeutet dies, dass Bestellungen aus dem [Daily Plan](/daily-plan) entfernt werden. Details finden Sie unter [Revoke Object](/configuration-inventory-operations-revoke-object).
- Automation-Objekte
  - **Freigeben** macht *Entwürfe* für Objekte verfügbar
    - für die Verwendung mit anderen Objekten, z.B. *Script Includes* werden bei der nächsten Bereitstellung von Workflows berücksichtigt, *Job Templates* können in referenzierenden Workflows aktualisiert werden.
    - für die Verwendung mit [Daily Plan](/daily-plan), z.B. *Schedules* werden bei der Erstellung von Aufträgen berücksichtigt.
    - details finden Sie unter [Release Object](/configuration-inventory-operations-release-object).
  - **Rückruf** macht eine vorherige *Freigabe* Operation rückgängig. Die Bestandsobjekte werden auf den Status *Entwurf* gesetzt. Dies bedeutet, dass *Zeitpläne* und *Kalender* von [Daily Plan](/daily-plan) nicht berücksichtigt werden. Einzelheiten finden Sie unter [Recall Object](/configuration-inventory-operations-recall-object).

## Referenzen

### Kontext-Hilfe

- [Changes](/changes)
- [Daily Plan](/daily-plan)
- [Object Naming Rules](/object-naming-rules)
- Controller-Objekte
  - [Workflows](/configuration-inventory-workflows)
  - [File Order Sources](/configuration-inventory-file-order-sources)
  - [Job Resources](/configuration-inventory-job-resources)
  - [Notice Boards](/configuration-inventory-notice-boards)
    - [Resouroes - Notice Boards](/resources-notice-boards)
  - [Resource Locks](/configuration-inventory-resource-locks)
    - [Resouroes - Resource Locks](/resources-resource-locks)
- Automatisierung Objekte
  - [Script Includes](/configuration-inventory-script-includes)
  - [Schedules](/configuration-inventory-schedules)
  - [Calendars](/configuration-inventory-calendars)
  - [Job Templates](/configuration-inventory-job-templates)
  - [Reports](/configuration-inventory-reports)
- Objekt-Operationen
  - [Deploy Object](/configuration-inventory-operations-deploy-object)
  - [Revoke Object](/configuration-inventory-operations-revoke-object)
  - [Release Object](/configuration-inventory-operations-release-object)
  - [Recall Object](/configuration-inventory-operations-recall-object)
  - [Remove Object](/configuration-inventory-operations-remove-object)
  - [Rename Object](/configuration-inventory-operations-rename-object)
- Operationen mit Benutzerordnern
  - [Deploy Folder](/configuration-inventory-operations-deploy-folder)
  - [Revoke Folder](/configuration-inventory-operations-revoke-folder)
  - [Release Folder](/configuration-inventory-operations-release-folder)
  - [Recall Folder](/configuration-inventory-operations-recall-folder)
  - [Remove Folder](/configuration-inventory-operations-remove-folder)
  - [Rename Folder](/configuration-inventory-operations-rename-folder)
  - [Export Folder](/configuration-inventory-operations-export-folder)
  - [Git - Clone Repository](/configuration-inventory-operations-git-clone)
  - [Manage Tags](/configuration-inventory-operations-manage-tags)

### Product Knowledge Base

- Controller-Objekte
  - [JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
  - [JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
  - [JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources)
  - [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)
- Automatisierung Objekte
  - [JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)
  - [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
  - [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
    - [JS7 - Management of Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Calendars)
  - [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)

