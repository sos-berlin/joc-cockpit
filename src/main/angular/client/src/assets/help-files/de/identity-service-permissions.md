# Identitätsdienste - Berechtigungen

Identitätsdienste regeln den Zugriff auf JOC Cockpit durch Authentifizierung und Autorisierung, siehe [Identitätsdienste](/identity-services).

Für die Autorisierung bietet JS7 ein rollenbasiertes Zugriffsmodell (RBAC), das beinhaltet, dass

- Rollen frei aus verfügbaren Berechtigungen konfiguriert werden,
- Benutzern eine oder mehrere Rollen zugewiesen werden, die für die daraus resultierenden Berechtigungen zusammengeführt werden.

Berechtigungen legen einen der folgenden Zustände fest:

- die Berechtigung ist nicht zugewiesen (weiße Hintergrundfarbe),
- die Berechtigung ist erteilt (blaue Hintergrundfarbe),
- die Berechtigung ist verweigert (graue Hintergrundfarbe).

Berechtigungen werden aus allen Rollen für die resultierenden Berechtigungen eines Benutzerkontos zusammengeführt.

## Inventarordner

Der Umfang der Berechtigungen in einer Rolle kann auf einen oder mehrere Inventarordner beschränkt werden.

- Über die Schaltfläche *Ordner hinzufügen* in der oberen rechten Ecke der Ansicht können Sie einen Inventarordner auswählen und eine rekursive Verwendung festlegen.
- Benutzer können einer Rolle eine beliebige Anzahl von Inventarordnern hinzufügen.

## Berechtigungsbaum

Berechtigungen können als Baum betrachtet werden, der eine Hierarchie von Zweigen bietet. Die Erteilung oder Verweigerung von Berechtigungen auf einer höheren Ebene vererbt die Berechtigungszuweisung rekursiv auf tiefere Ebenen des Baums.

### Erteilen und Verweigern von Berechtigungen

Berechtigungen werden durch ein Rechteck visualisiert, das einer Batterie ähnelt:

- Wenn Sie auf den Pol an der rechten Seite einer Batterie klicken, werden die abhängigen Berechtigungen ausgeklappt/eingeklappt.
- Wenn Sie auf den Hintergrund der Batterie klicken, wechselt die Berechtigung zwischen dem Status *nicht zugewiesen* und dem Status *zugewiesen*:
  - Ein Rechteck mit weißer Hintergrundfarbe zeigt eine nicht zugewiesene Berechtigung an.
  - Ein Rechteck mit blauer Hintergrundfarbe zeigt eine erteilte Berechtigung an, die an nachgeordnete Berechtigungen weitergegeben wird. <br/><img src="identity-service-permissions-granted.png" alt="Granted Permissions" width="600" height="100" />
  - Ein Rechteck mit hellblauem Hintergrund zeigt eine vererbte, erteilte Berechtigung an. Bei Änderungen an der Berechtigung müssen Sie nicht die übergeordnete Berechtigung erteilen, sondern die untergeordneten Berechtigungen einzeln erteilen. <br/><img src="identity-service-permissions-inherited.png" alt="Inherited Permissions" width="600" height="100" />
- Wenn Sie auf das Symbol + innerhalb des Rechtecks einer Berechtigung klicken, wechselt die Berechtigung in den Status *verweigert*, der durch die graue Hintergrundfarbe angezeigt wird. Wenn Sie auf das Symbol - innerhalb einer verweigerten Berechtigung klicken, wird sie zu einer *nicht zugewiesenen* Berechtigung mit weißem Hintergrund. <br/><img src="identity-service-permissions-denied.png" alt="Denied Permissions" width="600" height="100" />

### Reduzieren und Erweitern der Ansicht

Die folgenden Schaltflächen werden zum Ausklappen/Einklappen von Berechtigungen angeboten:

- **Alle ausklappen**, **Alle einklappen** erweitert oder reduziert alle Berechtigungen.
- **Aktive ausklappen** erweitert *zugewiesene*/*verweigerte* Berechtigungen und lässt vererbte Berechtigungen eingeklappt.
- **Inaktive einklappen** klappt nicht zugewiesene Berechtigungen ein.

## Grafische und tabellarische Ansicht

In der oberen rechten Ecke werden die folgenden Schaltflächen zur Anzeige von Berechtigungen angeboten:

- **Grafische Ansicht** zeigt die Berechtigungen in Form einer Baumstruktur mit Batterieform an.
- **Tabellarische Ansicht** zeigt die Berechtigungen in Textform an, wobei die Berechtigungsstufen durch einen Doppelpunkt getrennt sind.

## Referenzen

### Kontext-Hilfe

- [Identitätsdienste](/identity-services)
- [Identitätsdienste - Rollen](/identity-service-roles)

### Product Knowledge Base

- [JS7 - Default Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Default+Roles+and+Permissions)
- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Management of User Accounts, Roles and Permissions](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+User+Accounts%2C+Roles+and+Permissions)
