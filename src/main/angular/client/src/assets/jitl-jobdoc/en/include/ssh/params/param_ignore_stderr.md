## Argument: ignore_stderr
<article id="ignore_stderr">

The job checks if output to the stderr channel has been created by a command that is executed on the SSH server. Output to the stderr channel frequently is hinting at execution errors. Such errors are reported and by default will fail JS7 jobs and orders.

If the `true` value is specified, then output to the stderr channel will be reported but will not fail JS7 jobs and orders.
</article>