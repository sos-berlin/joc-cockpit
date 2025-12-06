# Konfiguration - Inventar - Berichtsvorlagen

Im *Berichtsvorlage* Panel können Sie Vorlagen für Berichte über die Ausführung von Arbeitsabläufen und Aufträgen erstellen:

- Berichtsvorlagen werden über das Inventar verwaltet, das in der Ansicht *Konfiguration* des JOC Cockpit verfügbar ist. Sie umfassen die Angabe von:
  - **Berichtsmuster**, das den Berichtstyp angibt, z.B. die Top 10 der fehlgeschlagenen Arbeitsabläufe, die Top 100 der fehlgeschlagenen Jobs usw. Die vollständige Liste finden Sie unter [Berichtsmuster](/report-templates).
  - **Berichtszeitraum** ist ein Datumsbereich, für den Elemente gemeldet werden. Datumsbereiche können absolut oder relativ sein, z.B. letzte 2 Monate, letztes Quartal, letztes Jahr.
  - die **Berichtsfrequenz** unterteilt den *Berichtszeitraum* in gleiche Zeiteinheiten, z.B. pro Woche oder Monat.
- Berichtsläufe und die Visualisierung von Berichten sind in der Ansicht *Berichte* von JOC Cockpit verfügbar.

Berichte werden über die folgenden Panels verwaltet:

- Der [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters ermöglicht die Navigation durch die Ordner, in denen sich die Berichtsvorlagen befinden. Außerdem bietet das Panel die Möglichkeit, Berichtsvorlagen zu bearbeiten.
- Das *Berichtsvorlage* Panel auf der rechten Seite des Fensters enthält Details zur Berichtskonfiguration.

## Berichtsvorlage Panel

Für eine Berichtsvorlage sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Berichts, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** erklärt den Zweck des Berichts. 
- **Berichtsmuster** gibt das verwendete [Berichtsmuster](/report-templates) an.
- **Berichtszeitraum** gibt den Datumsbereich an, der einer der folgenden ist:
  - **Von .. bis**
    - *Monat von*, *Monat bis* gibt die Anzahl der vergangenen Monate an, mit denen der *Berichtszeitraum* beginnt und mit denen er endet, zum Beispiel von *1m* bis *1m* für den letzten Monat.
  - **Berechnet**
    - *Einheit* ist eine von *Jahr*, *Monat*, *Quartal*
    - *Von* gibt die Anzahl der vergangenen Einheiten an, ab der der *Berichtszeitraum* beginnen soll, z.B. *3 Monate* zurück.
    - *Anzahl* gibt die Anzahl der vergangenen Einheiten an, mit denen der *Berichtszeitraum* endet.
  - **Voreinstellung** bietet die Auswahl aus einer Reihe vordefinierter Datumsbereiche wie *Letzter Monat*, *Dieses Quartal*, *Letztes Quartal*, *Dieses Jahr*, *Letztes Jahr*
- **Sortieren**
  - **Höchste**: Der Bericht gibt die n höchsten Werte aus.
  - **Niedrigste**: Der Bericht zeigt die n niedrigsten Werte an.
- **Berichtsfrequenz** gibt die Einteilung des *Berichtszeitraums* in gleiche Zeiteinheiten an:
  - *wöchentlich*
  - *alle 2 Wochen*
  - *monatlich*
  - *alle 3 Monate*
  - *alle 6 Monate*
  - *jährlich*

## Operationen für Berichte

Für allgemeine Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

Operationen für Berichte sind in den folgenden Ansichten verfügbar:

- Berichte werden in der Ansicht [Berichtsgenerierung](/report-creation) erstellt.
- Die Ausführung von Berichten ist über die Ansicht [Berichte - Historie Berichtsläufe](/report-run-history) möglich.
- Berichte werden in der Ansicht [Berichte](/reports) visualisiert.

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Regeln zur Benennung von Objekten](/object-naming-rules)
- [Berichte](/reports)
- [Berichtsgenerierung](/report-creation)
- [Berichte - Historie Berichtsläufe](/report-run-history)
- [Berichtsmuster](/report-templates)

### Product Knowledge Base

- [JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)
- [JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
- [JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)

