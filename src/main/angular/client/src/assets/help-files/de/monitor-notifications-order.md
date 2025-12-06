# Monitor - Auftrags-Benachrichtigungen

Die Ansicht zeigt die von Arbeitsabläufen ausgelösten Benachrichtigungen an.

Die Benachrichtigungen werden auf der Seite [Configuration - Notification](/configuration-notification) konfiguriert und können bei Erfolg, Warnungen oder Fehlern bei der Ausführung von Aufträgen oder Jobs ausgelöst werden.

- Das Fragment *notify_on_failure_gui* legt fest, ob Benachrichtigungen in dieser Ansicht sichtbar werden.
- Zusätzlich zur Anzeige von Benachrichtigungen in dieser Ansicht können diese per E-Mail und über die Kommandozeile weitergeleitet werden, z.B. an System Monitor Produkte von Drittanbietern. Einzelheiten finden Sie unter [Configuration - Notification ](/configuration-notification).

Benutzer sollten sich darüber im Klaren sein, dass Benachrichtigungen von [Bereinigungsdienst](/service-cleanup) gelöscht werden können. Standardmäßig werden Benachrichtigungen gelöscht, wenn sie älter als ein Tag sind.

## Anzeige von Benachrichtigungen

Benachrichtigungen werden über die folgenden Informationselemente angezeigt:

- **Arbeitsablauf** gibt den Namen eines Arbeitsablaufs an. 
  - Wenn Sie auf den Namen des Arbeitsablaufs klicken, gelangen Sie zur Ansicht [Arbeitsabläufe](/workflows).
  - Wenn Sie auf das Bleistiftsymbol links neben dem Namen des Arbeitsablaufs klicken, gelangen Sie zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).
- **Auftrags-ID** gibt den eindeutigen Bezeichner eines Auftrags an.
- **Job** wird angegeben, wenn die Warnung oder der Fehler durch einen Job verursacht wurde.
- **Typ** ist einer der folgenden Werte
  - **ERFOLG**, der die erfolgreiche Ausführung des Auftrags anzeigt, vorausgesetzt, die Benachrichtigungen sind so konfiguriert, dass sie diesen Status melden.
  - **WARNING**, der von Shell-Jobs ausgelöst wird, für die bestimmte Rückgabewarnungen konfiguriert sind, die sich nicht auf den Ablauf eines Auftrags auswirken, aber die entsprechende Benachrichtigung auslösen.
  - **ERROR**, der von Jobs oder anderen Arbeitsabläufen ausgelöst werden kann. Die Benachrichtigung wird unabhängig von der Tatsache ausgelöst, dass ein Arbeitsablauf eine Fehlerbehandlung wie die *Try/Catch*- oder *Retry-Anweisung* anwendet, die die Fortsetzung eines Auftrags im Arbeitsablauf ermöglicht.
  - **RECOVERED** zeigt an, dass ein zuvor *gescheiterter* Auftrag wiederhergestellt wurde und den Arbeitsablauf erfolgreich durchlaufen hat.
- **Return Code** gibt den Exit Code von Shell Jobs oder den Return Code von JVM Jobs an, die die Notification ausgelöst haben.
- **Message** enthält die Fehlermeldung oder Warnung.
- **Created** gibt das Datum an, an dem die Benachrichtigung ausgelöst wurde.

Eine Warnung oder ein Fehler kann je nach Konfiguration mehrere Benachrichtigungen auslösen, z.B. die Anzeige der Benachrichtigung in dieser Ansicht und die Weiterleitung der Benachrichtigung per E-Mail. 

Für jeden für die Benachrichtigung konfigurierten Kanal wird ein separater Eintrag angezeigt. Einträge für Benachrichtigungen per E-Mail oder über die Befehlszeile bieten ein *Pfeil-nach-unten-Symbol*, das Details über die erfolgreiche/nicht erfolgreiche Verwendung des entsprechenden Channels anzeigt.

## Operationen für Benachrichtigungen

Für jede Warn- und Fehlerbenachrichtigung wird das 3-Punkte-Aktionsmenü für die folgende Operation angeboten:

- **Bestätigen** gibt an, dass der Benutzer die Benachrichtigung zur Kenntnis genommen hat und Maßnahmen ergreift. Die Operation öffnet ein Popup-Fenster, in dem Sie einen Kommentar zur Behandlung der Meldung eingeben können. <br/><br/>Bestätigte Benachrichtigungen sind standardmäßig von der Anzeige ausgeschlossen. Sie können sichtbar gemacht werden, indem Sie die Filterschaltfläche *Bestätigt* auswählen.

*Filter

Oben auf der Seite finden Sie eine Reihe von Filterschaltflächen, die Sie einzeln oder in Kombination anwenden können:

- **Erfolgreich** schränkt die Anzeige auf Benachrichtigungen über die erfolgreiche Ausführung von Aufträgen ein.
- **Fehlgeschlagen** begrenzt die Anzeige der Benachrichtigungen auf Aufträge, die *Fehlgeschlagen* sind.
- **Warnung** begrenzt die Anzeige von Benachrichtigungen auf Aufträge, die Warnungen verursacht haben.
- **Wiederhergestellt** beschränkt die Anzeige von Benachrichtigungen auf Aufträge, die zunächst fehlgeschlagen sind und dann wiederhergestellt wurden, indem sie erfolgreich im Arbeitsablauf fortgesetzt wurden.
- **Bestätigt** schränkt die Anzeige auf Benachrichtigungen ein, die zuvor von dem entsprechenden Vorgang bestätigt wurden.

## Referenzen

### Kontext-Hilfe

- [Bereinigungsdienst](/service-cleanup)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Configuration - Notification](/configuration-notification)
- [Überwachung - Systembenachrichtigungen](/monitor-notifications-system)
- [Arbeitsabläufe](/workflows)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)

