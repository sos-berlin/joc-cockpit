# Konfiguration - Inventarisierung - Auftragsvorlagen

Im Bereich *Auftragsvorlage* können Sie zentral verwaltete Vorlagen für Aufträge festlegen, die in Workflows verwendet werden. Sie werden angewendet, wenn dieselbe Job-Implementierung für eine Reihe von Jobs verwendet wird.

- Aufträge enthalten einen Verweis auf eine Auftragsvorlage, die bei der Erstellung des Auftrags angewendet wird. 
- Jobs können aktualisiert werden, wenn Jobvorlagen geändert werden.
- Jobvorlagen können für jede Jobklasse erstellt werden, z. B. für Shell-Jobs und JVM-Jobs, die in der Java Virtual Machine des Agenten ausgeführt werden.

Jobvorlagen werden über die folgenden Fenster verwaltet:

- Die Seite [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner mit den Jobvorlagen. Darüber hinaus bietet das Panel die Möglichkeit, Jobvorlagen zu bearbeiten.
- Das *Jobvorlagen-Panel* auf der rechten Seite des Fensters enthält Details zur Zeitplankonfiguration.

*Jobvorlagen-Panel

Für eine Jobvorlage sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner einer Auftragsvorlage, siehe [Object Naming Rules](/object-naming-rules).
- Andere Eingaben entsprechen den Eingaben eines Auftrags:
  - [Job Properties](/configuration-inventory-workflow-job-properties)
  - [Job Options](/configuration-inventory-workflow-job-options)
  - [Job Node Properties](/configuration-inventory-workflow-job-node-properties)
  - [Job Notifications](/configuration-inventory-workflow-job-notifications)
  - [Job Tags](/configuration-inventory-workflow-job-tags)
- **Argumente** werden für JVM-Jobs verwendet. 
  - **Erforderlich** gibt an, ob das Argument erforderlich ist oder entfernt werden kann, wenn es in einem Auftrag verwendet wird.
  - **Beschreibung** fügt dem Argument eine Erklärung hinzu, die HTML-Tags enthalten kann.

## Operationen mit Job-Vorlagen

Für allgemeine Operationen siehe [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

Job Templates bieten die folgenden Operationen zur Aktualisierung von Jobs:

- die Schaltfläche **Vorlage auf Jobs anwenden** ist verfügbar, wenn eine Jobvorlage freigegeben wird.
  - Es wird ein Popup-Fenster mit den Workflows und Jobs angezeigt, die die Jobvorlage verwenden.
  - Benutzer können Workflows und Jobs auswählen, die aktualisiert werden sollen.
  - mit **Filter** können Sie die Aktualisierungen auf Workflows im Status *Entwurf* und/oder im Status *Engagiert* beschränken.
  - **Benachrichtigung aktualisieren** legt fest, dass die Einstellungen für die Job-Benachrichtigung aus der Job-Vorlage aktualisiert werden sollen.
  - **Aufnahmezeiten aktualisieren** gibt an, dass die Aufnahmezeiten für einen Auftrag von der Auftragsvorlage aus aktualisiert werden sollen.
  - **Aktualisierung von erforderlichen Argumenten** legt fest, dass die Argumente der Jobvorlage, die als erforderlich qualifiziert sind, in ausgewählten Jobs aktualisiert werden sollen.
  - **Aktualisierung von optionalen Argumenten** gibt an, dass die Argumente der Jobvorlage, die als optional eingestuft sind, in den ausgewählten Jobs aktualisiert werden sollen.
- **Jobs aus Vorlagen aktualisieren** ist im *Navigationsbereich* verfügbar und aktualisiert Jobs in Workflows, die sich im ausgewählten *Ordner* befinden, aus Jobvorlagen, die sich in einem beliebigen Ordner befinden.
- **Vorlage auf Jobs anwenden** ist über das *Navigationspanel* verfügbar und aktualisiert Jobs in Workflows, die sich in einem beliebigen Ordner befinden, der Verweise auf Jobvorlagen enthält, die im ausgewählten *Inventarordner* oder einem beliebigen Unterordner enthalten sind.

Nach der Aktualisierung von Jobs aus Jobvorlagen werden die zugehörigen Workflows auf den Status *Entwurf* gesetzt und sollten bereitgestellt werden, damit die Änderungen wirksam werden.

## Verwendung mit Jobs

Auftragsvorlagen können aus bestehenden Aufträgen erstellt werden. In der Ansicht *Konfiguration-&gt;Bestand* für einen bestimmten Workflow können Sie auf den entsprechenden Job klicken, um dessen Aktionsmenü mit der Funktion *Jobvorlage erstellen* aufzurufen.

Um einem Auftrag eine Auftragsvorlage zuzuweisen, können Sie wie folgt vorgehen:

- Rufen Sie in der oberen rechten Ecke des Fensters den Assistenten auf.
- Daraufhin öffnet sich ein Popup-Fenster, in dem Sie die Registerkarte *Auftragsvorlagen* auswählen können.
  - Navigieren Sie zu der gewünschten Jobvorlage oder geben Sie Teile des Namens ein.
  - Wählen Sie die Auftragsvorlage aus und fügen Sie optional Argumente hinzu, falls diese von der Auftragsvorlage bereitgestellt werden.
  
Wenn einer Jobvorlage ein Job zugewiesen ist, wird dies in der oberen rechten Ecke des Fensters angezeigt:

- Die Benutzer finden die *Job Template Reference*,
- gefolgt von einem Symbol für den *Synchronisationsstatusindikator*: 
  - die grüne Farbe zeigt an, dass der Auftrag und die Auftragsvorlage synchronisiert sind. 
  - orange Farbe zeigt an, dass die Auftragsvorlage geändert wurde und der Auftrag nicht synchronisiert ist.
- Wenn Sie auf den orangefarbenen *Synchronisierungsstatusindikator* klicken, wird der Auftrag aus seiner Auftragsvorlage aktualisiert.

Um einen Verweis auf eine Auftragsvorlage aus einem Auftrag zu entfernen, können Sie auf das Papierkorbsymbol in der oberen rechten Ecke nach dem Namen der Auftragsvorlage klicken. Der Vorgang lässt die Auftragseigenschaften unberührt und löst die Verknüpfung mit der Auftragsvorlage. 

Bei Jobs, die auf Jobvorlagen verweisen, können größere Teile des Jobs nicht geändert werden. Stattdessen müssen die Änderungen auf die Jobvorlage angewendet werden. Dies gilt nicht für die folgenden Eingaben, die frei gewählt werden können:

- **Jobname**
- **Label**
- **Agent**
- **Jobaufnahmezeiten**
- **Job-Benachrichtigung**

Um **Argumenten für JVM-Jobs** oder **Umgebungsvariablen für Shell-Jobs** dynamisch Werte zuzuweisen, können Benutzer wie folgt vorgehen:

- Die Jobvorlage verwendet eine Workflow-Variable für den Wert, der dem *Argument* oder der *Umgebungsvariable* zugewiesen wird.
- Der Workflow, der den Auftrag enthält, der auf die Auftragsvorlage verweist, deklariert die Workflow-Variable, die aus einem Standardwert und aus eingehenden Aufträgen gefüllt werden kann.

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Job Node Properties](/configuration-inventory-workflow-job-node-properties)
- [Job Notifications](/configuration-inventory-workflow-job-notifications)
- [Job Options](/configuration-inventory-workflow-job-options)
- [Job Properties](/configuration-inventory-workflow-job-properties)
- [Job Tags](/configuration-inventory-workflow-job-tags)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - JITL Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Integration+Job+Templates)
  - [JS7 - User Defined Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Defined+Job+Templates)

