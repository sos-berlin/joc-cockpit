# Einstellungen - JOC Cockpit

Die folgenden Einstellungen werden auf JOC Cockpit angewendet. Änderungen werden sofort wirksam.

Die Seite *Einstellungen* ist über das Symbol ![wheel icon](assets/images/wheel.png) in der Menüleiste zugänglich.

## Einstellungen: Prüfprotokoll

### Einstellung: *force\_comments\_for\_audit\_log*, Standard: *false*

Legt fest, dass für alle Änderungen an Objekten, wie das Hinzufügen eines Auftrags, das Abbrechen eines Auftrags usw., ein Grund für das [Prüfprotokoll](/audit-log) angegeben werden muss.

Dies gilt für Operationen aus dem GUI und für Operationen des [REST Web Service API](/rest-api)
Wenn Sie für diese Einstellung den Wert *true* angeben, werden alle API-Anfragen, die Objekte ändern, mit Argumenten für das Prüfprotokoll versehen.

Beachten Sie, dass [Profil - Einstellungen](/profile-preferences) eine verwandte Einstellung zum Aktivieren von Gründen für das Prüfprotokoll enthält, die den gleichen Effekt hat. Die Verwendung dieser Einstellung ist jedoch freiwillig und auf das Konto des Profils beschränkt. Die Einstellung *force\_comments\_for\_audit\_log* erzwingt dieses Verhalten für alle Benutzerkonten, unabhängig von den Profileinstellungen der einzelnen Benutzerkonten.

### Einstellung: *comments\_for\_audit\_log*

Legt eine Liste möglicher Kommentare fest, die ein Benutzer auswählen kann, wenn er eine GUI-Operation durchführt, die ein Objekt verändert. Neben der Verwendung von Listeneinträgen steht es den Benutzern frei, bei der Durchführung solcher Operationen individuelle Kommentare zu verwenden.

Die Liste ist mit einigen bekannten Gründen für Objektänderungen gefüllt. Es steht den Benutzern frei, die Listeneinträge zu ändern und eigene Einträge für mögliche Kommentare hinzuzufügen.

### Einstellung: *default\_profile\_account*, Voreinstellung: *root*

Wenn dem JOC Cockpit über [Identitätsdienste](/identity-services) Benutzerkonten hinzugefügt werden, werden deren [Profil - Einstellungen](/profile-preferences) aus dem Profil des angegebenen Benutzerkontos erstellt.

- Diese Einstellung legt das Konto fest, das bei der Erstellung von Benutzerkonten als Vorlage für das Profil verwendet wird. 
- Standardmäßig wird das *root* Benutzerkonto verwendet, was darauf hinausläuft, dass das Profil eines neuen Kontos aus den Einstellungen wie Sprache usw. des Standardprofilkontos erstellt wird.

## Einstellungen: Anmeldung

### Einstellung: *enable\_remember\_me*, Standard: *true*

Diese Einstellung aktiviert das Kontrollkästchen *Eingaben merken*, das im Anmeldefenster verfügbar ist und das die Anmeldedaten des Benutzers wie Konto und Kennwort in einem Website-Cookie speichert. Dadurch werden das Benutzerkonto und das Kennwort bei der nächsten Anmeldung ausgefüllt.

- Einige Benutzer könnten es für ein Sicherheitsrisiko halten, Anmeldedaten im Browser zu speichern.
- Diese Einstellung kann deaktiviert werden, um die Speicherung von Benutzerdaten nicht anzubieten.

## Einstellungen: Inventar

### Einstellungen: *copy\_paste\_suffix*, *copy\_paste\_prefix*, Standard: *copy*

Legt das Präfix/Suffix fest, das für Objektnamen verwendet werden soll, wenn Sie Kopier- und Einfügeoperationen in der JOC Cockpit GUI durchführen.

