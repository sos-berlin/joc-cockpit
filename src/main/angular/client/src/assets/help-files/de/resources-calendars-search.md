# Ressourcen - Kalender - Suche

Die *Kalendersuche* wird verwendet, um Kalender zu finden anhand von Kriterien wie

- **Benutzereingaben**, die mit einem bestimmten Namen oder Titel übereinstimmen, optional eingeschränkt durch Ordner.

## Metazeichen

- **?** Metazeichen ersetzt jedes einzelne Zeichen.
- **\*** Metazeichen ersetzt kein oder mehr Zeichen.

Die Suche erfolgt unabhängig von Groß- und Kleinschreibung und ist teilqualifiziert, zum Beispiel

- **test** findet Kalender mit dem Namen "My-**Test**-Board-1" und "**TEST**-Board-2"
- **te?t** sucht nach Kalendern mit dem Namen "Global-**Test**-Board-1" und "**TEXT**-Board-2"
- **te\*t** findet Kalender mit dem Namen "My-**tExt**-Board-1" und "My-**Terminat**ing-Board-2"

## Erweiterte Suche

Die Funktion ist verfügbar, wenn Sie auf den Link klicken:<br/>**&gt; Erweitert**

### Attributsuche

Die erweiterte Suche ermöglicht die Suche nach Attributen:

- **Agentenname** gibt Kalender für Arbeitsabläufe zurück, die Jobs enthalten, die mit dem angegebenen Agenten ausgeführt wurden.
- **Anzahl Jobs** gibt Kalender für Arbeitsabläufe zurück, die die mit dem Begriff **Von** angegebene Mindestanzahl von Jobs verwenden. Bei Verwendung mit **Bis** werden Arbeitsabläufe zurückgegeben, die eine Anzahl von Jobs im Bereich zwischen *Von* und *Bis* enthalten. Wenn nur *Bis* verwendet wird, werden Arbeitsabläufe zurückgegeben, die höchstens so viele Jobs enthalten wie mit *Bis* angegeben.
- mit **Job-Name** werden Kalender für Arbeitsabläufe zurückgegeben, die Jobs mit dem angegebenen Namen enthalten. Wenn Sie das Kontrollkästchen *Exakte Übereinstimmung* für *Job-Name* verwenden, muss der eingegebene Suchbegriff vollständig mit dem Job-Namen übereinstimmen, einschließlich Groß- und Kleinschreibung.

### Abhängigkeitssuche

Mit dem Such-Metazeichen **\*** können Sie festlegen, dass Abhängigkeiten gesucht werden, z.B. zu einer Ressourcen-Sperre unabhängig von deren Namen:

- **\*** Metazeichen für **Ressourcen-Sperren** gibt Kalender für Arbeitsabläufe zurück, die eine Ressourcen-Sperre verwenden,
- **\*** Metazeichen für **Dateiauftragsquellen** gibt Kalender für Arbeitsabläufe zurück, die von einer Dateiauftragsquelle referenziert werden.

## Referenzen

- [Konfiguration - Inventar - Kalender](/configuration-inventory-calendars)
- [Ressourcen - Kalender](/resources-calendars)
- [JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
