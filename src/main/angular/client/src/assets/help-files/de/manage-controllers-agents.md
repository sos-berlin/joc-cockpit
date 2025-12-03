# Controller und Agenten verwalten

Die Seite *Controller/Agenten verwalten* wird verwendet 

- um Standalone-Controller und Controller-Cluster zu registrieren,
- um eigenständige Agenten bei Controllern zu registrieren,
- um Cluster-Agenten bei Controllern zu registrieren,
  - einen Cluster von *Direktor-Agenten* zu spezifizieren
  - die Angabe einer beliebigen Anzahl von *Subagenten*, die als Worker-Knoten fungieren.
  - die Angabe einer beliebigen Anzahl von *Subagenten-Clustern*, die die Verwendung von Agenten regeln und denen in Arbeitsabläufen Jobs zugewiesen werden können.

Der Betrieb eines Controller Clusters oder Agent Clusters unterliegt den Vereinbarungen der [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License).

## Controller registrieren

Der Vorgang zur Registrierung eines Controllers ist über die Schaltfläche *Neuer Controller* verfügbar. Wenn Sie JOC Cockpit zum ersten Mal verwenden, wird das Popup-Fenster zur Registrierung eines Controllers automatisch angezeigt.

Erläuterungen finden Sie unter [Initial Operation - Register Controller](/initial-operation-register-controller).

## Operationen mit Controllern

Für einen vorhandenen Controller werden die folgenden Operationen in seinem 3-Punkte-Aktionsmenü angeboten:

- **Bearbeiten** ermöglicht das Ändern der Eigenschaften eines Controllers, einschließlich der URLs von Controller-Instanzen.
- **Eigenständigen Agenten hinzufügen** ermöglicht die Registrierung eines eigenständigen Agenten.
  - Erläuterungen finden Sie unter [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone).
- mit **Cluster-Agent hinzufügen** können Sie einen Cluster von Agenten registrieren. 
  - Der Vorgang umfasst die Angabe von *Director Agents* und *Subagents*.
  - Erklärungen finden Sie unter [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster).
- **Einmaliges Token erstellen** 
- **Agentenkonfiguration exportieren** bietet eine Exportdatei im JSON-Format mit den Agentenkonfigurationen des ausgewählten Controllers zum Download an.
- **Agentenkonfiguration importieren** bietet das Hochladen einer Exportdatei im JSON-Format an, die zuvor exportierte Agentenkonfigurationen enthält. Die entsprechenden Agenten werden bei dem Controller registriert.
- **Löschen** ermöglicht das Löschen der Controller-Konfiguration einschließlich aller Agentenkonfigurationen. Dabei werden der Controller und die Agenten nicht von der Festplatte gelöscht, sondern die Konfiguration wird im JOC Cockpit gelöscht.

## Filter

Die folgenden Filter-Schaltflächen für Agenten sind oben auf dem Bildschirm verfügbar:

- **Alle Agenten** zeigt alle Agentenkonfigurationen an, unabhängig von ihrem Bereitstellungsstatus.
- **Synchronisiert** zeigt Agent-Konfigurationen an, die auf einem Controller bereitgestellt wurden.
- **Nicht synchronisiert** zeigt Agentenkonfigurationen an, deren Änderungen noch nicht an einen Controller übertragen wurden.
- **Nicht bereitgestellt** zeigt Agentenkonfigurationen an, die noch nicht an einen Controller bereitgestellt wurden.
- **Unbekannt** zeigt Agentenkonfigurationen in einem unbekannten Status an, z.B. nachdem ein Controller neu initialisiert wurde. Die Benutzer sollten die Agentenkonfiguration bereitstellen.

## Referenzen

### Kontexthilfe

- [Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster)
- [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)
- [Initial Operation - Register Controller](/initial-operation-register-controller)

### Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

