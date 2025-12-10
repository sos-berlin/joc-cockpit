# Erste Inbetriebnahme - Registrierung Standalone Agent

Erste Inbetriebnahme wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt. Die Registrierung des Agenten erfolgt, nachdem die [Erste Inbetriebnahme - Registrierung Controller](/initial-operation-register-controller) abgeschlossen ist.

## Standalone Agent registrieren

Benutzer sollten überprüfen, ob Netzwerkverbindungen vom Server des Controller zum Server des Agenten verfügbar sind und ob die Firewall-Regeln Verbindungen zum Port des Agenten zulassen.

Die Seite *Controller/Agenten verwalten* ist über das Rädchen-Symbol in der Hauptmenüleiste erreichbar und bietet die Operation *Autonomen Agenten hinzufügen* aus dem Aktionsmenü des Controller. Daraufhin wird das Popup-Fenster für die Registrierung eines Standalone Agenten angezeigt.

Die Benutzer geben die folgenden Eingaben ein:

- **Kennung Agent** ist die eindeutige Kennung eines Agenten, die während der Lebensdauer des Agenten nicht geändert werden kann. Die *Kennung Agent* ist bei Jobs und Arbeitsabläufen nicht sichtbar.
  - Hinweis: Verwenden Sie einen eindeutigen Namen bspw. den FQDN des Hosts und den Port des Agenten
- **Name Agent** ist der eindeutige Name eines Agenten. Wenn einem Job ein Agent zugewiesen wird, wird der *Name Agent* verwendet. 
  - Hinweis: Wenn Sie getrennte Umgebungen für Produktion und Nicht-Produktion verwenden, sollten Sie für beide denselben *Name Agent* verwenden. Geben Sie daher einen sprechenden Namen an, z.B. für einen Geschäftsprozess wie *Fakturierung*, *Buchhaltung*, *Berichtswesen* etc.
  - Hinweis: Wenn Sie den *Name Agent* später ändern, können Sie den vorherigen *Name Agent* als *Alias-Name* weiterverwenden.
- **Titel** ist eine Beschreibung, die für einen Agenten hinzugefügt werden kann.
- **Alias-Namen** sind alternative Namen für denselben Agenten. Wenn Sie einem Job einen Agenten zuweisen, dann werden auch *Alias-Namen* angeboten. *Alias-Namen* können z.B. verwendet werden, wenn eine Testumgebung weniger Agenten enthält als die Produktionsumgebung: Damit die Agentenzuweisungen zwischen den Umgebungen unverändert bleiben, werden die fehlenden Agenten von *Alias-Namen* desselben Agenten abgebildet.
- **URL** wird erwartet bestehend aus Protokoll, Host und Port, die der Controller für die Verbindung mit dem Agenten verwendet, zum Beispiel http://localhost:4445.
  - Die URL beginnt mit dem *http*-Protokoll, wenn der Agent das einfache HTTP-Protokoll verwendet. Das *https*-Protokoll wird verwendet, wenn der Agent für HTTPS konfiguriert ist.
  - Der Hostname kann *localhost* sein, wenn der Agent auf demselben Rechner wie der Controller installiert ist. Andernfalls sollte der FQDN des Hosts des Agenten angegeben werden.
  - Der *Port* des Agenten wird bei der Installation festgelegt. 

Nach erfolgreicher Registrierung wird der Agent in der Ansicht [Ressourcen - Agenten](/resources-agents) angezeigt.

## Referenzen

### Kontext-Hilfe

- [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster)
- [Erste Inbetriebnahme - Registrierung Controller](/initial-operation-register-controller)

### Product Knowledge Base

- [JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
- [JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)
