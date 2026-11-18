# Job: MonitoringJob
<summary>
Performs health checks of JOC Cockpit, Controller and Agents.
</summary>

# Purpose
<detail>

The job performs health checks of JS7 JOC Cockpit, Controller and Agents.
Health check results can be forwarded, for example by mail.

- Users can use health status results for integration with their monitoring system.
- SOS offers a 24/7 Monitoring Service to receive health status results of customers using a commercial license who subscribe to this support option, see JS7 License.

The job can be used as a building block in a monitoring solution to

- repeatedly run the job using a Cycle Instruction,
- forward health check results to a monitoring solution.
  - This can include forwarding health check report files when used with a user's monitoring solution.
  . This can include sending mail to SOS indicating a notice or an alert. 
  - Such notices do not include any data related to the user's JS7 environment, they indicate a notice or alert only.

The job makes use of the JS7 REST Web Service API to retrieve information from the JOC Cockpit.

- The job authenticates with the JS7 REST Web Service API by use of user account/password and/or by use of a certificate, for details see [JS7 - JITL Common Authentication](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Common+Authentication).
</detail>

# Arguments

## Argument: controller_id
<article id="controller_id">

Specifies the Controller ID of the Controller instance that should be checked.

By default the current Controller is used.			
</article>

## Argument: monitor_report_dir
<article id="monitor_report_dir">

Specifies the directory to which the job will store health status report files (.json). 
The directory must exist prior to running the job and must be in reach of the Agent that runs the job. 

- An absolute or relative path can be specified.
- An expression can be used, for example `env('JS7_AGENT_DATA') ++ '/monitor'`
</article>

## Argument: monitor_report_max_files
<article id="monitor_report_max_files">

Limits the maximum number of files in *monitor_report_dir*.

Older report files will be removed when the value is exceeded.
</article>

## Argument: max_failed_orders
<article id="max_failed_orders">

Specifies the maximum number of failed orders that are considered acceptable for a health status check. 
If this number is exceeded then the resulting return variable will carry a non-zero value indicating a failed health status check.

By default the number of failed orders is not considered for successful/unsuccessful health status checks.
</article>

## Argument: from
<article id="from">

Specifies the e-mail address that is used to send mail for notices and alerts. The argument is used by the job to create the subject and body return variables.
</article>

# Return Variables

## Return Variable: monitor_report_date
<article id="monitor_report_date">

Provides the date and time for which the health status check has been performed. 

The date format is yyyy-MM-dd.HH-mm-ss.K, for example `2022-07-31.23-12-59.Z` indicating UTC time.
</article>

## Return Variable: monitor_report_file
<article id="monitor_report_file">

Provides he path to the report file created for the health status check.	                    
</article>

## Return Variable: subject
<article id="subject">

Returns the subject for sending mail which is one of:

- JS7 Monitor: Notice from: *from* at: *monitor_report_date*
- JS7 Monitor: Alert from: *from* at: *monitor_report_date*

The *subject* includes the values specified from the *from* argument and *monitor_report_date* return variable.
</article>

## Return Variable: body
<article id="body">

Provides the body of an e-mail for use with a later MailJob, by default the value is the same as for the subject.
</article>

## Return Variable: result
<article id="result">

Provides the number of problems identified during the health status check. A value 0 indicates absence of problems, other values indicate existence of problems.	
</article>
