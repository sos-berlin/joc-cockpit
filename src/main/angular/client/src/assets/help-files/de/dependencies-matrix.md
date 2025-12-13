# Matrix der Abhängigkeiten

JS7 Inventarobjekte sind durch Abhängigkeiten miteinander verbunden. Zum Beispiel ein Arbeitsablauf, der eine Job-Ressource und eine Ressourcen-Sperre referenziert; ein Zeitplan, der einen Kalender und einen oder mehrere Arbeitsabläufe referenziert.

Beim Ausrollen von Objekten wird auf Konsistenz geachtet:

- Wenn eine Job-Ressource erstellt wird und von einem neu erstellten Arbeitsablauf referenziert wird, beinhaltet das Ausrollen des Arbeitsablaufs auch das Ausrollen der Job-Ressource.
- Wenn eine Job-Ressource von einem ausgerollten Arbeitsablauf referenziert wird und zurückgezogen oder entfernt werden soll, muss auch der Arbeitsablauf zurückgezogen oder entfernt werden.

Einzelheiten finden Sie unter [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies).

Die Abhängigkeitsmatrix der Inventarobjekte sieht wie folgt aus:

| Bereich |Objekttyp | Eingehende Referenzen |      | Ausgehende Referenzen |      |      |      |      |
| ----- | ----- | ----- | ----- |
| Controller |
|      | Arbeitsablauf | Arbeitsablauf | Zeitplan | Arbeitsablauf | Job-Ressource | Notizbrett | Ressourcen-Sperre | Job-Vorlage | Skript-Baustein |
|      | Dateiauftragsquelle |      |      | Arbeitsablauf |
|      | Job-Ressource | Arbeitsablauf |
|      | Notizbrett | Arbeitsablauf |
|      | Ressourcen-Sperre | Arbeitsablauf |
| Automatisierung |
|      | Zeitplan |      |      | Arbeitsablauf | Kalender |
|      | Kalender | Zeitplan |
|      | Job-Vorlage | Arbeitsablauf |
|      | Skript-Baustein | Arbeitsablauf |

## Referenzen

### Kontext-Hilfe

- [Konfiguration - Inventar - Operationen - Ordner ausrollen](/configuration-inventory-operations-deploy-folder)
- [Konfiguration - Inventar - Operationen - Objekt ausrollen](/configuration-inventory-operations-deploy-object)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
