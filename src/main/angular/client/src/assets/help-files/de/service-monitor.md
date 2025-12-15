# Überwachungsdienst

Der Überwachungsdienst wird verwendet, um den Zustand von JS7 Produkten und Probleme bei der Ausführung von Arbeitsabläufen zu melden. Der Überwachungsdienst füllt die *Überwachung* Unteransichten in JOC Cockpit:

- Überwachung der Verfügbarkeit von JS7 Produkten und Meldung an die Unteransichten [Überwachung - Verfügbarkeit Controller](/monitor-availability-controller) und [Überwachung - Verfügbarkeit Agenten](/monitor-availability-agent).
- Überwachung der angeschlossenen Controller und Agenten auf Warnungen und Fehler, die beim Betrieb der Produkte auftreten. Die Ergebnisse werden der Unteransicht [Überwachung - Systembenachrichtigungen](/monitor-notifications-system) hinzugefügt.
- Überwachung der Ergebnisse der Ausführung von Arbeitsabläufen und Jobs von allen angeschlossenen Controller Instanzen und Hinzufügen von Benachrichtigungen zur Ansicht [Überwachung - Auftragsbenachrichtigungen](/monitor-notifications-order).

Dadurch werden Fehler und Warnungen, die während der Ausführung von Arbeitsabläufen auftreten, in den *Überwachung*-Unteransichten der Benutzeroberfläche sichtbar und können von [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications) weitergeleitet werden. Aufgrund der asynchronen Natur von JS7 Produkten wird diese Aufgabe von einem Hintergrunddienst ausgeführt.

Der Überwachungsdienst wird automatisch beim Start von JOC Cockpit gestartet. Er kann in der Übersichtsansicht aus dem Rechteck der aktiven JOC Cockpit Instanzen mit der Operation *Dienst neu starten - Überwachungsdienst* neu gestartet werden.

<img src="dashboard-restart-monitor-service.png" alt="Restart Monitor Service" width="750" height="280" />

## Referenzen

### Kontext-Hilfe

- [Überwachung - Verfügbarkeit Agenten](/monitor-availability-agent)
- [Überwachung - Verfügbarkeit Controller](/monitor-availability-controller)
- [Überwachung - Auftragsbenachrichtigungen](/monitor-notifications-order)
- [Überwachung - Systembenachrichtigungen](/monitor-notifications-system)

### Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
