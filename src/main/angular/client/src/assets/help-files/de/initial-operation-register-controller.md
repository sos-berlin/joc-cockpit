# Erste Inbetriebnahme - Registrierung Controller

Die erste Inbetriebnahme wird nach der Installation von JS7 Controller, Agent und JOC Cockpit durchgeführt.

Der Betrieb eines Controller Cluster unterliegt den Vereinbarungen der [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

- Verwendung des Standalone Controller:
  - verfügbar für Anwender der Open Source Lizenz und für Inhaber einer kommerziellen Lizenz.
- Verwendung von Controller Cluster:
  - verfügbar für Inhaber einer kommerziellen Lizenzn,
  - für Details siehe [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

Für einen Standalone Controller umfasst die erste Inbetriebnahme

- die Registrierung eines Standalone Controller,
- die Registrierung von Agenten, siehe [Erste Inbetriebnahme - Registrierung Standalone Agent](/initial-operation-register-agent-standalone) und [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster).

Für einen Controller Cluster umfasst die erste Inbetriebnahme

- die Registrierung eines Controller Cluster,
- die Registrierung von Standalone Agenten und/oder Agent Cluster.

## Controller registrieren

Nach der ersten Anmeldung wird ein Popup-Fenster angezeigt, das die Registrierung eines Controller anbietet. Das Popup-Fenster ist ebenfalls über das Radsymbol in der Hauptmenüleiste verfügbar, wenn Sie die Seite *Controller/Agenten verwalten* auswählen.

Das Popup-Fenster bietet die Registrierung eines Standalone Controller an. Die Registrierung eines Controller Cluster wird angeboten, wenn ein JS7 Lizenzschlüssel für JOC Cockpit vorhanden ist. Wenn Sie auf das JS7 Logo in der oberen linken Ecke des GUI von JOC Cockpit klicken, wird der verwendete Lizenztyp angezeigt.

Benutzer sollten überprüfen, ob Netzwerkverbindungen vom JOC Cockpit Server zum Server des Controller verfügbar sind und ob die Firewall-Regeln Verbindungen zulassen.

Nach erfolgreicher Registrierung werden die Controller Instanzen in der Ansicht *Übersicht* angezeigt.

### Standalone Controller registrieren

Die Benutzer geben die folgenden Eingaben ein:

- **Titel** ist die Beschriftung, die im Rechteck der Controller Instanz im der Seite [Übersicht - Produkt Status](/dashboard-product-status) angezeigt wird.
- **JOC Cockpit Verbindung zum Controller** erwartet die URL bestehend aus Protokoll, Host und Port, die von JOC Cockpit für die Verbindung mit dem Controller verwendet werden, z.B. http://localhost:4444.
  - Die URL beginnt mit dem *http*-Protokoll, wenn der Controller das einfache HTTP-Protokoll verwendet. Das *HTTPS*-Protokoll wird verwendet, wenn der Controller für HTTPS konfiguriert ist.
  - Der Hostname kann *localhost* sein, wenn der Controller auf demselben Rechner wie JOC Cockpit installiert ist. Andernfalls sollte der FQDN des Hosts der Controller Instanz angegeben werden.
  - Der *Port* der Controller Instanz wird bei der Installation festgelegt. 

Wenn die Registrierungsinformationen übermittelt werden, stellt JOC Cockpit eine Verbindung zum Standalone Controller her.

### Controller Cluster registrieren

Zu den Voraussetzungen für die Installation gehören:

- JOC Cockpit und alle Controller Instanzen müssen mit einem gültigen JS7 Lizenzschlüssel ausgestattet sein.
- Der Sekundäre Controller muss in seiner Datei *./config/controller.conf* die folgende Einstellung enthalten: *js7.journal.cluster.node.is-backup = yes*
- Die Primäre und Sekundäre Controller Instanz müssen gestartet und betriebsbereit sein.

Die Benutzer geben die folgenden Eingaben ein:

- **Primärer Controller** ist die Controller Instanz, der zunächst die aktive Rolle zugewiesen wird. Die aktive Rolle kann zu einem späteren Zeitpunkt gewechselt werden.
  - **Titel** ist die Beschriftung, die im Rechteck der Controller Instanz im der Seite [Übersicht - Produkt Status](/dashboard-product-status) angezeigt wird.
  - **Verbindung von JOC Cockpit zum Primären Controller** erwartet die URL bestehend aus Protokoll, Host und Port, die von JOC Cockpit für die Verbindung zum Primären Controller verwendet wird, zum Beispiel http://primary-server:4444.
  - **Verbindung vom Sekundären Controller zum Primären Controller** ist in den meisten Situationen die gleiche wie die *Verbindung von JOC Cockpit zum Primären Controller*. Eine andere URL wird verwendet, wenn ein Proxy Server zwischen dem Primären und dem Sekundären Controller betrieben wird. Die URL wird vom Sekundären Controller verwendet, um sich mit dem Primären Controller zu verbinden.
- **Sekundärer Controller** ist die Controller Instanz, der zunächst die Standby Rolle zugewiesen wird.
  - **Titel** ist die Beschriftung, die im Rechteck der Controller Instanz in der Seite [Übersicht - Produkt Status](/dashboard-product-status) angezeigt wird.
  - **Verbindung von JOC Cockpit zum Sekundären Controller** erwartet die URL bestehend aus Protokoll, Host und Port, die von JOC Cockpit für die Verbindung zum Sekundären Controller verwendet werden, zum Beispiel http://secondary-server:4444.
  - **Verbindung vom Primären Controller zum Sekundären Controller** ist in den meisten Fällen die gleiche wie die *Verbindung von JOC Cockpit zum Sekundären Controller*. Eine andere URL wird verwendet, wenn ein Proxy Server zwischen dem Primären und Sekundären Controller betrieben wird. Die URL wird vom Primären Controller verwendet, um sich mit dem Sekundären Controller zu verbinden.

Wenn die Registrierungsinformationen übermittelt werden, stellt JOC Cockpit eine Verbindung zu beiden Instanzen des Primären und Sekundären Controller her.

## Referenzen

### Kontext-Hilfe

- [Übersicht - Produkt Status](/dashboard-product-status)
- [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster)
- [Erste Inbetriebnahme - Registrierung Standalone Agent](/initial-operation-register-agent-standalone)

### Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)
