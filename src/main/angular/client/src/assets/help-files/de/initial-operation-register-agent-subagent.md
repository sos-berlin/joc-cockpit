# Erste Inbetriebnahme - Unteragent registrieren

Initial Operation wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt. Die Registrierung des Subagenten erfolgt, nachdem [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster) abgeschlossen ist.

## Architektur

## Agenten

- **Standalone-Agenten** führen Aufträge auf entfernten Rechnern vor Ort und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agenten-Cluster**
  - **Direktor-Agenten** orchestrieren *Unteragenten* in einem Agenten-Cluster. Sie werden von zwei Instanzen im Aktiv-Passiv-Clustering betrieben und vom Controller verwaltet.
  - **Subagents** führen Aufträge auf entfernten Rechnern vor Ort und in Containern aus. Sie können als Arbeitsknoten in einem Agenten-Cluster betrachtet werden und werden von *Direktor-Agenten* verwaltet.

### Verbindungen

- **Standalone Agent**, **Director Agent** Verbindungen werden vom Controller hergestellt. 
- **Subagenten**-Verbindungen in einem Agenten-Cluster werden von *Direktor-Agenten* hergestellt.

## Subagent registrieren

Benutzer sollten überprüfen, ob Netzwerkverbindungen von den Servern der Director Agents zum Server des Subagenten verfügbar sind und ob die Firewall-Regeln Verbindungen zum Port des Subagenten zulassen.

Die Seite *Controller/Agenten verwalten* ist über das Radsymbol in der Hauptmenüleiste verfügbar und bietet die Operation *Subagent hinzufügen* aus dem Aktionsmenü des Agenten-Clusters. Daraufhin wird das Popup-Fenster für die Registrierung eines Subagenten angezeigt.

Die Benutzer geben die folgenden Eingaben ein:

- **Subagent ID** ist die eindeutige Kennung eines Subagenten, die während der Lebensdauer des Subagenten nicht geändert werden kann. Die *Subagent ID* ist bei Jobs und Arbeitsabläufen nicht sichtbar.
- **Title** ist eine Beschreibung, die für einen Subagenten hinzugefügt werden kann.
- **URL** erwartet die URL von Protokoll, Host und Port, die von Director-Agenten verwendet werden, um sich mit dem Subagenten zu verbinden, zum Beispiel http://localhost:4445.
  - Die URL beginnt mit dem *http*-Protokoll, wenn der Subagent das einfache HTTP-Protokoll verwendet. Das *https*-Protokoll wird verwendet, wenn der Subagent für HTTPS konfiguriert ist.
  - Der Hostname kann *localhost* sein, wenn der Subagent auf demselben Rechner wie die Director Agents installiert ist. Andernfalls sollte der FQDN des Hosts des Subagenten angegeben werden.
  - Der *Port* des Subagenten wird während der Installation festgelegt. 
  - **Als eigener Subagent Cluster** erstellt optional einen Subagent Cluster für den Subagenten, siehe [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster).

Nach erfolgreicher Registrierung wird der Subagent in der Ansicht [Resources - Agents](/resources-agents) angezeigt.

## Referenzen

### Kontexthilfe

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)
- [Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

