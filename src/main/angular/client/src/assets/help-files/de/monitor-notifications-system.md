# Monitor - System-Benachrichtigungen

In dieser Ansicht werden die von JS7-Produkten ausgelösten Benachrichtigungen angezeigt.

- Für Systembenachrichtigungen muss der *Log Notification Service* auf der Seite [Settings](/settings) im Abschnitt [Einstellungen - Protkoll-Benachrichtigung](/settings-log-notification) eingerichtet werden. Wenn es konfiguriert ist, fungiert das JOC Cockpit als Syslog-Dienst, der Warnungen und Fehler von Controllern und Agenten empfängt, die bei JOC Cockpit registriert sind.
- Zusätzlich zur Anzeige von Benachrichtigungen in dieser Ansicht können diese per E-Mail und über die Kommandozeile weitergeleitet werden, zum Beispiel an System Monitor Produkte von Drittanbietern. Details finden Sie unter [Configuration - Notification ](/configuration-notification).

Benutzer sollten sich darüber im Klaren sein, dass Benachrichtigungen von [Bereinigungsdienst](/service-cleanup) gelöscht werden können. Standardmäßig werden Benachrichtigungen gelöscht, wenn sie älter als ein Tag sind.

## Anzeige von Benachrichtigungen

Benachrichtigungen werden über die folgenden Informationselemente angezeigt:

- **JOC Cockpit ID** gibt die eindeutige Kennung der JOC Cockpit-Instanz an. 
  - **Präfix** ist normalerweise *joc* für eine JOC Cockpit-Instanz, die GUI-Zugriff bietet.
  - **Seriennummer** die Nummer, die der JOC Cockpit-Instanz bei der Installation zugewiesen wurde.
- **Kategorie** gibt das JS7-Produkt an, das die Benachrichtigung ausgelöst hat, nämlich *JOC*, *CONTROLLER* oder *AGENT*.
- **Source** gibt die Quelle an 
  - **LogNotification** zeigt an, dass die Meldung über die Syslog-Schnittstelle empfangen wurde.
  - **Deployment** gibt eine Deployment-Operation in der aktuellen JOC Cockpit-Instanz an.
- **Notifier** ist einer der folgenden Werte
  - **<*Controller-ID*>** gibt den eindeutigen Bezeichner eines Controllers an, wenn die CONTROLLER *Kategorie* angegeben ist.
  - **<*Agent-Name*>(<*Director-Agent*>)** gibt den Namen des Agenten an, wenn die *Kategorie AGENT* angegeben ist.
  - **<*Java-class*>** gibt den Namen der Java-Klasse an, die die Benachrichtigung ausgelöst hat.
- **Typ** ist einer der folgenden Werte
  - **WARNING**, was eine Warnung im Protokoll des JS7-Produkts anzeigt.
  - **ERROR**, der einen Fehler im Protokoll des JS7-Produkts anzeigt.
- **Message** enthält die Fehlermeldung oder Warnung.
- **Exception** gibt die Ausnahme an, die die Meldung ausgelöst hat.
- **Created** gibt das Datum an, an dem die Meldung ausgelöst wurde.

Eine Warnung oder ein Fehler kann je nach Konfiguration mehrere Benachrichtigungen auslösen, z.B. die Anzeige der Benachrichtigung in dieser Ansicht und die Weiterleitung der Benachrichtigung per E-Mail. 

Für jeden für die Benachrichtigung konfigurierten Kanal wird ein separater Eintrag angezeigt. Einträge für Benachrichtigungen per E-Mail oder über die Befehlszeile bieten ein *Pfeil-nach-unten-Symbol*, das Details über die erfolgreiche/nicht erfolgreiche Verwendung des entsprechenden Channels anzeigt.

## Operationen für Benachrichtigungen

Für jede Warn- und Fehlerbenachrichtigung wird das 3-Punkte-Aktionsmenü mit der folgenden Operation angeboten:

- **Bestätigen** gibt an, dass der Benutzer die Benachrichtigung zur Kenntnis genommen hat und Maßnahmen ergreift. Die Aktion öffnet ein Popup-Fenster, in dem Sie einen Kommentar zur Behandlung der Meldung eingeben können. <br/><br/>Bestätigte Benachrichtigungen sind standardmäßig von der Anzeige ausgeschlossen. Sie können sichtbar gemacht werden, indem Sie die Filterschaltfläche *Bestätigt* auswählen.

*Filter

Oben auf der Seite finden Sie eine Reihe von Filterschaltflächen, die Sie einzeln oder in Kombination anwenden können.

Die folgenden Schaltflächen filtern die Quelle der Benachrichtigungen:

- **Alle** zeigt Benachrichtigungen von allen JS7-Produkten an.
- **System**
- **JOC** beschränkt die Anzeige von Benachrichtigungen auf *gescheiterte* Aufträge. 
- **Controller** begrenzt die Anzeige von Benachrichtigungen auf Aufträge, die Warnungen verursacht haben.
- **Agent** beschränkt die Anzeige von Benachrichtigungen auf Aufträge, die zunächst fehlgeschlagen sind und dann durch erfolgreiche Fortsetzung des Arbeitsablaufs wiederhergestellt wurden.

Mit den folgenden Schaltflächen können Sie die Art der Benachrichtigungen filtern:

- **Fehler** gibt an, dass Benachrichtigungen vom *Typ* FEHLER angezeigt werden sollen.
- **Warnung** gibt an, dass Benachrichtigungen vom *Typ* WARNUNG angezeigt werden sollen.
- **Bestätigt** schränkt die Anzeige auf Benachrichtigungen ein, die zuvor von dem entsprechenden Vorgang bestätigt wurden.

## Referenzen

### Kontext-Hilfe

- [Bereinigungsdienst](/service-cleanup)
- [Configuration - Notification ](/configuration-notification)
- [Settings](/settings)
- [Einstellungen - Protkoll-Benachrichtigung](/settings-log-notification)
- [Überwachung - Auftragsbenachrichtigungen](/monitor-notifications-order)
- [Arbeitsabläufe](/workflows)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)

