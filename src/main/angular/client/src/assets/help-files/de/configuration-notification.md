# Konfiguration - Benachrichtigung

JS7 bietet Benachrichtigungen bei Warnungen und Fehlern von JS7 Produkten und bei fehlgeschlagenen Jobs und Arbeitsabläufen. Benachrichtigungen können auch bei erfolgreicher Ausführung von Jobs und Arbeitsabläufen gesendet werden.

- Die Benachrichtigungen basieren auf der laufenden Überwachung durch das JOC Cockpit mithilfe des [Überwachungsdienstes](/service-monitor) und werden in der Ansicht [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor) visualisiert. Dazu gehören:
  - die Überwachung der Verfügbarkeit von Controller und Agenten,
  - die Überwachung der Ausführung von Arbeitsabläufen und Jobs.
- Benachrichtigungen werden auf eine der folgenden Arten weitergeleitet:
  - per E-Mail, Einzelheiten finden Sie unter [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment) und [JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs).
  - über ein CLI-Tool wie den System Monitor Agent für [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor), Einzelheiten finden Sie unter [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment).

Benachrichtigungen werden über die Unteransicht Konfiguration-&gt;Benachrichtigung im JOC Cockpit verwaltet. Die Konfiguration wird im XML-Format gespeichert und anhand des oben auf der Seite angegebenen *XSD Schema* validiert.

Die Seite ist aufgeteilt in den *Navigationsbereich* auf der linken Seite und den *Detailbereich* auf der rechten Seite. 

- Der *Detailbereich* bietet Eingabefelder und die dazugehörige Dokumentation pro Element.
- Wenn Sie Konfigurationsdetails eingeben, werden diese automatisch innerhalb von 30 Sekunden und beim Verlassen der Seite gespeichert.

Der typische Lebenszyklus beim Ändern von Benachrichtigungen umfasst

- die Eingabe von Konfigurationsdetails,
- klicken der Schaltfläche *Validieren*, um zu überprüfen, ob die Konfiguration konsistent ist,
- klicken der Schaltfläche *Freigeben*, um die Konfiguration zu aktivieren.

## Bereich: Navigation

Die Konfiguration wird über die Navigation nach Elementen angeboten. Wenn Sie auf einen Elementnamen klicken, wird das Element geöffnet und die verfügbaren Unterelemente werden angezeigt. Die Pfeilanzeige links neben dem Elementnamen zeigt an, ob Unterelemente verfügbar sind.

Das 3-Punkte Aktionsmenü eines Elements bietet die folgenden Operationen:

- **Kindknoten hinzufügen** ermöglicht das Hinzufügen von Knoten zum aktuellen Element. Die verfügbaren Knotentypen werden angezeigt.
- **Alle Kindknoten des ausgewählten Knotens anzeigen** öffnet ein Popup-Fenster, in dem mögliche untergeordnete Knoten angezeigt werden. Dazu gehört das Durchlaufen von Kindknoten und die Suche von Kindknoten nach Namen.
- **Kopieren/Einfügen** ermöglicht das Kopieren eines Knotens einschließlich der Kindknoten. Das Einfügen ist über das Aktionsmenü des übergeordneten Knotens möglich.
- mit **Entfernen** können Sie den Knoten und alle untergeordneten Knoten entfernen.

### Fragments

#### MessageFragments

- **Message**
  - Eine *Message* definiert den Inhalt, der z.B. per E-Mail an einen Benutzer gesendet wird oder der zur Parametrierung eines Kommandozeilenprogramms verwendet wird, wie z.B. der Inhalt, der an ein System Monitor Dienstprogramm weitergeleitet werden soll.
    - *Messages* für die Verwendung mit E-Mail stellen den E-Mail-Textkörper dar, der aus einfachem Text oder aus HTML verwendet wird.
    - Nachrichten für die Verwendung mit der Befehlszeile stellen eine Zeichenkette dar, die mit dem Element *CommandFragmentRef* verwendet werden kann, siehe unten.
    - *Message*-Elemente können Monitor-Variablen enthalten, die Platzhalter für Werte sind, z.B. für den Pfad des Arbeitsablaufs, die Auftragskennung usw.
    - Es kann eine beliebige Anzahl von *Message*-Elementen hinzugefügt werden.

#### MonitorFragments

Die Fragmente gibt es in einer Reihe von Varianten für die folgenden Benachrichtigungstypen.

