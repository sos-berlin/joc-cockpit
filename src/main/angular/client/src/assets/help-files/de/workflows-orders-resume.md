# Aufträge fortsetzen

Das Popup-Fenster *Aufträge wiederaufnehmen* wird für *ausgesetzte* und *fehlgeschlagene* Aufträge angezeigt, die fortgesetzt werden sollen. Je nachdem, ob die Wiederaufnahme für einen einzelnen Auftrag oder im Rahmen einer Sammelverarbeitung von Aufträgen erfolgt, stehen verschiedene Bereiche für Benutzereingaben zur Verfügung.

- **Variablen** werden mit Werten angezeigt, die vor der aktuellen Position im Arbeitsablauf gültig waren. Wenn beispielsweise ein fehlgeschlagener Job eine *Dynamische Variable* geändert hat, wird die Variable mit ihrem historischen Wert vor der Ausführung des Jobs angezeigt.
- **Optionen** ermöglichen es, das Verhalten von wiederaufgenommenen Aufträgen zu ändern.
- **Positionen** ermöglichen es, Aufträge von einer früheren oder späteren Position im Arbeitsablauf fortzusetzen.

## Operationen für einzelne Aufträge

### Variablen mit konstanten Werten

In diesem Abschnitt werden *Variablen des Arbeitsablaufs* mit ihren im Auftrag enthaltenen effektiven Werten angezeigt.

Solche Variablen enthalten konstante Werte, die nicht geändert werden können.

### Variablen mit änderbaren Werten

In diesem Abschnitt werden *Dynamische Variablen* angezeigt, die nicht im Arbeitsablauf deklariert wurden. Solche Variablen werden dynamisch durch Jobs erzeugt.

Benutzer können die Werte von *Dynamischen Variablen* ändern. 

- **Operationen**
  - **Wert beibehalten**: Die Variable wird mit ihrem aktuellen Wert an die nachfolgende Anweisung im Arbeitsablauf übergeben.
  - **Wert ändern**: Der geänderte Wert der Variable wird verwendet, sofern das entsprechende Kontrollkästchen *aktiviert* ist.
  - **Variable entfernen**: Es wird der ursprüngliche Wert der Variable verwendet, der vor der aktuellen Anweisung gültig war.
  - **Variable hinzufügen**: Ermöglicht das Hinzufügen des Namens und Werts einer neuen *Dynamischen Variable*.
- **Variablen**
  - **returnCode**: ist eine integrierte Variable, die das numerische Ergebnis der vorherigen Anweisung im Arbeitsablauf enthält. Standardmäßig bedeutet der Wert Null Erfolg, Werte ungleich Null bedeuten einen Fehler.

Die nachfolgende Anweisung im Arbeitsablauf ist dieselbe oder jene, in die ein Benutzer den Auftrag per Ziehen & Ablegen verschiebt, einschließlich Anweisungen, die vor oder nach der aktuellen Position des Auftrags liegen.

### Optionen

#### Erzwingen des Neustarts von Jobs

Das Kontrollkästchen **Wiederaufnahme erzwingen** wirkt sich auf Jobs aus, die als *nicht wiederanlauffähig* konfiguriert sind, siehe [Konfiguration – Inventar – Arbeitsablauf – Job-Optionen](/configuration-inventary-workflow-job-options.md). Solche Jobs werden nicht erneut ausgeführt, sofern sie durch den Agenten oder das Betriebssystem abgebrochen wurden. Dies betrifft nicht *ausgesetzte* Aufträge und *fehlgeschlagene* Aufträge, die nach Job-Fehler fortgesetzt werden.

Damit soll verhindert werden, dass Jobs, die nicht für einen Neustart ausgelegt sind, nach Abbruch automatisch fortgesetzt werden. Stattdessen müssen Benutzer das entsprechende Kontrollkästchen aktivieren. Typische Anwendungsfälle sind beispielsweise Jobs, die Finanztransaktionen ausführen, bei denen das Ergebnis überprüft werden sollte, bevor ein Neustart veranlasst wird.

#### Festlegen der Zyklus Endzeit

Das Eingabefeld **Zyklus Endzeit** ist für Aufträge verfügbar, die mindestens einen Zyklus in einer *Cycle Anweisung* gestartet haben.

Es kann ein Zeitraum angegeben werden, der kürzer oder länger ist als der in der *Cycle Anweisung* konfigurierte.
Zeiträume werden in *Sekunden* oder *Stunden:Minuten:Sekunden* angegeben. Die Angabe des Werts *0* für den Zeitraum bewirkt, dass der Auftrag

