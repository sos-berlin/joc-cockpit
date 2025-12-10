# Erste Inbetriebnahme - Registrierung Agent Cluster

Die erste Inbetriebnahme wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt. Die Registrierung eines Agent Cluster erfolgt, nachdem die [Erste Inbetriebnahme - Registrierung Controller](/initial-operation-register-controller) abgeschlossen ist.

Der Betrieb eines Agent Cluster unterliegt den Vereinbarungen der [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Verwendung des Standalone Agent:
  - verfügbar für Anwender der Open Source Lizenz und für Inhaber einer kommerziellen Lizenz.
- Verwendung des Agent Cluster:
  - verfügbar für Inhaber einer kommerziellen Lizenz,
  - für Details siehe [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

## Architektur

### Agenten

- **Standalone Agents** führen Jobs auf Rechnern und in Containern aus. Sie werden einzeln betrieben und vom Controller verwaltet.
- **Agent Cluster**
  - **Director Agents** orchestrieren *Subagenten* in einem Agent Cluster. Sie werden von zwei Instanzen im aktiv-passiv Clustering betrieben und vom Controller verwaltet.
  - **Subagenten** führen Jobs auf Rechnern und in Containern aus. Sie können als Arbeitsknoten in einem Agent Cluster betrachtet werden und werden von *Director Agents* verwaltet.

### Verbindungen

- **Standalone Agent**, **Director Agent** Verbindungen werden vom Controller hergestellt. 
- **Subagenten** Verbindungen in einem Agent Cluster werden von *Director Agents* hergestellt.

## Agent Cluster registrieren

Die Registrierung eines Agent Cluster umfasst den Primären und Sekundären Director Agent. Für die spätere Registrierung von Subagenten siehe - [Erste Inbetriebnahme - Registrierung Subagent](/initial-operation-register-agent-subagent).

Zu den Voraussetzungen vor der Installation gehören:

- JOC Cockpit, Controller und alle Director Agent Instanzen müssen mit einem gültigen JS7 Lizenzschlüssel ausgestattet sein.
- Der Sekundäre Director Agent muss in seiner Datei *./config/agent.conf* die Einstellung aufweisen: *js7.journal.cluster.node.is-backup = yes*
- Der Primäre und Sekundäre Director Agent müssen konfiguriert und gestartet sein.

Benutzer sollten überprüfen, ob die Netzwerkverbindungen vom Server des Controller zu den Servern beider Director Agents verfügbar sind und ob die Firewall-Regeln Verbindungen zu den Ports der Director Agents zulassen.

Die Seite *Controller/Agenten verwalten* ist über das Radsymbol in der Hauptmenüleiste erreichbar und bietet die Operation *Cluster Agenten hinzufügen* aus dem Aktionsmenü des Controller. Dadurch wird das Popup-Fenster für die Registrierung eines Agent Cluster angezeigt.

Die Benutzer geben die folgenden Eingaben ein:

- **Kennung Agent** ist die eindeutige Kennung des Agenten Cluster, die während der Lebensdauer des Clusters nicht geändert werden kann. Die *Kennung Agent* ist bei Jobs und Arbeitsabläufen nicht sichtbar.
  - Hinweis: Verwenden Sie einen eindeutigen Namen bspw. *agent-cluster-001*.
- **Name Agenten Cluster** ist der eindeutige Name eines Agenten Cluster. Wenn Sie einem Job einen Agenten zuweisen, wird der *Name Agenten Cluster* verwendet. Wenn Sie den *Name Agenten Cluster* später ändern, können Sie den vorherigen *Name Agenten Cluster* aus einem *Alias-Namen* weiter verwenden.
  - Hinweis: Wenn Sie getrennte Umgebungen für Produktion und Nicht-Produktion verwenden, sollten Sie für beide denselben *Name Agenten Cluster* verwenden. Geben Sie daher einen sprechenden Namen an, z.B. für einen Geschäftsbereich wie *Vertrieb*, *Finanzen* etc.
  - Hinweis: Wenn Sie den *Agent Cluster Name* später ändern, können Sie den vorherigen *Agent Cluster Name* als *Alias Name* weiterverwenden.  
- **Titel** ist eine Beschreibung, die für einen Agent Cluster hinzugefügt werden kann.
- **Alias-Namen** sind alternative Namen für denselben Agent Cluster. Wenn Sie einem Job einen Agent zuweisen, werden auch *Alias Cluster Names* angeboten. *Alias Cluster Names* können z.B. verwendet werden, wenn eine Testumgebung weniger Agent Cluster enthält als die Produktionsumgebung: Damit die Agentenzuweisungen zwischen den Umgebungen unverändert bleiben, werden die fehlenden Agent Cluster von *Alias Cluster Names* desselben Agent Clusters abgebildet.
- **Primärer Director Agent**
  - die **Kennung Subagent** ist die eindeutige Kennung des Primären Director Agent, die während der Lebensdauer des Director Agent nicht geändert werden kann. Die *Kennung Subagent* ist bei Jobs und Arbeitsabläufen nicht sichtbar.
    - Hinweis: Verwenden Sie einen eindeutigen Namen bspw. den FQDN des Hosts und den Port des Agenten.
  - **Titel** ist eine Beschreibung, die für einen Director Agent hinzugefügt werden kann.
  - **URL** erwartet die URL bestehend aus Protokoll, Host und Port, die der Controller für die Verbindung mit dem Primären Director Agent verwendet, zum Beispiel http://localhost:4445.
    - Die URL beginnt mit dem Protokoll *http*, wenn der Director Agent das einfache HTTP-Protokoll verwendet. Das *https*-Protokoll wird verwendet, wenn der Director Agent für HTTPS konfiguriert ist.
    - Der Hostname kann *localhost* sein, wenn der Director Agent auf demselben Rechner wie der Controller installiert ist. Andernfalls sollte der FQDN des Hosts des Director Agent angegeben werden.
    - Der *Port* des Director Agent wird während der Installation festgelegt. 
  - **Als eigener Subagent Cluster** erstellt optional Subagent Cluster für den Primären und Sekundären Director Agent, siehe [Erste Inbetriebnahme - Registrierung Subagent Cluster](/initial-operation-register-agent-subagent-cluster).
- **Sekundärer Director Agent**
  - die **Kennung Subagent** ist die eindeutige Kennung des Sekundären Director Agent, die während der Lebensdauer des Director Agent nicht geändert werden kann. Die *Kennung Subagent* ist bei Jobs und Arbeitsabläufen nicht sichtbar.
    - Hinweis: Verwenden Sie einen eindeutigen Namen bspw. den FQDN des Hosts und den Port des Agenten.
  - **Titel** ist eine Beschreibung, die für einen Director Agent hinzugefügt werden kann.
  - **URL** erwartet die URL bestehend aus Protokoll, Host und Port, die der Controller zur Verbindung mit dem Sekundären Director Agent verwendet, ähnlich wie beim *Primären Director Agent*.

Nach erfolgreicher Registrierung wird der Agent Cluster in der Ansicht [Ressourcen - Agenten](/resources-agents) angezeigt.

## Referenzen

### Kontext-Hilfe

- [Erste Inbetriebnahme - Registrierung Controller](/initial-operation-register-controller)
- [Erste Inbetriebnahme - Registrierung Standalone Agent](/initial-operation-register-agent-standalone)
- [Erste Inbetriebnahme - Registrierung Subagent](/initial-operation-register-agent-subagent)
- [Erste Inbetriebnahme - Registrierung Subagent Cluster](/initial-operation-register-agent-subagent-cluster)
- [Übersicht - Produkt Status](/dashboard-product-status)

### Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
