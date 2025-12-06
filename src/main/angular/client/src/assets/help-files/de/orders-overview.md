# Aufträge Übersicht

Die Ansicht *Auftragsübersicht* ermöglicht die Überwachung und Kontrolle von Aufträgen für Arbeitsabläufe.

- Benutzer können Aufträge, die bearbeitet werden, über [Order State](/order-states) identifizieren.
- Sie können Aufträge umwandeln, indem Sie zum Beispiel *laufende* Aufträge stornieren.
- Die Ansicht enthält Aufträge, die von [Tagesplan](/daily-plan) hinzugefügt werden, und Aufträge, die auf Anfrage hinzugefügt wurden.

## Auswahlfenster Auftragsstatus

Das linke Feld zeigt die Anzahl der Aufträge an, die pro Status verfügbar sind. Wenn Sie auf den entsprechenden Status oder die Nummer klicken, werden die entsprechenden Aufträge im Auftragspanel angezeigt.

## Markierungsfeld

Der mittlere Bereich ist in Registerkarten unterteilt, die eine Filterung der Aufträge nach Tags ermöglichen.

- **Arbeitsablauf-Tags** werden in der Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows) zugewiesen.
- **Auftrags-Tags** werden in der Ansicht [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules) zugewiesen.

Tags werden über die Symbole + und - ausgewählt und können über das Symbol Schnellsuche nachgeschlagen werden. Die Anzeige von Tags muss auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) aktiviert werden.

## Auftragspanel

Das Panel zeigt die Liste der Aufträge für den jeweiligen Status an:

- **Auftrags-ID** ist die eindeutige Kennung, die einem Auftrag zugeordnet ist.
  - Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, werden die Variablen angezeigt, die der Auftrag enthält.
- **Arbeitsablauf-Name** ist der eindeutige Name eines Arbeitsablaufs.
  - Wenn Sie auf den *Arbeitsablaufnamen* klicken, gelangen Sie zur Ansicht [Arbeitsabläufe](/workflows).
  - Wenn Sie auf das Bleistiftsymbol klicken, gelangen Sie zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).
- **Etikett** gibt die Position des Auftrags anhand des Etiketts der Arbeitsablauf-Anweisung an. Wenn keine Etiketten vorhanden sind, wird die technische Position angegeben.
- **Status** zeigt den [Order State](/order-states) an.
  - Wenn Sie den Mauszeiger über den Statusindikator bewegen, werden Details angezeigt, sofern verfügbar. Zum Beispiel zeigen *Wartende* Aufträge Gründe an wie *Warten auf Bearbeitung*, *Warten auf Aushang* usw.
- **Geplant für** zeigt das Startdatum des Auftrags an.

## Historie Panel

Das Panel wird im unteren Teil des Fensters angezeigt, wenn Sie auf die Auftrags-ID klicken. Das Panel enthält Unterregisterkarten für die *Historie des Auftrags* und das *Prüfungsprotokoll*.

### Auftrag Historie

- die **Auftrags-ID** ist die eindeutige Kennung, die einem Auftrag zugeordnet ist. Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, werden die Auftragsvariablen angezeigt.
- **Label** zeigt die letzte Position eines Auftrags im Arbeitsablauf an. Benutzer können den Arbeitsabläufen *Labels* zuweisen, die dann angezeigt werden, andernfalls wird die technische Position angezeigt.
- der **Status der Historie** zeigt das letzte Ergebnis im Leben des Auftrags an.
  - Wenn Aufträge abgeschlossen sind, lautet der *Historie-Status* *Erfolgreich* oder *Fehlgeschlagen*.
  - Wenn Aufträge noch nicht abgeschlossen sind, lautet der *Status der Historie* *in Bearbeitung*.
- **Planungszeit** gibt das ursprüngliche Datum und die Uhrzeit an, für die der Auftrag geplant war.
- **Startzeit** gibt das Datum und die Uhrzeit an, zu der der Auftrag tatsächlich begonnen hat.
- **Endzeit** gibt das Datum und die Uhrzeit an, zu der der Auftrag abgeschlossen wurde.

#### Zugriff auf die Protokollausgabe

