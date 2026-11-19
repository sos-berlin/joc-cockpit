## Argument: command
<article id="command">

Specfies the command that will be executed on the SSH server.

If more than one command is used, they must be separated by the character(s) indicated with the *command_delimiter* argument.

If in addition the *command_script_file* argument is used, then the script file will be transferred to the SSH server, but will not be executed. Instead the `JS7_SSH_TMP_SCRIPT_FILE` environment variable will be created that holds the path to the temporary script file on the SSH server.

If in addition the *command_script_param* argument is used, then the `JS7_SSH_SCRIPT_PARAMS` environment variable will be created and can be used in the *command* argument.

One of the *command*, *command_script* and *command_script_file* arguments must be used.
</article>