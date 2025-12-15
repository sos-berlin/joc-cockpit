# Ausrollhistorie

Die Ansicht *Ausrollhistorie* fasst das Ausrollen von Inventarobjekten zusammen.

JS7 implementiert eine verteilte Architektur, die es ermöglicht, Jobs desselben Arbeitsablaufs auf unterschiedlichen Agenten und Plattformen auszuführen. Ein erfolgreiches Ausrollen beinhaltet die Bestätigung der neuen und aktualisierten Objekte durch die einzelnen Agenten, die asynchron erfolgt.

Wenn Sie die Operation *Ausrollen* in der Ansicht *Konfiguration* verwenden, wird die Bestätigung je nach Verfügbarkeit der Agenten erfolgen. Ein heruntergefahrener Agent wird beispielsweise das Ausrollen bestätigen, wenn er neu gestartet wird.

Die *Ausrollhistorie* wird asynchron aktualisiert, um den Ausrollstatus der Inventarobjekte wiederzugeben.

## Bereich: Ausrollhistorie

### Historie des Ausrollens

Die Anzeige erfolgt gruppiert in einem Block pro Ausrollen und in Blöcken pro Inventarobjekt.

- **Datum des Ausrollens** gibt den Zeitpunkt des Ausrollens an.
- **Konto** gibt das JOC Cockpit Benutzerkonto an, das das Ausrollen durchgeführt hat.
- **Status** zeigt an, ob das Ausrollen erfolgreich war oder fehlgeschlagen ist.
  - *Ausgerollt* zeigt an, dass alle Inventarobjekte erfolgreich eingesetzt wurden.
  - *Nicht ausgerollt* zeigt an, dass ein oder mehrere Inventarobjekte nicht ausgerollt werden konnten.
- **Anzahl Einträge** gibt die Anzahl der Inventarobjekte wie Arbeitsabläufe usw. an, die in den Umfang des Ausrollens fallen.

### Historie des Ausrollens pro Inventarobjekt

Wenn Sie auf das Pfeil-nach-unten-Symbol neben dem *Ausrolldatum* klicken, werden Details zu jedem Inventarobjekt angezeigt:

- **Meldung** zeigt eine Fehlermeldung im Falle eines fehlgeschlagenen Ausrollens an.
- **Objekttyp** gibt den Typ des Inventarobjekts an, z.B. *Workflow*, *Job-Ressource* usw.
- **Pfad** gibt den Inventarordner und den Objektnamen an. Für Arbeitsabläufe
  - klicken Sie auf den Namen des Arbeitsablaufs, um die Ansicht [Arbeitsabläufe](/workflows) aufzurufen,
  - klicken Sie auf das Bleistiftsymbol, um zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows) zu gelangen.
- **Operation** ist eine von *speichern* oder *löschen*. Bei beiden Operationen werden die Objekte aktualisiert.
- **Datum** gibt den Zeitpunkt des Ausrollens an.

## Referenzen

- [Arbeitsabläufe](/workflows)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [JS7 - Deployment of Scheduling Objects](https://kb.sos-berlin.com/display/JS7/JS7+-+Deployment+of+Scheduling+Objects)
