## Argument: required_authentications
<article id="required_authentications">

Specifies a list of authentication methods that must be successfully used in the given order for the SSH connection being established.

All authentication methods specified from the argument are mandatory. This is different from the *preferred_authentications* argument that allows choosing one of the methods specified.

This can be used for scenarios where multi-factor authentication is enforced by the SSH server, such as requiring both `publickey` and *password* authentication.

Important: The order of methods must match the SSH server configuration.

If the client specifies a different order than the server expects, then authentication will fail even if all credentials are correct.

Possible values (case-insensitive, semicolon-separated):

- `publickey;password`: The server requires key authentication followed by password confirmation.
- `password;publickey`: The server requires password authentication followed by key confirmation.

For related arguments that might need to be specified, such as *auth_file*, *password*, see the explanation for the *auth_method* argument.

Recommendations:
- Use *required_authentications* if the SSH server is configured to require all specified methods in the same order.
- Use *preferred_authentications* if its considered acceptable that one method from the list succeeds while others might fail.

The *auth_method* argument specifies a single authentication method only.
</article>