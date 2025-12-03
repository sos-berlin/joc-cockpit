# Inventar Suche

Die Inventarsuche wird verwendet, um die Ergebnisse nach Objekttyp einzuschränken, zum Beispiel:

- objekte zurückgeben, die einem bestimmten Namen oder Titel entsprechen, optional eingeschränkt nach Ordnern
- bereitgestellte oder freigegebene Objekte, Entwurfsobjekte, ungültige Objekte zurückgeben

## Meta-Zeichen

- **?** Metazeichen ersetzt ein einzelnes Zeichen.
- **\*** Metazeichen ersetzt null oder mehr Zeichen.

Die Suche erfolgt unabhängig von der Groß-/Kleinschreibung und teilweise qualifiziert, zum Beispiel:

- **rest** findet Objekte mit dem Namen "pdfNon**Rest**artable" und "**REST**-RunningTaskLog"
- **re?t** findet Objekte mit dem Namen "ActivePassiveDi**rect**or" und "JITL-JS7**REST**ClientJob"
- **re\*t** findet Objekte mit dem Namen "pdSQLExecuto**rExt**ractJSON" und "pdu**Reset**Subagent"

## Erweiterte Suche

Die Funktion ist verfügbar, wenn Sie auf den Link klicken: **&gt; Erweitert**

### Attributsuche

Die erweiterte Suche ermöglicht die Suche nach Objektattributen:

- **Agentenname** liefert Ergebnisse, die Jobs enthalten, die mit dem angegebenen Agent ausgeführt wurden.
- mit **Anzahl Jobs** werden die Suchergebnisse auf Arbeitsabläufe beschränkt, die die mit dem Begriff **Von** angegebene Mindestanzahl von Jobs verwenden. Wenn Sie den Begriff **Bis** verwenden, werden Arbeitsabläufe zurückgegeben, die eine Anzahl von Jobs im Bereich zwischen *Aus* und *Bis* enthalten. Wenn nur der Begriff *Bis* verwendet wird, werden Arbeitsabläufe zurückgegeben, die keine Jobs enthalten, die über den Begriff *Bis* hinausgehen.
- **Jobname** gibt Arbeitsabläufe zurück, die Jobs mit dem angegebenen Namen enthalten

Wenn Sie das Kontrollkästchen *Exakte Übereinstimmung* für **Jobname** verwenden, muss der eingegebene Suchbegriff vollständig mit einem Jobnamen übereinstimmen, einschließlich Groß- und Kleinschreibung. Die Suche nach Jobnamen bietet Massenoperationen auf Jobs für die resultierenden Arbeitsabläufe.

### Abhängigkeitssuche

Mit dem Such-Metazeichen **\*** können Sie festlegen, dass Abhängigkeiten gesucht werden, z.B. zu einer Ressourcensperre, egal welchen Namen diese hat:

- die Suche mit dem Metazeichen **\*** für **Ressourcensperren** liefert Arbeitsabläufe, die eine Ressourcensperre verwenden
- die Suche mit dem Metazeichen **\*** für **Datei Auftragsquellen** liefert Arbeitsabläufe, die von einer Datei Auftragsquelle referenziert werden

## Referenzen

[JS7 - Inventory Search](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Search)