- an der jeweiligen Position im Arbeitsablauf fortgesetzt wird,
- nachfolgende Jobs ausgeführt werden,
- den Zyklus beim nächsten Passieren der *Cycle Anweisung* verlassen wird.

### Positionen für das Ziehen und Ablegen von Aufträgen

Aufträge können an einer früheren oder späteren Position im Arbeitsablauf fortgesetzt werden.
Benutzer können den Auftrag per Ziehen und Ablegen auf die Anweisung im Arbeitsablauf ziehen, an der er fortgesetzt werden soll.

- **Zulässige Positionen**
  - Aufträge können an späteren Anweisungen auf derselben Blockebene wie die aktuelle Position im Arbeitsablauf fortgesetzt werden.
  - Aufträge können an einer Position im *wahr*-Zweig oder *falsch*-Zweig einer *If Anweisung* fortgesetzt werden.
  - Aufträge können an einer Position innerhalb der *ConsumeNotices Anweisung* fortgesetzt werden, wodurch die Prüfung auf das Vorhandensein zugehöriger Notizen übersprungen wird.
- **Nicht zulässige Positionen**
  - Aufträge können nicht an eine Position innerhalb des Zweigs einer *Fork Anweisung* verschoben werden. Der Grund dafür ist, dass der *Elternauftrag* bei der *Fork Anweisung* verbleibt, während *Kindaufträge* pro Zweig erstellt werden.
    - *Kindaufträge* können nicht zwischen den Zweigen einer *Fork Anweisung* verschoben werden. Die Wiederaufnahme eines *Kindauftrags* von einer Position innerhalb seines Zweigs ist zulässig.
    - Aufträge können direkt von einer *Fork Anweisung* aus wieder aufgenommen werden.
  - Aufträge können nicht an eine Position innerhalb von *Lock Anweisungen* verschoben werden. Die Operation wird abgelehnt, da sie das Halten einer *Ressourcen-Sperre* beeinflusst. Die Fortsetzung eines Auftrags ab dem Beginn des Blocks der *Lock Anweisung* ist zulässig.

Das oben Genannte gilt in gleicher Weise für verschachtelte Anweisungen im Arbeitsablauf, zum Beispiel eine innere *Fork Anweisung* innerhalb einer äußeren *Fork Anweisung*.

Wenn keine Änderung der Position vorgenommen wird, dann wird der Auftrag an seiner aktuellen Position im Arbeitsablauf fortgesetzt.

## Massenoperationen für Aufträge

Die Massenoperation ist in der Ansicht [Auftragsübersicht](/orders-overview.md) verfügbar, in der mehrere Aufträge aus demselben oder aus unterschiedlichen Arbeitsabläufen ausgewählt werden können.

- **Von derselben Position wiederaufnehmen** ermöglicht die Fortsetzung ab der aktuellen Anweisung im Arbeitsablauf, an der der Auftrag *ausgesetzt* oder *fehlgeschlagen* ist.
- **Vom aktuellen Block wiederaufnehmen** bietet die Fortsetzung ab dem Beginn der aktuellen Blockanweisung. Zum Beispiel:
  - Befindet sich ein Auftrag an einer Anweisung innerhalb des Blocks einer *Lock Anweisung*, dann wird er ab dem Beginn der *Lock Anweisung* fortgesetzt.
  - Befindet sich ein Auftrag an einer Anweisung innerhalb eines Zweigs der *Fork Anweisung*, dann wird er vom Anfang des Zweigs fortgesetzt.
- **Von Kennung fortsetzen** ermöglicht die Angabe einer *Kennung*, die allen Arbeitsabläufen gemeinsam ist, für die Aufträge wiederaufgenommen werden sollen. Die Wiederaufnahme von Aufträgen erfolgt an der durch die *Kennung* angegebenen Position im Arbeitsablauf. Wenn die *Kennung* in einem Arbeitsablauf nicht vorhanden ist, wird der Auftrag an seiner aktuellen Position fortgesetzt.

## Referenzen

### Kontext-Hilfe

- [Konfiguration – Inventar – Arbeitsablauf – Job-Optionen](/configuration-inventary-workflow-job-options.md)
- [Konfiguration – Inventar – Arbeitsabläufe](/configuration-inventory-workflows.md)
- [Auftragsübersicht](/orders-overview.md)
- [Arbeitsabläufe](/workflows.md)

### Product Knowledge Base

- [JS7 - Workflows - Status Operations on Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows+-+Status+Operations+on+Orders)
