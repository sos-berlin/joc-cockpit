# Erste Inbetriebnahme - Subagent Cluster

Die erste Inbetriebnahme wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt. Die Registrierung eines Subagent Cluster erfolgt, nachdem die [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster) abgeschlossen ist.

## Subagent Cluster

Die Konfiguration eines Subagent Cluster umfasst

- die *Auswahl* von Director Agent und Subagenten in einem Agent Cluster.
- die *Reihenfolge*, in der die Subagenten betrieben werden
  - *aktiv-passiv*: nur der erste Subagent wird für die Job-Ausführung verwendet. Wenn der Subagent nicht verfügbar ist, wird der nächste Subagent verwendet. Einzelheiten finden Sie unter [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *aktiv-aktiv*: jeder nächste Job wird mit dem nächsten Subagenten ausgeführt. Dies bedeutet, dass alle ausgewählten Subagenten beteiligt sind. Einzelheiten finden Sie unter - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *metrikbasiert*: auf der Grundlage von Regeln wie CPU- und Speicherverbrauch wird der nächste Subagent für die Job-Ausführung ausgewählt. Einzelheiten finden Sie unter [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

### Auswahl der Agenten

Auf der linken Seite finden Sie die Liste der Subagenten, einschließlich der Director Agents, die zur Auswahl stehen.

Subagenten können per Drag&amp;Drop in das rechte Fenster in den entsprechenden Ablagebereich gezogen werden. Um die Auswahl eines Subagenten aufzuheben, können Sie ihn im rechten Fenster in den Bereich *Hierher ziehen, um Subagenten zu entfernen* ziehen und ablegen.

### Reihenfolge der Agenten

Die Reihenfolge der Subagenten bestimmt die Art des Cluster.

#### Aktiv-passiv Subagent Cluster

Subagenten werden per Drag&amp;Drop in die *gleiche Spalte* gezogen:

- Subagenten in derselben Spalte legen einen aktiv-passiven Cluster (feste Priorität) fest, in dem der erste Subagent für alle Jobs verwendet wird, solange er verfügbar ist. Nur wenn der erste Subagent nicht mehr verfügbar ist, wird der nächste Subagent verwendet.
- Einzelheiten finden Sie unter [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).

#### Aktiv-aktiv Subagent Cluster

Subagenten werden per Drag&amp;Drop in die *gleiche Zeile* gezogen:

- Subagenten in derselben Zeile legen einen aktiv-aktiv Cluster (Round-Robin) fest, in dem jeder nächste Job mit dem nächsten Subagenten ausgeführt wird.
- Einzelheiten finden Sie unter [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).

#### Metrikbasierter Subagent Cluster

Subagenten werden per Drag&amp;Drop in die *gleiche Zeile* gezogen und erhalten eine *Metrikbasierte Priorität*:

- Subagenten in derselben Reihe legen eine metrikbasierte Priorität fest:
    - Wenn Sie mit der Maus über das Rechteck des Subagenten fahren, wird dessen 3-Punkte Aktionsmenü angezeigt: Mit der Aktion *Metrikbasierte Priorität* können Sie die Priorität anhand eines Ausdrucks festlegen.
- Einzelheiten finden Sie unter [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

Ausdrücke für metrikbasierte Prioritäten:

| Indikatorvariable | Metrik |
| ----- | ----- |
| $js7SubagentProcessCount | Anzahl der Prozesse, die im Subagenten laufen. |
| $js7ClusterSubagentProcessCount | Anzahl der Prozesse für den Subagent Cluster, die im Subagenten laufen. |
| | Die folgenden Indikatoren sind verfügbar, wie unter https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html erklärt
| $js7CpuLoad | Gibt die "aktuelle CPU-Auslastung" für die Betriebsumgebung zurück. Dieser Wert ist ein Double im Intervall [0.0,1.0]. Ein Wert von 0.0 bedeutet, dass alle CPUs während des zuletzt beobachteten Zeitraums im Leerlauf waren, während ein Wert von 1.0 bedeutet, dass alle CPUs während des zuletzt beobachteten Zeitraums zu 100% aktiv waren. Alle Werte zwischen 0.0 und 1.0 sind möglich, abhängig von den Aktivitäten, die stattfinden. Wenn die aktuelle CPU-Auslastung nicht verfügbar ist, gibt die Methode einen negativen Wert zurück. Ein negativer Wert wird als fehlend gemeldet. Die CPU-Auslastung ist für MacOS nicht verfügbar und wird als fehlend gemeldet. |
| $js7CommittedVirtualMemorySize | Gibt die Menge an virtuellem Speicher in Bytes zurück, die dem laufenden Prozess garantiert zur Verfügung steht, oder -1, wenn dieser Vorgang nicht unterstützt wird. Ein negativer Wert wird als fehlend gemeldet. |
| $js7FreeMemorySize | Gibt die Menge des freien Speichers in Bytes zurück. |
| $js7TotalMemorySize | Gibt die Gesamtmenge des Speichers in Bytes zurück. |

## Referenzen

### Kontext-Hilfe

- [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster)
- [Erste Inbetriebnahme - Registrierung Subagent Cluster](/initial-operation-register-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)
