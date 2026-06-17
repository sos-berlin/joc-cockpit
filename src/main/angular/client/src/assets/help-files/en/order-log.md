# Order Log View

The *Order Log View* offers a running log that is updated every 2-3s. This allows following output of Jobs and Workflow Instructions executed by the Order in near real-time.

## Filter

The *Order Log View* offers filtering from a number of criteria available from the top of the window:

- **Main** specifies that details about Order starts, Job starts and the parameterization on Job starts will be displayed. Such output is indicated by the [MAIN] qualifier.
- **Success** events are indicated by the [SUCCESS] qualifier and show details such as the resulting parameterization when Jobs are completed.
- **stdout** specifies if output written by Jobs to the stdout channel will be displayed using the [STDOUT] qualifier.
- **Debug** applies to JVM Jobs that make use of the [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API). Such Jobs can be added the *log_level* argument holding the *debug*  or*trace* value. If debug output is available from a Job, then it will be displayed using the [DEBUG] qualifier.
- **Detail** specifies if events created by Workflow instructions such as posting and expecting Notices should be displayed.

Log output written by Jobs to the stderr channel is not subject to filtering and will be displayed from the [STDERR] qualifier.

## Display of Log Output

### Log Panel

Log output is displayed in historic ordering of arrival. If a Workflow forks execution to parallel Jobs, then output of each Job will be displayed coherently.

The top of the window offers the chevron-down and chevron-up icons that will expand or collapse log output of any Jobs.

#### Timestamps

Log output indicates timestamps from different sources:

- **Agent's time**: Initial main events such as *OrderStarted* are created by the Agent and reflect the Agent's real-time clock.
- **Job's time**: Output of Jobs makes use of the time zone of the server on which the Job will be executed or the time zone specified from the Job's implementation.
- **Controller's time**: Final events such as *OrderFinished* are created by the Controller and reflect the Controller's real-time clock.

The *Order Log View* converts timestamps to the user's time zone, if the related setting in the [Profile - Preferences](/profile-preferences) is active. Other than that, the Controller's and Agent's time zones will be used.

If the Controller's and Agent's real-time clocks are not synchronized, this can result in log output that suggests time travel.

### Navigation Panel

On the right side of the window users find an arrow-left icon that brings forward the navigation panel.

The panel offers the historic ordering of Jobs and Workflow Instructions executed by the Order. Red color indicates failed Jobs and Workflow Instructions.

Clicking a Job or Workflow instruction in the navigation panel jumps to related log output in the log panel.

## References

- [Profile - Preferences](/profile-preferences)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Log Levels and Debug Options](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Levels+and+Debug+Options)
