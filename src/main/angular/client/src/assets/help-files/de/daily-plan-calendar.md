# Tagesplan-Kalender

Über den Tagesplan-Kalender sind eine Reihe von Vorgängen verfügbar. 

Für allgemeine Operationen, die über den Tagesplan verfügbar sind, siehe [Tagesplan](/daily-plan).

## Einzelnes Datum auswählen

Wenn Sie auf ein Kalenderdatum klicken, werden die für das ausgewählte Datum verfügbaren Aufträge angezeigt.

## Mehrere Daten auswählen

So wählen Sie eine Reihe von Terminen

- halten Sie die Maus gedrückt und ziehen Sie, um den Datumsbereich auszuwählen,
- oder drücken Sie die Strg-Taste und wählen Sie Start- und Enddatum per Mausklick aus,
- oder klicken Sie auf das Kalendersymbol und wählen Sie Start- und Enddatum per Mausklick aus.

Die ausgewählten Daten werden hervorgehoben und die Schaltflächen *Auftrag entfernen* und *Auftrag stornieren* werden unterhalb des Hauptmenüs verfügbar.

Die folgenden Filterschaltflächen schränken den Umfang der Operationen ein: 

- **Alle**: Die Operation kann auf Aufträge mit beliebigem Status angewendet werden.
- **Geplant**: Die Operationen *Einsenden* und *Entfernen* können auf *geplante* Aufträge angewandt werden, die noch nicht an den Controller *eingegeben* wurden.
- **Eingereicht**: Die Operation *Abbrechen* kann auf Aufträge angewandt werden, die dem Controller und den Agenten *vorgelegt* wurden.
- **Erledigt**: Die Operation *Abbrechen* kann auf Aufträge angewandt werden, die abgeschlossen wurden.
- **Spät** ist ein zusätzlicher Filter über den Auftragsstatus, der anzeigt, dass Aufträge später als erwartet gestartet wurden.

### Aufträge stornieren

- Wenn diese Funktion auf *übermittelte* Aufträge im ausgewählten Datumsbereich angewendet wird, werden die Aufträge vom Controller und den Agenten zurückgerufen.
- Bei *eingereichten* oder *abgeschlossenen* Aufträgen werden die Aufträge auf den Status *geplant* gesetzt.
- Bei *geplanten* Aufträgen wird die Operation ignoriert.

### Aufträge entfernen

- Wenn diese Funktion auf *geplante* Orders angewendet wird, werden die Orders aus dem Tagesplan entfernt.
  - Wenn Aufträge aus einem Tagesplan-Datum entfernt werden, werden sie nicht ausgeführt und der Tagesplan-Service wird nicht versuchen, Aufträge zu dem gegebenen Datum hinzuzufügen.
  - Die Operation *Tagesplan löschen* entfernt implizit die Orders. Außerdem werden alle Eingaben für das angegebene Tagesplanungsdatum gelöscht und der nächste Lauf des Tagesplanungsdienstes plant die Aufträge für das angegebene Datum, siehe [Tagesplan löschen](#delete-daily-plan).
- Der Vorgang wird bei *eingereichten* und *abgeschlossenen* Aufträgen ignoriert.

### Tagesplan erstellen

Dieser Vorgang ist über eine Schaltfläche unterhalb des Kalender-Widgets für ein einzelnes Datum und für einen Datumsbereich verfügbar.

- Für die ausgewählten Tage wird der Tagesplan erstellt.
  - Sie haben die Wahl zwischen der Erstellung aller Aufträge oder der Erstellung von Aufträgen aus ausgewählten Zeitplänen und Workflows, optional eingeschränkt durch Ordner.
  - Sie können festlegen, dass bestehende Aufträge aus denselben Zeitplänen ersetzt werden und dass die Aufträge sofort an den Controller übermittelt werden.
  - Sie können Aufträge aus Zeitplänen einbeziehen, die nicht für die Berücksichtigung durch den Tagesplanungsdienst konfiguriert sind.
- Wenn der Tagesplan für ein bestimmtes Datum erstellt wird, plant der nächste Lauf des Tagesplanungsdienstes keine weiteren Aufträge für dasselbe Datum. Der Dienst übermittelt jedoch *geplante* Aufträge im Rahmen der vorausliegenden Tage, für die Aufträge übermittelt werden sollen, siehe Seite [Einstellungen - Tagesplan](/settings-daily-plan).

### Täglichen Plan löschen

Dieser Vorgang ist über eine Schaltfläche unterhalb des Kalender-Widgets für ein einzelnes Datum und für einen Datumsbereich verfügbar.

- Für ausgewählte Tage wird der Tagesplan gelöscht, sofern keine *eingereichten* oder *abgeschlossenen* Aufträge vorhanden sind. Wenn *geplante* Orders vorhanden sind, werden sie mit dem Tagesplan gelöscht.
- Wenn der Tagesplan für ein bestimmtes Datum gelöscht wird, plant der nächste Lauf des Tagesplan-Service Aufträge für dieses Datum, vorausgesetzt, das Datum liegt im Bereich der Tage, für die Aufträge geplant werden, siehe [Einstellungen - Tagesplan](/settings-daily-plan).

## Referenzen

- [Tagesplan](/daily-plan)
- [Einstellungen - Tagesplan](/settings-daily-plan)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)

