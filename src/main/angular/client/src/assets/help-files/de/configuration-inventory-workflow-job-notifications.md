# Konfiguration - Inventar - Arbeitsabläufe - Job-Benachrichtigungen

Im Bereich *Arbeitsablauf* können Sie Arbeitsabläufe aus einer Folge von Anweisungen erstellen. Sie können die *Job Anweisung* per Drag &amp; Drop aus der *Symbolleiste* an eine Position im Arbeitsablauf ziehen.

Die grafische Benutzeroberfläche bietet eine Reihe von Registerkarten für die Angabe von Details. Die fünfte Registerkarte wird für *Benachrichtigungen* angeboten.

## Benachrichtigungen

### Globale Benachrichtigungen

Globale Benachrichtigungen werden von [Benachrichtigungen](/notifications) aus konfiguriert und werden auf alle Arbeitsabläufe und Jobs angewendet, die in der Konfiguration angegeben sind.

Benachrichtigungen erlauben die Verwendung verschiedener Kanäle:

- Benachrichtigungen in den Ansichten [Monitor - Order Notifications](/monitor-notifications-order) und [Monitor - System Notifications](/monitor-notifications-system).
- Versenden von Benachrichtigungen per E-Mail.
- Ausführen eines Shell Kommandos. Systemmonitor-Tools von Drittanbietern bieten beispielsweise häufig eine Befehlszeilenschnittstelle, die so parametrisiert werden kann, dass sie den Systemmonitor mit Ereignissen über die erfolgreiche oder fehlgeschlagene Ausführung von Jobs versorgt.

### Job-Benachrichtigungen

Spezifische Benachrichtigungen pro Job haben Vorrang vor den globalen Benachrichtigungen der folgenden Einstellungen:

- **E-Mail bei** legt ein oder mehrere Ereignisse fest, bei denen ein E-Mail gesendet werden soll
  - *ERROR* löst die Benachrichtigung aus, wenn ein Auftrag fehlschlägt.
  - *WARNING* löst die Benachrichtigung bei erfolgreichen Jobs aus, die einen Rückgabewert für Warnungen aufweisen.
  - *SUCCESS* löst die Benachrichtigung bei erfolgreichen Aufträgen mit oder ohne Warnungen aus.
- **E-Mail senden an** gibt die Liste der E-Mail-Empfänger an. Mehrere Empfänger können durch ein Komma oder Semikolon angegeben werden. Wenn kein Empfänger angegeben wird, wird keine Benachrichtigung per E-Mail versendet und die Einstellung *Globale Benachrichtigungen* überschrieben.
- **Kopie senden an** gibt die Liste der E-Mail-Empfänger an, die Durchschläge erhalten. Sie können mehr als einen Empfänger angeben, indem Sie ein Komma oder ein Semikolon verwenden.
- **Blindkopie senden an** legt die Liste der E-Mail-Empfänger fest, die Blindkopien erhalten. Mehrere Empfänger können durch ein Komma oder Semikolon angegeben werden.

## Referenzen

### Kontexthilfe

- [Konfiguration - Inventar - Arbeitsabläufe](/configuration-inventory-workflows)
  - [Konfiguration - Inventar - Arbeitsabläufe - Job Optionen](/configuration-inventory-workflows-job-options)
  - [Konfiguration - Inventar - Arbeitsabläufe - Job Eigenschaften](/configuration-inventory-workflows-job-properties)
  - [Konfiguration - Inventar - Arbeitsabläufe - Job Knoteneigenschaften](/configuration-inventory-workflows-job-node-properties)
  - [Konfiguration - Inventar - Arbeitsabläufe - Job Kennzeichnungen](/configuration-inventory-workflows-job-tags)
- [Monitor - Order Notifications](/monitor-notifications-order)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Benachrichtigungen](/notifications)

### Product Knowledge Base

- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
