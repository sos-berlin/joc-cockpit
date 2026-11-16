# Job: CheckLicenseJob
<summary id="summary">
The job checks the expiration date of the JS7 license used by JOC Cockpit.
</summary>

# Purpose
<detail id="detail">

Users of the commercial license receive warnings and errors about license expiration from the JOC Cockpit GUI. Users who whish to receive e-mail notification about upcoming license expiration and expired licenses can make use of the job template.            

Return Codes:

- 1: license check not applicable for open source license
- 2: license is expired
- 3: license will expire within the number of days specified by the *validity_days* argument
</detail>

# Arguments

## Argument: validity_days
<article id="validity_days">

Specifies the number of days for which a license should be valid.
</article>

# Return Variables

## Return Variable: subject
<article id="subject">

Provides the e-mail subject indicating the state of license that can be used in a subsequent job.
</article>

## Return Variable: body
<article id="body">

Provides the e-mail body indicating the state of license that can be used in a subsequent job.
</article>