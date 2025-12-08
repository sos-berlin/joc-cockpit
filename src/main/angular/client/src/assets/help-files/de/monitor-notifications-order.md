# Monitor - Auftrags-Benachrichtigungen

Die Ansicht zeigt die von Arbeitsabläufen ausgelösten Benachrichtigungen an.

Die Benachrichtigungen werden auf der Seite [Konfiguration - Benachrichtigung](/configuration-notification) konfiguriert und können bei Erfolg, Warnungen oder Fehlern bei der Ausführung von Aufträgen oder Jobs ausgelöst werden.

- Das Fragment *notify_on_failure_gui* legt fest, ob Benachrichtigungen in dieser Ansicht sichtbar werden.
- Zusätzlich zur Anzeige von Benachrichtigungen in dieser Ansicht können diese per E-Mail und über die Kommandozeile weitergeleitet werden, z.B. an System Monitor Produkte von Drittanbietern. Einzelheiten finden Sie unter [Konfiguration - Benachrichtigung](/configuration-notification).

Benutzer sollten sich bewusst sein, dass Benachrichtigungen vom [Bereinigungsdienst](/service-cleanup) gelöscht werden. Standardmäßig werden Benachrichtigungen gelöscht, wenn sie älter als ein Tag sind.

## Anzeige von Benachrichtigungen

Benachrichtigungen werden über die folgenden Informationselemente angezeigt:

- **Arbeitsablauf** gibt den Namen eines Arbeitsablaufs an. 
  - Wenn Sie auf den Namen des Arbeitsablaufs klicken, gelangen Sie zur Ansicht [Arbeitsabläufe](/workflows).
  - Wenn Sie auf das Bleistiftsymbol links neben dem Namen des Arbeitsablaufs klicken, gelangen Sie zur Ansicht [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows).
- **Auftragskennung** gibt den eindeutigen Bezeichner eines Auftrags an.
- **Job** wird angezeigt, wenn die Warnung oder der Fehler durch einen Job verursacht wurde.
- **Typ** ist einer der folgenden Werte
  - **SUCCESS** zeigt die erfolgreiche Ausführung des Auftrags an, vorausgesetzt, die Benachrichtigungen sind so konfiguriert, dass sie diesen Status melden.
  - **WARNING** wird von Jobs ausgelöst, für die bestimmte Rückgabewerte konfiguriert sind, die sich nicht auf den Ablauf eines Auftrags auswirken, aber die entsprechende Benachrichtigung auslösen.
  - **ERROR** wird von Jobs oder anderen Arbeitsablauf-Anweisungen ausgelöst. Die Benachrichtigung wird unabhängig von der Tatsache ausgelöst, dass ein Arbeitsablauf eine Fehlerbehandlung wie die *Try/Catch*- oder *Retry-Anweisung* anwendet, die die Fortsetzung eines Auftrags im Arbeitsablauf ermöglicht.
  - **RECOVERED** zeigt an, dass ein zuvor *fehlgeschlagener* Auftrag wiederhergestellt wurde und den Arbeitsablauf erfolgreich durchlaufen hat.
- **Rückgabewert** gibt den Exit Code von Shell Jobs an oder den Return Code von JVM Jobs, die die Benachrichtigung ausgelöst haben.
- **Nachricht** enthält die Fehlermeldung oder Warnung.
- **Erstellt** gibt das Datum an, an dem die Benachrichtigung ausgelöst wurde.

Eine Warnung oder ein Fehler kann je nach Konfiguration mehrere Benachrichtigungen auslösen, z.B. die Anzeige der Benachrichtigung in dieser Ansicht und die Weiterleitung der Benachrichtigung per E-Mail. 

Für jeden für die Benachrichtigung konfigurierten Kanal wird ein separater Eintrag angezeigt. Einträge für Benachrichtigungen per E-Mail oder über die Befehlszeile bieten ein *Pfeil-nach-unten-Symbol*, das Details über die erfolgreiche/nicht erfolgreiche Verwendung des entsprechenden Kanals anzeigt.

## Operationen für Benachrichtigungen

Für jede Warn- und Fehlerbenachrichtigung wird das 3-Punkte Aktionsmenü für die folgende Operation angeboten:

- **Quittieren** gibt an, dass der Benutzer die Benachrichtigung zur Kenntnis genommen hat und Maßnahmen ergreift. Die Operation öffnet ein Popup-Fenster, in dem Sie einen Kommentar zur Behandlung der Meldung eingeben können. <br/><br/>Quittierte Benachrichtigungen sind standardmäßig von der Anzeige ausgeschlossen. Sie können sichtbar gemacht werden, indem Sie die Filterschaltfläche *Quittiert* auswählen.

## Filter

Oben auf der Seite finden Sie eine Reihe von Filterschaltflächen, die Sie einzeln oder in Kombination anwenden können:

- **Erfolgreich** schränkt die Anzeige auf Benachrichtigungen über die erfolgreiche Ausführung von Aufträgen ein.
- **Fehlgeschlagen** begrenzt die Anzeige der Benachrichtigungen auf Aufträge, die *fehlgeschlagen* sind.
- **Warnung** begrenzt die Anzeige von Benachrichtigungen auf Aufträge, die Warnungen verursacht haben.
- **Wiederhergestellt** beschränkt die Anzeige von Benachrichtigungen auf Aufträge, die zunächst *fehlgeschlagen* sind und dann wiederhergestellt wurden, indem sie *erfolgreich* im Arbeitsablauf fortgesetzt wurden.
- **Quittiert** schränkt die Anzeige auf Benachrichtigungen ein, die zuvor vom Benutzer quittiert wurden.

## Referenzen

### Kontext-Hilfe

- [Arbeitsabläufe](/workflows)
- [Bereinigungsdienst](/service-cleanup)
- [Konfiguration - Benachrichtigung](/configuration-notification)
- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
- [Überwachung - Systembenachrichtigungen](/monitor-notifications-system)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
