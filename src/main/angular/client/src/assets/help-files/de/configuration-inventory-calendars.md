# Konfiguration - Inventar - Kalender

Das *Kalender-Panel* bietet die Möglichkeit, regelbasierte Kalender festzulegen, die von [Configuration - Inventory - Schedules](/configuration-inventory-schedules) für die Erstellung von Aufträgen aus [Daily Plan](/daily-plan) verwendet werden. Details finden Sie unter [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars).

- In den Kalendern werden die Tage festgelegt, an denen Workflows ausgeführt werden.
  - **Arbeitstagskalender** legen die Tage für die Ausführung des Workflows fest.
  - **Nicht-Arbeitstag-Kalender** geben Tage an, an denen Workflows nicht ausgeführt werden.
- Zeitpläne 
  - enthalten Referenzen auf eine beliebige Anzahl von Arbeitstagskalendern und Nicht-Arbeitstagskalendern, die zusammengeführt werden, um die Liste der resultierenden Tage zu erhalten.
  - bestimmen den Zeitpunkt, an dem die Ausführung von Aufträgen für Workflows beginnt. 

Kalender werden über die folgenden Fenster verwaltet:

- Die Seite [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) auf der linken Seite des Fensters bietet eine Navigation durch die Ordner mit den Kalendern. Außerdem bietet das Panel Operationen mit Kalendern.
- Die *Kalendertafel* auf der rechten Seite des Fensters enthält Details zur Kalenderkonfiguration.

## Kalender-Panel

Für einen Kalender sind die folgenden Eingaben möglich:

- **Name** ist der eindeutige Bezeichner eines Kalenders, siehe [Object Naming Rules](/object-naming-rules).
- **Titel** enthält eine optionale Erklärung zum Zweck des Kalenders.
- **Typ** ist ein Kalender mit Arbeitstagen oder ein Kalender ohne Arbeitstage.
- **Gültig von**, **Gültig bis** geben optional die Gültigkeitsdauer eines Kalenders an. Vor und nach der Gültigkeit liefert ein Kalender keine resultierenden Tage. Wenn keine Gültigkeitsdauer angegeben wird, ist der Kalender unbegrenzt gültig.

### Frequenzen

Häufigkeiten gibt es in zwei Varianten, die kombiniert werden können:

- **Eingeschlossene Häufigkeiten** geben positive Tage an.
- **Ausgenommene Häufigkeiten** geben Tage an, die aus der Liste der resultierenden Tage entfernt werden.

Das bedeutet, dass *Ausgenommene Häufigkeiten* die Verwendung der angegebenen Daten verweigern und die *Eingeschlossenen Häufigkeiten* an übereinstimmenden Tagen außer Kraft setzen.

Betrachten Sie das Beispiel eines Arbeitstagskalenders:

- Nehmen Sie eine *Eingeschlossene Häufigkeit* von Mo-Fr an.
- Nehmen Sie eine *Ausgenommene Häufigkeit* für nationale Feiertage wie den 1. Januar und den 1. Mai an.
- Bei Verwendung mit Zeitplänen, die die Eigenschaft **am arbeitsfreien Tag** mit dem Wert
  - **vor dem arbeitsfreien Tag** 
    - wenn der 1. Januar ein Montag ist, dann wird der Auftrag für den vorhergehenden Sonntag erstellt, der nicht in den *Eingeschlossenen Frequenzen* und nicht in den *Ausgeschlossenen Frequenzen* enthalten ist. 
    - wenn der 1. Januar ein Samstag ist, dann wird keine Order erstellt, da der vorherige arbeitsfreie Tag der Freitag ist, für den eine Order aus den *Inbegriffenen Frequenzen* erstellt wird.
  - **nach arbeitsfreiem Tag**
    - wenn der 1. Januar ein Samstag ist, dann wird die Order für den nächsten Sonntag erstellt, der nicht zu den *Eingeschlossenen Frequenzen* und nicht zu den *Ausgeschlossenen Frequenzen* gehört. 
    - wenn der 1. Januar ein Sonntag ist, wird keine Order erstellt, da der nächste arbeitsfreie Tag der Montag ist, für den eine Order aus den *Inbegriffenen Frequenzen* erstellt wird.

