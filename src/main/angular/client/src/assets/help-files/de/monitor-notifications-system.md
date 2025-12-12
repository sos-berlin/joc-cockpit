# Monitor - System-Benachrichtigungen

In dieser Ansicht werden die von JS7 Produkten ausgelösten Benachrichtigungen angezeigt.

- Für Systembenachrichtigungen muss der *Protokoll-Benachrichtigungsdienst* auf der Seite [Einstellungen](/settings) im Abschnitt [Einstellungen - Protkoll-Benachrichtigung](/settings-log-notification) eingerichtet werden. Wenn der Dienst konfiguriert ist, fungiert das JOC Cockpit als Syslog Server, der Warnungen und Fehler von Controller und Agenten empfängt, die bei JOC Cockpit registriert sind.
- Zusätzlich zur Anzeige von Benachrichtigungen in dieser Ansicht können diese per E-Mail und über die Kommandozeile weitergeleitet werden, zum Beispiel an System Monitor Produkte von Drittanbietern. Details finden Sie unter [Configuration - Notification ](/configuration-notification).

Benutzer sollten sich bewusst sein, dass Benachrichtigungen vom [Bereinigungsdienst](/service-cleanup) gelöscht werden. Standardmäßig werden Benachrichtigungen gelöscht, wenn sie älter als ein Tag sind.

## Anzeige von Benachrichtigungen

Benachrichtigungen werden über die folgenden Informationselemente angezeigt:

- **JOC Cockpit ID** gibt die eindeutige Kennung der JOC Cockpit Instanz an. 
  - **Präfix** ist normalerweise *joc* für eine JOC Cockpit Instanz, die GUI-Zugriff bietet.
  - **Lfd. Nummer** ist die fortlaufende Nummer, die der JOC Cockpit Instanz bei der Installation zugewiesen wurde.
- **Kategorie** gibt das JS7 Produkt an, das die Benachrichtigung ausgelöst hat, *JOC*, *CONTROLLER* oder *AGENT*.
- **Quelle** gibt die Herkunft an:
  - **LogNotification** zeigt an, dass die Meldung über die Syslog-Schnittstelle empfangen wurde.
  - **Deployment** zeigt eine Ausrolloperation in der aktuellen JOC Cockpit Instanz an.
- **Benachrichtigung** ist einer der folgenden Werte
  - **<*Controller-ID*>** gibt den eindeutigen Bezeichner eines Controller an, wenn die CONTROLLER *Kategorie* angegeben ist.
  - **<*Agent-Name*>(<*Director-Agent*>)** gibt den Namen des Agenten an, wenn die Kategorie *AGENT* angegeben ist.
  - **<*Java-class*>** gibt den Namen der Java-Klasse an, die die Benachrichtigung ausgelöst hat.
- **Typ** ist einer der folgenden Werte:
  - **WARNING** zeigt eine Warnung im Protokoll des JS7 Produkts an.
  - **ERROR** zeigt eine Fehlermeldung im Protokoll des JS7 Produkts an.
- **Nachricht** enthält die Fehlermeldung oder Warnung.
- **Ausnahme** gibt die Ausnahme an, die die Meldung ausgelöst hat.
- **Erstellt** gibt das Datum an, an dem die Meldung ausgelöst wurde.

Eine Warnung oder ein Fehler kann je nach Konfiguration mehrere Benachrichtigungen auslösen, z.B. die Anzeige der Benachrichtigung in dieser Ansicht und die Weiterleitung der Benachrichtigung per E-Mail. 

Für jeden für die Benachrichtigung konfigurierten Kanal wird ein separater Eintrag angezeigt. Einträge für Benachrichtigungen per E-Mail oder über die Befehlszeile bieten ein *Pfeil-nach-unten-Symbol*, das Details über die erfolgreiche/nicht erfolgreiche Verwendung des entsprechenden Kanals anzeigt.

## Operationen für Benachrichtigungen

Für jede Fehlerbenachrichtigung wird das 3-Punkte Aktionsmenü mit der folgenden Operation angeboten:

- **Quittieren** gibt an, dass der Benutzer die Benachrichtigung zur Kenntnis genommen hat und Maßnahmen ergreift. Die Aktion öffnet ein Popup-Fenster, in dem Sie einen Kommentar zur Behandlung der Meldung eingeben können. <br/><br/>Quittierte Benachrichtigungen sind standardmäßig von der Anzeige ausgeschlossen. Sie können sichtbar gemacht werden, indem Sie die Filterschaltfläche *Quittiert* auswählen.

## Filter

Oben auf der Seite finden Sie eine Reihe von Filterschaltflächen, die Sie einzeln oder in Kombination anwenden können.

Die folgenden Schaltflächen filtern die Quelle der Benachrichtigungen:

- **Alle** zeigt Benachrichtigungen von allen JS7 Produkten an.
- **System** beschränkt Benachrichtiugungen auf Probleme, die im Betriebssystem aufgetreten sind.
- **JOC** beschränkt die Anzeige von Benachrichtigungen auf Probleme, die in JOC Cockpit aufgetreten sind.
- **Controller** begrenzt die Anzeige von Benachrichtigungen auf Probleme, die im Controller aufgetreten sind.
- **Agent** beschränkt die Anzeige von Benachrichtigungen auf Probleme, die in Agenten aufgetreten sind.

Mit den folgenden Schaltflächen können Sie die Art der Benachrichtigungen filtern:

- **Fehler** gibt an, dass Benachrichtigungen vom *Typ* ERROR angezeigt werden sollen.
- **Warnung** gibt an, dass Benachrichtigungen vom *Typ* WARNING angezeigt werden sollen.
- **Quittiert** schränkt die Anzeige auf Benachrichtigungen ein, die zuvor vom Benuter *quittiert* wurden.

## Referenzen

### Kontext-Hilfe

- [Arbeitsabläufe](/workflows)
- [Bereinigungsdienst](/service-cleanup)
- [Einstellungen](/settings)
- [Einstellungen - Protkoll-Benachrichtigung](/settings-log-notification)
- [Konfiguration - Benachrichtigung](/configuration-notification)
- [Überwachung - Auftragsbenachrichtigungen](/monitor-notifications-order)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
