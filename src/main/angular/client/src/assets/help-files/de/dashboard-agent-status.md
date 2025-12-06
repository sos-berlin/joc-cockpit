# Übersicht - Agenten Status

Der Bereich *Agenten Status* fasst den Verbindungsstatus der registrierten Agenten zusammen.

<img src="dashboard-agent-status.png" alt="Agent Status" width="332" height="135" />

## Architektur

### Agenten

- **Standalone Agents** führen Aufträge auf entfernten Rechnern und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agent Cluster**
  - **Director Agents** orchestrieren *Subagenten* in einem Agent Cluster. Sie werden von zwei Instanzen im Aktiv-Passiv Clustering betrieben und vom Controller verwaltet.
  - **Subagenten** führen Aufträge auf entfernten Rechnern und in Containern aus. Sie können als Arbeitsknoten in einem Agent Cluster betrachtet werden und werden von einem *Director Agent* verwaltet.

### Verbindungen

- **Standalone Agent**, **Director Agent** Verbindungen werden vom Controller hergestellt. 
- **Subagenten** Verbindungen in einem Agent Cluster werden vom *Director Agent* hergestellt.

## Verbindungsstatus

Für die Anzeige des Agenten Status werden die folgenden Farbindikatoren verwendet:

- **Grüne Farbe** zeigt intakte Agenten-Verbindungen an.
- **Gelbe Farbe** zeigt Agenten an, die gerade zurückgesetzt werden. Das bedeutet, dass sie ihr Journal initialisieren und neu starten.
- **Rote Farbe** zeigt fehlgeschlagene Verbindungen zu Agenten an, wenn der Agent nicht erreicht werden kann.
- **Graue Farbe** zeigt einen *unbekannten* Verbindungsstatus an, z.B. wenn ein Director Agent nicht erreicht werden kann, ist der Status für Subagenten *unbekannt*.

Die Benutzer sollten die folgenden Auswirkungen berücksichtigen:

- Wenn eine Agenten-Verbindung als fehlgeschlagen gilt, bedeutet dies nicht, dass der Agent ausgefallen ist. Es kann Netzwerkprobleme geben, die die Verbindung verhindern.
- Das JOC Cockpit erhält Informationen über den Verbindungsstatus des Agenten vom Controller. Wenn der Controller nicht verfügbar ist, ist diese Information nicht vorhanden. Dies bedeutet nicht, dass die Agenten ausgefallen sind, aber es bedeutet, dass die Agenten mit einem *unbekannten* Status angezeigt werden.
- Der Controller meldet Verbindungen zu *Standalone Agents* und zu *Director Agents*. Fehlgeschlagene Verbindungen zu *Director Agents* implizieren, dass der Controller den Status der *Subagenten* im Agent Cluster nicht kennt, der entsprechend als *unbekannt* angezeigt wird.

## Referenzen

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
