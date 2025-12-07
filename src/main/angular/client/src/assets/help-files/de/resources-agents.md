# Ressourcen - Agenten

Die Ansicht *Ressourcen-&gt;Agenten* gibt einen Überblick über den Status der registrierten Agenten.

## Architektur

### Agenten

- **Standalone Agents** führen Jobs auf Rechnern und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agent Cluster**
  - **Director Agents** orchestrieren *Subagenten* in einem Agent Cluster. Sie werden von zwei Instanzen im aktiv-passiv Clustering betrieben und vom Controller verwaltet.
  - **Subagenten** führen Jobs auf Rechnern und in Containern aus. Sie können als Arbeitsknoten in einem Agent Cluster betrachtet werden und werden von *Director Agents* verwaltet.

### Verbindungen

- **Standalone Agent**, **Director Agent** Verbindungen werden vom Controller hergestellt. 
- **Subagenten** Verbindungen in einem Agent Cluster werden von *Director Agents* hergestellt.

## Verbindungsstatus

Für die Anzeige des Status werden die folgenden Farbindikatoren verwendet:

- **Grüne Farbe** zeigt gesunde Verbindungen an.
- **Gelbe Farbe** zeigt Agenten an, die gerade zurückgesetzt werden. Das bedeutet, dass sie ihr Journal initialisieren und neu starten.
- **Rote Farbe** zeigt fehlgeschlagene Verbindungen zu Agenten an, z.B. wenn der Agent nicht erreicht werden kann.
- **Graue Farbe** zeigt einen *unbekannten* Verbindungsstatus an, z.B. wenn ein Director Agent nicht erreicht werden kann, dann ist der Status für Subagenten *unbekannt*.

Die Benutzer sollten die folgenden Auswirkungen berücksichtigen:

- Wenn eine Verbindung zu einem Agenten als fehlgeschlagen gilt, bedeutet dies nicht, dass der Agent ausgefallen ist. Es kann Netzwerkprobleme geben, die die Verbindung verhindern.
- Das JOC Cockpit erhält Informationen über den Verbindungsstatus des Agenten vom Controller. Wenn der Controller nicht verfügbar ist, ist diese Information nicht vorhanden. Dies bedeutet nicht, dass die Agenten ausgefallen sind, aber es bedeutet, dass die Agenten mit einem *unbekannten* Status angezeigt werden.
- Der Controller meldet Verbindungen zu *Standalone Agents* und zu *Director Agents*. Fehlgeschlagene Verbindungen zu *Director Agents* impllizieren, dass der Controller den Status der *Subagents* im Agent Cluster nicht kennt, der dementsprechend als *unbekannt* angezeigt wird.

## Referenzen

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)

