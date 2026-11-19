## Argument: preferred_authentications
<article id="preferred_authentications">

Specifies the order in which the job should attempt authentication methods for the connection to the SSH server.

This allows the job to prefer one method, for example `publickey`, to another method, for example `password`, and to define a set of alternative methods if one of the methods would fail.

If one method fails, the job will continue trying the remaining methods in the given order until authentication succeeds or allmethods are exhausted.

Possible values (case-insensitive, semicolon-separated):

- `publickey;password`: Prefer `publickey` authentication and fall back to `password` if the key is not accepted.
- `password;publickey`: Prefer `password` authentication and fall back to `publickey` if password authentication fails.

For related arguments that might need to be specified, such as *auth_file*, *password*, see the explanation for the *auth_method* argument.

Recommendations:
- Use *required_authentications* if the SSH server is configured to require all specified methods in the same order.
- Use *preferred_authentications* if its considered acceptable that one method from the list succeeds while others might fail.

The *auth_method* argument specifies a single authentication method only.
</article>