# Arbeitsablaufsuche

Die Arbeitsablaufsuche wird verwendet, um Arbeitsabläufe zu suchen anhand von Kriterien wie

- **Suche**, die mit einem bestimmten Namen oder Titel übereinstimmen, optional eingeschränkt nach Ordnern,
- Arbeitsablauf Verfügbarkeit
  - **Synchron**, **Nicht synchron** Arbeitsabläufe sind an einen Controller ausgerollt.
  - **Ausgesetzte** Arbeitsabläufe sind eingefroren, d.h. sie akzeptieren Aufträge, erlauben aber nicht, dass Aufträge gestartet werden.
  - **Ausstehende** Arbeitsabläufe warten auf die Bestätigung eines Agenten, dass die Arbeitsabläufe ausgesetzt wurden.
- Job Verfügbarkeit
  - **Übersprungene** Aufträge werden nicht für die Ausführung berücksichtigt, wenn Aufträge vorbeigehen.
  - **Gestoppt** Aufträge werden beim Eintreffen von Aufträgen ausgesetzt.

## Meta-Zeichen

- **?** Metazeichen ersetzt ein einzelnes Zeichen.
- **\*** Metazeichen ersetzt null oder mehr Zeichen.

Die Suche erfolgt unabhängig von Groß- und Kleinschreibung und teilweise qualifiziert, zum Beispiel

- **rest** findet Arbeitsabläufe mit dem Namen "pdfNon**Rest**artable" und "**REST**-RunningTaskLog"
- **re?t** findet Arbeitsabläufe mit dem Namen "ActivePassiveDi**rect**or" und "JITL-JS7**REST**ClientJob"
- **re\*t** findet Arbeitsabläufe mit dem Namen "pdSQLExecuto**rExt**ractJSON" und "pdu**Reset**Subagent"

## Erweiterte Suche

Die Funktion ist verfügbar, wenn Sie auf den Link klicken:<br/>**&gt; Erweitert**

### Attributsuche

Die erweiterte Suche ermöglicht die Suche nach Objektattributen:

- **Agentenname** gibt Arbeitsabläufe zurück, die Jobs enthalten, die mit dem angegebenen Agenten ausgeführt wurden.
- **Anzahl Jobs** gibt Arbeitsabläufe zurück, die mindestens **Von** Jobs enthalten. Wenn Sie **Bis** verwenden, werden Arbeitsabläufe zurückgegeben, die eine Anzahl von Jobs im Bereich zwischen *Von* und *Bis* enthalten. Wenn nur *Bis* verwendet wird, werden Arbeitsabläufe zurückgegeben, die keine Anzahl Jobs enthalten, die *Bis* überschreitet.
- **Job-Name** gibt Arbeitsabläufe zurück, die Jobs mit dem angegebenen Namen enthalten. Wenn Sie das Kontrollkästchen *Exakte Übereinstimmung* für *Job-Name* verwenden, muss der eingegebene Suchbegriff vollständig mit dem Job-Namen übereinstimmen, einschließlich Groß- und Kleinschreibung.

### Abhängigkeitssuche

Mit dem Such-Metazeichen **\*** können Sie festlegen, dass Abhängigkeiten gesucht werden, z.B. zu einer Ressourcen-Sperre, egal welchen Namen diese hat:

- das Metazeichen **\*** für **Ressourcen-Sperren** gibt Arbeitsabläufe zurück, die eine Ressourcen-Sperre verwenden,
- **\*** Metazeichen für **Dateiauftragsquellen** gibt Arbeitsabläufe zurück, die von einer Datei Auftragsquelle referenziert werden.
