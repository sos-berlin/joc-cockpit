# Controller Status

Das Feld *Controller Status* enthält Informationen über registrierte Controller.

## Controller-Instanzen

Jede angezeigte Controller-Instanz bietet die folgenden Attribute:

- **Controller ID** bezeichnet eine eindeutige Kennung, die bei der Installation eines Controllers angegeben wird. In einem Controller-Cluster haben alle Instanzen die gleiche Controller-ID.
- **URL** gibt die URL an, über die die Controller-Instanz erreicht werden kann.
- **Status** gibt den Status der Komponente an, d.h. *operational* oder *unbekannt*, wenn die Controller-Instanz nicht erreicht werden kann.
- **Cluster-Rolle** gibt die *aktive* oder *Standby*-Rolle einer Controller-Instanz in einem Cluster an.

Wenn Sie auf die Controller-ID einer Instanz klicken, wechselt das Dashboard zur Anzeige des Produktstatus des entsprechenden Controllers.

## Operationen auf Controller-Instanzen

Die folgenden Operationen sind verfügbar:

Controller-Instanzen bieten die folgenden Operationen aus dem 3-Punkte-Aktionsmenü der jeweiligen Instanz:

- **Beenden**, **Beenden und Neustart** fährt die Instanz herunter. Für die aktive Instanz in einem Cluster wird das Menü erweitert:
  - **mit Umschaltung**, um die aktive Rolle an die Standby-Instanz zu übergeben.
  - **ohne Switch-over**: um die aktive Rolle bei der heruntergefahrenen Instanz zu belassen. Benutzer sollten sich darüber im Klaren sein, dass kein Failover stattfindet und dass keine Instanz aktiv ist.
- **Abbrechen**, **Abbrechen und Neustart** beenden die Instanz zwangsweise. Wenn dies auf die aktive Instanz in einem Cluster angewendet wird, wird ein Failover erzwungen:
  - mit **Failover** wird die aktive Rolle an die Standby-Instanz übergeben.
- **Download Log** bietet die Datei controller.log des Controllers zum Download aus einer .gz-Datei im gzipped-Format an.

## Referenzen

- [Dashboard - Product Status](/dashboard-product-status)

