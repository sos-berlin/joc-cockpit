# Einstellungen - Bereinigungsdienst

Die folgenden Einstellungen werden auf den [Bereinigungsdienst](/service-cleanup) angewendet. Änderungen werden sofort wirksam.

Die Seite *Einstellungen* ist über das Symbol ![wheel icon](assets/images/wheel.png) in der Menüleiste zugänglich.

## Startzeit-Einstellungen

### Einstellung: *time\_zone*, Standard: *UTC*

Gibt die Zeitzone an, die auf die Startzeit und den Zeitraum des Bereinigungsdienstes angewendet wird.

### Einstellung: *period*

Legt die Wochentage fest, an denen der Bereinigungsdienst ausgeführt wird. Der erste Wochentag wird als Montag angenommen. Bei der Erstinstallation von JS7 sind die Standardwerte wie folgt: 1,2,3,4,5,6,7 für die tägliche Bereinigung. Wenn keine Wochentage angegeben werden, wird der Bereinigungsdienst nicht gestartet.

In den meisten Fällen ist es empfehlenswert, den Bereinigungsdienst täglich auszuführen, da dies die Anzahl der zu bereinigenden Datensätze gering hält. Es kann Ausnahmen geben, wenn die tägliche Auftragsausführung für 24 Stunden sehr dicht ist und wenn es z.B. am Wochenende Zeiten mit geringer Last gibt.

### Einstellung: *period\_begin*, Standard: *01:00:00*

Gibt die Startzeit des Bereinigungsdienstes in der entsprechenden *Zeitzone* an.

### Einstellung: *period\_end*, Standard: *04:00:00*

Gibt das Ende des Zeitraums an, in dem der Bereinigungsdienst in der entsprechenden *Zeitzone* laufen darf. Der Bereinigungsdienst wird die Bereinigung der Datenbank höchstwahrscheinlich vor der angegebenen Zeit abschließen. Wenn er jedoch eine Aktivität des *Historiendienstes* feststellt, wird der Bereinigungsdienst beendet und später neu gestartet. Der Bereinigungsdienst wird nicht über das angegebene *period_end* hinaus fortgesetzt.

### Einstellung: *force\_cleanup*, Voreinstellung: *false*

Wenn diese Option auf *true* gesetzt ist, wird der Bereinigungsdienst zum angegebenen *period_begin* zwangsweise ausgeführt. Standardmäßig hält der Bereinigungsdienst an, wenn er eine Aktivität des Historiendienstes feststellt. Die Einstellung ermöglicht es dem Bereinigungsdienst, den Historiendienst für eine konfigurierbare Dauer anzuhalten.

Wenn die Einstellung auf *true* gesetzt ist, werden die folgenden Einstellungen berücksichtigt:

- **history\_pause\_duration**: Zeitraum, für den der Historiendienst pausiert wird.
- **history\_pause\_delay**: Verzögerung, nachdem der Historiendienst aus einer Pause wieder aufgenommen wurde und für die der Bereinigungsdienst wartet, bis er neu startet.

Benutzer, die ihre Jobs rund um die Uhr laufen lassen, ohne dass der Historiendienst genügend Leerlaufzeit hat, um den Bereinigungsdienst aktiv werden zu lassen, sollten die Einstellung aktivieren, um die Ausführung des Bereinigungsdienstes zu erzwingen. Eine fehlende Bereinigung der Datenbank führt zu einer verringerten Leistung und einem steigenden Ressourcenverbrauch der Datenbank.

### Einstellung: *history\_pause\_duration*, Standard: *60*s

Wenn die Einstellung *force\_cleanup* auf *true* gesetzt ist, wird der Historiendienst für die angegebene Dauer oder für den Abschluss der Bereinigung angehalten, je nachdem, was zuerst eintritt. Während der Historiendienst pausiert, werden im JOC Cockpit keine neuen Historieneinträge zur Ausführung von Aufträgen und Jobs zur Verfügung gestellt. Nach Beendigung der Pause des Historiendienstes werden alle ausstehenden Historien-Einträge verarbeitet.

### Einstellung: *history\_pause\_delay*, Voreinstellung: *30*s

Wenn die Einstellung *force\_cleanup* auf *true* gesetzt ist und die Pause des Historiendienstes beendet ist, wartet der Bereinigungsdienst die angegebene Verzögerung ab und startet neu, wenn eine weitere Bereinigung der Datenbank erforderlich ist.

## Einstellungen: Datenbankverbindung

### Einstellung: *batch\_size*, Standard: *1000*

