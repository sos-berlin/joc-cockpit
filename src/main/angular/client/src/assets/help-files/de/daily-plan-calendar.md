# Tagesplan-Kalender

Über den Tagesplan-Kalender sind eine Reihe von Operationen verfügbar. 

Für allgemeine Operationen, die über den Tagesplan verfügbar sind, siehe [Tagesplan](/daily-plan).

## Einzelnes Datum auswählen

Wenn Sie auf ein Kalenderdatum klicken, werden die für das ausgewählte Datum verfügbaren Aufträge angezeigt.

## Mehrere Tage auswählen

So wählen Sie eine Reihe von Tagen

- halten Sie die Maus gedrückt und ziehen Sie, um den Datumsbereich auszuwählen,
- oder drücken Sie die Strg-Taste und wählen Sie Start- und Enddatum per Mausklick aus,
- oder klicken Sie auf das Kalendersymbol und wählen Sie Start- und Enddatum per Mausklick aus.

Die ausgewählten Tage werden hervorgehoben und die Schaltflächen *Auftrag entfernen* und *Auftrag abbrechen* werden unterhalb des Hauptmenüs verfügbar.

Die folgenden Filterschaltflächen schränken den Umfang der Operationen ein: 

- **Alle**: Die Operation kann auf Aufträge mit beliebigem Status angewendet werden.
- **Geplant**: Die Operationen *Übermitteln* und *Entfernen* können auf *geplante* Aufträge angewandt werden, die noch nicht an den Controller *übermittelt* wurden.
- **Übermittelt**: Die Operation *Abbrechen* kann auf Aufträge angewandt werden, die dem Controller und den Agenten *übermittelt* wurden.
- **Beendet**: Die Operation *Abbrechen* kann auf Aufträge angewandt werden, die abgeschlossen wurden.
- **Verspätet** ist ein zusätzlicher Filter über den Auftragszustand, der anzeigt, dass Aufträge später als erwartet gestartet wurden.

### Aufträge abbrechen

- Wenn diese Funktion auf *übermittelte* Aufträge im ausgewählten Datumsbereich angewendet wird, werden die Aufträge vom Controller und den Agenten zurückgenommen.
- Bei *übermittelten* und *beendeten* Aufträgen werden die Aufträge auf den Status *geplant* gesetzt.
- Bei *geplanten* Aufträgen wird die Operation ignoriert.

### Aufträge entfernen

- Wenn diese Funktion auf *geplante* Aufträge angewendet wird, werden die Aufträge aus dem Tagesplan entfernt.
  - Wenn Aufträge von einem Tagesplandatum entfernt werden, werden sie nicht ausgeführt und der Tagesplandienst wird nicht versuchen, Aufträge zu dem gegebenen Datum ernneut hinzuzufügen.
  - Die Operation *Tagesplan löschen* entfernt implizit die Aufträge. Außerdem werden alle Eingaben für das angegebene Tagesplandatum gelöscht und der nächste Lauf des Tagesplandienstes plant die Aufträge für das angegebene Datum, siehe [Tagesplan löschen](#delete-daily-plan).
- Die Operation wird für *übermittelte* und *beendete* Aufträge ignoriert.

### Tagesplan erstellen

Diese Operation ist über eine Schaltfläche unterhalb des Kalenders für ein einzelnes Datum und für einen Datumsbereich verfügbar.

- Für die ausgewählten Tage wird der Tagesplan erstellt.
  - Sie haben die Wahl zwischen der Erstellung aller Aufträge oder der Erstellung von Aufträgen aus ausgewählten Zeitplänen und Arbeitsabläufen, optional eingeschränkt durch Ordner.
  - Sie können festlegen, dass bestehende Aufträge aus denselben Zeitplänen ersetzt werden und dass die Aufträge sofort an den Controller übermittelt werden.
  - Sie können Aufträge aus Zeitplänen einbeziehen, die nicht für die Berücksichtigung durch den Tagesplandienst konfiguriert sind.
- Wenn der Tagesplan für ein bestimmtes Datum erstellt wird, plant der nächste Lauf des Tagesplandienstes keine weiteren Aufträge für dasselbe Datum. Der Dienst übermittelt jedoch *geplante* Aufträge im Rahmen der vorausliegenden Tage, für die Aufträge übermittelt werden sollen, siehe Seite [Einstellungen - Tagesplan](/settings-daily-plan).

### Tagesplan löschen

Diese Operation ist über eine Schaltfläche unterhalb des Kalenders für ein einzelnes Datum und für einen Datumsbereich verfügbar.

- Für ausgewählte Tage wird der Tagesplan gelöscht, sofern keine *übermittelten* oder *beendeten* Aufträge vorhanden sind. Wenn *geplante* Aufträge vorhanden sind, werden sie mit dem Tagesplan gelöscht.
- Wenn der Tagesplan für ein bestimmtes Datum gelöscht wird, plant der nächste Lauf des Tagesplandienstes Aufträge für dieses Datum, vorausgesetzt, das Datum liegt im Bereich der Tage, für die Aufträge geplant werden, siehe [Einstellungen - Tagesplan](/settings-daily-plan).

## Referenzen

- [Tagesplan](/daily-plan)
- [Einstellungen - Tagesplan](/settings-daily-plan)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)

