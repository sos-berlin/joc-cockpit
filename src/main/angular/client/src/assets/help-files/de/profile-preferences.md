# Profil - Präferenzen

Die Seite *Profil - Einstellungen* enthält Einstellungen für ein Benutzerkonto.

Wenn sich ein Benutzer zum ersten Mal mit JOC Cockpit verbindet, werden die Einstellungen des *Standardbenutzerkontos* in die Einstellungen des Benutzers kopiert. Das *Standardbenutzerkonto* wird auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) festgelegt.

*Rollen

Die dem Benutzerkonto zugewiesenen Rollen werden angezeigt. Die daraus resultierenden Berechtigungen werden aus den Rollenzuweisungen zusammengeführt und sind auf der Registerkarte [Profile - Permissions](/profile-permissions) verfügbar.

## Einstellungen

Benutzer können die Präferenzen nach Belieben ändern.

### Browserbezogene Präferenzen

Die Einstellungen in diesem Abschnitt verwenden die Standardwerte des verwendeten Browsers:

- **Sprache** ist die Oberflächensprache von JOC Cockpit, die für Englisch, Französisch, Deutsch und Japanisch verfügbar ist.
- **Zeitzone** gibt die Zeitzone an, in die alle in JOC Cockpit angezeigten Daten umgerechnet werden.
- **Datum-Zeit-Format** bietet die Auswahl aus einer Liste verfügbarer Formate.

### Liste der Einstellungen

Die Präferenzen beziehen sich auf die Anzeige von Listen in JOC Cockpit. Wenn Sie die Werte erhöhen, sollten Sie die folgenden Auswirkungen berücksichtigen:

- Wenn Sie mehr Daten aus JOC Cockpit lesen, wird die Reaktionsfähigkeit der Benutzeroberfläche nicht verbessert.
- Längere Listen erhöhen den Speicher- und CPU-Verbrauch des Browsers für das Rendering.

Die folgenden Einstellungen, die für allgemeine Werte verwaltet werden können, finden Sie unter dem Link *Group Limit*:

- **Max. Anzahl der Einträge in der Historie** gilt für die Ansicht [History - Orders](/history-orders).
- **Max. Anzahl der Audit-Log-Einträge** gilt für die Ansicht [Audit Log](/audit-log).
- **Max. Anzahl der Benachrichtigungseinträge** gilt für die Ansichten *Monitor-Auftragsbenachrichtigungen* und *Monitor-Systembenachrichtigungen*.
- **Max. Anzahl der Einträge in der Auftragsübersicht** gilt für die Ansicht [Orders - Overview](/orders-overview).
- **Max. Anzahl der Tagesplan-Einträge** gilt für die Ansicht [Daily Plan](/daily-plan).
- **Max. Anzahl der Aufträge pro Arbeitsablauf** begrenzt die Anzahl der Aufträge, die in der Ansicht [Workflows](/workflows) verfügbar sind.
- **Max. Anzahl der Dateitransfer-Einträge** gilt für die Ansicht [History - File Transfers](/history-file-transfers).
- **Max. Anzahl von Aufträgen pro Ressourcensperre** begrenzt die Anzahl der Aufträge, die in der Ansicht [Resources - Resource Locks](/resources-resource-locks) angezeigt werden.
- **Max. Anzahl der Aufträge pro Schwarzes Brett** begrenzt die Anzahl der Aufträge, die in der Ansicht [Resources - Notice Boards](/resources-notice-boards) angezeigt werden.

### Arbeitsablauf Ansichtsvorgaben

Die Voreinstellungen gelten für die Ansicht [Workflows](/workflows):

- **Max. Anzahl der Einträge in der Auftrags Historie pro Arbeitsablauf** begrenzt die Anzahl der Einträge im Fenster *Auftrag Historie*.
- **Max. Anzahl der Einträge in der Job Historie pro Arbeitsablauf** begrenzt die Anzahl der Einträge im Fenster *Auftrag Historie*.
- die **Max. Anzahl der Audit-Log-Einträge pro Objekt** begrenzt die Anzahl der Einträge im Bereich *Audit Log*.

### Konfiguration - Voreinstellungen für die Inventaransicht

- **Max. Anzahl der Favoriteneinträge** begrenzt die Anzeige von Favoriten, z.B. bei der Zuweisung eines Auftrags an einen Agenten.

### Paginierung Voreinstellungen

Die Präferenzen gelten für die Paginierung auf jeder Seite:

- **Max. Anzahl der Einträge pro Seite** begrenzt die Anzahl der Einträge, die auf einer einzelnen Seite sichtbar sind.
- **Standardanzahl der Einträge pro Seite** gibt den Standardwert an, der einer der Werte 10, 25, 50, 100 oder 1000 sein kann.

### Theme-Einstellungen

- **Thema wechseln** bietet die Möglichkeit, zwischen Themen zu wechseln. Einige Themen sind für einen höheren Kontrast vorgesehen, der für Benutzer mit Sehbehinderungen besser geeignet sein kann.
  - **Farbe der Auftragszustände ändern** ist über ein Symbol rechts neben *Thema ändern* verfügbar und bietet die Möglichkeit, die Standardfarben für [Order States](/order-states) zu ändern. Es könnte verwirrend aussehen, Farben zu ändern, die in der JS7-Dokumentation anders dargestellt sind. Für Benutzer mit Sehbehinderungen könnte dies jedoch hilfreich sein: Sie können RGB-Werte für jede Farbe angeben, die für einen Auftragsstatus verwendet wird.
- **Menüleistenfarbe** ist verfügbar, wenn das Thema *Hell* verwendet wird. Damit können Sie die Hintergrundfarbe der Menüleiste ändern. Die Einstellung kann z.B. verwendet werden, wenn Benutzer mit verschiedenen JS7-Umgebungen (Dev, Test, Prod) arbeiten: Die Verwendung unterschiedlicher Hintergrundfarben hilft bei der Identifizierung der jeweiligen JS7-Umgebung.
- der **Thementitel** wird direkt unter der Menüleiste angezeigt. Ähnlich wie bei der *Menüleistenfarbe* kann dies zur Identifizierung der entsprechenden JS7-Umgebung verwendet werden.

### Editor-Einstellungen

- **Tab Size** wird auf der Registerkarte [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties) verwendet, wenn Sie das *Job Script* bearbeiten. Die Einstellung gibt die Anzahl der Leerzeichen an, die der Größe entsprechen, wenn Sie die TAB-Taste drücken.

### Ansichtseinstellungen

- **Protokolle anzeigen** legt die Anzeige von [Order Log View](/order-log) und [Task Log View](/task-log) fest. Beide Protokollansichten ermöglichen die Anzeige und den Download von Protokollen.
- **Dokumentationen anzeigen** legt die Anzeige der Benutzerdokumentation für Arbeitsabläufe und Jobs fest.

### Einstellungen der Konfigurationsansicht

- **Unterordner und Ordnerinhalte anzeigen** regelt das Verhalten beim Klicken auf einen Ordner im *Navigationsfeld* der Ansicht *Konfiguration-&gt;Inventar*, um entweder nur die verfügbaren Objekte oder die verfügbaren Objekte und Unterordner anzuzeigen.

### Gemischte Einstellungen

- **Dateien sofort in der Ansicht Dateitransfer anzeigen** ist nützlich, wenn jeder Dateitransfer eine absehbare Anzahl von Dateien umfasst. Für einzelne Übertragungen, die Tausende von Dateien umfassen können, sollten Sie diese Einstellung deaktivieren.
- **Gründe für Audit-Protokoll aktivieren** zwingt den Benutzer, einen Grund anzugeben, wenn er Objekte ändert, z.B. Aufträge hinzufügt oder storniert, Arbeitsabläufe aussetzt usw. Die Benutzereinstellung kann über die entsprechende Seite [Einstellungen - JOC Cockpit](/settings-joc) außer Kraft gesetzt werden.
- **Zeitzone für Protokoll-Zeitstempel verwenden** ist anwendbar, wenn Agenten auf Servern in verschiedenen Zeitzonen oder in einer anderen Zeitzone als der des Controller-Servers laufen. In dieser Situation könnte ein Auftragsprotokoll, das die Protokollausgabe einer Reihe von Aufträgen enthält, die mit möglicherweise unterschiedlichen Agenten ausgeführt wurden, verwirrend aussehen. Die Einstellung konvertiert die Zeitstempel des Protokolls in die im Benutzerprofil angegebene *Zeitzone*.
- **Aktueller Controller** gilt, wenn mehr als ein Controller mit JOC Cockpit verbunden ist. Die Option, die in einer Reihe von Ansichten angeboten wird, zum Beispiel in der Ansicht [History - Orders](/history-orders). Wenn diese Option aktiviert ist, wird die Anzeige auf Aufträge beschränkt, die an den aktuell ausgewählten Controller übermittelt wurden, andernfalls werden Aufträge aller verbundenen Controller angezeigt. Die Einstellung bestimmt den Standardwert für verwandte *Aktueller Controller*-Optionen in JOC Cockpit-Ansichten.
- **Tooltips für Inventarobjekte unterdrücken** bezieht sich auf die Ansicht *Konfiguration-&gt;Inventar*, die Tooltips anbietet, zum Beispiel für [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties). Tooltips werden eingeblendet, wenn die Maus auf die Beschriftung eines Eingabefeldes bewegt wird, um den Benutzern die möglichen Eingaben zu erläutern. Während dies für Benutzer, die mit JS7 nicht allzu vertraut sind, nützlich ist, sind Tooltips für erfahrene Benutzer möglicherweise nicht erforderlich.
- **Lizenzwarnung bestätigt** bezieht sich auf die Verwendung von Abonnementlizenzen, die in der Regel auf ein Jahr begrenzt sind. Vor Ablauf der Lizenz werden entsprechende Warnungen von JOC Cockpit angezeigt. Der Benutzer kann die Warnungen zum Ablauf der Lizenz unterdrücken. Details finden Sie unter [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings).
- **Mehr Optionen anzeigen** aktiviert den entsprechenden Schieberegler in der Ansicht *Konfiguration-&gt;Inventar*. Er bietet detailliertere Optionen für die Auftragskonfiguration, zum Beispiel auf der Registerkarte [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options).
- **Listenvariable kollabieren** gilt für die Ansicht [Configuration - Inventory - Workflows](/configuration-inventory-workflows), die die Angabe von Arbeitsablauf-Variablen aus einer Reihe von Datentypen bietet. Wenn der Datentyp *Liste* (Array) verwendet wird, kann er eine größere Anzahl von Einträgen aufnehmen. Die Benutzer möchten möglicherweise nicht sofort sehen, dass die Listenvariablen bei der Bearbeitung eines Arbeitsablaufs erweitert werden.