- In JS7 sind die Namen von Inventarobjekten für jeden Objekttyp eindeutig: Arbeitsabläufe verwenden z.B. eindeutige Namen, eine Job-Ressource kann jedoch denselben Namen wie ein Arbeitsablauf verwenden.
- Daher muss ein neuer Objektname erstellt werden, wenn Sie Kopier- und Einfügeoperationen durchführen. Dies wird durch Hinzufügen eines Präfixes oder Suffixes erreicht, das von den Benutzern angegeben werden kann.

### Einstellung: *restore\_suffix*, *restore\_prefix*, Standard: *restored*

Wenn Inventarobjekte entfernt werden, werden sie dem Papierkorb hinzugefügt.

- Wenn entfernte Objekte aus dem Papierkorb wiederhergestellt werden, kann der ursprüngliche Objektname von einem neueren Objekt verwendet werden. 
- Mit dieser Einstellung können Sie die Präfix- und Suffixwerte festlegen, die beim Wiederherstellen von Objekten aus dem Papierkorb verwendet werden sollen.

### Einstellung: *import\_suffix*, *import\_prefix*, Standard: *imported*

Die JS7 Export- und Importoperationen für Inventar ermöglichen den Import von Objekten aus einer Archivdatei.

- Wenn Objekte importiert werden, können ihre Namen mit bereits vorhandenen Objektnamen in Konflikt geraten.
- Mit dieser Einstellung können Sie die Präfix- und Suffixwerte festlegen, die beim Importieren von Objekten verwendet werden sollen.

## Einstellungen: Ansicht

### Einstellung: *show\_view\_\**

Mit diesen Einstellungen können Sie einzelne Ansichten deaktivieren, die in der JOC Cockpit GUI über Hauptmenüpunkte wie *Überwachung*, *Tagesplan*, *Arbeitsabläufe* usw. verfügbar sind.

- Diese Einstellung funktioniert unabhängig von den Standardrollen und -berechtigungen.
- Infolgedessen kann ein Benutzerkonto die Berechtigung haben, Daten aus der Ansicht *Überwachung* anzuzeigen, obwohl die Ansicht in der Benutzeroberfläche nicht angeboten wird. Gleichzeitig sind die Daten aus der Ansicht *Überwachung* für dieses Konto verfügbar, wenn es das [REST Web Service API](/rest-api) verwendet.

### Einstellung: *display\_folders\_in\_views*, Standard: *true*

Gibt an, dass in Ansichten wie *Arbeitsabläufe*, *Tagesplan*, *Ressourcen - Kalender*, *Ressourcen - Ressourcen-Sperren*, *Ressourcen - Notizbretter* die Namen und Pfade von Objekten angezeigt werden. Wenn Sie für diese Einstellung den Wert *false* verwenden, wird der Pfad bei der Anzeige der Objekte weggelassen. In JS7 sind die Namen aller Objekte eindeutig.

## Einstellungen: Controller

### Einstellung: *controller\_connection\_joc\_password*, *controller\_connection\_history\_password*

JS7 bietet eine konsistente Konfiguration ohne Verwendung von Kennwörtern. Dies gilt auch für die Verbindung von JOC Cockpit zu Controller Instanzen, die durch gegenseitige HTTPS Server Authentifizierung und Client Authentifizierung gesichert werden kann. Wenn Benutzer die gegenseitige Authentifizierung für Controller Verbindungen nicht konfigurieren möchten, muss ein Kennwort verwendet werden, um das JOC Cockpit beim Controller zu authentifizieren.

Dies gilt für zwei Verbindungen, die von JOC Cockpit zu Controller Instanzen hergestellt werden, was sich in separaten Einstellungen für das *controller\_connection\_joc\_password* und das *controller\_connection\_history\_password* widerspiegelt:

- Das JOC Cockpit GUI nutzt eine Verbindung, um Ereignisse zu empfangen, zum Beispiel über Zustandstransitionen von Aufträgen.
- Der Historiendienst ist mit einem Controller verbunden, um Informationen wie den Zustand von Aufträgen und Protokollausgaben von Aufträgen zu erhalten.

Das Kennwort wird im Klartext auf der Seite *Einstellungen* und als Prüfsumme in der Datei *private.conf* des Controller angegeben.

