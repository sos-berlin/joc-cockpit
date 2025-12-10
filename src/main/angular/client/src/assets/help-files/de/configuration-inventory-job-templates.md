# Konfiguration - Inventarisierung - Job-Vorlagen

Im Bereich *Job-Vorlage* können Sie zentral verwaltete Vorlagen für Jobs festlegen, die in Arbeitsabläufen verwendet werden. Sie werden angewendet, wenn dieselbe Job-Implementierung für eine Reihe von Jobs verwendet wird.

- Jobs enthalten einen Verweis auf eine Job-Vorlage, die bei der Erstellung des Jobs angewendet wird. 
- Jobs können aktualisiert werden, wenn Job-Vorlagen geändert werden.
- Job-Vorlagen können für jede Job-Klasse erstellt werden, z. B. für Shell Jobs und JVM Jobs, die in der Java Virtual Machine des Agenten ausgeführt werden.

Job-Vorlagen werden über die folgenden Fenster verwaltet:

- Der [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner mit den Job-Vorlagen und die Möglichkeit, Job-Vorlagen zu bearbeiten.
- Der Bereich *Job-Vorlage* auf der rechten Seite des Fensters enthält Details zur Konfiguration.

## Bereich: Job-Vorlage

Für eine Job-Vorlage sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner einer Job-Vorlage, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- Andere Eingaben entsprechen den Eingaben eines Jobs:
  - [Job-Eigenschaften](/configuration-inventory-workflow-job-properties)
  - [Job-Optionen](/configuration-inventory-workflow-job-options)
  - [Job Knoten-Eigenschaften](/configuration-inventory-workflow-job-node-properties)
  - [Job-Benachrichtigungen](/configuration-inventory-workflow-job-notifications)
  - [Job-Kennzeichnungen](/configuration-inventory-workflow-job-tags)
- **Argumente** werden für JVM Jobs verwendet. 
  - **Erforderlich** gibt an, ob das Argument erforderlich ist oder entfernt werden kann, wenn es in einem Job verwendet wird.
  - **Beschreibung** fügt dem Argument eine Erklärung hinzu, die HTML Tags enthalten kann.

## Operationen für Job-Vorlagen

Für allgemeine Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

Job-Vorlagen bieten die folgenden Operationen zur Aktualisierung von Jobs:

- die Schaltfläche **Vorlage auf Jobs anwenden** ist verfügbar, wenn eine Job-Vorlage freigegeben wird.
  - Es wird ein Popup-Fenster mit den Arbeitsabläufen und Jobs angezeigt, die die Job-Vorlage verwenden.
  - Benutzer können Arbeitsabläufe und Jobs auswählen, die aktualisiert werden sollen.
  - mit **Filter** können Sie die Aktualisierungen auf Arbeitsabläufe im Status *Entwurf* und/oder im Status *Freigegeben* beschränken.
  - **Benachrichtigung aktualisieren** legt fest, dass die Einstellungen für die Job-Benachrichtigungen aus der Job-Vorlage aktualisiert werden sollen.
  - **Zutrittszeiten aktualisieren** gibt an, dass die Zutrittszeiten für einen Job von der Job-Vorlage aus aktualisiert werden sollen.
  - **Aktualisierung von erforderlichen Argumenten** legt fest, dass die Argumente der Job-Vorlage, die als erforderlich qualifiziert sind, in ausgewählten Jobs aktualisiert werden sollen.
  - **Aktualisierung von optionalen Argumenten** gibt an, dass die Argumente der Job-Vorlage, die als optional eingestuft sind, in den ausgewählten Jobs aktualisiert werden sollen.
- **Jobs aus Vorlagen aktualisieren** ist im *Navigationsbereich* verfügbar und aktualisiert Jobs in Arbeitsabläufen, die sich im ausgewählten *Ordner* befinden, aus Job-Vorlagen, die sich in einem beliebigen Ordner befinden.
- **Vorlage auf Jobs anwenden** ist über der *Navigationsbereich* verfügbar und aktualisiert Jobs in Arbeitsabläufen, die sich in einem beliebigen Ordner befinden und Verweise auf Job-Vorlagen enthalten, die im ausgewählten *Inventarordner* oder einem beliebigen Unterordner enthalten sind.

Nach der Aktualisierung von Jobs aus Job-Vorlagen werden die zugehörigen Arbeitsabläufe auf den Status *Entwurf* gesetzt und sollten ausgerollt werden, damit die Änderungen wirksam werden.

## Verwendung mit Jobs

Job-Vorlagen können aus bestehenden Jobs erstellt werden. In der Ansicht *Konfiguration->Inventar* für einen bestimmten Arbeitsablauf können Sie auf den entsprechenden Job klicken, um dessen Aktionsmenü mit der Funktion *Job-Vorlage erstellen* aufzurufen.

Um einem Job eine Job-Vorlage zuzuweisen, können Sie wie folgt vorgehen:

- Rufen Sie in der oberen rechten Ecke des Fensters den Assistenten auf.
- Daraufhin öffnet sich ein Popup-Fenster, in dem Sie die Registerkarte *Job-Vorlagen* auswählen können.
  - Navigieren Sie zu der gewünschten Job-Vorlage oder geben Sie Teile des Namens ein.
  - Wählen Sie die Job-Vorlage aus und fügen Sie optional Argumente hinzu, falls diese von der Job-Vorlage angeboten werden.
  
Wenn einer Job-Vorlage ein Job zugewiesen ist, wird dies in der oberen rechten Ecke des Fensters angezeigt:

- Die Benutzer finden die *Job-Vorlage Referenz*,
- gefolgt von einem Symbol für den *Synchronisationsstatusindikator*: 
  - die grüne Farbe zeigt an, dass der Job und die Job-Vorlage synchronisiert sind. 
  - orange Farbe zeigt an, dass die Job-Vorlage geändert wurde und der Job nicht synchronisiert ist.
- Wenn Sie auf den orangefarbenen *Synchronisierungsstatusindikator* klicken, wird der Job aus seiner Job-Vorlage aktualisiert.

Um einen Verweis auf eine Job-Vorlage aus einem Job zu entfernen, können Sie auf das Papierkorbsymbol in der oberen rechten Ecke nach dem Namen der Job-Vorlage klicken. Die Operation lässt die Job-Eigenschaften unberührt und löst die Verknüpfung mit der Job-Vorlage. 

Bei Jobs, die auf Job-Vorlagen verweisen, können größere Teile des Jobs nicht geändert werden. Stattdessen müssen die Änderungen auf die Job-Vorlage angewendet werden. Dies gilt nicht für die folgenden Eingaben, die frei gewählt werden können:

- **Job-Name**
- **Adresse**
- **Agent**
- **Job-Zutrittszeiten**
- **Job-Benachrichtigungen**

Um **Argumenten für JVM Jobs** oder **Umgebungsvariablen für Shell Jobs** dynamisch Werte zuzuweisen, können Benutzer wie folgt vorgehen:

- Die Job-Vorlage verwendet eine Arbeitsablauf-Variable für den Wert, der dem *Argument* oder der *Umgebungsvariable* zugewiesen wird.
- Der Arbeitsablauf, der den Job enthält, der auf die Job-Vorlage verweist, deklariert die Arbeitsablauf-Variable, die aus einem Standardwert und aus eingehenden Aufträgen gefüllt werden kann.

## Referenzen

### Kontext-Hilfe

- [Job-Benachrichtigungen](/configuration-inventory-workflow-job-notifications)
- [Job-Eigenschaften](/configuration-inventory-workflow-job-properties)
- [Job-Kennzeichnungen](/configuration-inventory-workflow-job-tags)
- [Job Knoten-Eigenschaften](/configuration-inventory-workflow-job-node-properties)
- [Job-Optionen](/configuration-inventory-workflow-job-options)
- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Regeln zur Benennung von Objekten](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  - [JS7 - JITL Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Integration+Job+Templates)
  - [JS7 - User Defined Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Defined+Job+Templates)
