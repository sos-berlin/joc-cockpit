## Argument: command_script
<article id="command_script">

Carries script code that will be transferred to the remote SSH server and will then be executed.

The (script) file can access variables from workflows, job resources and workflow variables by environment variables. The names of environment variables are spellted with upper case letters and are prefixed with `JS7_VAR_`.

One of the *command*, *command_script* and *command_script_file* arguments must be used.
</article>