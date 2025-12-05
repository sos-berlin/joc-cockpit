# Erste Inbetriebnahme - Subagent Cluster

Die Erstinbetriebnahme wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt. Die Registrierung eines Subagenten-Clusters erfolgt, nachdem [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster) abgeschlossen ist.

## Subagent Cluster

Die Konfiguration eines Subagenten-Clusters umfasst

- die *Auswahl* von Director-Agenten und Subagenten in einem Agenten-Cluster
- die *Reihenfolge*, in der die Subagenten betrieben werden
  - *aktiv-passiv*: nur der erste Subagent wird für die Auftragsausführung verwendet. Wenn der Subagent nicht verfügbar ist, wird der nächste Subagent verwendet. Einzelheiten finden Sie unter [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *aktiv-aktiv*: jeder nächste Auftrag wird mit dem nächsten Subagenten ausgeführt. Dies bedeutet, dass alle ausgewählten Subagenten beteiligt sind. Einzelheiten finden Sie unter - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *metrikbasiert*: auf der Grundlage von Regeln wie CPU- und Speicherverbrauch wird der nächste Subagent für die Auftragsausführung ausgewählt. Einzelheiten finden Sie unter [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

### Auswahl der Agenten

Auf der linken Seite finden Sie die Liste der Subagenten, einschließlich der Director-Agenten, die zur Auswahl stehen.

Unteragenten können per Drag&amp;Drop in das rechte Fenster in den entsprechenden Ziehbereich gezogen werden. Um die Auswahl eines Unteragenten aufzuheben, können Sie ihn im rechten Fenster in den Bereich *Hierher ziehen, um den Unteragenten zu entfernen* ziehen und ablegen.

### Reihenfolge der Agenten

Die Reihenfolge der Subagenten bestimmt die Art des Clusters:

#### Aktiv-passiv Subagenten-Cluster

Subagenten werden per Drag&amp;Drop in die *gleiche Spalte* gezogen:

- Subagenten in derselben Spalte geben einen aktiv-passiven Cluster (feste Priorität) an, in dem der erste Subagent für alle Aufträge verwendet wird, solange er verfügbar ist. Nur wenn der erste Subagent nicht mehr verfügbar ist, wird der nächste Subagent verwendet.
- Einzelheiten finden Sie unter [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).

#### Aktiv-aktiver Subagent Cluster

Subagenten werden per Drag&amp;Drop in die *gleiche Zeile* gezogen:

- Subagenten in derselben Zeile geben einen aktiv-aktiven Cluster (Round-Robin) an, in dem jeder nächste Auftrag mit dem nächsten Subagenten ausgeführt wird.
- Einzelheiten finden Sie unter [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).

#### Metrikbasierte Subagenten-Cluster

Subagenten werden per Drag&amp;Drop in die *gleiche Zeile* gezogen und erhalten eine *Metrik-basierte Priorität*:

- Subagenten in derselben Reihe geben eine metrikbasierte Priorität an:
    - Wenn Sie mit der Maus über das Rechteck des Subagenten fahren, wird dessen 3-Punkte-Aktionsmenü angezeigt: Mit der Aktion *Messdatenbasierte Priorität* können Sie die Priorität anhand eines Ausdrucks festlegen.
- Einzelheiten finden Sie unter [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

Ausdrücke für metrikbasierte Prioritäten:

| Indikatorvariable | Metrik |
| ----- | ----- |
| $js7SubagentProcessCount | Anzahl der Prozesse, die mit dem Subagenten laufen. |
| $js7ClusterSubagentProcessCount | Anzahl der Prozesse für den gegebenen Subagent Cluster, die mit dem Subagenten laufen. |
| | Die folgenden Indikatoren sind verfügbar, wie unter https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html erklärt
| $js7CpuLoad | Gibt die "aktuelle CPU-Auslastung" für die Betriebsumgebung zurück. Dieser Wert ist ein Double im Intervall [0.0,1.0]. Ein Wert von 0.0 bedeutet, dass alle CPUs während des zuletzt beobachteten Zeitraums im Leerlauf waren, während ein Wert von 1.0 bedeutet, dass alle CPUs während des zuletzt beobachteten Zeitraums zu 100% aktiv waren. Alle Werte zwischen 0.0 und 1.0 sind möglich, abhängig von den Aktivitäten, die stattfinden. Wenn die aktuelle CPU-Auslastung nicht verfügbar ist, gibt die Methode einen negativen Wert zurück. Ein negativer Wert wird als fehlend gemeldet. Die CPU-Auslastung ist für MacOS nicht verfügbar und wird als fehlend gemeldet. |
| $js7CommittedVirtualMemorySize | Gibt die Menge an virtuellem Speicher in Bytes zurück, die dem laufenden Prozess garantiert zur Verfügung steht, oder -1, wenn dieser Vorgang nicht unterstützt wird. Ein negativer Wert wird als fehlend gemeldet. |
| $js7FreeMemorySize | Gibt die Menge des freien Speichers in Bytes zurück. Gibt die Größe des freien Speichers zurück. |
| $js7TotalMemorySize | Gibt die Gesamtmenge des Speichers in Bytes zurück. Gibt die Gesamtmenge des Speichers zurück |

## Referenzen

### Kontexthilfe

- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)