- **Auftrags-ID**: Wenn Sie im Bereich *Historie* auf die *Auftrags-ID* klicken, wird die Protokollausgabe des Auftrags auf [Anzeige Auftragsprotokoll](/order-log) angezeigt. Das Protokoll enthält die Ausgabe, die von allen mit dem Arbeitsablauf ausgeführten Aufträgen erstellt wurde.
- **Download-Symbol**: Wenn Sie auf das Symbol klicken, wird das Protokoll des Auftrags in eine Datei heruntergeladen.

Standardmäßig ist die Anzeige von Auftragsprotokollen auf eine Größe von 10 MB begrenzt, ansonsten werden die Protokolle in Dateien heruntergeladen. Die Benutzer können das Limit auf der Seite [Einstellungen - JOC Cockpit](/settings-joc) anpassen.

### Audit Log

Das *Audit Log* zeigt an, welche Änderungen an einem Auftrag vorgenommen wurden.

- **Erstellt** gibt das Datum an, an dem die Operation durchgeführt wurde.
- **Konto** gibt das Benutzerkonto an, das den Vorgang durchgeführt hat.
- **Anfrage** gibt den REST-API-Endpunkt an, der aufgerufen wurde.
- **Category** gibt die Klassifizierung des Vorgangs an, z.B. CONTROLLER bei der Stornierung von Aufträgen oder DAILYPLAN bei der Erstellung von Aufträgen aus der [Tagesplan](/daily-plan).
- **Grund** erklärt, warum ein Auftrag geändert wurde. Das JOC Cockpit kann so konfiguriert werden, dass die Angabe von Gründen bei der Änderung von Objekten erzwungen wird.
  - Die Einstellung ist unter [Profil - Einstellungen](/profile-preferences) verfügbar.
  - Die Einstellung kann über die Seite [Einstellungen - JOC Cockpit](/settings-joc) erzwungen werden.
- **Aufgewandte Zeit** Ähnlich wie bei der Angabe von *Gründen* kann bei der Änderung von Aufträgen die für einen Vorgang aufgewendete Zeit hinzugefügt werden.
- **Ticket Link** Ähnlich wie bei der Angabe von *Gründe* kann bei der Änderung von Aufträgen ein Verweis auf ein Ticketsystem hinzugefügt werden.

## Vorgänge

### Vorgänge bei Aufträgen

Für jeden Auftrag gibt es ein Aktionsmenü, das die für den jeweiligen Auftrag verfügbaren Operationen enthält.

Für Aufträge im Zustand *anhängig*, *geplant*, *in Bearbeitung*, *laufend*, *ausgesetzt*, *auffordernd*, *wartend*, *gescheitert* werden die folgenden Operationen angeboten:

- **Priorität ändern** 
  - Wenn ein Auftrag im Arbeitsablauf auf eine *Ressourcensperre* trifft, die die Parallelität einschränkt, dann bestimmt seine *Priorität* die Position in der Warteschlange der *wartenden* Aufträge.
  - die *Prioritäten* werden durch negative, null und positive Ganzzahlen oder durch die angebotenen Abkürzungen festgelegt. Eine höhere *Priorität* hat Vorrang. Die Abkürzungen bieten die folgenden Werte:
    - **Niedrig**: -20000
    - **Niedrig Normal**: -10000
    - **Normal**: 0
    - **Über Normal**: 10000
    - **Hoch**: 20000
- mit **Abbrechen** wird der Auftrag abgebrochen. Laufende Aufträge beenden den aktuellen Auftrag oder die aktuelle Arbeitsablauf-Anweisung und verlassen den Arbeitsablauf mit einem fehlgeschlagenen Historie-Status.
- **Abbrechen/Aufgabe beenden** beendet zwangsweise Aufträge, die einen Auftrag ausführen. Aufträge verlassen den Arbeitsablauf mit dem Status "Historie fehlgeschlagen".
- **Abbrechen/Zurücksetzen** beendet zwangsweise Aufträge, die einen Auftrag ausführen. Aufträge verlassen den Arbeitsablauf mit einem fehlgeschlagenen Status in der Historie.
- **Aussetzen** setzt den Auftrag aus. Laufende Aufträge werden angehalten, nachdem sie den aktuellen Auftrag oder Arbeitsablauf abgeschlossen haben.
- **Aussetzen/Aufgabe beenden** beendet laufende Aufträge zwangsweise und setzt die Aufträge aus.
- **Aussetzen/Zurücksetzen** setzt die aktuelle Arbeitsablauf-Anweisung sofort zurück und versetzt den Auftrag in den Zustand *Ausgesetzt*. Diese Option kann mit dem erzwungenen Beenden von Aufgaben für *laufende* Aufträge kombiniert werden.
- **Fortsetzen** setzt einen *ausgesetzten* oder *gescheiterten* wiederaufnehmbaren Auftrag fort.

