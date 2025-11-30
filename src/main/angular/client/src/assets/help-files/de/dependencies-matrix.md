# Matrix der Abhängigkeiten

JS7-Inventarobjekte sind durch Abhängigkeiten miteinander verbunden. Zum Beispiel ein Workflow, der eine Job Resource und eine Resource Lock referenziert; ein Schedule, der einen Kalender und einen oder mehrere Workflows referenziert.

Bei der Bereitstellung von Objekten wird z.B. auf Konsistenz geachtet:

- Wenn eine Job Resource erstellt wird und von einem neu erstellten Workflow referenziert wird, beinhaltet die Bereitstellung des Workflows auch die Bereitstellung der Job Resource.
- Wenn eine Job Resource von einem bereitgestellten Workflow referenziert wird und widerrufen oder entfernt werden soll, muss auch der Workflow widerrufen oder entfernt werden.

Einzelheiten finden Sie unter [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies).

Die Abhängigkeitsmatrix der Inventarobjekte sieht wie folgt aus:

| Bereich |Objekttyp | Eingehende Referenzen | | Ausgehende Referenzen | | | | |
| ----- | ----- | ----- | ----- |
| Controller | Workflow | Workflow
| | Workflow | Workflow | Schedule | Workflow | Job Resource | Notice Board | Resource Lock | Job Template | Script Include |
| | File Order Source | | | Workflow |
| | Job Ressource | Workflow |
| | Schwarzes Brett | Workflow |
| Ressourcensperre | Workflow |
| Automatisierung |
| | Zeitplan | | | Workflow | Kalender |
| | Kalender | Zeitplan |
| | Jobvorlage | Workflow |
| | Skript einschließen | Workflow |

## Referenzen

### Kontexthilfe

- [Configuration - Inventory - Operations - Deploy Folder](/configuration-inventory-operations-deploy-folder)
- [Configuration - Inventory - Operations - Deploy Object](/configuration-inventory-operations-deploy-object)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

