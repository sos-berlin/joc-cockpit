# Controller und Agenten verwalten

Die Seite *Controller/Agenten verwalten* wird verwendet 

- um Standalone Controller und Controller Cluster zu registrieren,
- um Standalone Agenten beim Controller zu registrieren,
- um Agent Cluster beim Controller zu registrieren:
  - einen Cluster von *Director Agents*
  - einer beliebige Anzahl *Subagenten*, die als Arbeitsknoten fungieren.
  - einer beliebigen Anzahl *Subagent Cluster*, die die Verwendung von Subagenten regeln und die in Arbeitsabläufen den Jobs zugewiesen werden können.

Der Betrieb eines Controller Cluster oder Agent Cluster unterliegt den Vereinbarungen der [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

## Controller registrieren

Die Operation zur Registrierung eines Controller ist über die Schaltfläche *Neuer Controller* verfügbar. Wenn Sie JOC Cockpit zum ersten Mal verwenden, wird das Popup-Fenster zur Registrierung eines Controller automatisch angezeigt.

Erläuterungen finden Sie unter [Erste Inbetriebnahme - Registrierung Controller](/initial-operation-register-controller).

## Operationen für Controller

Für einen vorhandenen Controller werden die folgenden Operationen in seinem 3-Punkte Aktionsmenü angeboten:

- **Bearbeiten** ermöglicht das Ändern der Eigenschaften eines Controller, einschließlich der URLs von Controller Instanzen.
- **Autonomen Agenten hinzufügen** ermöglicht die Registrierung eines Standalone Agent.
  - Erläuterungen finden Sie unter [Erste Inbetriebnahme - Registrierung Standalone Agent](/initial-operation-register-agent-standalone).
- **Cluster Agenten hinzufügen** erlaubt einen Cluster von Agenten zu registrieren:
  - Konfiguration von zwei *Director Agents* und einer beliebigen Anzahl *Subagents*.
  - Erklärungen finden Sie unter [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster).
- **Einmaliges Token erstellen** 
- **Agenten-Konfiguration exportieren** bietet eine Exportdatei im JSON-Format mit der Agenten-Konfiguration des ausgewählten Controller zum Herunterladen an.
- **Agenten-Konfiguration importieren** bietet das Hochladen einer Exportdatei im JSON-Format an, die zuvor exportierte Agenten-Konfigurationen enthält. Die entsprechenden Agenten werden beim Controller registriert.
- **Löschen** ermöglicht das Löschen der Controller Konfiguration einschließlich aller Agenten-Konfigurationen. Dabei werden der Controller und die Agenten nicht von der Festplatte gelöscht, sondern die Konfiguration wird im JOC Cockpit gelöscht.

## Filter

Die folgenden Filter-Schaltflächen für Agenten sind oben auf dem Bildschirm verfügbar:

- **Alle Agenten** zeigt alle Agenten-Konfigurationen an, unabhängig von ihrem Ausrollstatus.
- **Synchronisiert** zeigt Agenten-Konfigurationen an, die auf einen Controller ausgerollt wurden.
- **Nicht synchronisiert** zeigt Agenten-Konfigurationen an, deren Änderungen noch nicht an einen Controller übertragen wurden.
- **Nicht ausgerollt** zeigt Agenten-Konfigurationen an, die noch nicht an einen Controller ausgerollt wurden.
- **Unbekannt** zeigt Agenten-Konfigurationen in einem unbekannten Status an, z.B. nachdem ein Controller neu initialisiert wurde. 

## Referenzen

### Kontext-Hilfe

- [Erste Inbetriebnahme - Registrierung Agent Cluster](/initial-operation-register-agent-cluster)
- [Erste Inbetriebnahme - Registrierung Controller](/initial-operation-register-controller)
- [Erste Inbetriebnahme - Registrierung Standalone Agent](/initial-operation-register-agent-standalone)

### Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)
