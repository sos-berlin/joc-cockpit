# Erste Inbetriebnahme - Agent Cluster registrieren

Initial Operation wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt. Die Registrierung eines Agent-Clusters erfolgt, nachdem [Initial Operation - Register Controller](/initial-operation-register-controller) abgeschlossen ist.

Der Betrieb eines Agent Clusters unterliegt den Vereinbarungen der [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Verwendung des Standalone-Agenten:
  - verfügbar für Inhaber einer Open-Source-Lizenz und für Inhaber einer kommerziellen Lizenz.
- Verwendung von Agent Cluster:
  - verfügbar für Inhaber einer kommerziellen Lizenz,
  - für Details siehe [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

## Architektur

### Agenten

- **Standalone-Agenten** führen Aufträge auf entfernten Rechnern vor Ort und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agenten-Cluster**
  - **Direktor-Agenten** orchestrieren *Unteragenten* in einem Agenten-Cluster. Sie werden von zwei Instanzen im Aktiv-Passiv-Clustering betrieben und vom Controller verwaltet.
  - **Subagents** führen Aufträge auf entfernten Rechnern vor Ort und in Containern aus. Sie können als Arbeitsknoten in einem Agenten-Cluster betrachtet werden und werden von *Direktor-Agenten* verwaltet.

### Verbindungen

- **Standalone Agent**, **Director Agent** Verbindungen werden vom Controller hergestellt. 
- **Subagenten**-Verbindungen in einem Agenten-Cluster werden von *Direktor-Agenten* hergestellt.

## Agent Cluster registrieren

Die Registrierung eines Agenten-Clusters umfasst die Registrierung der primären und sekundären Director-Agenten. Für die spätere Registrierung von Subagenten siehe - [Initial Operation - Register Subagent](/initial-operation-register-agent-subagent).

Zu den Voraussetzungen vor der Installation gehören:

- JOC Cockpit, Controller und alle Director Agent-Instanzen müssen mit einem gültigen JS7-Lizenzschlüssel ausgestattet sein.
- Der Secondary Director Agent muss in seiner Datei ./config/agent.conf die Einstellung: *js7.journal.cluster.node.is-backup = yes*
- Sowohl die primäre als auch die sekundäre Director Agent-Instanz müssen eingerichtet sein und laufen.

Die Benutzer sollten überprüfen, ob die Netzwerkverbindungen vom Server des Controllers zu den Servern beider Director Agents verfügbar sind und ob die Firewall-Regeln Verbindungen zu den Ports der Director Agents zulassen.

Die Seite *Controller/Agenten verwalten* ist über das Radsymbol in der Hauptmenüleiste erreichbar und bietet die Operation *Agentencluster hinzufügen* aus dem Aktionsmenü des Controllers. Dadurch wird das Popup-Fenster für die Registrierung eines Agent-Clusters angezeigt.

Die Benutzer geben die folgenden Eingaben ein:

- **Agent ID** ist die eindeutige Kennung des Agent Clusters, die während der Lebensdauer des Clusters nicht geändert werden kann. Die *Agent ID* ist bei Jobs und Arbeitsabläufen nicht sichtbar.
- **Agent Cluster Name** ist der eindeutige Name eines Agent Clusters. Wenn Sie einem Auftrag einen Agenten zuweisen, wird der *Agent Cluster Name* verwendet. Wenn Sie den *Agent Cluster Name* später ändern, müssen Sie den vorherigen *Agent Cluster Name* aus einem *Alias Namen* weiter verwenden.
- **Titel** ist eine Beschreibung, die für einen Agent Cluster hinzugefügt werden kann.
- **Alias-Namen** sind alternative Namen für denselben Agent Cluster. Wenn Sie einem Job einen Agent zuweisen, werden auch *Alias Cluster Names* angeboten. *Alias Cluster Names* können z.B. verwendet werden, wenn eine Testumgebung weniger Agent Cluster enthält als die Produktionsumgebung: Damit die Agentenzuweisungen zwischen den Umgebungen unverändert bleiben, werden die fehlenden Agent Cluster von *Alias Cluster Names* desselben Agent Clusters gemappt.
- **Primärer Director Agent**
  - die **Subagent ID** ist die eindeutige Kennung des Primary Director Agent, die während der Lebensdauer des Director Agent nicht geändert werden kann. Die *Subagent ID* ist bei Jobs und Arbeitsabläufen nicht sichtbar.
  - **Title** ist eine Beschreibung, die für einen Director Agent hinzugefügt werden kann.
  - **URL** erwartet die URL von Protokoll, Host und Port, die der Controller für die Verbindung mit dem primären Director Agent verwendet, zum Beispiel http://localhost:4445.
    - Die URL beginnt mit dem Protokoll *http*, wenn der Director Agent das einfache HTTP-Protokoll verwendet. Das *https*-Protokoll wird verwendet, wenn der Director Agent für HTTPS konfiguriert ist.
    - Der Hostname kann *localhost* sein, wenn der Director Agent auf demselben Rechner wie der Controller installiert ist. Andernfalls sollte der FQDN des Director Agent-Hosts angegeben werden.
    - Der *Port* des Director Agent wird während der Installation festgelegt. 
  - **Als eigener Subagent Cluster** erstellt optional Subagent Cluster für jeden primären und sekundären Director Agent, siehe [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster).
- **Sekundärer Director Agent**
  - die **Subagent ID** ist die eindeutige Kennung des sekundären Director Agents, die während der Lebensdauer des Director Agents nicht geändert werden kann. Die *Subagent ID* ist bei Jobs und Arbeitsabläufen nicht sichtbar.
  - **Title** ist eine Beschreibung, die für einen Director Agent hinzugefügt werden kann.
  - **URL** erwartet die URL aus Protokoll, Host und Port, die der Controller zur Verbindung mit dem sekundären Director Agent verwendet, ähnlich wie beim *Primären Director Agent*.

Nach erfolgreicher Registrierung wird der Agent in der Ansicht [Resources - Agents](/resources-agents) angezeigt.

## Referenzen

### Kontexthilfe

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)
- [Initial Operation - Register Subagent](/initial-operation-register-agent-subagent)
- [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

