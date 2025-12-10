# Erste Inbetriebnahme - Registrierung Subagent Cluster

Die erste Inbetriebnahme wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt. Die Registrierung eines Subagent Clusters erfolgt, nachdem die [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster) abgeschlossen ist.

## Architektur

### Agenten

- **Standalone Agents** führen Jobs auf Rechnern und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agent Cluster**
  - **Director Agents** orchestrieren *Subagenten* in einem Agent Cluster. Sie werden von zwei Instanzen im aktiv-passiv Clustering betrieben und vom Controller verwaltet.
  - **Subagenten** führen Jobs auf Rechnern und in Containern aus. Sie können als Arbeitsknoten in einem Agent Cluster betrachtet werden und werden von *Director Agents* verwaltet.

### Verbindungen

- **Standalone Agent**, **Director Agent** Verbindungen werden vom Controller hergestellt. 
- **Subagenten** Verbindungen in einem Agent Cluster werden von *Director Agents* hergestellt.

## Subagent Cluster registrieren

Die Registrierung eines Subagent Cluster umfasst

- die *Auswahl* von Direktor-Agenten und Unteragenten in einem Agenten-Cluster
- die *Reihenfolge*, in der die Subagenten betrieben werden
  - *aktiv-aktiv*: jeder nächste Auftrag wird mit dem nächsten Subagenten ausgeführt. Das bedeutet, dass alle ausgewählten Subagenten beteiligt sind. Für Details siehe - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *aktiv-passiv*: nur der erste Subagent wird für die Auftragsausführung verwendet. Wenn er nicht verfügbar ist, wird der nächste Subagent verwendet. Einzelheiten finden Sie unter [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *metrikbasiert*: Auf der Grundlage von Regeln wie CPU- und Speicherverbrauch wird der nächste Subagent für die Auftragsausführung ausgewählt. Einzelheiten finden Sie unter [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

Für Details siehe [Initial Operation - Subagent Cluster](/initial-operation-agent-subagent-cluster)

## Referenzen

## Kontext-Hilfe

- [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster)
- [Erste Inbetriebnahme - Registrierung Controller](/initial-operation-register-controller)
- [Erste Inbetriebnahme - Registrierung Subagent](/initial-operation-register-agent-subagent)
- [Erste Inbetriebnahme - Registrierung Subagent Cluster](/initial-operation-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)