- **MailFragment**
  - Die folgenden Elemente sind für den Versand von E-Mail erforderlich:
    - **MessageRef**: Gibt den Verweis auf ein Nachrichtenelement an, das den E-Mail-Text enthält.
    - **Subject**: Gibt den Betreff der E-Mail an und kann Monitor-Variablen enthalten.
    - **An**: Gibt die E-Mail-Adresse des Empfängers an. Mehrere Empfänger können durch ein Komma getrennt werden.
  - Die folgenden Elemente sind optional, um eine E-Mail zu versenden:
    - **CC**: Der Empfänger der Durchschläge. Mehrere Empfänger können durch Komma getrennt werden.
    - **BCC**: Der Empfänger von Blindkopien. Mehrere Empfänger können durch ein Komma getrennt werden.
    - **Von**: Die E-Mail-Adresse des Kontos, das zum Versenden von E-Mails verwendet wird. Beachten Sie, dass die Konfiguration Ihres Mail Server bestimmt, ob ein bestimmtes oder ein beliebiges Konto verwendet werden kann.
- **CommandFragment**
  - **MessageRef**: Gibt den Verweis auf ein *Message*-Element an, das den Inhalt liefert, der mit dem *Command*-Element weitergeleitet wird. Der Inhalt der Nachricht ist in der *$\{MESSAGE\}* Monitor-Variable für die Verwendung mit späteren Elementen verfügbar.
  - **Command**: Gibt das Shell Kommando für Linux/Windows an, das zur Weiterleitung von Benachrichtigungen verwendet wird, z.B. an ein System Monitor Dienstprogramm.
    - Zum Beispiel kann das folgende Shell Kommando verwendet werden:
      - *echo "$\{MESSAGE\}" &gt;&gt; /tmp/notification.log*
      - Das Shell Kommando *echo* fügt den Inhalt der *$\{MESSAGE\}* Monitor-Variable an eine Datei im Verzeichnis */tmp* an.
- **JMSFragment**
  - Der Fragmenttyp wird verwendet, um ein Java Message Queue Produkt zu integrieren, das die JMS-API implementiert. Die Werte der Attribute sind spezifisch für das verwendete JMS-Produkt.

#### ObjectFragments

- **Workflows**: Es können beliebig viele Konfigurationen hinzugefügt werden, die sich durch einen eindeutigen Namen unterscheiden, der dem Element zugewiesen wird.
  - **Workflow**: Das Attribut *Pfad* erlaubt einen regulären Ausdruck, der einen Teil des Pfads des Arbeitsablaufs angibt.
    - **WorkflowJob**: Das Element kann verwendet werden, um Benachrichtigungen auf bestimmte Jobs in einem *Workflow* zu beschränken.
      - Dazu gehört die Möglichkeit, das Attribut *Job Name* und/oder sein Attribut *Label* anzugeben. Für beide Attribute können konstante Werte und reguläre Ausdrücke verwendet werden, z.B. *.\**, um anzugeben, dass für alle Jobs eine E-Mail gesendet wird.
      - Für Versionen vor 2.7.1:
        - Bei der Verwendung des Elements muss die Kritikalität angegeben werden, die entweder *ALL*, *NORMAL* oder *CRITICAL* ist.
      - Für Versionen ab 2.7.1:
        - Die Kritikalität kann eine oder mehrere der Optionen *MINOR*, *NORMAL*, *MAJOR*, *CRITICAL* sein.
        - Die Kritikalität *ALL* ist veraltet.
      - Die Attribute **return_code_from** und **return_code_to** können optional verwendet werden, um die Benachrichtigungen weiter auf Jobs zu beschränken, die mit dem angegebenen Return Code abgeschlossen wurden. Der Returncode für Shell Jobs entspricht dem Exitcode des Betriebssystems.
    - Leer: Wenn kein *WorkflowJob*-Element angegeben ist, gilt die Benachrichtigung für alle [JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions) einschließlich der [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction). Andernfalls gilt sie für alle Vorkommen der [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction).

### Notifications

Sie aktivieren die effektiven Benachrichtigungen durch Verweise auf die oben beschriebenen *Fragment*-Elemente.

#### SystemNotification

