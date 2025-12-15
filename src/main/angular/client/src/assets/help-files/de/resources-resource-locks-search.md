# Ressourcen - Ressourcen-Sperren - Suche

Die *Suche Ressource-Sperren* wird verwendet, um Ressourcen-Sperren zu finden, anhand von Kriterien wie

- **Benutzereingaben**, die mit einem bestimmten Namen oder Titel übereinstimmen, optional eingeschränkt durch Ordner.

## Metazeichen

- **?** Metazeichen ersetzt jedes einzelne Zeichen.
- **\*** Metazeichen ersetzt kein oder mehr Zeichen.

Die Suche erfolgt unabhängig von Groß- und Kleinschreibung und ist teilqualifiziert, zum Beispiel

- **test** findet Ressourcen-Sperren mit dem Namen "My-**Test**-Board-1" und "**TEST**-Board-2"
- **te?t** findet Ressourcen-Sperren mit dem Namen "Global-**Test**-Board-1" und "**TEXT**-Board-2"
- **te\*t** findet Ressourcen-Sperren mit dem Namen "My-**tExt**-Board-1" und "My-**Terminat**ing-Board-2"

## Erweiterte Suche

Die Funktion ist verfügbar, wenn Sie auf den Link klicken:<br/>**&gt; Erweitert**

### Attributsuche

Die erweiterte Suche ermöglicht die Suche nach Attributen:

- **Agentenname** gibt Ressourcen-Sperren für Arbeitsabläufe zurück, die Jobs enthalten, die mit dem angegebenen Agenten ausgeführt wurden.
- **Anzahl Jobs** gibt Ressourcen-Sperren für Arbeitsabläufe zurück, die die mit **Von** angegebene Mindestanzahl von Jobs verwenden. Bei Verwendung mit **Bis** werden Arbeitsabläufe zurückgegeben, die eine Anzahl von Jobs im Bereich zwischen *Von* und *Bis* enthalten. Wenn nur *Bis* verwendet wird, werden Arbeitsabläufe zurückgegeben, die höchstens so viele Jobs enthalten wie mit *Bis* angegeben.
- die Option **Job-Name** liefert Ressourcen-Sperren für Arbeitsabläufe, die Jobs mit dem angegebenen Namen enthalten. Wenn Sie das Kontrollkästchen *Exakte Übereinstimmung* für **Job-Name** verwenden, muss der eingegebene Suchbegriff vollständig mit dem Job-Namen übereinstimmen, einschließlich Groß- und Kleinschreibung.

### Abhängigkeitssuche

Mit dem Such-Metazeichen **\*** können Sie festlegen, dass Abhängigkeiten gesucht werden, z.B. zu einer Ressourcen-Sperre unabhängig von deren Namen:

- **\*** Metazeichen für **Notizbretter** liefert Ressourcen-Sperren für Arbeitsabläufe, die ein Notice Board verwenden,
- **\*** Metazeichen für **Dateiauftragsquellen** gibt Ressourcen-Sperren für Arbeitsabläufe zurück, auf die eine Dateiauftragsquelle verweist.

## Referenzen

- [Konfiguration - Inventar - Ressourcen-Sperren](/configuration-inventory-resource-locks)
- [Ressourcen - Ressourcen-Sperren](/resources-resource-locks)
