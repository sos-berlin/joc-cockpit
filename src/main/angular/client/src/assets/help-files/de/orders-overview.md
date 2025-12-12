# Auftragsübersicht

Die Ansicht *Auftragsübersicht* ermöglicht die Überwachung und Kontrolle von Aufträgen für Arbeitsabläufe.

- Benutzer können Aufträge über [Aufträge - Zustandstransitionen](/order-states) gruppieren.
- Sie können Aufträge transitieren, indem Sie zum Beispiel *laufende* Aufträge abbrechen.
- Die Ansicht enthält Aufträge, die dem [Tagesplan](/daily-plan) hinzugefügt wurden, und Aufträge, die nach Bedarf hinzugefügt wurden.

## Bereich: Auftragszustände

Das linke Feld zeigt die Anzahl der Aufträge an, die pro Zustand verfügbar sind. Wenn Sie auf den entsprechenden Zustand oder die Zahl klicken, werden die entsprechenden Aufträge im Bereich *Aufträge* angezeigt.

## Bereich: Navigation

Der mittlere Bereich ist in Registerkarten unterteilt, die eine Filterung der Aufträge nach Kennzeichnungen ermöglichen.

- **Kennz. Arbeitsablauf** werden in der Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows) zugewiesen.
- **Kennz. Auftrag** werden in der Ansicht [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules) zugewiesen.

Kennzeichnungen werden über die Symbole + und - ausgewählt und können über das Symbol *Schnellsuche* nachgeschlagen werden. Die Anzeige von Kennzeichnungen muss auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) aktiviert werden.

## Bereich: Aufträge

Der Bereich zeigt die Liste der Aufträge für den jeweiligen Zustand an:

- **Auftragskennung** ist die eindeutige Kennung, die einem Auftrag zugeordnet ist.
  - Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, werden die Variablen angezeigt, die der Auftrag enthält.
- **Arbeitsablauf** ist der eindeutige Name eines Arbeitsablaufs.
  - Wenn Sie auf den *Arbeitsablauf* klicken, gelangen Sie zur Ansicht [Arbeitsabläufe](/workflows).
  - Wenn Sie auf das Bleistiftsymbol klicken, gelangen Sie zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).
- **Adresse** gibt die Position des Auftrags anhand der *Adresse* des Jobs oder der Arbeitsablauf-Anweisung an. Wenn keine Adresse vorhanden sind, wird die technische Position angegeben.
- **Zustand** zeigt [Aufträge - Zustandstransitionen](/order-states) an.
  - Wenn Sie den Mauszeiger über den Statusindikator bewegen, werden Details angezeigt, sofern verfügbar. Zum Beispiel zeigen *Wartende* Aufträge Gründe an wie *Warten auf Prozess*, *Warten auf Notiz* usw.
- **Geplant für** zeigt das Startdatum des Auftrags an.

## Bereich: Historie

Der Bereich wird im unteren Teil des Fensters angezeigt, wenn Sie auf die *Auftragskennung* klicken. Der Bereich enthält Unterregisterkarten für die *Historie des Auftrags* und das *Prüfprotokoll*.

### Auftragshistorie

- **Auftragskennung** ist die eindeutige Kennung, die einem Auftrag zugeordnet ist. Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, werden die Auftragsvariablen angezeigt.
- **Adresse** zeigt die letzte Position eines Auftrags im Arbeitsablauf an. Benutzer können den Arbeitsablauf-Anweisungen *Adressen* zuweisen, die dann angezeigt werden, andernfalls wird die technische Position angezeigt.
- **Status** zeigt das letzte Ergebnis im Leben des Auftrags an.
  - Wenn Aufträge abgeschlossen sind, lautet der *Status der Historie* entweder *Erfolgreich* oder *Fehlgeschlagen*.
  - Wenn Aufträge noch nicht abgeschlossen sind, lautet der *Status der Historie* *in Verarbeitung*.
- **Geplante Zeit** gibt das ursprüngliche Datum und die Uhrzeit an, für die der Auftragsstart geplant war.
- **Startzeit** gibt das Datum und die Uhrzeit an, zu der der Auftrag tatsächlich gestartet ist.
- **Endezeit** gibt das Datum und die Uhrzeit an, zu der der Auftrag abgeschlossen wurde.

