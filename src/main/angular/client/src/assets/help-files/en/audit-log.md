# Audit Log

The *Audit Log* keeps track of changes to scheduling objects.

## Request

In JOC Cockpit all user operations are performed from REST API requests.

The request identifies the endpoint used and offers displaying the request body when clicking the arrow-down icon.

## Categories

- **CONTROLLER** indicates Controller operations such as adding Orders on demand.
- **DAILYPLAN** indicates changes to the Daily Plan.
- **IDENTITY** indicates changes to Identity Services.
- **INVENTORY** indicates inventory changes such as storing Workflows.

# Audit Trail

The JOC Cockpit can be configured to write an *Audit Trail* that keeps track of any REST API requests. The *Audit Trail* includes information about user sessions and is not available from the JOC Cockpit GUI.

The *Audit Trail* can be activated by administrators and is available from log files on disk.

## References

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Audit Trail](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Trail)
