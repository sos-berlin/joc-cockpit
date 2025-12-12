# Übersicht Tagesplan

Der Bereich *Tagesplan* liefert Informationen über die Ausführung von Aufträgen, die durch den Tagesplan erstellt wurden. Davon ausgenommen sind Aufträge, die bei Bedarf durch Benutzereingriff erstellt werden, und Aufträge, die aus der Dateiüberwachung durch *Dateiauftragsquellen* erstellt werden.

<img src="dashboard-daily-plan.png" alt="Daily Plan" width="330" height="80" />

## Status im Tagesplan

Der Status im Tagesplan ist der anfängliche Status, wenn ein Auftrag durch den Tagesplandienst erstellt wird.

- **Geplante** Aufträge wurden noch nicht an den Controller und die Agenten übermittelt. Eine beliebige Anzahl von *Geplanten* Aufträgen weist auf ein Problem hin, wenn der Datumsbereich die Anzahl der Tage überschreitet, für die Aufträge übermittelt werden sollten.
- **Übermittelte** Aufträge sind für eine spätere Ausführung im Laufe des Tages geplant oder befinden sich in Ausführung. Der Status spiegelt nicht den aktuellen Stand der gestarteten Aufträge wider, sondern fasst die Aufträge zusammen, die im Laufe des Tages ausgeführt werden sollen.
- **Beendete** Aufträge sind abgeschlossen. Dies ist unabhängig davon, ob die Aufträge erfolgreich oder nicht erfolgreich abgeschlossen wurden, was in der Ansicht [Auftragshistorie](/history-orders) angezeigt wird.

Wenn Sie auf die angegebene Anzahl von Aufträgen klicken, gelangen Sie zur Ansicht *Tagesplan*, in der die Aufträge im Detail angezeigt werden.

## Filter

Über die Schaltfläche in der oberen rechten Ecke des Fensters können Sie Aufträge aus einem Datumsbereich auswählen:

- **Heute** Aufträge beziehen sich auf den aktuellen Tag, der anhand der Zeitzone im Profil des Benutzers berechnet wird.
- **Nächster Tag** Aufträge sind für die Ausführung am nächsten Tag vorgesehen. Dies schließt *heutige* Aufträge aus.
- **Nächster 2. Tag** Aufträge sind für die Ausführung am nächsten 2. Tag vorgesehen.
- **Nächster 3. Tag** Aufträge sind für die Ausführung am nächsten 3. Tag vorgesehen.
- **Nächster 4. Tag** Aufträge werden für die Ausführung am nächsten 4. Tag angestrebt.
- **Nächster 5. Tag** Aufträge sind für die Ausführung am nächsten 5. Tag vorgesehen.
- **Nächster 6. Tag** Aufträge sind für die Ausführung am nächsten 6. Tag vorgesehen.
- **Nächster 7. Tag** Aufträge sind für die Ausführung am nächsten 7. Tag vorgesehen.

## Referenzen

- [Tagesplan](/daily-plan)
- [Auftragshistorie](/history-orders)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