Der Link **Prüfsumme anzeigen** ist auf der Seite *Einstellungen* verfügbar und ermöglicht die Anzeige der Prüfsumme des Kennworts.

Wenn ein Kennwort auf der Seite *Einstellungen* geändert wird, muss es auch in der Datei *private.conf* des Controller geändert werden, damit die Kennwörter übereinstimmen.

Es wird empfohlen, zuerst das Kennwort in der Datei *private.conf* der aktiven Controller Instanz zu ändern und danach auf der Seite *Einstellungen*. Anschließend sollte die Controller Instanz neu gestartet werden. JOC Cockpit wird sich danach wieder mit der aktiven Controller Instanz verbinden. Wenn ein Controller Cluster verwendet wird, muss die gleiche Änderung in der Datei *private.conf* der Standby Controller Instanz vorgenommen werden.

## Einstellungen: Unicode

### Einstellung: *encoding*

Die Kodierung wird angewendet, wenn JOC Cockpit für Windows Umgebungen betrieben wird. Windows unterstützt kein Unicode, sondern verwendet Codepages. Für den Fall, dass die Windows Codepage nicht automatisch erkannt wird, können Sie die Codepage angeben. Ein häufig verwendeter Wert ist *UTF-8*.

## Einstellungen: Lizenz

### Einstellung: *disable\_warning\_on\_license\_expiration*, Standard: *false*

JS7 bietet die Möglichkeit, Warnungen anzuzeigen, wenn die Lizenz bald abläuft. Die Funktion zur Anzeige von Warnungen bei Ablauf der Lizenz kann deaktiviert werden, indem Sie dieser Einstellung den Wert *true* zuweisen.

## Einstellungen: Protokolle

### Einstellung: *log\_ext\_directory*

Gibt ein Verzeichnis an, auf das JOC Cockpit zugreifen kann und in das Kopien der Auftrags- und Job-Protokolle geschrieben werden.

### Einstellung: *log\_ext\_order\_history*

Legt fest, dass eine JSON-Datei mit Informationen über die Historie des Auftrags bei erfolgreichen Aufträgen, fehlgeschlagenen Aufträgen oder beidem erstellt wird. Mögliche Werte sind:

- **alle**: erstellt eine Historie für alle erfolgreichen und fehlgeschlagenen Aufträge.
- **fehlgeschlagen**: erstellt eine Historie für fehlgeschlagene Aufträge.
- **erfolgreich**: erstellt eine Historie für erfolgreiche Aufträge.

### Einstellung: *log\_ext\_order*

Legt fest, dass eine Auftragsprotokolldatei im Falle von erfolgreichen Aufträgen, fehlgeschlagenen Aufträgen oder beidem erstellt wird. Mögliche Werte sind:

- **alle**: erstellt eine Auftragsprotokolldatei für alle erfolgreichen und fehlgeschlagenen Aufträge.
- **fehlgeschlagen**: erstellt eine Auftragsprotokolldatei für fehlgeschlagene Aufträge.
- **erfolgreich**: erstellt eine Auftragsprotokolldatei für erfolgreiche Aufträge.

### Einstellung: *log\_ext\_task*

Gibt an, dass eine Job-protokolldatei im Fall eines erfolgreichen Jobs, eines fehlgeschlagenen Jobs oder beidem erstellt wird. Mögliche Werte sind:

- **all**: erstellt eine Job-Protokolldatei für alle erfolgreichen und fehlgeschlagenen Jobs.
- **fehlgeschlagen**: erstellt eine Job-Protokolldatei für fehlgeschlagene Jobs.
- **erfolgreich**: erstellt eine Job-Protokolldatei für erfolgreiche Jobs.

### Einstellung: *log\_maximum\_display\_size*, Standard: *10* MB

JOC Cockpit bietet die Protokollausgaben zur Anzeige im Fenster *Protokollansicht* an, wenn die Größe der unkomprimierten Protokollausgaben diesen Wert nicht überschreitet. Andernfalls wird das Protokoll nur zum Herunterladen angeboten. Die Größe wird in MB angegeben.

