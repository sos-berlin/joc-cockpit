# Konfiguration - Inventar - Kalender

Der Bereich *Kalender* bietet die Möglichkeit, regelbasierte Kalender festzulegen, die von [Konfiguration - Inventar - Zeitpläne](/configuration-inventory-schedules) für die Erstellung von Aufträgen aus dem [Tagesplan](/daily-plan) verwendet werden. Details finden Sie unter [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).

- In den Kalendern werden die Tage festgelegt, an denen Arbeitsabläufe ausgeführt werden.
  - **Arbeitstagskalender** legen die Tage für die Ausführung des Arbeitsablaufs fest.
  - **Nicht-Arbeitstagskalender** geben Tage an, an denen Arbeitsabläufe nicht ausgeführt werden.
- Zeitpläne 
  - enthalten Referenzen auf eine beliebige Anzahl von Arbeitstagskalendern und Nicht-Arbeitstagskalendern, die zusammengeführt werden, um die Liste der resultierenden Tage zu erhalten.
  - bestimmen den Zeitpunkt, an dem die Ausführung von Aufträgen für Arbeitsabläufe beginnt. 

Kalender werden über die folgenden Fenster verwaltet:

- Der [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner mit den Kalendern und Operationen für Kalender.
- Der Bereich *Kalender* auf der rechten Seite des Fensters zeigt Details zur Kalenderkonfiguration.

## Bereich: Kalender

Für einen Kalender sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Kalenders, siehe [Regeln zur Benennung von Objekten](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung zum Zweck des Kalenders.
- **Typ** ist ein Kalender mit Arbeitstagen oder ein Kalender mit Nicht-Arbeitstagen.
- **Gültig von**, **Gültig bis** geben optional die Gültigkeitsdauer eines Kalenders an. Vor und nach der Gültigkeit liefert ein Kalender keine resultierenden Tage. Wenn keine Gültigkeitsdauer angegeben wird, ist der Kalender unbegrenzt gültig.

### Häufigkeiten

Häufigkeiten gibt es in zwei Varianten, die kombiniert werden können:

- **Eingeschlossene Häufigkeiten** geben positive Tage an, an denen Arbeitsabläufe ausgeführt werden.
- **Ausgeschlossene Häufigkeiten** geben Tage an, die aus der Liste der resultierenden Tage entfernt werden.

Das bedeutet, dass *Ausgeschlossene Häufigkeiten* die Verwendung der angegebenen Tage verweigern und die *Eingeschlossenen Häufigkeiten* an übereinstimmenden Tagen außer Kraft setzen.

Betrachten Sie das Beispiel eines Arbeitstagskalenders:

- Nehmen Sie eine *Eingeschlossene Häufigkeit* von Mo-Fr an.
- Nehmen Sie eine *Ausgeschlossene Häufigkeit* für nationale Feiertage wie den 1. Januar und den 1. Mai an.
- Bei Verwendung mit Zeitplänen, nimmt die Eigenschaft **bei Nicht-Arbeitstag** einen der Werte an:
  - **vor Nicht-Arbeitstag** 
    - wenn der 1. Januar ein Montag ist, dann wird der Auftrag für den vorhergehenden Sonntag erstellt, der nicht in den *Eingeschlossenen Häufigkeiten* und nicht in den *Ausgeschlossenen Häufigkeiten* enthalten ist. 
    - wenn der 1. Januar ein Samstag ist, dann wird kein Auftrag erstellt, da der vorherige Arbeitstag der Freitag ist, für den ein Auftrag aus den *Eingeschlossenen Häufigkeiten* erstellt wird.
  - **nach Nicht-Arbeitstag**
    - wenn der 1. Januar ein Samstag ist, dann wird der Auftrag für den nächsten Sonntag erstellt, der nicht zu den *Eingeschlossenen Häufigkeiten* und nicht zu den *Ausgeschlossenen Häufigkeiten* gehört. 
    - wenn der 1. Januar ein Sonntag ist, wird kein Auftrag erstellt, da der nächste Arbeitstag der Montag ist, für den ein Auftrag aus den *Eingeschlossenen Häufigkeiten* erstellt wird.

Für die Verwendung von Kalendern für Nicht-Arbeitstage gelten entsprechende Regeln: *Eingeschlossene Häufigkeiten* geben Nicht-Arbeitstage an, *Ausgeschlossene Häufigkeiten* geben Arbeitstage an.

Ein Kalender kann eine beliebige Anzahl von *Häufigkeiten* enthalten, die zusammengeführt werden. Die Schaltfläche *Häufigkeit hinzufügen* wird für jede der *Eingeschlossenen Häufigkeiten* und *Ausgeschlossenen Häufigkeiten* angeboten.

#### Häufigkeitstypen

Beim Hinzufügen von *Häufigkeiten* können Sie aus einer Reihe von Typen auswählen:

  - **Wochentage** geben den Wochentag Mo-So an.
  - **Bestimmte Wochentage** geben relative Wochentage an, z.B. den ersten oder letzten Montag eines Monats.
  - **Bestimmte Tage** geben die Tage des Jahres an.
  - **Monatstage** geben relative Tage in einem Monat an, z.B. den ersten oder letzten Tag eines Monats.
  - **Jeder** gibt wiederkehrende Zeiträume an, z.B. jeden 2. Tag, jede 1. Woche, jeden 3. Monat. Dazu müssen Sie das Datum *Gültig ab* angeben, ab dem die Tage gezählt werden.
  - **Nationale Feiertage** geben bekannte Feiertage an. Die daraus resultierenden Tage sind nicht verbindlich und können von der lokalen Gesetzgebung abweichen.
  - **Kalender für Nicht-Arbeitstage** schließen die entsprechenden Tage aus den Arbeitstagen eines Arbeitstagskalenders aus.

*Häufigkeitstypen* können durch wiederholte Anwendung des gleichen oder eines anderen *Häufigkeitstyps* kombiniert werden.

#### Beispiel

Nehmen wir das Beispiel eines Kalenders, der jeden 2. Arbeitstag liefert:

- Angenommen, Mo-Fr sind Arbeitstage, Sa-So sind Nicht-Arbeitstage.
- Angenommen, der 1. Januar und der 1. Mai sind nationale Feiertage.

Bei der Zählung jedes 2. Arbeitstages sollten Wochenenden und Feiertage ausgeschlossen werden:

- Erstellen Sie einen Arbeitstagskalender mit
  - *Eingeschlossenen Häufigkeiten*: Fügen Sie den **Wochentage** *Häufigkeitstyp* hinzu und wählen Sie *Jeder Tag*. Das Ergebnis wird alle Tage des Jahres enthalten.
  - *Ausgeschlossenen Häufigkeiten*: Fügen Sie **Jeder** *Häufigkeitstyp* hinzu und wählen Sie *2* für das Intervall und *Tage* für die Einheit. Geben Sie das Datum *Gültig ab* an. Dadurch werden die resultierenden Tage halbiert.
  - *Ausgeschlossenen Häufigkeiten*: Fügen Sie den Häufigkeitstyp **Nationale Feiertage** hinzu und wählen Sie Ihr *Land* und *Jahr*. Dies schränkt die resultierenden Tage weiter ein.

Prüfen Sie die Ergebnisse über die Schaltfläche *Vorschau anzeigen*, die Ihnen jeden 2. Werktag ohne Wochenenden und Feiertage anzeigen wird.

Eine alternative Lösung besteht darin, den *Häufigkeitstyp* **Jeder** in der *Einschränkung* eines Zeitplans anzugeben.

## Operationen für Kalender

Für verfügbare Operationen siehe [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation).

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Navigationsbereich](/configuration-inventory-navigation)
- [Konfiguration - Inventar - Zeitpläne - Startzeitregel](/configuration-inventory-schedules-run-time)
- [Regeln zur Benennung von Objekten](/object-naming-rules)
- [Tagesplan](/daily-plan)

### Product Knowledge Base

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
