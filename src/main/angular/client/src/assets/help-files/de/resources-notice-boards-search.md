# Ressourcen - Notizbretter - Suche

Die *Suche Notizbretter* wird verwendet, um Notizbrettern zu find, basierend auf Kriterien wie

- **Benutzereingaben**, die mit einem bestimmten Namen oder Titel übereinstimmen, optional eingeschränkt durch Ordner.

## Metazeichen

- **?** Metazeichen ersetzt jedes einzelne Zeichen.
- **\*** Metazeichen ersetzt kein oder mehr Zeichen.

Die Suche erfolgt unabhängig von Groß- und Kleinschreibung und teilweise qualifiziert, zum Beispiel

- **test** findet Notizbretter mit dem Namen "My-**Test**-Board-1" und "**TEST**-Board-2"
- **te?t** findet Notizbretter mit dem Namen "Global-**Test**-Board-1" und "**TEXT**-Board-2"
- **te\*t** findet Notizbretter mit dem Namen "My-**tExt**-Board-1" und "My-**Terminat**ing-Board-2"

## Erweiterte Suche

Die Funktion ist verfügbar, wenn Sie auf den Link klicken:<br/>**&gt; Erweitert**

### Attributsuche

Die erweiterte Suche ermöglicht die Suche nach Attributen:

- **Agentenname** gibt Notizbretter für Arbeitsabläufe zurück, die Jobs enthalten, die mit dem angegebenen Agenten ausgeführt wurden.
- **Anzahl Jobs** gibt Notizbretter für Arbeitsabläufe zurück, die die mit **Von** angegebene Mindestanzahl von Jobs verwenden. Wenn Sie **Bis** verwenden, werden Arbeitsabläufe zurückgegeben, die eine Anzahl von Jobs im Bereich zwischen *Von* und *Bis* enthalten. Wenn nur *Bis* verwendet wird, werden Arbeitsabläufe zurückgegeben, die höchstens so viele Jobs enthalten wie mit *Bis* angegeben.
- mit der Option **Job-Name** erhalten Sie Notizbretter für Arbeitsabläufe, die Jobs mit dem angegebenen Namen enthalten. Wenn Sie das Kontrollkästchen *Exakte Übereinstimmung* für **Job-Name** verwenden, muss der eingegebene Suchbegriff vollständig mit dem Job-Namen übereinstimmen, einschließlich Groß- und Kleinschreibung.

### Abhängigkeitssuche

Mit dem Such-Metazeichen **\*** können Sie festlegen, dass Abhängigkeiten gesucht werden, z.B. zu einer Ressourcen-Sperre unabhängig von deren Namen:

- das Metazeichen **\*** für **Ressourcen-Sperren** gibt Notizbretter für Arbeitsabläufe zurück, die eine Ressourcen-Sperre verwenden,
- **\*** Metazeichen für **Dateiauftragsquellen** gibt Notizbretter für Arbeitsabläufe zurück, die von einer Dateiauftragsquelle referenziert werden.

## Referenzen

- [Konfiguration - Inventar - Notizbretter](/configuration-inventory-notice-boards)
- [Ressourcen - Notizbretter](/resources-notice-boards)
