# Erste Inbetriebnahme - Registrierung Subagent

Erste Inbetriebnahme wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt. Die Registrierung des Subagenten erfolgt, nachdem [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster) abgeschlossen ist.

## Architektur

## Agenten

- **Standalone Agents** führen Jobs auf Rechnern und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agent Cluster**
  - **Director Agents** orchestrieren *Subagenten* in einem Agent Cluster. Sie werden von zwei Instanzen im aktiv-passiv Clustering betrieben und vom Controller verwaltet.
  - **Subagenten** führen Jobs auf Rechnern und in Containern aus. Sie können als Arbeitsknoten in einem Agent Cluster betrachtet werden und werden von *Director Agents* verwaltet.

### Verbindungen

- **Standalone Agent**, **Director Agent** Verbindungen werden vom Controller hergestellt. 
- **Subagent** Verbindungen in einem Agenten Cluster werden von *Director Agents* hergestellt.

## Subagent registrieren

Benutzer sollten überprüfen, ob Netzwerkverbindungen von den Servern der Director Agent zum Server des Subagenten verfügbar sind und ob die Firewall-Regeln Verbindungen zum Port des Subagenten zulassen.

Die Seite *Controller/Agenten verwalten* ist über das Radsymbol in der Hauptmenüleiste verfügbar und bietet die Operation *Subagent hinzufügen* aus dem Aktionsmenü des Agenten-Clusters. Daraufhin wird das Popup-Fenster für die Registrierung eines Subagenten angezeigt.

Die Benutzer geben die folgenden Eingaben ein:

- **Kennung Subagent** ist die eindeutige Kennung eines Subagenten, die während der Lebensdauer des Subagenten nicht geändert werden kann. Die *Kennung Subagent* ist bei Jobs und Arbeitsabläufen nicht sichtbar.
  - Hinweis: Verwenden Sie einen eindeutigen Namen bspw. den FQDN des Hosts und den Port des Subagenten.
- **Titel** ist eine Beschreibung, die für einen Subagenten hinzugefügt werden kann.
- **URL** erwartet die URL bestehend aus Protokoll, Host und Port, die von Director Agents verwendet werden, um sich mit dem Subagenten zu verbinden, zum Beispiel http://localhost:4445.
  - Die URL beginnt mit dem *http*-Protokoll, wenn der Subagent das einfache HTTP-Protokoll verwendet. Das *https*-Protokoll wird verwendet, wenn der Subagent für HTTPS konfiguriert ist.
  - Der Hostname kann *localhost* sein, wenn der Subagent auf demselben Rechner wie die Director Agents installiert ist. Andernfalls sollte der FQDN des Hosts des Subagenten angegeben werden.
  - Der *Port* des Subagenten wird während der Installation festgelegt. 
  - **Als eigener Subagent Cluster** erstellt optional einen Subagent Cluster für den Subagenten, siehe [Erste Inbetriebnahme - Registrierung Subagent Cluster](/initial-operation-register-agent-subagent-cluster).

Nach erfolgreicher Registrierung wird der Subagent in der Ansicht [Ressourcen - Agenten](/resources-agents) angezeigt.

## Referenzen

### Kontext-Hilfe

- [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster)
- [Erste Inbetriebnahme - Registrierung Controller](/initial-operation-register-controller)
- [Erste Inbetriebnahme - Registrierung Subagent Cluster](/initial-operation-register-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