Für die Verwendung mit Kalendern für arbeitsfreie Tage gelten entsprechende Regeln: *Enthaltene Frequenzen* geben arbeitsfreie Tage an, *Ausgenommene Frequenzen* geben Arbeitstage an.

Ein Kalender kann eine beliebige Anzahl von *Frequenzen* enthalten, die zusammengeführt werden. Die Schaltfläche *Frequenz hinzufügen* wird für jede der *Eingeschlossenen Frequenzen* und *Ausgeschlossenen Frequenzen* angeboten.

#### Frequenztypen

Beim Hinzufügen von *Frequenzen* können Sie eine Reihe von Typen auswählen:

  - **Wochentage** geben den Wochentag an.
  - **Bestimmte Wochentage** geben relative Wochentage an, z.B. den ersten oder letzten Montag eines Monats.
  - **Bestimmte Tage** geben die Tage des Jahres an.
  - **Monatstage** geben relative Tage in einem Monat an, z.B. den ersten oder letzten Tag eines Monats.
  - **Jeder** gibt wiederkehrende Zeiträume an, z.B. jeden 2. Tag, jede 1. Woche, jeden 3. Dazu müssen Sie das Datum *Gültig ab* angeben, ab dem die Tage gezählt werden.
  - **Nationale Feiertage** gibt bekannte Feiertage an. Die daraus resultierenden Tage sind nicht verbindlich und können von der lokalen Gesetzgebung abweichen.
  - **Kalender für arbeitsfreie Tage** schließen die entsprechenden Tage aus den Kalendern für arbeitsfreie Tage für den aktuellen Kalender aus.

*Häufigkeitstypen* können durch wiederholte Anwendung des gleichen oder eines anderen *Häufigkeitstyps* kombiniert werden.

#### Beispiel

Nehmen wir das Beispiel eines Kalenders, der jeden 2:

- Angenommen, Mo-Fr sind Arbeitstage, Sa-So sind arbeitsfreie Tage.
- Angenommen, der 1. Januar und der 1. Mai sind nationale Feiertage.

Bei der Zählung jedes 2. Arbeitstages sollten Wochenenden und Feiertage ausgeschlossen werden:

- Erstellen Sie einen Arbeitstagskalender mit
  - *Eingeschlossene Frequenzen*: Fügen Sie den **Wochentage** *Häufigkeitstyp* hinzu und wählen Sie *Jeder Tag*. Das Ergebnis wird alle Tage des Jahres enthalten.
  - *Ausgenommene Frequenzen*: Fügen Sie **Jeder** *Häufigkeitstyp* hinzu und wählen Sie *2* für das Intervall und *Tage* für die Einheit. Geben Sie das Datum *Gültig ab* an. Dadurch werden die resultierenden Tage halbiert.
  - *Ausgenommene Häufigkeiten*: Fügen Sie den *Frequenztyp **Nationale Feiertage** hinzu und wählen Sie Ihr *Land* und *Jahr*. Dies schränkt die resultierenden Tage weiter ein.

Prüfen Sie die Ergebnisse über die Schaltfläche *Vorschau anzeigen*, die Ihnen jeden 2. Werktag ohne Wochenenden und Feiertage anzeigen sollte.

Eine alternative Lösung besteht darin, den *Häufigkeitstyp* **Jeder** in der *Einschränkung* eines Zeitplans anzugeben.

## Operationen an Kalendern

Für verfügbare Operationen siehe [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

## Referenzen

### Kontext-Hilfe

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Configuration - Inventory - Schedules - Run-time](/configuration-inventory-schedules-run-time)
- [Daily Plan](/daily-plan)
- [Object Naming Rules](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)

