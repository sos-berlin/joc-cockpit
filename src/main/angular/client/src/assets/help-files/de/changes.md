# Änderungen verwalten

JOC Cockpit bietet die Verwaltung von [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) für Objekte wie Arbeitsabläufe. Eine Änderung wird als eine Liste von Inventarobjekten betrachtet, die Gegenstand gemeinsamer Ausrolloperationen sind

- für das Ausrollen auf Controller,
- für das Ausrollen über [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import),
- für das Ausrollen mit [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface).

Änderungen umfassen Inventarobjekte wie Arbeitsabläufe, Zeitpläne usw. und sie umfassen referenzierte Objekte, z.B. eine Job-Ressource, die von einem Arbeitsablauf referenziert wird.

- Benutzer können Inventarobjekte direkt zu einer Änderung hinzufügen.
- Referenzierte Objekte werden automatisch mit einer Änderung verknüpft.

Die Seite *Änderungen verwalten* wird zum Hinzufügen, Aktualisieren und Löschen von Änderungen verwendet.

## Liste der Änderungen

Vorhandene Änderungen werden in einer Liste angezeigt:

- **Aktionsmenü** bietet die Möglichkeit, den Änderungseintrag zu aktualisieren und zu löschen.
- **Name** ist der eindeutige Name, den die Benutzer einer Änderung zuweisen.
- **Titel** erklärt den Zweck der Änderung.
- **Status** ist einer der Werte *Offen* oder *Geschlossen*. Geschlossene Änderungen werden nicht für Operation zum Export oder Rollout angeboten.
- **Eigentümer** gibt das Konto an, das Eigentümer der Änderung ist.
- **Objekte** bietet ein Symbol zur Anzeige von Objekten, die der Änderung unterliegen.

## Operationen für Änderungen

Im oberen Teil des Bildschirms stehen Ihnen die folgenden Schaltflächen zur Verfügung:

- **Änderung hinzufügen** bietet das Hinzufügen einer Änderung an. Details finden Sie unter [Änderungen - Eigenschaften](/changes-properties).

In der *Liste der Änderungen* werden die folgenden Operationen mit dem entsprechenden 3-Punkte Aktionsmenü angeboten:

- **Bearbeiten** ermöglicht das Aktualisieren der Eigenschaften der Änderung. Details finden Sie unter [Änderungen - Eigenschaften](/changes-properties).
- **Löschen** entfernt den Eintrag der Änderung.

## Referenzen

### Kontext-Hilfe

- [Änderungen - Eigenschaften](/changes-properties)

### Product Knowledge Base

- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)

