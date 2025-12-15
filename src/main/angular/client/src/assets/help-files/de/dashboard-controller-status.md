# Übersicht - Controller Status

Der Bereich *Controller Status* enthält Informationen über registrierte Controller.

## Controller Instanzen

Jede angezeigte Controller Instanz bietet die folgenden Attribute:

- **Controller ID** bezeichnet eine eindeutige Kennung, die bei der Installation eines Controller angegeben wird. In einem Controller Cluster haben alle Instanzen die gleiche Controller ID.
- **URL** gibt die URL an, über die die Controller Instanz erreicht werden kann.
- **Status** gibt den Status der Komponente an, d.h. *betriebsfähig* oder *unbekannt*, wenn die Controller Instanz nicht erreicht werden kann.
- **Cluster Rolle** gibt die *aktive* oder *Standby* Rolle einer Controller Instanz in einem Cluster an.

Wenn Sie auf die *Controller ID* einer Instanz klicken, wechselt die Übersichtsansicht zur Anzeige des Produktstatus des entsprechenden Controller.

## Operationen für Controller Instanzen

Die folgenden Operationen sind verfügbar:

Controller Instanzen bieten die folgenden Operationen aus dem 3-Punkte Aktionsmenü der jeweiligen Instanz:

- **Beenden**, **Beenden und Neustart** fährt die Instanz herunter. Für die aktive Instanz in einem Cluster wird das Menü erweitert:
  - **mit Umschalten**, um die aktive Rolle an die Standby Instanz zu übergeben.
  - **ohne Umschalten**: um die aktive Rolle bei der heruntergefahrenen Instanz zu belassen. Benutzer sollten sich bewusst sein, dass keine Aktivierung der Ausfallsicherung erfolgt und dass keine Instanz aktiv ist.
- **Abbrechen**, **Abbrechen und neu starten** beenden die Instanz zwangsweise. Wenn dies auf die aktive Instanz in einem Cluster angewendet wird, wird die Ausfallsicherung aktiviert:
  - mit **Ausfallsicherung** wird die aktive Rolle an die Standby Instanz übergeben.
- **Protokoll herunterladen** bietet die Datei *controller.log* des Controller zum Herunterladen aus einer .gz-Datei in komprimiertem Format an.

## Referenzen

- [Übersicht - Produkt Status](/dashboard-product-status)
