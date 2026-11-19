# Job: SSHJob
<summary>
Executes commands and executables on a remote server by SSH.
</summary>

# Purpose
<detail>

The job is used to execute commands, programs, shell scripts on a remote server by use of the SSH protocol.

For more information see [SSH](https://en.wikipedia.org/wiki/SSH).

[](include:include/ssh/notes/how_to_use_open_ssh.md)
[](include:include/ssh/notes/how_to_handle_stderr_and_exit_code.md)
[](include:include/ssh/features/parameter_substitution.md)
</detail>

# Arguments

[](include:include/vfs/common/params/param_host.md)
[](include:include/vfs/ssh/params/param_port.md)
[](include:include/vfs/ssh/params/param_connect_timeout.md)
[](include:include/vfs/ssh/params/param_auth_method.md)
[](include:include/vfs/ssh/params/param_preferred_authentications.md)
[](include:include/vfs/ssh/params/param_required_authentications.md)
[](include:include/vfs/common/params/param_user.md)
[](include:include/vfs/common/params/param_password.md)
[](include:include/vfs/ssh/params/param_auth_file.md)
[](include:include/vfs/ssh/params/param_passphrase.md)
[](include:include/vfs/ssh/params/param_socket_timeout.md)
[](include:include/vfs/ssh/params/param_server_alive_interval.md)
[](include:include/vfs/ssh/params/param_strict_hostkey_checking.md)
[](include:include/vfs/ssh/params/param_remote_charset.md)
[](include:include/vfs/ssh/params/param_simulate_shell.md)
[](include:include/vfs/common/params/param_credential_store_file.md)
[](include:include/vfs/common/params/param_credential_store_key_file.md)
[](include:include/vfs/common/params/param_credential_store_password.md)
[](include:include/vfs/common/params/param_credential_store_entry_path.md)
[](include:include/vfs/common/params/param_proxy_host.md)
[](include:include/vfs/common/params/param_proxy_port.md)
[](include:include/vfs/common/params/param_proxy_user.md)
[](include:include/vfs/common/params/param_proxy_password.md)
[](include:include/vfs/ssh/params/param_command.md)
[](include:include/vfs/ssh/params/param_command_script.md)
[](include:include/vfs/ssh/params/param_command_script_file.md)
[](include:include/vfs/ssh/params/param_command_script_param.md)
[](include:include/vfs/ssh/params/param_command_delimiter.md)
[](include:include/vfs/ssh/params/param_ignore_error.md)
[](include:include/vfs/ssh/params/param_ignore_stderr.md)
[](include:include/vfs/ssh/params/param_raise_exception_on_error.md)
[](include:include/vfs/ssh/params/param_exit_codes_to_ignore.md)

## Argument: tmp_dir
<article id="tmp_dir">

Specifies the directory for temporary data on the remote host.

Default: 
- Unix: `/tmp`
- Windows: `%TEMP%`
</article>

## Argument: create_env_vars
<article id="create_env_vars">

Populates the remote session with JS7 Agent environment variables.
</article>

## Argument: pre_command
<article id="pre_command">

Specifies the command to set an environment variable on the remote host.

Default: 
- Unix: `export %s='%s'`
- Windows: `set %s=%s`
</article>

## Argument: post_command_read
<article id="post_command_read">

Specifies the command to read the content of a file on the remote host.

The content will then be written to the stdout channel of the remote host. The command reads return values from a temporary file.

Default: `test -r %s && cat %s;`
</article>

## Argument: post_command_delete
<article id="post_command_delete">

Specifies the command to delete a file on the remote host. The command deletes a temporary file after proccessing.

Default: `test -r %s &amp;&amp; rm %s;`
</article>

# Return Variables

The job does not provide return variables.
