# Arbeitsablauf Suche

Die Arbeitsablauf-Suche wird verwendet, um Arbeitsabläufe anhand von Kriterien wie

- **Benutzereingabe**, die mit einem bestimmten Namen oder Titel übereinstimmen, optional eingeschränkt nach Ordnern,
- Verfügbarkeit des Arbeitsablaufs
  - **Synchronisierte** Arbeitsabläufe werden einem Controller zur Verfügung gestellt.
  - **Suspended** Arbeitsabläufe sind eingefroren, d.h. sie akzeptieren Aufträge, erlauben aber nicht, dass Aufträge gestartet werden.
  - **Outstanding** Arbeitsabläufe warten auf die Bestätigung eines Agenten, dass die Arbeitsabläufe ausgesetzt wurden.
- Auftragsverfügbarkeit
  - **Übersprungene** Aufträge werden nicht für die Ausführung berücksichtigt, wenn Aufträge vorbeigehen.
  - **Gestoppt** Aufträge werden beim Eintreffen von Aufträgen ausgesetzt.

## Meta-Zeichen

- **?** Metazeichen ersetzt ein einzelnes Zeichen.
- ******* Metazeichen ersetzt null oder mehr Zeichen.

Die Suche erfolgt unabhängig von Groß- und Kleinschreibung und teilweise qualifiziert, zum Beispiel

- **rest** findet Arbeitsabläufe mit dem Namen "pdfNon**Rest**artable" und "**REST**-RunningTaskLog"
- **re?t** findet Arbeitsabläufe mit dem Namen "ActivePassiveDi**rect**or" und "JITL-JS7**REST**ClientJob"
- **re\*t** findet Arbeitsabläufe mit dem Namen "pdSQLExecuto**rExt**ractJSON" und "pdu**Reset**Subagent"

## Erweiterte Suche

Die Funktion ist verfügbar, wenn Sie auf den Link klicken:<br/>**&gt; Erweitert**

### Attributsuche

Die erweiterte Suche ermöglicht die Suche nach Objektattributen:

- **Agentenname** gibt Arbeitsabläufe zurück, die Jobs enthalten, die mit dem angegebenen Agent ausgeführt wurden.
- **Anzahl Jobs** gibt Arbeitsabläufe zurück, die die mit dem Begriff **Von** angegebene Mindestanzahl von Jobs verwenden. Wenn Sie den Begriff **Bis** verwenden, werden Arbeitsabläufe zurückgegeben, die eine Anzahl von Jobs im Bereich zwischen *Aus* und *Bis* enthalten. Wenn nur der Begriff *Bis* verwendet wird, werden Arbeitsabläufe zurückgegeben, die keine Jobs enthalten, die über den Begriff *Bis* hinausgehen.
- **Jobname** gibt Arbeitsabläufe zurück, die Jobs mit dem angegebenen Namen enthalten. Wenn Sie das Kontrollkästchen *Exakte Übereinstimmung* für **Jobname** verwenden, muss der eingegebene Suchbegriff vollständig mit dem Jobnamen übereinstimmen, einschließlich Groß- und Kleinschreibung.

### Abhängigkeitssuche

Mit dem Such-Metazeichen **\*** können Sie festlegen, dass Abhängigkeiten gesucht werden, z.B. zu einer Ressourcensperre, egal welchen Namen diese hat:

- das Metazeichen **\*** für **Ressourcensperren** gibt Arbeitsabläufe zurück, die eine Ressourcensperre verwenden,
- **\*** Metazeichen für **Datei Auftragsquellen** gibt Arbeitsabläufe zurück, die von einer Datei Auftragsquelle referenziert werden.

