# Ressource Schlösser

Die Ansicht *Ressourcen-Sperren* zeigt Live-Informationen über die Verwendung von Ressourcen-Sperren an.

Resource Locks werden verwendet, um die Parallelität von Jobs und Arbeitsablauf-Instruktionen in Arbeitsabläufen zu begrenzen.
Resource Locks sind Blockinstruktionen, die sich über mehrere Jobs und Arbeitsablauf-Instruktionen im selben Arbeitsablauf erstrecken können.

- **Exclusive Locks** können von einem einzigen Job verwendet werden. Der exklusive Zugriff wird entweder über die Resource Lock oder über die Verwendung im Arbeitsablauf konfiguriert.
- **Shared Locks** können von einer konfigurierbaren Anzahl von Jobs verwendet werden.
  - Dem Resource Lock wird eine *Kapazität* zugewiesen, z.B. 6.
  - Jeder Nutzung des Resource Locks durch eine Reihe von Jobs wird eine *Gewichtung* zugewiesen, z.B. 3 und 4 für die Nutzung in den Arbeitsabläufen A und B. Dies ermöglicht die parallele Ausführung von 2 Aufträgen für Arbeitsablauf A und verhindert die parallele Ausführung von Aufträgen für Arbeitsablauf A und B.

## Navigationsleiste

Das linke Panel zeigt den Baum der Bestandsordner an, die Ressourcensperren enthalten.

- Wenn Sie auf einen Ordner klicken, werden die Resource Locks aus diesem Ordner angezeigt.
- Wenn Sie auf das Symbol mit dem Sparren nach unten klicken, wenn Sie den Mauszeiger über einen Ordner bewegen, werden die Resource Locks des Ordners und aller Unterordner angezeigt.

Das Symbol Schnellsuche ermöglicht die Suche nach Resource Locks auf der Grundlage von Benutzereingaben:

- Wenn Sie **Test** eingeben, werden Ressourcensperren mit Namen wie *test-lock-1* und *TEST-lock-2* angezeigt. 
- Wenn Sie **Test** eingeben, werden Ressourcensperren mit Namen wie *test-lock-1* und *my-TEST-lock-2* angezeigt

## Ressource Lock Panel

### Anzeige von Resource Locks

Die folgenden Informationen werden angezeigt:

- **Name** ist der eindeutige Name einer Ressourcensperre.
- **Deployment Date** ist das Datum, an dem die Ressourcensperre bereitgestellt wurde.
- **Status** ist einer der Werte *Synchronisiert* und *Nicht synchronisiert*, wenn die Ressourcensperre noch nicht auf dem Controller bereitgestellt wurde.
- **Erworbenes Gewicht** gibt das kumulative *Gewicht* der parallelen Aufträge an, die die Sperre erworben haben.
- **Haltende Aufträge** zeigt die Anzahl der Aufträge an, die die Sperre erworben haben.
- **Wartende Aufträge** zeigt die Anzahl der Aufträge an, die darauf warten, die Sperre zu erhalten.
- **Kapazität** zeigt die *Kapazität* an, die für die Sperre verfügbar ist. *Exklusive Sperren* haben eine *Kapazität* von 1, *Gemeinsame Sperren* haben eine individuelle *Kapazität*.

### Anzeige der Aufträge

Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, wird die Ressourcensperre erweitert und es werden detaillierte Informationen über Aufträge angezeigt, die die Ressourcensperre erworben haben, sowie über Aufträge, die auf die Ressourcensperre warten.

## Suche

Die *Suche* bietet Kriterien für die Suche nach Resource Locks aus Abhängigkeiten. Wenn Sie z.B. nach Arbeitsabläufen suchen, die einen bestimmten Auftragsnamen enthalten, werden die vom Arbeitsablauf verwendeten Resource Locks angezeigt.

## Referenzen

- [Resources - Resource Locks - Search](/resources-resource-locks-search)
- [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)

