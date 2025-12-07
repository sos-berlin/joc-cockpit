# Erstmalige Inbetriebnahme - Register Controller

Die Erstinbetriebnahme wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt.

Der Betrieb eines Controller Clusters unterliegt den Vereinbarungen der [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Verwendung des Standalone Controllers:
  - verfügbar für Inhaber einer Open Source-Lizenz und für Inhaber einer kommerziellen Lizenz.
- Verwendung von Controller Cluster:
  - verfügbar für kommerzielle Lizenznehmer,
  - für Details siehe [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

Für einen Standalone-Controller umfasst die Erstinbetriebnahme

- die Registrierung eines Standalone-Controllers,
- die Registrierung von Agenten, siehe [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone) und [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster).

Für einen Controller-Cluster umfasst die erste Inbetriebnahme

- die Registrierung eines Controller-Clusters,
- die Registrierung von Standalone-Agenten oder Cluster-Agenten.

## Controller registrieren

Nach der ersten Anmeldung wird ein Popup-Fenster angezeigt, das die Registrierung eines Controllers anbietet. Das Popup-Fenster ist ebenfalls über das Radsymbol in der Hauptmenüleiste verfügbar, wenn Sie die Seite *Controller/Agenten verwalten* auswählen.

Das Popup-Fenster bietet die Registrierung eines eigenständigen Controllers an. Die Registrierung eines Controller-Clusters wird angeboten, wenn ein JS7-Lizenzschlüssel für JOC Cockpit vorhanden ist. Wenn Sie auf das JS7-Logo in der oberen linken Ecke der GUI von JOC Cockpit klicken, wird der verwendete Lizenztyp angezeigt.

Benutzer sollten überprüfen, ob Netzwerkverbindungen vom JOC Cockpit-Server zum Server des Controllers verfügbar sind und ob die Firewall-Regeln Verbindungen zulassen.

Nach erfolgreicher Registrierung werden die Controller-Instanzen in der Ansicht *Dashboard* angezeigt.

### Eigenständigen Controller registrieren

Die Benutzer geben die folgenden Eingaben ein:

- **Beschriftung** ist der Titel des Controllers, der zusammen mit dem Rechteck des Controllers im der seite [Übersicht - Produkt Status](/dashboard-product-status) angezeigt wird.
- **JOC Cockpit Verbindung zum Controller** erwartet die URL von Protokoll, Host und Port, die von JOC Cockpit für die Verbindung mit dem Controller verwendet werden, z.B. http://localhost:4444.
  - Die URL beginnt mit dem *http*-Protokoll, wenn der Controller das einfache HTTP-Protokoll verwendet. Das *https*-Protokoll wird verwendet, wenn der Controller für HTTPS konfiguriert ist.
  - Der Hostname kann *localhost* sein, wenn der Controller auf demselben Rechner wie JOC Cockpit installiert ist. Andernfalls sollte der FQDN des Hosts des Controllers angegeben werden.
  - Der *Port* des Controllers wird bei der Installation festgelegt. 

Wenn die Registrierungsinformationen übermittelt werden, stellt JOC Cockpit eine Verbindung zum Standalone Controller her.

### Controller Cluster registrieren

Zu den Voraussetzungen für die Installation gehören:

- JOC Cockpit und alle Controller-Instanzen müssen mit einem gültigen JS7-Lizenzschlüssel ausgestattet sein.
- Der sekundäre Controller muss in seiner Datei ./config/controller.conf die folgende Einstellung enthalten: *js7.journal.cluster.node.is-backup = yes*
- Sowohl die primäre als auch die sekundäre Controller-Instanz müssen betriebsbereit sein.

Die Benutzer geben die folgenden Eingaben ein:

- **Primärer Controller** ist die Controller-Instanz, der zunächst die aktive Rolle zugewiesen wird. Die aktive Rolle kann zu einem späteren Zeitpunkt gewechselt werden.
  - **Beschriftung** ist der Titel des Controllers, der zusammen mit dem Rechteck des Controller im Bereich [Übersicht - Produkt Status](/dashboard-product-status) angezeigt wird.
  - **JOC Cockpit Verbindung zum Primary Controller** erwartet die URL von Protokoll, Host und Port, die von JOC Cockpit für die Verbindung zum Primary Controller verwendet werden, zum Beispiel http://primary-server:4444.
  - die **Secondary Controller Verbindung zum Primary Controller** ist in den meisten Situationen die gleiche wie die *JOC Cockpit Verbindung zum Primary Controller*. Eine andere URL wird verwendet, wenn ein Proxy Server zwischen dem Primary und dem Secondary Controller betrieben wird. Die URL wird vom Secondary Controller verwendet, um sich mit dem Primary Controller zu verbinden.
- **Secondary Controller** ist die Controller-Instanz, der zunächst die Standby-Rolle zugewiesen wird.
  - **Beschriftung** ist der Titel des Controllers, der zusammen mit dem Rechteck des Controllers im Bereich [Übersicht - Produkt Status](/dashboard-product-status) angezeigt wird.
  - **JOC Cockpit Verbindung zum Secondary Controller** erwartet die URL von Protokoll, Host und Port, die von JOC Cockpit für die Verbindung zum Secondary Controller verwendet werden, zum Beispiel http://secondary-server:4444.
  - die **Verbindung vom primären Controller zum sekundären Controller** ist in den meisten Fällen die gleiche wie die *JOC Cockpit Verbindung zum sekundären Controller*. Eine andere URL wird verwendet, wenn ein Proxy Server zwischen dem Primary und dem Secondary Controller betrieben wird. Die URL wird vom Primary Controller verwendet, um sich mit dem Secondary Controller zu verbinden.

Wenn die Registrierungsinformationen übermittelt werden, stellt JOC Cockpit eine Verbindung zu beiden Instanzen des Primary und Secondary Controllers her.

## Referenzen

### Kontext-Hilfe

- [Übersicht - Produkt Status](/dashboard-product-status)
- [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)

### Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