Für Aufträge im Zustand *erledigt* und für unterbrochene Aufträge im Zustand *gescheitert* werden die folgenden Operationen angeboten:

- **Arbeitsablauf verlassen** wird den Auftrag beenden. 
  - *Erledigte* Aufträge verlassen den Arbeitsablauf mit dem Status *Erfolgreich* in der Historie.
  - *Fehlgeschlagene/gestörte* Aufträge verlassen den Arbeitsablauf mit dem Status *Fehlgeschlagen* in der Historie.

Es können zusätzliche Operationen verfügbar sein, die für den Status des Auftrags spezifisch sind.

### Bulk-Operationen

Massenoperationen stehen zur Verfügung, wenn Sie Aufträge aus verbundenen Kontrollkästchen auswählen. Sie bieten die gleichen Funktionen wie für einzelne Aufträge.

Wenn Sie Aufträge auswählen, werden im oberen Teil des Fensters Schaltflächen für Massenoperationen sichtbar, die ähnliche Beschriftungen haben wie die oben beschriebenen Operationen.

## Filter

Benutzer können Filter anwenden, um die Anzeige von Aufträgen einzuschränken. Die Schaltflächen für die Filter sind oben im Fenster verfügbar.

### Schaltfläche Datumsbereich Filter

Über die Dropdown-Schaltfläche können Sie Aufträge aus einem Datumsbereich auswählen:

- **Alle** gibt an, dass Aufträge, die für ein beliebiges vergangenes oder zukünftiges Datum geplant sind, angezeigt werden.
- **Heute** Aufträge beziehen sich auf den aktuellen Tag, der anhand der Zeitzone auf [Profil - Einstellungen](/profile-preferences) berechnet wird.
- **Nächste Stunde** enthält Aufträge, die innerhalb der nächsten Stunde beginnen sollen.
- **Nächste 12 Stunden** enthält Aufträge, die innerhalb der nächsten 12 Stunden beginnen sollten.
- **Nächste 24 Stunden** enthält Aufträge, die innerhalb der nächsten 24 Stunden beginnen sollten.
- **Nächster Tag** enthält Aufträge, die bis zum Ende des nächsten Tages beginnen sollten.
- **Nächste 7 Tage** enthält Aufträge, die innerhalb der nächsten 7 Tage beginnen sollten.

### Schaltflächen für den Statusfilter

Ähnlich wie bei der *Auswahltafel für Auftragsstatus* steht Ihnen eine Filterschaltfläche pro Auftragsstatus zur Verfügung, um die Anzeige der Aufträge zu filtern.

### Von ... Bis Datum Eingabefilter

Für Aufträge in den Zuständen *in Bearbeitung*, *laufend*, *gescheitert*, *abgeschlossen* stehen Eingabefelder zur Verfügung, in denen Sie das Datum und die Uhrzeit angeben können, für die ein Auftrag den entsprechenden Zustand hat.

Sie können absolute oder relative Daten und Uhrzeiten angeben.

### Ergebnisfilter

Der Filter beschränkt die Anzeige auf übereinstimmende *Auftrags-IDs* und *Arbeitsablauf-Namen*. Der Filter wird auf sichtbare Aufträge angewendet und unterscheidet nicht zwischen Groß- und Kleinschreibung.

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Tagesplan](/daily-plan)
- [Anzeige Auftragsprotokoll](/order-log)
- [Order State](/order-states)
- [Profil - Einstellungen](/profile-preferences)
- [Einstellungen - JOC Cockpit](/settings-joc)
- [Workflows - Add Orders](/workflows-orders-add)

### Product Knowledge Base

- [JS7 - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Orders)

