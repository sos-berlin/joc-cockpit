# Einsatzverlauf

Die Ansicht *Einsatzverlauf* fasst die Einsätze von Inventarobjekten zusammen.

JS7 implementiert eine verteilte Architektur, die es ermöglicht, Jobs desselben Workflows auf verschiedenen Agenten und Plattformen auszuführen. Eine erfolgreiche Bereitstellung beinhaltet die Bestätigung der neuen und aktualisierten Objekte durch die einzelnen Agenten, die asynchron eintrifft.

Wenn Sie die Operation *deploy* in der Ansicht *Konfiguration* verwenden, wird die Bestätigung je nach Verfügbarkeit der Agenten erfolgen. Ein heruntergefahrener Agent wird beispielsweise die Bereitstellung bestätigen, wenn er neu gestartet wird, was einige Zeit später geschehen kann.

Die *Verteilungshistorie* wird asynchron aktualisiert, um den Verteilungsstatus der Inventarobjekte wiederzugeben.

## Verlaufspanel

### Verlauf der Einsätze

Die Anzeige erfolgt gruppiert in einem Block pro Einsatz und in Blöcken pro Inventarobjekt.

- **Einsatzdatum** gibt den Zeitpunkt des Einsatzes an.
- **Konto** gibt das JOC Cockpit-Benutzerkonto an, das die Bereitstellung durchgeführt hat.
- **Status** zeigt an, ob die Bereitstellung erfolgreich war oder fehlgeschlagen ist.
  - *Eingesetzt* zeigt an, dass alle Inventarobjekte erfolgreich eingesetzt wurden.
  - *Nicht bereitgestellt* zeigt an, dass ein oder mehrere Inventarobjekte nicht bereitgestellt werden konnten.
- **Anzahl der Objekte** gibt die Anzahl der Inventarobjekte wie Workflows, Auftragsressourcen usw. an, die in den Umfang der Bereitstellung fallen.

### Historie der Einsätze pro Inventarobjekt

Wenn Sie auf das Pfeil-nach-unten-Symbol neben dem *Einsatzdatum* klicken, werden Details zu jedem Inventarobjekt angezeigt:

- **Meldung** zeigt eine Fehlermeldung im Falle einer fehlgeschlagenen Bereitstellung an.
- **Objekttyp** gibt den Typ des Inventarobjekts an, z.B. *Workflow*, *Job Resource* usw.
- **Pfad** gibt den Inventarordner und den Objektnamen an. Für Workflow-Objekte
  - klicken Sie auf den Namen des Workflows, um die Ansicht [Workflows](/workflows) aufzurufen,
  - klicken Sie auf das Bleistiftsymbol, um zur Ansicht [Configuration - Inventory - Workflows](/configuration-inventory-workflows) zu gelangen.
- **Operation** ist eine von *Speichern* oder *Löschen*. Bei beiden Operationen werden die Objekte aktualisiert.
- **Datum** gibt den Zeitpunkt der Bereitstellungsoperation an.

## Referenzen

- [Configuration - Inventory- Workflows](/configuration-inventory-workflows)
- [Workflows](/workflows)
- [JS7 - Deployment of Scheduling Objects](https://kb.sos-berlin.com/display/JS7/JS7+-+Deployment+of+Scheduling+Objects)