#### Zugriff auf Protokolle

- **Auftragskennung**: Wenn Sie im Bereich *Historie* auf die *Auftragskennung* klicken, wird das Protokoll des Auftrags mittels [Anzeige Auftragsprotokoll](/order-log) dargestellt. Das Protokoll enthält die Ausgaben, die von allen mit dem Arbeitsablauf ausgeführten Jobs erzeugt wurden.
- **Herunterladen-Symbol**: Wenn Sie auf das Symbol klicken, wird das Protokoll des Auftrags in eine Datei heruntergeladen.

Standardmäßig ist die Anzeige von Auftragsprotokollen auf eine Größe von 10 MB begrenzt, ansonsten werden die Protokolle in Dateien heruntergeladen. Die Benutzer können das Limit auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) anpassen.

### Prüfprotokoll

Das *Prüfprotokoll* zeigt an, welche Änderungen an einem Auftrag vorgenommen wurden.

- **Erstellt** gibt das Datum an, an dem die Operation durchgeführt wurde.
- **Konto** gibt das Benutzerkonto an, das die Operation durchgeführt hat.
- **Anfrage** gibt den REST-API-Endpunkt an, der aufgerufen wurde.
- **Kategorie** gibt die Klassifizierung der Operation an, z.B. CONTROLLER bei beim Abbrechen von Aufträgen oder DAILYPLAN bei der Erstellung von Aufträgen aus dem [Tagesplan](/daily-plan).
- **Begründung** erklärt, warum ein Auftrag geändert wurde. Das JOC Cockpit kann so konfiguriert werden, dass die Angabe von Gründen bei der Änderung von Objekten erzwungen wird.
  - Die Einstellung ist unter [Profil - Einstellungen](/profile-preferences) verfügbar.
  - Die Einstellung kann über die Seite [Einstellungen - JOC Cockpit](/settings-joc) erzwungen werden.
- **Zeitaufwand**: Ähnlich wie bei der *Begründung* kann bei der Änderung von Aufträgen die für einen Operation aufgewendete Zeit hinzugefügt werden.
- **Ticket-Verweis**: Ähnlich wie bei der *Begründung* kann bei der Änderung von Aufträgen ein Verweis auf ein Ticketsystem hinzugefügt werden.

## Operation

### Operationen für Aufträge

Für jeden Auftrag gibt es ein Aktionsmenü, das die für den Auftrag verfügbaren Operationen enthält.

Für Aufträge im Zustand *anstehend*, *eingeplant*, *in Verarbeitung*, *laufend*, *ausgesetzt*, *anfragend*, *wartend*, *fehlgeschlagen* werden die folgenden Operationen angeboten:

- **Priorität ändern** 
  - Wenn ein Auftrag im Arbeitsablauf auf eine *Ressourcen-Sperre* trifft, die die Parallelität einschränkt, dann bestimmt seine *Priorität* die Position in der Warteschlange der *wartenden* Aufträge.
  - die *Prioritäten* werden durch negative, null und positive Ganzzahlen oder durch die angebotenen Abkürzungen festgelegt. Eine höhere *Priorität* hat Vorrang. Die Abkürzungen bieten die folgenden Werte:
    - **Niedrig**: -20000
    - **Niedriger als Normal**: -10000
    - **Normal**: 0
    - **Höher als Normal**: 10000
    - **Hoch**: 20000
- **Abbrechen**: bricht den Auftrag ab. *Laufende* Aufträge setzen den aktuellen Job oder die aktuelle Arbeitsablauf-Anweisung fort und verlassen den Arbeitsablauf mit dem Status *fehlgeschlagen*.
- **Abbrechen/Prozess beenden**: terminiert zwangsweise den Job, den ein Auftrag ausführt. Aufträge verlassen den Arbeitsablauf mit dem Status *fehlgeschlagen*.
- **Aussetzen**: laufende Aufträge werden angehalten, nachdem sie den aktuellen Job oder die aktuelle Arbeitsablauf-Anweisung abgeschlossen haben. *Ausgesetzte* Aufträge können vom Benutzer wieder aufgenommen werden.
- **Aussetzen/Prozess beenden**: terminiert zwangsweise einen *laufenden* Job und versetzt den Auftrag in den Zustand *ausgesetzt*.
- **Aussetzen/Rücksetzen**: beendet zwangsweise die aktuelle Arbeitsablauf-Anweisung und versetzt den Auftrag in den Zustand *ausgesetzt*.  Diese Option kann mit dem erzwungenen Beenden von Jobs für *laufende* Aufträge kombiniert werden.
- **Fortsetzen**: setzt einen *ausgesetzten* oder *fehlgeschlagenen*, wiederaufnehmbaren Auftrag fort.

