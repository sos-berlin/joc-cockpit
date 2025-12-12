# Regeln zur Benennung von Objekten

Objektnamen werden an einer Reihe von Stellen angegeben für

- Arbeitsabläufe, Jobs, Variablen, Notizbretter, Ressourcen-Sperren, Dateiauftragsquellen, Job-Ressourcen, Ordner,
- Kalender, Zeitpläne, Skript-Bausteine, Job-Vorlagen, Berichtsvorlagen.

JS7 erzwingt keine Namenskonventionen für Objekte: Die Benutzer können die Namenskonventionen nach Belieben wählen, z. B. für Job-Namen:

- camel Case Stil wie in: *loadDataWarehouseDaily*
- kebab-Stil wie in: *load-data-warehouse-daily*
- gemischter Stil wie in: *DataWarehouse-Load-Daily*

## Zeichensatz

JS7 erlaubt die Verwendung von Unicode-Zeichen für Objektnamen.

### Objekt-Namen

Für Objektnamen gelten eine Reihe von Einschränkungen:

#### Benennungsregeln

- Die folgenden Benennungsregeln müssen für Objektnamen beachtet werden: [Java Identifiers](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- Gemäß dem regulären Ausdruck \[^\\\\x00-\\\\x1F\\\\x7F\\\\x80-\\\\x9F\] sind keine Steuerzeichen erlaubt
- Interpunktionszeichen sind nicht erlaubt. Punkte '.', Unterstrich '_' und Bindestrich '-' sind jedoch gemäß dem regulären Ausdruck erlaubt: \[^\\\\x20-\\\\x2C\\\\x2F\\\\x3A-\\\\x40\\\\x5B-\\\\x5E\\\\x60\\\\x7B-\\\\x7E\\\\xA0-\\\\xBF\\\\xD7\\\\xF7\]
  - Punkt: ist als vorangestelltes oder nachgestelltes Zeichen nicht erlaubt und zwei Punkte in Folge sind nicht erlaubt.
  - Bindestrich: ist als führendes oder nachgestelltes Zeichen nicht erlaubt und zwei Bindestriche in Folge sind nicht erlaubt.
  - Klammern sind nicht erlaubt \[({})\]
- Zeichen mit halber Breite sind nicht erlaubt, siehe [Halfwidth and Fullwidth Forms](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_\(Unicode_block\)).
- Leerzeichen sind nicht erlaubt.
- Objektnamen dürfen mit einer Ziffer beginnen.
- Die Verwendung von reservierten Java-Schlüsselwörtern ist nicht erlaubt:
  - *abstrakt, continue, for, new, switch, assert, default, goto, package, synchronized, boolean, do, if, private, this, break, double, implements, protected, throw, byte, else, import, public, throws, case, enum, instanceof, return, transient, catch, extends, int, short, try, char, final, interface, static, void, class, finally, long, strictfp, volatile, const, float, native, super, while*
  - Beispiel: Die Verwendung des reservierten Schlüsselworts *switch* ist nicht erlaubt, die Verwendung von *myswitch* ist erlaubt.

#### Beispiele

- Nationale Sprachzeichen wie z.B. Japanisch:
  - *こんにちは世界*
- Verwendung von Punkt, Bindestrich, Unterstrich:
  - *Say.Hello*
  - *Say-Hello*
  - *Say_Hello*

### Kennungen

Für *Labels*, die die Position eines Auftrags oder einer anderen Anweisung des Arbeitsablaufs angeben, gelten weniger strenge Regeln:

- Labels können mit Ziffern, Buchstaben, _ beginnen
- Bezeichnungen können $, _, -, #, :, !
- Beschriftungen dürfen nichts enthalten, was für Objektnamen nicht erlaubt ist, zum Beispiel keine Anführungszeichen, keine Leerzeichen, \[, \], {, }, /, \, =, +

### Eindeutigkeit von Objektnamen

Objektnamen in JS7 sind pro Objekttyp eindeutig, d.h. pro Arbeitsablauf, pro Job in einem Arbeitsablauf, pro Ressourcen-Sperre usw.

- Benutzer können Objektnamen mit Groß-/Kleinschreibung hinzufügen.
- Der Objektname wird vom JOC Cockpit GUI genau so übernommen, wie er vom Benutzer eingegeben wurde.
- Benutzer können denselben Objektnamen nicht mit einer anderen Schreibweise hinzufügen, wenn dies von dem zugrunde liegenden DBMS für den Datentyp *nvarchar* nicht unterstützt wird. Nehmen wir zum Beispiel einen bestehenden Objektnamen *myLock* an, dann kann ein neues Objekt mit dem Namen *mylock* nicht erstellt werden, wenn Sie das MySQL DBMS verwenden.

### Länge der Objektnamen

Die maximale Länge von Objektnamen ist wie folgt:

- Grundsätzlich können Objektnamen bis zu 255 Unicode-Zeichen umfassen.
- Es gilt die folgende Einschränkung:
  - Objekte befinden sich in der Regel in Ordnern: Die Gesamtlänge der Ordnerhierarchie und des Objektnamens darf 255 Zeichen nicht überschreiten.
  - Verzweigungen innerhalb einer [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction) sind auf 10 Zeichen begrenzt.
  - Verzweigungen können auf bis zu 15 Ebenen verschachtelt werden.

## Referenzen

- [Java-Bezeichner](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
- [JS7 - Object Naming Rules](https://kb.sos-berlin.com/display/JS7/JS7+-+Object+Naming+Rules)
- [Zeichen mit halber und ganzer Breite](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_\(Unicode_block\))
