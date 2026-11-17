## Argument: exit_code
<article id="exit_code">

The return code of the process is provided with the value of the *exit_code* return variable. The return code is zero if the process completes without errors.

If SP2 or Oracle error messages such as SP2-\*, ORA-\* is raised, then the job will be terminated abnormally and the *exit_code* return variable will be set to `98`.

If an error occurs and the stderr channnel is not empty, then the *exit_code* return variable will be set to `99`.
</article>