# Configuration - Notification

JS7 provides Notifications in case of warnings and errors of JS7 products and in the event of failed jobs and workflows. Notifications can also be sent in case of successful execution of jobs and workflows.

- Notifications are based on ongoing monitoring by the JOC Cockpit from the [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service) and are visualized in the [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor) view. This includes:
  - monitoring the  availability of the Controller and Agents,
  - monitoring the execution of Workflows and Jobs.
- Notifications are forwarded by one of the following means:
  - by e-mail, for details see [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment) and [JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs).
  - by using a CLI tool such as a System Monitor Agent for [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor), for details see [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment).

Notifications are managed from the Configuration->Notification sub-view in the JOC Cockpit.

## References

- [JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
  - [JS7 - Notifications - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration)
    - [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment)
    - [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment)
 - [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor)
