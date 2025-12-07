# Inventarsuche

Die Inventarsuche wird verwendet, um die Ergebnisse nach Objekttyp einzuschränken, zum Beispiel:

- Objekte zurückgeben, die einem bestimmten Namen oder Titel entsprechen, optional eingeschränkt nach Ordnern
- Ausgerollte oder freigegebene Objekte, Entwurfsobjekte, ungültige Objekte zurückgeben

## Meta-Zeichen

- **?** Metazeichen ersetzt ein einzelnes Zeichen.
- **\*** Metazeichen ersetzt kein oder mehr Zeichen.

Die Suche erfolgt unabhängig von der Groß-/Kleinschreibung und teilweise qualifiziert, zum Beispiel:

- **rest** findet Objekte mit dem Namen "pdfNon**Rest**artable" und "**REST**-RunningTaskLog"
- **re?t** findet Objekte mit dem Namen "ActivePassiveDi**rect**or" und "JITL-JS7**REST**ClientJob"
- **re\*t** findet Objekte mit dem Namen "pdSQLExecuto**rExt**ractJSON" und "pdu**Reset**Subagent"

## Erweiterte Suche

Die Funktion ist verfügbar, wenn Sie auf den Link klicken: **&gt; Erweitert**

### Attributsuche

Die erweiterte Suche ermöglicht die Suche nach Objektattributen:

- **Agentenname** liefert Ergebnisse, die Jobs enthalten, die mit dem angegebenen Agent ausgeführt wurden.
- mit **Anzahl Jobs** werden die Suchergebnisse auf Arbeitsabläufe beschränkt, die die mit **Von** angegebene Mindestanzahl von Jobs verwenden. Wenn Sie **Bis** verwenden, werden Arbeitsabläufe zurückgegeben, die eine Anzahl von Jobs im Bereich zwischen *Von* und *Bis* enthalten. Wenn nur *Bis* verwendet wird, werden Arbeitsabläufe zurückgegeben, die keine Anzahl Jobs enthalten, die *Bis* überschreitet.
- **Job-Name** gibt Arbeitsabläufe zurück, die Jobs mit dem angegebenen Namen enthalten

Wenn Sie das Kontrollkästchen *Exakte Übereinstimmung* für **Job-Name** verwenden, muss der eingegebene Suchbegriff vollständig mit einem Job-Namen übereinstimmen, einschließlich Groß- und Kleinschreibung. Die Suche nach Job-Namen bietet Massenoperationen auf Jobs für die resultierenden Arbeitsabläufe.

### Abhängigkeitssuche

Mit dem Such-Metazeichen **\*** können Sie festlegen, dass Abhängigkeiten gesucht werden, z.B. zu einer Ressourcen-Sperre, egal welchen Namen diese hat:

- die Suche mit dem Metazeichen **\*** für **Ressourcen-Sperren** liefert Arbeitsabläufe, die eine Ressourcensperre verwenden
- die Suche mit dem Metazeichen **\*** für **Dateiauftragsquellen** liefert Arbeitsabläufe, die von einer Dateiauftragsquelle referenziert werden

## Referenzen

[JS7 - Inventory Search](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Search)
