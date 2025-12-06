# Einstellungen - Tagesplan

Die folgenden Einstellungen werden auf den [Tagesplan](/daily-plan) angewendet. Änderungen werden sofort wirksam.

Die Seite *Einstellungen* ist über das Symbol ![wheel icon](assets/images/wheel.png) in der Menüleiste zugänglich.

## Einstellungen: Tagesplan

### Einstellung: *time\_zone*, Standard: *UTC*

Gibt die Zeitzone an, die für die Startzeit des [Tagesplandienst](/service-daily-plan) und den Zeitraum des Tagesplans gilt.

### Einstellung: *period_begin*, Standard: *00:00*

Gibt den Beginn der 24-Stunden Tagesplanperiode in der angegebenen Zeitzone an.

### Einstellung: *start\_time*, Voreinstellung: *30 Minuten vor period\_begin*

Gibt die Startzeit für die tägliche Ausführung des Tagesplans in der angegebenen Zeitzone an. Ohne diese Einstellung wird der Tagesplan 30 Minuten vor dem Zeitpunkt ausgeführt, der durch die Einstellung *period\_begin* festgelegt wurde. Diese Einstellung akzeptiert einen Zeitwert, zum Beispiel 23:00:00.

### Einstellung: *days\_ahead\_plan*, Voreinstellung: *7*

Gibt die Anzahl der Tage im Voraus an, für die Aufträge generiert und mit dem Status *geplant* zur Verfügung gestellt werden. Ein Wert von *0* bedeutet, dass keine Aufträge generiert werden sollen und deaktiviert die Funktion.

### Einstellung: *days\_ahead\_submit*, Voreinstellung: *3*

Gibt die Anzahl der Tage im Voraus an, für die *geplante* Aufträge an die Controller übermittelt und im Status *übermittelt* zur Verfügung gestellt werden. Ein Wert von *0* bedeutet, dass keine Aufträge übermittelt werden sollen und deaktiviert die Funktion.

### Einstellung: *submit\_orders\_individually*, Standard: *false*

Der Tagesplandienst übermittelt standardmäßig Aufträge aus einer einzigen Transaktion, die zurückgesetzt wird, wenn die Übermittlung eines Auftrags fehlschlägt. Wenn diese Einstellung aktiviert ist, werden die Aufträge einzeln und unabhängig von der fehlgeschlagenen Übermittlung anderer Aufträge übermittelt. Der Tagesplandienst benötigt mehr Zeit, um Aufträge einzeln zu übermitteln.

### Einstellung: *age\_of\_plans\_to\_be\_closed\_automatically*, Standard: *1*

Legt die Anzahl der Tage fest, nach denen der Tagesplan geschlossen wird und das Hinzufügen von Aufträgen, die Abhängigkeiten für [Ressourcen - Notizbretter](/resources-notice-boards) auflösen, für das ursprüngliche Datum nicht mehr zulässt.

### Einstellung: *projections\_month\_ahead*, Standard: *6*

Gibt die Anzahl der Monate im Voraus an, für die die [Tagesplan - Projektion](/daily-plan-projections) berechnet wird, die auf die zukünftige Ausführung von Aufträgen hinweisen.

## Referenzen

### Kontext-Hilfe

- [Einstellungen](/settings)
- [Ressourcen - Notizbretter](/resources-notice-boards)
- [Tagesplan](/daily-plan)
- [Tagesplan - Projektion](/daily-plan-projections)
- [Tagesplandienst](/service-daily-plan)

### Product Knowledge Base

- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
