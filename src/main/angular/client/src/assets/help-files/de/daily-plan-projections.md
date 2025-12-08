# Tagesplan - Projektion

Der [Tagesplan](/daily-plan) enthält Aufträge, die einige Tage im Voraus an den Controller und die Agenten übermittelt werden, um die Ausfallsicherheit zu gewährleisten. Darüber hinaus bietet er die Projektion zukünftiger Auftragsstartzeiten, die für die nächsten sechs Monate berechnet werden.

Benutzer, die einen längeren Projektionszeitraum wünschen, können die entsprechende Einstellung auf der Seite [Einstellungen - Tagesplan](/settings-daily-plan) ändern.

### Termine, Zeiträume und Zeitzonen

Die Projektion beziehen sich auf die Tage des Tagesplans, nicht auf Kalendertage. 

- Zeiträume
  - Wenn der 24-Stunden-Zeitraum des Tagesplans um Mitternacht beginnt, stimmt er mit dem Kalendertag überein.
  - Bei Tagesplanperioden, die während des Tages beginnen, überschneidet sich der 24-Stunden-Zeitraum mit zwei Kalendertagen.
- Zeitzonen
  - Wenn Zeitpläne andere Zeitzonen verwenden als der Tagesplan, können sich die Startzeiten der Aufträge mit dem vorherigen oder nächsten Tag überschneiden. Solche Aufträge werden mit dem entsprechenden Tagesplandatum angezeigt, zeigen aber Startzeiten für ein anderes Datum an.
  - Die Verwendung von Zeitzonen kann zu Startzeiten von -14 Stunden und +12 Stunden zusätzlich zum 24-Stunden-Zeitraum des Tagesplans führen. Für manche Benutzer ist es überraschend, dass ein Tag nicht 24 Stunden lang ist, sondern bis zu 50 Stunden umfassen kann. Der Zeitraum eines Tages ist immer 24 Stunden lang, da er von der Erdrotation abhängt. Für eine bestimmte Zeitzone gibt es jedoch eine Abdeckung von 50 Stunden, um alle möglichen Zeiten rund um den Planeten zu berücksichtigen.

Alle Tage und Zeiten werden in der Zeitzone angezeigt, die im Profil des Benutzers angegeben ist.

### Anzeigeoptionen

Sie können zwischen der *Monatsansicht* und der *Jahresansicht* der projizierten Aufträge wechseln, indem Sie die entsprechenden Links in der oberen linken Ecke des Fensters verwenden.

Für jeden Tag werden die Nummer des Tages im Monat und die Anzahl der projizierten Aufträge angezeigt:

- **Grüne Aufträge**: Es handelt sich um Aufträge, die an den Controller und die Agenten übermittelt wurden.
- **Orange Aufträge**: Sie zeigen projizierte Aufträge an, die auf der Grundlage von Startzeitregeln berechnet wurden.
- **Invertierte Projektion**:
  - *unmarkiert*: Die Projektion zeigt die Tage an, für die die Aufträge berechnet werden, sowie die Anzahl der Aufträge. Sie können auf einen einzelnen Tag klicken, um die Startzeiten der Aufträge zu sehen.
  - *Aktiviert*: Wenn Sie die Projektion umkehren, werden die Tage hervorgehoben, für die es Zeitpläne gibt, die keine Aufträge erstellen werden. Wenn Sie auf den entsprechenden Tag klicken, werden Zeitpläne ohne Aufträge angezeigt.

### Erweiterter Filter

Der Filter bietet die Möglichkeit, die Anzeige von Aufträgen auf bestimmte Ordner mit Arbeitsabläufen oder Zeitplänen zu beschränken.

## Operationen für Projektionen

### Projektion erstellen

- Projektionen werden vom Tagesplandienst während seines täglichen Laufs berechnet. Spätere Änderungen am Tagesplan während des Tages werden nicht berücksichtigt.
- Sie können die Projektionen bei Bedarf über die entsprechende Schaltfläche neu erstellen.
- Das *Erhebungsdatum* zeigt das Erstellungsdatum der aktuellen Tagesplanprojektion an.

### Projektion exportieren

Projektionen können in eine .xlsx-Datei exportiert werden, wobei das Datum des Tagesplans auf der x-Achse und der Arbeitsablauf und der Zeitplan auf der y-Achse angezeigt werden.

- Mit der Operation *Exportieren der sichtbaren Aufträge* exportieren Sie die im Fenster dargestellten Aufträge. 
- Über die Schaltfläche *Exportieren* können Sie die zu exportierenden Aufträge auswählen:
  - **Startdatum**, **Enddatum**: Erstes und letztes Tagesplandatum, für das die Aufträge exportiert werden sollen.
  - **Arbeitsabläufe**, **Zeitpläne**: Benutzer können den Export auf bestimmte Zeitpläne und Arbeitsabläufe beschränken, die optional durch Ordner eingeschränkt werden können.
  - **Invertierte Projektion**: 
    - *Unmarkiert*: Exportiert Tage, für die Aufträge berechnet werden.
    - *Aktiviert*: Exportiert Tage, für die keine Aufträge berechnet werden. Damit können Sie überprüfen, ob Nicht-Arbeitstage berücksichtigt werden.

## Referenzen

- [Einstellungen - Tagesplan](/settings-daily-plan)
- [Tagesplan](/daily-plan)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
