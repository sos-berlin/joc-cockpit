# Kalendersuche

*Die Kalendersuche* wird verwendet, um Kalender anhand von Kriterien wie

- **Benutzereingabe**, die mit einem bestimmten Namen oder Titel übereinstimmen, optional eingeschränkt durch Ordner.

## Meta-Zeichen

- **?** Metazeichen ersetzt jedes einzelne Zeichen.
- ******* Metazeichen ersetzt null oder mehr Zeichen.

Die Suche erfolgt unabhängig von Groß- und Kleinschreibung und teilweise qualifiziert, zum Beispiel

- **test** findet Kalender mit dem Namen "Mein-**Test**-Board-1" und "**TEST**-Board-2"
- **te?t** sucht nach Kalendern mit dem Namen "Global-**Test**-Board-1" und "**TEXT**-Board-2"
- **te\*t** findet Kalender mit dem Namen "Mein-**tExt**-Board-1" und "Mein-**Terminat**ing-Board-2"

## Erweiterte Suche

Die Funktion ist verfügbar, wenn Sie auf den Link klicken:<br/>**&gt; Erweitert**

### Attributsuche

Die erweiterte Suche ermöglicht die Suche nach Objektattributen:

- **Agentenname** gibt Kalender für Arbeitsabläufe zurück, die Jobs enthalten, die mit dem angegebenen Agent ausgeführt wurden.
- **Anzahl Jobs** gibt Kalender für Arbeitsabläufe zurück, die die mit dem Begriff **Von** angegebene Mindestanzahl von Jobs verwenden. Bei Verwendung mit dem Term **Bis** werden Arbeitsabläufe zurückgegeben, die eine Anzahl von Jobs im Bereich zwischen *Aus* und *Bis* enthalten. Wenn nur der Begriff *Bis* verwendet wird, werden Arbeitsabläufe zurückgegeben, die keine Jobs enthalten, die über den Begriff *Bis* hinausgehen.
- mit **Jobname** werden Kalender für Arbeitsabläufe zurückgegeben, die Jobs mit dem angegebenen Namen enthalten. Wenn Sie das Kontrollkästchen *Exakte Übereinstimmung* für **Jobname** verwenden, muss der eingegebene Suchbegriff vollständig mit dem Jobnamen übereinstimmen, einschließlich Groß- und Kleinschreibung.

### Abhängigkeitssuche

Mit dem Such-Metazeichen **\*** können Sie festlegen, dass Abhängigkeiten gesucht werden, z.B. zu einer Ressourcensperre, egal welchen Namen diese hat:

- das Metazeichen **\*** für **Ressourcensperren** gibt Kalender für Arbeitsabläufe zurück, die eine Ressourcensperre verwenden,
- ******* Metazeichen für **Datei Auftragsquellen** gibt Kalender für Arbeitsabläufe zurück, die von einer Datei Auftragsquelle referenziert werden.

## Referenzen

- [Configuration - Inventory - Calendars](/configuration-inventory-calendars)
- [Resources - Calendars](/resources-calendars)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)

