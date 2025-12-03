# Agent-Status

Die Ansicht *Agent* gibt einen Überblick über den Verbindungsstatus der registrierten Agenten.

## Architektur

## Agenten

- **Standalone-Agenten** führen Aufträge auf entfernten Rechnern vor Ort und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agenten-Cluster**
  - **Direktor-Agenten** orchestrieren *Unteragenten* in einem Agenten-Cluster. Sie werden von zwei Instanzen im Aktiv-Passiv-Clustering betrieben und vom Controller verwaltet.
  - **Subagents** führen Aufträge auf entfernten Rechnern vor Ort und in Containern aus. Sie können als Arbeitsknoten in einem Agenten-Cluster betrachtet werden und werden von *Direktor-Agenten* verwaltet.

### Verbindungen

- **Standalone Agent**, **Director Agent** Verbindungen werden vom Controller hergestellt. 
- **Subagenten**-Verbindungen in einem Agenten-Cluster werden von *Direktor-Agenten* hergestellt.

## Verbindungsstatus

Für die Anzeige des Agentenstatus werden die folgenden Farbindikatoren verwendet:

- **Grüne Farbe** zeigt gesunde Agent-Verbindungen an.
- **Gelbe Farbe** zeigt Agenten an, die gerade zurückgesetzt werden. Das bedeutet, dass sie ihr Journal initialisieren und neu starten.
- **Rote Farbe** zeigt fehlgeschlagene Verbindungen zu Agenten an, z.B. wenn der Agent nicht erreicht werden kann.
- **Graue Farbe** zeigt einen *unbekannten* Verbindungsstatus an, z.B. wenn ein Director Agent nicht erreicht werden kann, dann ist der Status für Subagenten *unbekannt*.

Die Benutzer sollten die folgenden Auswirkungen berücksichtigen:

- Wenn eine Agent-Verbindung als fehlgeschlagen gilt, bedeutet dies nicht, dass der Agent ausgefallen ist. Es kann Netzwerkprobleme geben, die die Verbindung verhindern.
- Das JOC Cockpit erhält Informationen über den Verbindungsstatus des Agenten vom Controller. Wenn der Controller nicht verfügbar ist, ist diese Information nicht vorhanden. Dies bedeutet nicht, dass die Agenten ausgefallen sind, aber es bedeutet, dass die Agenten mit einem *unbekannten* Status angezeigt werden.
- Der Controller meldet Verbindungen zu *Standalone-Agenten* und zu *Direktor-Agenten*. Fehlgeschlagene Verbindungen zu *Direktor-Agenten* deuten darauf hin, dass der Controller den Status der *Unteragenten* im Agenten-Cluster nicht kennt, der dementsprechend als *unbekannt* angezeigt wird.

## Referenzen

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)

