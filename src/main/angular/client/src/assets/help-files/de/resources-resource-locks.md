# Ressourcen - Ressourcen-Sperren

Die Ansicht *Ressourcen-Sperren* zeigt Live-Informationen über die Verwendung von Ressourcen-Sperren an.

Ressourcen-Sperren werden verwendet, um die Parallelität von Jobs und Arbeitsablauf-Anweisungen in Arbeitsabläufen zu begrenzen.
Ressourcen-Sperren sind Blockanweisungen, die sich über mehrere Jobs und Arbeitsablauf-Anweisungen im selben Arbeitsablauf erstrecken können.

- **Exklusive Sperren** können von einem einzigen Job verwendet werden. Der exklusive Zugriff wird entweder über die Ressourcen-Sperre oder über die Verwendung im Arbeitsablauf konfiguriert.
- **Gemeinsame Sperren** können von einer konfigurierbaren Anzahl von Jobs verwendet werden.
  - Der Ressourcen-Sperre wird eine *Kapazität* zugewiesen, z.B. 6.
  - Jeder Nutzung der Ressourcen-Sperre durch eine Reihe von Jobs wird eine *Gewichtung* zugewiesen, z.B. 3 und 4 für die Nutzung in den Arbeitsabläufen A und B. Dies ermöglicht die parallele Ausführung von 2 Aufträgen für Arbeitsablauf A und verhindert die parallele Ausführung von Aufträgen für Arbeitsablauf A und B.

## Bereich: Navigation

Der linke Bereich zeigt die Ordner des Inventars an, die Ressourcen-Sperren enthalten.

- Wenn Sie auf einen Ordner klicken, werden die Ressourcen-Sperren aus diesem Ordner angezeigt.
- Wenn Sie den Mauszeiger über einen Ordner bewegen und auf das Symbol mit dem Doppelpfeil nach unten klicken, werden die Ressourcen-Sperren des Ordners und aller Unterordner angezeigt.

Das Symbol *Schnellsuche* ermöglicht die Suche nach Ressourcen-Sperren auf der Grundlage von Benutzereingaben:

- Wenn Sie **Test** eingeben, werden Ressourcen-Sperren mit Namen wie *test-lock-1* und *TEST-lock-2* angezeigt. 
- Wenn Sie **Test** eingeben, werden Ressourcen-Sperren mit Namen wie *test-lock-1* und *my-TEST-lock-2* angezeigt

## Bereich: Ressourcen-Sperre

### Anzeige von Ressourcen-Sperren

Die folgenden Informationen werden angezeigt:

- **Name** ist der eindeutige Name einer Ressourcen-Sperre.
- **Ausrolldatum** ist das Datum, an dem die Ressourcen-Sperre ausgerollt wurde.
- **Status** ist einer der Werte *Synchron* und *Nicht synchron*, wenn die Ressourcen-Sperre nicht auf dem Controller ausgerollt ist.
- **Erworbenes Gewicht** gibt das kumulative *Gewicht* der parallelen Aufträge an, die die Sperre erworben haben.
- **Haltende Aufträge** zeigt die Anzahl der Aufträge an, die die Sperre erworben haben.
- **Wartende Aufträge** zeigt die Anzahl der Aufträge an, die darauf warten, die Sperre zu erhalten.
- **Kapazität** zeigt die *Kapazität* an, die für die Sperre verfügbar ist. *Exklusive Sperren* haben eine *Kapazität* von 1, *Gemeinsame Sperren* haben eine individuelle *Kapazität*.

### Anzeige der Aufträge

Wenn Sie auf das Pfeil-nach-unten-Symbol klicken, wird die Ressourcen-Sperre erweitert und es werden detaillierte Informationen über Aufträge angezeigt, die die Ressourcen-Sperre erworben haben, sowie über Aufträge, die auf die Ressourcen-Sperre warten.

## Suche

Die *Suche* bietet Kriterien für die Suche nach Ressourcen-Sperren aus Abhängigkeiten. Wenn Sie z.B. nach Arbeitsabläufen suchen, die einen bestimmten Auftragsnamen enthalten, werden die vom Arbeitsablauf verwendeten Ressourcen-Sperren angezeigt.

## Referenzen

- [Ressourcen - Ressourcen-Sperren - Suche](/resources-resource-locks-search)
- [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)
