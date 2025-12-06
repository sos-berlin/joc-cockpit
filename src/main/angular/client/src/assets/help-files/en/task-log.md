# Task Log View

The *Task Log View* offers a running log that is updated every 2-3s. This allows following output of Jobs in near real-time.

## Filter

The *Task Log View* offers filtering from a number of criteria available from the top of the window:

- **Main** specifies that details about Job start and the parameterization on Job start will be displayed. Such output is indicated from the [MAIN] qualifier.
- **stdout** specifies if output written by the Job to the stdout channel will be displayed using the [STDOUT] qualifier.
- **Debug** applies to JVM Jobs that make use of the [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API). Such Jobs can be added the *log_level* argument holding the *debug*  or *trace* value. If debug output is available from a Job, then it will be displayed using the [DEBUG] qualifier.

Log output written by Jobs to the stderr channel is not subject to filtering and wil be displayed from the [STDERR] qualifier.

## Log Panel

Log output is displayed in historic ordering of arrival.

### Timestamps

Log output indicates timestamps from different sources:

- **Agent's time**: Events such as *Start* and *End* are created by the Agent and reflect the Agent's real-time clock.
- **Job's time**: Output of Jobs makes use of the time zone of the server on which the Job will be executed or the time zone specified from the Job's implementation.

The *Task Log View* converts timestamps to the user's time zone, if the related setting in the [Profile - Preferences](/profile-preferences) is active. Other than that, the Agent's time zone will be used.

If the Agent's real-time clock is not synchronized, this can result in inaccurate timestamps from log output.

## References

- [Profile - Preferences](/profile-preferences)
- [JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
- [JS7 - Log Levels and Debug Options](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Levels+and+Debug+Options)