Für Aufträge im Zustand *abgeschlossen* und für unterbrochene Aufträge im Zustand *fehlgeschlagen* werden die folgenden Operationen angeboten:

- **Arbeitsablauf verlassen** wird den Auftrag beenden. 
  - *Abgeschlossene* Aufträge verlassen den Arbeitsablauf mit dem Status *Erfolgreich* in der Historie.
  - *Fehlgeschlagene/funktionsunfähige* Aufträge verlassen den Arbeitsablauf mit dem Status *Fehlgeschlagen* in der Historie.

Es können zusätzliche Operationen verfügbar sein, die spezifisch für den Status eines Auftrags sind.

### Massenoperationen

Massenoperationen stehen zur Verfügung, wenn Sie Aufträge über Kontrollkästchen auswählen. Sie bieten die gleichen Funktionen wie für einzelne Aufträge.

Wenn Sie Aufträge auswählen, werden im oberen Teil des Fensters Schaltflächen für Massenoperationen sichtbar, die ähnliche Beschriftungen haben wie die oben beschriebenen Operationen.

## Filter

Benutzer können Filter anwenden, um die Anzeige von Aufträgen einzuschränken. Die Schaltflächen für die Filter sind oben im Fenster verfügbar.

### Schaltflächen: Auftragszustand

Ähnlich wie im Bereich der *Auftragszustände* steht Ihnen ein Filter pro Auftragszustand zur Verfügung, um die Anzeige der Aufträge zu filtern.

### Schaltfläche: Datumsbereich

Über die Schaltfläche können Sie Aufträge aus einem Datumsbereich auswählen:

- **Alle** gibt an, dass Aufträge, die für ein beliebiges zurückliegendes oder zukünftiges Datum geplant sind, angezeigt werden.
- **Heute** Aufträge beziehen sich auf den aktuellen Tag, der anhand der Zeitzone der [Profil - Einstellungen](/profile-preferences) berechnet wird.
- **Nächste Stunde** enthält Aufträge, die innerhalb der nächsten Stunde beginnen sollen.
- **Nächste 12 Stunden** enthält Aufträge, die innerhalb der nächsten 12 Stunden beginnen sollten.
- **Nächste 24 Stunden** enthält Aufträge, die innerhalb der nächsten 24 Stunden beginnen sollten.
- **Nächster Tag** enthält Aufträge, die bis zum Ende des nächsten Tages beginnen sollten.
- **Nächste 7 Tage** enthält Aufträge, die innerhalb der nächsten 7 Tage beginnen sollten.

### Eingabefilter: Von ... Bis

Für Aufträge in den Zuständen *fortschreitend*, *laufend*, *fehlgeschlagen*, *abgeschlossen* stehen Eingabefelder zur Verfügung, in denen Sie das Datum und die Uhrzeit angeben können, ab der ein Auftrag den entsprechenden Zustand hat.

Sie können absolute oder relative Tage und Uhrzeiten angeben.

### Ergebnisfilter

Der Filter beschränkt die Anzeige auf übereinstimmende *Auftragskennungen* und *Namen der Arbeitsabläufe*. Der Filter wird auf sichtbare Aufträge angewendet und unterscheidet nicht zwischen Groß- und Kleinschreibung.

## Referenzen

### Kontext-Hilfe

- [Anzeige Auftragsprotokoll](/order-log)
- [Aufträge hinzufügen](/workflows-orders-add)
- [Aufträge - Zustandstransitionen](/order-states)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules)
- [Profil - Einstellungen](/profile-preferences)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)
