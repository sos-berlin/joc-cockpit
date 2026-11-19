## Argument: strict_hostkey_checking
<article id="strict_hostkey_checking">

Specifies the behavior for hosts that have not previously been involved in an SSH connection from the job.

By default it is not required that the client's `known_hosts` file includes the host key - this situation corresponds to use of the value `false`.

If this argument is set to `true`, then the host key is expected in the user's `known_hosts` file and otherwise the connection will be refused.

The argument forces to manually add new hosts to the `known_hosts` file.
</article>