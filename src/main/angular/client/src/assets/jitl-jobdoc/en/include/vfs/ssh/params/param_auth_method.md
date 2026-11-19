## Argument: auth_method
<article id="auth_method">

Specifies a the authentication method used for the connection to the SSH server:

- `publickey`
  - If this authentication method is used, the following arguments can be used:
    - *auth_file*: path to Private Key file (required).
    - *passphrase*: passphrase for Private Key (optional).
- `password`
  - If this authentication method is used, the following argument must be specified:
    - *password* : Password for SSH login (required).
- `keyboard-interactive`
  - The authentication method is not supported as it is not possible for an unattended application such as JS7 JobScheduler that does not dispose of a keyboard to type passwords on-the-fly.

The argument selects a single authentication method.

To specify a numbeer of required or preferred authentication methods use the *required_authentications* or *preferred_authentications* arguments.
</article>