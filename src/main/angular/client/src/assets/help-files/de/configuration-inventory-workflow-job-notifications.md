# Konfiguration - Inventarisierung - Workflow - Auftragsbenachrichtigungen

Im Bereich *Workflow* können Sie Workflows aus einer Folge von Anweisungen erstellen. Sie können die *Auftragsanweisung* per Drag &amp; Drop aus der *Symbolleiste* an eine Position im Workflow ziehen.

Die grafische Benutzeroberfläche bietet eine Reihe von Registerkarten für die Angabe von Auftragsdetails. Die fünfte Registerkarte wird für *Benachrichtigungen* angeboten.

*Benachrichtigungen

### Globale Benachrichtigungen

Globale Benachrichtigungen werden von [Notifications](/notifications) aus konfiguriert und werden auf alle Workflows und Jobs angewendet, die in der Konfiguration angegeben sind.

Benachrichtigungen erlauben die Verwendung verschiedener Kanäle:

- Die Benachrichtigung in der Ansicht [Monitor - Order Notifications](/monitor-notifications-order) und [Monitor - System Notifications](/monitor-notifications-system) verfügbar machen
- Versenden von Benachrichtigungen per E-Mail.
- Ausführen eines Shell-Befehls. Systemmonitor-Tools von Drittanbietern bieten beispielsweise häufig eine Befehlszeilenschnittstelle, die so parametrisiert werden kann, dass sie den Systemmonitor mit Ereignissen über die erfolgreiche oder fehlgeschlagene Ausführung von Aufträgen füttert.

### Jobbezogene Benachrichtigungen

Spezifische Benachrichtigungen pro Job haben Vorrang vor den globalen Benachrichtigungen der folgenden Einstellungen:

- **Mail on** legt ein oder mehrere Ereignisse fest, bei denen eine E-Mail gesendet werden soll
  - *ERROR* löst die Benachrichtigung aus, wenn ein Auftrag fehlschlägt.
  - *WARNING* löst die Benachrichtigung bei erfolgreichen Jobs aus, die einen Warn-Rückgabecode aufweisen.
  - *SUCCESS* löst die Benachrichtigung bei erfolgreichen Aufträgen mit oder ohne Warnungen aus.
- **Mail To** gibt die Liste der E-Mail-Empfänger an. Mehrere Empfänger können durch ein Komma oder Semikolon angegeben werden. Wenn kein Empfänger angegeben wird, wird keine Benachrichtigung per E-Mail versendet und die Einstellung Globale Benachrichtigung überschrieben.
- **Mail Cc** gibt die Liste der E-Mail-Empfänger an, die Durchschläge erhalten. Sie können mehr als einen Empfänger angeben, indem Sie ein Komma oder ein Semikolon verwenden.
- **Mail Bcc** legt die Liste der E-Mail-Empfänger fest, die Blindkopien erhalten. Mehrere Empfänger können durch ein Komma oder Semikolon angegeben werden.

## Referenzen

### Kontexthilfe

- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
  - [Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  - [Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  - [Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  - [Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)
- [Monitor - Order Notifications](/monitor-notifications-order)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Notifications](/notifications)

### Product Knowledge Base

- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)