Gibt die Anzahl der Datensätze an, die innerhalb einer einzigen Transaktion bereinigt werden. Eine Erhöhung dieses Wertes kann die Leistung verbessern - gleichzeitig erhöht sich dadurch das Risiko von Konflikten mit parallelen Transaktionen, wenn Dienste parallel auf der Datenbank arbeiten.

### Einstellung: *max\_pool\_size*, Voreinstellung: *8*

Gibt die maximale Anzahl der vom Dienst verwendeten parallelen Datenbankverbindungen an.

## Einstellungen: Aufbewahrungsfrist

### Einstellung: *order\_history\_age*, Standard: *90*d

Legt die Aufbewahrungsfrist für die [Auftragshistorie](/history-orders) und [Prozesshistorie](/history-tasks) fest. Alle Historie-Einträge, die älter als der angegebene Wert sind, werden gelöscht.

### Einstellung: *order\_history\_logs\_age*, Voreinstellung: *90*d

Legt die Aufbewahrungsfrist für Auftragsprotokolle und Job-Protokolle fest. Alle Protokolle, die älter als der angegebene Wert sind, werden gelöscht. Beachten Sie, dass dieser Wert den Wert der Einstellung *cleanup\_order\_history\_age* nicht überschreiten sollte, da sonst die Navigation zu den Protokollen nicht über das JOC Cockpit GUI erfolgen kann.

### Einstellung: *file\_transfer\_history\_age*, Voreinstellung: *90*d

Legt die Aufbewahrungsfrist der [Dateiübertragungshistorie](/history-file-transfers) fest. Alle Einträge, die älter als der angegebene Wert sind, werden gelöscht.

### Einstellung: *audit\_log\_age*, Standard: *90*d

Gibt die Aufbewahrungsfrist für das [Prüfprotokoll](/audit-log) an. Alle Einträge des Prüfprotokolls, die älter als der angegebene Wert sind, werden gelöscht.

### Einstellung: *daily\_plan\_history\_age*, Voreinstellung: *30*d

Legt den Aufbewahrungszeitraum für die Historie der Übermittlungen des [Tagesplans](/daily-plan) fest. Alle Einträge, die älter als der angegebene Wert sind, werden gelöscht.

### Einstellung: *monitoring\_history\_age*, Voreinstellung: *1*d

Legt die Aufbewahrungsfrist für Einträge in der Ansicht *Überwachung* fest. Da es sich hierbei um eine taktische Ansicht handelt, werden längere Aufbewahrungsfristen nicht empfohlen.

### Einstellung: *notification\_history\_age*, Standard: *1*d

Legt die Aufbewahrungsfrist für Benachrichtigungen fest, z.B. über Auftragsfehler und Warnungen. Da Benachrichtigungen in der Regel noch am selben Tag bearbeitet werden, werden längere Aufbewahrungsfristen nicht empfohlen.

### Einstellung: *profile\_age*, Standard: *365*d

Legt die Aufbewahrungsfrist für ungenutzte [Profile](/profile) fest, d.h. Profile von Benutzerkonten, die sich in dem angegebenen Zeitraum nicht angemeldet haben.

### Einstellung: *failed\_login\_history\_age*, Voreinstellung: *90*d

Legt den Aufbewahrungszeitraum der Historie für [Fehlgeschlagene Anmeldungen](/identity-service-faíled-logins) fest. Fehlgeschlagene Anmeldungen, die vor dem angegebenen Zeitraum erfolgten, werden gelöscht.

### Einstellung: *reporting\_age*, Standard: *365*d

Legt die Aufbewahrungsfrist für [Berichte](/reports) fest.

### Einstellung: *deployment\_history\_versions*, Voreinstellung: *10*

Gibt die Anzahl der Versionen pro ausgerolltem Objekt an, die beibehalten werden sollen. Versionen können verwendet werden, um ein Objekt von einem früheren Zustand aus erneut auszurollen. Alle früher ausgerollten Versionen von Objekten werden entfernt.

## Referenzen

### Kontext-Hilfe

- [Bereinigungsdienst](/service-cleanup)
- [Berichte](/reports)
- [Einstellungen](/settings)
- [Fehlgeschlagene Anmeldungen](/identity-service-faíled-logins)
- [Profile](/profile)
- [Prüfprotokoll](/audit-log)
- [Ressourcen - Notizbretter](/resources-notice-boards)
- [Tagesplan](/daily-plan)
- [Tagesplan - Projektion](/daily-plan-projections)

### Product Knowledge Base

- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
