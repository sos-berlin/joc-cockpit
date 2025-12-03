# Erstmalige Inbetriebnahme - Standalone-Agent registrieren

Initial Operation wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt. Die Registrierung des Agenten erfolgt, nachdem [Initial Operation - Register Controller](/initial-operation-register-controller) abgeschlossen ist.

## Standalone-Agent registrieren

Benutzer sollten überprüfen, ob Netzwerkverbindungen vom Server des Controllers zum Server des Agenten verfügbar sind und ob die Firewall-Regeln Verbindungen zum Port des Agenten zulassen.

Die Seite *Controller/Agenten verwalten* ist über das Rädchen-Symbol in der Hauptmenüleiste erreichbar und bietet den Vorgang *Einzelplatz-Agent hinzufügen* aus dem Aktionsmenü des Controllers. Daraufhin wird das Popup-Fenster für die Registrierung eines Standalone-Agenten angezeigt.

Die Benutzer geben die folgenden Eingaben ein:

- **Agent ID** ist die eindeutige Kennung eines Agenten, die während der Lebensdauer des Agenten nicht geändert werden kann. Die *Agent ID* ist bei Jobs und Arbeitsabläufen nicht sichtbar.
- **Agentenname** ist der eindeutige Name eines Agenten. Wenn einem Job ein Agent zugewiesen wird, wird der *Agentenname* verwendet. Wenn Sie den *Agentennamen* später ändern, müssen Sie den vorherigen *Agentennamen* aus einem *Aliasnamen* weiterverwenden.
- **Titel** ist eine Beschreibung, die für einen Agenten hinzugefügt werden kann.
- **Alias-Namen** sind alternative Namen für denselben Agenten. Wenn Sie einem Job einen Agenten zuweisen, dann werden auch *Aliasnamen* angeboten. *Alias-Namen* können z.B. verwendet werden, wenn eine Testumgebung weniger Agenten enthält als die Produktionsumgebung: Damit die Agentenzuweisungen zwischen den Umgebungen unverändert bleiben, werden die fehlenden Agenten von *Alias-Namen* desselben Agenten gemappt.
- **URL** erwartet die URL aus Protokoll, Host und Port, die der Controller für die Verbindung mit dem Agenten verwendet, zum Beispiel http://localhost:4445.
  - Die URL beginnt mit dem *http*-Protokoll, wenn der Agent das einfache HTTP-Protokoll verwendet. Das *https*-Protokoll wird verwendet, wenn der Agent für HTTPS konfiguriert ist.
  - Der Hostname kann *localhost* sein, wenn der Agent auf demselben Rechner wie der Controller installiert ist. Andernfalls sollte der FQDN des Agent-Hosts angegeben werden.
  - Der *Port* des Agenten wird bei der Installation festgelegt. 

Nach erfolgreicher Registrierung wird der Agent in der Ansicht [Resources - Agents](/resources-agents) angezeigt.

## Referenzen

### Kontexthilfe

- [Dashboard - Product Status](/dashboard-product-status)
- [Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Controller](/initial-operation-register-controller)

### Product Knowledge Base

- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