### Ansichtstyp-Einstellungen

- **Ansicht anzeigen** gilt für eine Reihe von Ansichten, die den entsprechenden Indikator in der oberen rechten Ecke des Fensters anbieten. Die Einstellung legt den Ansichtstyp fest, der standardmäßig verwendet wird. Sie können den Ansichtstyp bei Bedarf in jeder Ansicht ändern. Der Ansichtstyp *Karte* benötigt mehr Platz auf dem Bildschirm als der Ansichtstyp *Liste*. Einige Benutzer bevorzugen jedoch vielleicht die Sichtbarkeit von Karten.
- **Übersicht der Aufträge anzeigen** ähnelt der Einstellung *Ansicht anzeigen*, gilt aber für die Ansicht [Orders - Overview](/orders-overview). Zusätzlich bietet die Ansicht den Ansichtstyp *Bulk*, der den Übergang von Aufträgen aus Bulk-Vorgängen ermöglicht.

### Arbeitsablauf Layout Präferenzen

Die Einstellungen gelten für die Anzeige von Arbeitsablauf-Anweisungen in der Ansicht [Configuration - Inventory - Workflows](/configuration-inventory-workflows):

- mit **Orientierung** können Sie die Anzeige von Arbeitsabläufen auf vertikale oder horizontale Darstellung umstellen. Die Verwendung der horizontalen *Orientierung* bringt Vorteile bei der Gestaltung von Arbeitsabläufen mit einer größeren Anzahl von Jobs und anderen Arbeitsanweisungen.
- mit **Abstand zwischen Anweisungen auf benachbarten Ebenen** können Sie den Abstand zwischen vertikalen Arbeitsablauf-Anweisungen ändern.
- mit **Abstand zwischen Instruktionen auf derselben Ebene** können Sie den Abstand zwischen horizontalen Arbeitsablauf-Instruktionen ändern.
- **Runde Kanten für Verbindungen** glättet die Kanten bei der Anzeige von Arbeitsablauf-Anweisungen, z.B. von Jobs.

## Referenzen

### Kontexthilfe

- [Audit Log](/audit-log)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options)
  - [Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties)
- [Daily Plan](/daily-plan)
- [History - File Transfers](/history-file-transfers)
- [History - Orders](/history-orders)
- [Order Log View](/order-log)
- [Order States](/order-states)
- [Orders - Overview](/orders-overview)
- [Profile](/profile)
   - [Profile - Permissions](/profile-permissions)
- [Resources - Notice Boards](/resources-notice-boards)
- [Resources - Resource Locks](/resources-resource-locks)
- [Einstellungen - Tagesplan](/settings-daily-plan)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Task Log View](/task-log)
- [Workflows](/workflows)

### Product Knowledge Base

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - File Transfer History](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Transfer+History)
- [JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