- **SystemNotification**: Wählt eines oder mehrere der oben genannten *MonitorFragmente* aus. Es ist möglich, eine Reihe von *Fragmenten* desselben Fragmenttyps auszuwählen.
  - Benachrichtigungen werden aus Systemfehlern und Warnungen erstellt, die in den JS7 Produktprotokolldateien identifiziert werden, siehe [Protokoll-Benachrichtigungsdienst](/service-log-notification).
  - Das Element wird verwendet, um die Unteransicht [Überwachung - Systembenachrichtigungen](/monitor-notifications-system) von JOC Cockpit zu füllen.

#### Notification

- **Notification**: Es kann eine beliebige Anzahl von Benachrichtigungen hinzugefügt werden, wobei jede Benachrichtigung durch einen eindeutigen Namen gekennzeichnet ist. Einer Benachrichtigung wird ein Typ zugewiesen, der entweder *SUCCESS*, *WARNING* oder *ERROR* sein kann. Auf diese Weise können Benachrichtigungen z.B. bei Auftragsfehlern und Warnungen versendet werden. Ebenso können Sie Benachrichtigungen für die erfolgreiche Ausführung eines Arbeitsabläufe angeben. Beachten Sie, dass eine erfolgreiche Ausführung sowohl das Nichtvorhandensein von Job-Fehlern als auch optional das Vorhandensein von Job-Warnungen beinhaltet.
  - **NotificationMonitors**: Wählt eines oder mehrere der oben genannten *MonitorFragments* aus. Es ist möglich, mehrere Fragmente desselben Fragmenttyps auszuwählen.
    - **CommandFragmentRef**: Wählt das verwendete *CommandFragment* aus.
      - **MessageRef**: Wählt das mit dem *Command* verwendete *Message*-Element aus.
    - **MailFragmentRef**: Wählt das *MailFragment* aus, das für den Versand von Benachrichtigungen per E-Mail verwendet wird. Wenn mehrere *MailFragment*-Elemente referenziert werden, können verschiedene Arten von E-Mails verwendet werden, z.B. für verschiedene Empfänger oder mit unterschiedlichem Inhalt und Layout des E-Mail Body.
    - **JMSFragmentRef**: Wählt das *JMSFragment* aus, das für den Versand von Benachrichtigungen an ein Java Message Queue-kompatibles Produkt verwendet wird.
  - **NotificationObjects**: Wählt die Arbeitsabläufe aus, für die Benachrichtigungen erstellt werden.
    - **WorkflowRef**: Wählt ein *Workflow*-Element aus, das die Benachrichtigungen auf verwandte Arbeitsabläufe beschränkt. Es kann eine beliebige Anzahl von Workflow-Referenzen hinzugefügt werden.

## Operationen für Benachrichtigungen

Die Seite *Benachrichtigung* bietet die folgenden Operationen über die entsprechenden Schaltflächen oben auf der Seite:

- **Neu**: beginnt mit einer leeren Konfiguration.
- **Entfernen**: löscht die aktuelle Konfiguration.
- **Entwurf zurücksetzen**: erstellt einen neuen Entwurf ausgehend von der zuletzt veröffentlichten Version. Aktuelle Änderungen gehen dabei verloren.
- **Hochladen**: ermöglicht das Hochladen einer XML-Datei mit der Konfiguration.
- **Herunterladen**: bietet das Herunterladen der Konfiguration in eine XML-Datei an.
- **XML bearbeiten**: ermöglicht die direkte Bearbeitung der Konfiguration im XML-Format.
- **Validieren**: validiert die Konfiguration anhand eines XSD-Schemas. Dies garantiert, dass die XML-Konfiguration wohlgeformt und formal korrekt ist.
- **Freigeben**: veröffentlicht die Konfiguration in JOC Cockpit. Die Änderungen werden sofort wirksam.

## Referenzen

### Kontext-Hilfe

- [Protokoll-Benachrichtigungsdienst](/service-log-notification)
- [Überwachung - Verfügbarkeit Agenten](/monitor-availability-agent)
- [Überwachung - Verfügbarkeit Controller](/monitor-availability-controller)
- [Überwachung - Auftragsbenachrichtigungen](/monitor-notifications-order)
- [Überwachung - Systembenachrichtigungen](/monitor-notifications-system)
- [Überwachungsdienst](/service-monitor)

### Product Knowledge Base

- [JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
  - [JS7 - Notifications - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration)
    - [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment)
    - [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment)
  - [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor)
- [JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions)
  - [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
