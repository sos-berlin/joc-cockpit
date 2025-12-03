# Tagesplan

Das Panel *Tagesplan* liefert Informationen über die Ausführung von Orders, die durch den Tagesplan erstellt wurden. Davon ausgenommen sind Aufträge, die bei Bedarf durch Benutzereingriff erstellt werden, und Aufträge, die aus der Datei-Überwachung durch *Datei-Auftragsquellen* erstellt werden.

<img src="dashboard-daily-plan.png" alt="Daily Plan" width="330" height="80" />

## Status des Tagesplans

Der Status des Tagesplans ist der anfängliche Status, wenn eine Order durch den Tagesplanservice erstellt wird.

- **Geplante** Aufträge wurden noch nicht an den Controller und die Agenten übermittelt. Eine beliebige Anzahl von *Geplanten* Aufträgen weist auf ein Problem hin, wenn der Datumsbereich die Anzahl der Tage überschreitet, für die Aufträge eingereicht werden sollten.
- **Übermittelte** Aufträge sind für eine spätere Ausführung im Laufe des Tages geplant oder befinden sich in der Ausführung. Der Status spiegelt nicht den aktuellen Stand der gestarteten Orders wider, sondern fasst die Orders zusammen, die im Laufe des Tages ausgeführt werden sollen.
- **Erledigt** Orders sind abgeschlossen. Dies ist unabhängig davon, ob die Orders erfolgreich oder nicht erfolgreich abgeschlossen wurden, was in der Ansicht *Orderverlauf* angezeigt wird.

Wenn Sie auf die angegebene Anzahl von Aufträgen klicken, gelangen Sie zur Ansicht *Tagesplan*, in der die Aufträge im Detail angezeigt werden.

*Filter

Über die Dropdown-Schaltfläche in der oberen rechten Ecke des Fensters können Sie Aufträge aus einem Datumsbereich auswählen:

- **Heute** Orders beziehen sich auf den aktuellen Tag, der anhand der Zeitzone im Profil des Benutzers berechnet wird.
- **Nächster Tag** Orders sind für die Ausführung am nächsten Tag vorgesehen. Dies schließt *heutige* Orders aus.
- **Nächster 2. Tag** Orders sind für die Ausführung am 2. nächsten Tag vorgesehen.
- **Nächster 3. Tag** Orders sind für die Ausführung am nächsten 3. Tag vorgesehen.
- **Nächster 4. Tag** Orders werden für die Ausführung am nächsten 4. Tag angestrebt.
- **Nächster 5. Tag** Orders sind für die Ausführung am nächsten 5. Tag vorgesehen.
- **Nächster 6. Tag** Orders sind für die Ausführung am nächsten 6. Tag vorgesehen.
- **Nächster 7. Tag** Orders sind für die Ausführung am nächsten 7. Tag vorgesehen.

## Referenzen

- [Tagesplan](/daily-plan)
- [Dashboard - Orders](/dashboard-orders)
- [Auftragshistorie](/history-orders)
- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)