### Einstellung: *log\_applicable\_size*, Voreinstellung: *500* MB

Wenn die Größe der Protokollausgaben eines Auftrags den Wert überschreitet, schneidet der Historiendienst die Protokollausgaben ab und verwendet die ersten und letzten 100 KB für das Protokoll. Die ursprüngliche Protokolldatei wird entfernt. Die Größe wird in MB angegeben.

### Einstellung: *log\_maximum\_size*, Standard: *1000* MB

Wenn die Größe der Protokollausgaben eines Auftrags den Wert überschreitet, schneidet der Historiendienst die Protokollausgaben ab und verwendet die ersten 100 KB für das Protokoll. Die ursprüngliche Protokolldatei wird entfernt. Die Größe wird in MB angegeben.

## Einstellungen: Links

### Einstellung: *joc\_reverse\_proxy\_url*

Wenn JOC Cockpit nicht über die originale URL, sondern nur über einen Reverse-Proxy-Dienst erreichbar ist, gibt dieser Wert die zu verwendende URL an, zum Beispiel bei E-Mail-Benachrichtigungen,

## Einstellungen: Job

### Einstellung: *allow\_empty\_arguments*, Standard: *false*

Standardmäßig müssen Argumente, die für Aufträge angegeben werden, Werte enthalten, da der Arbeitsablauf sonst als ungültig betrachtet wird. Diese Einstellung setzt das Standardverhalten außer Kraft und erlaubt die Angabe von leeren Werten.

## Einstellungen: Auftrag

### Einstellung: *allow\_undeclared\_variables*, Voreinstellung: *false*

Standardmäßig müssen alle Auftragsvariablen mit dem Arbeitsablauf deklariert werden. Diese Einstellung ändert das Standardverhalten und ermöglicht es Aufträgen, beliebige Variablen anzugeben. Benutzer sollten sich bewusst sein, dass Aufträge und damit verbundene Arbeitsablauf-Anweisungen fehlschlagen, wenn sie auf Variablen verweisen, die nicht von eingehenden Aufträgen angegeben werden.

## Einstellungen: Kennzeichnungen

### Einstellung: *num\_of\_tags\_displayed\_as\_order\_id*, Standard: *0*

Gibt die maximale Anzahl Kennzeichnungen an, die bei jedem Auftrag angezeigt werden. Ein Wert von 0 unterdrückt die Anzeige von Kennzeichnungen. Beachten Sie, dass die Anzeige einer größeren Anzahl von Kennzeichnungen pro Auftrag zu Leistungseinbußen führen kann.

### Einstellung: *num\_of\_workflow\_tags\_displayed*, Voreinstellung: *0*

Gibt die maximale Anzahl Kennzeichnungen an, die bei jedem Arbeitsablauf angezeigt werden. Ein Wert von 0 unterdrückt die Anzeige von Kennzeichnungen.

## Einstellungen: Autorisierung

### Einstellung: *approval\_requestor\_role*

Gibt den Namen der *Requestor* Rolle an, die Konten zugewiesen wird, die dem Autorisierungsprozess unterliegen.

## Einstellungen: Berichte

### Einstellung: *report\_java\_options*, Standard: *-Xmx54M*

Gibt die Java Optionen an, die bei der Erstellung von Berichten verwendet werden. Der Standardwert berücksichtigt den minimalen Java Heap Speicherplatz, der für die Erstellung von Reports erforderlich ist. Benutzer, die eine größere Anzahl von Auftragsausführungen pro Tag feststellen, müssen diesen Wert möglicherweise erhöhen, um den Speicherbedarf zu decken.

## Referenzen

### Kontext-Hilfe

- [Einstellungen](/settings)
- [Identitätsdienste](/identity-services)
- [Profil - Einstellungen](/profile-preferences)
- [Prüfprotokoll](/audit-log)
- [REST Web Service API](/rest-api)

### Product Knowledge Base

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Audit Trail](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Trail)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
