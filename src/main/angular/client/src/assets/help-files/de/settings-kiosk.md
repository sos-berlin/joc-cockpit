# Einstellungen - Kiosk

JOC Cockpit kann unter [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode) betrieben werden

- unbeaufsichtigter Betrieb,
- die Anzeige einer Reihe von Seiten jeweils für einen vordefinierten Zeitraum,
- die Aktualisierung von Seiten, wenn neue Ereignisse eintreffen, wie z.B. der Abschluss von Aufträgen.

Die Seite *Einstellungen* ist über das Symbol ![wheel icon](assets/images/wheel.png) in der Menüleiste zugänglich.

## Kiosk-Einstellungen

### Einstellung: *kiosk\_role*, Standard: *kiosk*

Gibt den Namen der Rolle an, die einem Konto zugeordnet ist, das für den Betrieb im Kioskmodus verwendet wird:

- Die Rolle muss vom Benutzer erstellt werden.
- Die Rolle sollte nur über Leseberechtigungen verfügen.
- Die Rolle ist die einzige, der das Konto zugewiesen ist.

### Einstellung: *view\_dashboard\_duration*, Standard: *20*

Gibt die Dauer in Sekunden an, für die das Dashboard angezeigt werden soll.

Benutzer können das Dashboard-Layout für das im Kioskmodus verwendete Konto ändern.

- Ein Wert von 0 gibt an, dass die Ansicht nicht angezeigt wird.
- Ein Wert &gt;10 gibt die gewünschte Dauer an.

### Einstellung: *view\_monitor\_order\_notification\_duration*, Standard: *15*

Gibt die Dauer in Sekunden an, für die die Ansicht [Monitor - Order Notifications](/monitor-notifications-order) angezeigt werden soll.

- Ein Wert von 0 gibt an, dass die Ansicht nicht angezeigt wird.
- Ein Wert &gt;10 gibt die gewünschte Dauer an.

### Einstellung: *view\_monitor\_system\_notification\_duration*, Standard: *15*

Gibt die Dauer in Sekunden an, für die die Ansicht [Monitor - System Notifications](/monitor-notifications-system) angezeigt werden soll.

- Ein Wert von 0 gibt an, dass die Ansicht nicht angezeigt wird.
- Ein Wert &gt;10 gibt die gewünschte Dauer an.

### Einstellung: *view\_history\_tasks\_duration*, Voreinstellung: *30*

Gibt die Dauer in Sekunden an, für die die Ansicht [Prozesshistorie](/history-tasks) angezeigt werden soll.

- Ein Wert von 0 gibt an, dass die Ansicht nicht angezeigt wird.
- Ein Wert &gt;10 gibt die gewünschte Dauer an.

### Einstellung: *view\_history\_orders\_duration*, Voreinstellung: *0*

Gibt die Dauer in Sekunden an, für die die Ansicht [Auftragshistorie](/history-orders) angezeigt werden soll.

Ein Wert von 0 gibt an, dass die Ansicht nicht angezeigt wird.
Ein Wert &gt;10 gibt die gewünschte Dauer an.

## Referenzen

### Kontexthilfe

- [Monitor - Order Notifications](/monitor-notifications-order)
- [Monitor - System Notifications](/monitor-notifications-system)
- [Auftragshistorie](/history-orders)
- [Prozesshistorie](/history-tasks)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

