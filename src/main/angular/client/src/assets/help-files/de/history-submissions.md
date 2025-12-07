# Übermittlungshistorie

Die *Historie der Übermittlungen* verfolgt die von [Tagesplan](/daily-plan) übermittelten Aufträge.

Aufträge werden durch den Tagesplan in zwei Schritten erstellt: zuerst werden sie *geplant*, dann werden sie an den Controller und die Agenten *übermittelt*. Die Übermittlung beinhaltet, dass die Aufträge selbstständig auf den Agenten gestartet werden.

Die *Übermittlungshistorie* unterliegt der Bereinigung der Datenbank, die vom [Bereinigungsdienst](/service-cleanup) durchgeführt wird.

## Bereich: Übermittlungshistorie

Die Anzeige ist in Blöcken pro Tagesplandatum, pro Übermittlung und inklusive Aufträge gruppiert.

Die Anzeige ist auf maximal 5000 Einträge begrenzt, wenn nicht anders in [Profil - Einstellungen](/profile-preferences) angegeben.

### Historie des Tagesplans

Die folgenden Informationen werden pro Tagesplandatum angezeigt.

- **Datum des Tagesplans** zeigt den Tag an, für den die Aufträge geplant sind.
- **Summe** zeigt die Anzahl der Aufträge an, die für das jeweilige Datum übermittelt wurden.
- **Anzahl Übermittlungen** zeigt die Anzahl der erfolgreich übermittelten Aufträge an.
  - Wenn die Zahl der *Anzahl* entspricht, wurden alle Aufträge erfolgreich übermittelt.
  - Liegt die Zahl über Null, aber unter der *Anzahl*, dann impliziert dies, dass
    - die Einstellung, dass Aufträge einzeln übermittelt werden, aktiv ist, siehe [Einstellungen - Tagesplan](/settings-daily-plan) und
    - eine Anzahl von Aufträgen nicht übermittelt werden konnte.
  - Wenn die Zahl Null ist, bedeutet dies
    - dass die Einstellung für die individuelle Übermittlung von Aufträgen nicht aktiviert ist, siehe [Einstellungen - Tagesplan](/settings-daily-plan), und/oder
    - nicht alle Aufträge übermittelt werden konnten.

### Historie der Übermittlungen

Für ein bestimmtes Tagesplandatum kann es eine beliebige Anzahl von Übermittlungen geben. Wenn Benutzer Änderungen an Inventarobjekten wie Arbeitsabläufen und Zeitplänen vornehmen und die Option wählen, den Tagesplan zu aktualisieren, wird eine Übermittlung für die betreffenden Objekte hinzugefügt.

Wenn Sie auf das Pfeil-nach-unten-Symbol neben dem *Datum des Tagesplans* klicken, werden Details zu jeder Übermittlung angezeigt:

- **Summe in Übermittlungen** zeigt die Anzahl der Aufträge an, die Gegenstand der Übermittlungen sind.
- **Anzahl in Übermittlungen** zeigt die Anzahl der erfolgreich übermittelten Aufträge im Rahmen der jeweiligen Übermittlung an.
  - Wenn die Zahl der *Anzahl Übermittlungen* entspricht, wurden alle Aufträge erfolgreich übermittelt.
  - Wenn die Zahl Null oder größer als Null ist, gelten die vorherigen Erklärungen zu den Übermittlungen pro Tagesplandatum.

### Historie der Übermittlungen pro Auftrag

Wenn Sie auf das Pfeil-nach-unten-Symbol des *Übermittlungsdatums* klicken, werden Details pro Auftrag angezeigt:

- **Meldung** kann eine Fehlermeldung anzeigen, wenn die Einreichung fehlgeschlagen ist.
- **Auftragskennung** ist die eindeutige Kennung, die einem Auftrag zugeordnet ist.
- **Arbeitsablauf** gibt den Arbeitsablauf an, den der Auftrag durchläuft.
  - Wenn Sie auf den Namen des Arbeitsablaufs klicken, gelangen Sie zur Ansicht [Arbeitsabläufe](/workflows).
  - Wenn Sie auf das Bleistiftsymbol klicken, gelangen Sie zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).
- **Geplant für** gibt das Datum und die Uhrzeit an, zu der der Auftrag voraussichtlich starten wird.
- **Status** ist einer der Werte *Übermittelt* oder *Nicht übermittelt*.
  - *Übermittelt* zeigt an, dass der Auftrag bei einem Agenten verfügbar ist.
  - *Nicht übermittelt* bedeutet, dass die Übermittlung fehlgeschlagen ist.

## Filter

Benutzer können Filter anwenden, die oben im Fenster verfügbar sind, um die Anzeige von Tagesplandaten und Übermittlungen einzuschränken.

- die Filterschaltflächen **Übermittelt**, **Nicht übermittelt** beschränken die Anzeige auf Übermittlungen mit dem entsprechenden Status.
- über die Filterschaltflächen **Datumsbereich** können Sie den Datumsbereich für die Anzeige der Übermittlungen auswählen.
- das Kontrollkästchen **Aktueller Controller** beschränkt die Übermittlungen auf den aktuell ausgewählten Controller.

## Referenzen

### Kontext-Hilfe

- [Arbeitsabläufe](/workflows)
- [Bereinigungsdienst](/service-cleanup)
- [Einstellungen - Tagesplan](/settings-daily-plan)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Profil - Einstellungen](/profile-preferences)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
