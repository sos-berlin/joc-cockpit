# Erste Inbetriebnahme - Subagent Cluster registrieren

Initial Operation wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt. Die Registrierung eines Subagenten-Clusters erfolgt, nachdem [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster) abgeschlossen ist.

## Architektur

## Agenten

- **Standalone-Agenten** führen Aufträge auf entfernten Rechnern vor Ort und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agenten-Cluster**
  - **Direktor-Agenten** orchestrieren *Unteragenten* in einem Agenten-Cluster. Sie werden von zwei Instanzen im Aktiv-Passiv-Clustering betrieben und vom Controller verwaltet.
  - **Subagents** führen Aufträge auf entfernten Rechnern vor Ort und in Containern aus. Sie können als Arbeitsknoten in einem Agenten-Cluster betrachtet werden und werden von *Direktor-Agenten* verwaltet.

### Verbindungen

- **Standalone Agent**, **Director Agent** Verbindungen werden vom Controller hergestellt. 
- **Subagenten**-Verbindungen in einem Agenten-Cluster werden von *Direktor-Agenten* hergestellt.

## Subagent Cluster registrieren

Die Registrierung eines Subagenten-Clusters umfasst die Registrierung von

- die *Auswahl* von Direktor-Agenten und Unteragenten in einem Agenten-Cluster
- die *Reihenfolge*, in der die Subagenten betrieben werden
  - *aktiv-aktiv*: jeder nächste Auftrag wird mit dem nächsten Subagenten ausgeführt. Das bedeutet, dass alle ausgewählten Subagenten beteiligt sind. Für Details siehe - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster).
  - *aktiv-passiv*: nur der erste Subagent wird für die Auftragsausführung verwendet. Wenn er nicht verfügbar ist, wird der nächste Subagent verwendet. Einzelheiten finden Sie unter [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster).
  - *metrikbasiert*: Auf der Grundlage von Regeln wie CPU- und Speicherverbrauch wird der nächste Subagent für die Auftragsausführung ausgewählt. Einzelheiten finden Sie unter [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster).

Für Details siehe [Initial Operation - Subagent Cluster](/initial-operation-agent-subagent-cluster)

## Referenzen

## Kontext-Hilfe

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)
- [Initial Operation - Register Subagent](/initial-operation-register-agent-subagent)
- [Initial Operation - Subagent Cluster](/initial-operation-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)

