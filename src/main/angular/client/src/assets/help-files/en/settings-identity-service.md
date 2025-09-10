# Settings - Identity Service

The following settings are applied to any [Identtiy Service](/identity-service). Changes become effective immediately.

## Identity Service Settings

### Setting: *idle_session_timeout*, Default: *30*m

Specifies the maximum duration in minutes of an idle session in JOC Cockpit.

- If users are inactive for the given number of minutes, then the user session expires and is terminated. Users can specify credentials and login to create a new user session.
- Should the lifetime of an access token provided by an external Identity Service be different from the maximum idle-timeout, then the JOC Cockpit will try to renew the access token with the Identity Service. Renewal of an access token does not require the user to re-specify their login credentials.
- Identity Services can restrict the lifetime of access tokens (time to live) and they can limit renewal of access tokens (maximum time to live). If an access token cannot be renewed, then the user session is terminated and the user is required to perform login.

### Setting: *initial_password*, Default: *initial*

Specifies the initial password used when creating new accounts or when resetting passwords in the [Identity Service - JOC Cockpit](/identity-service-joc).

- If an administrator adds user accounts with the JOC Cockpit and does not specify a password then the Initial Password will be used. As a general rule the JOC Cockpit does not allow use of empty passwords but populates them from the *initial_password*. Administrators can apply the initial password and they can specify an individual password for the given account.
- When resetting a user account's password, then an existing password will be replaced by the *initial_password*.
- Independently from the fact if the *initial_password* or an individual password is assigned a user account, the password must be changed by the user on first login. This ensures that users cannot use the initial password except for initial login.

### Setting: *minimum_password_length*, Default: *1*

Specifies the minimum length for passwords in the JOC Identity Service.

For any passwords specified - including the *initial_password* - the minimum length is indicated.
Note that the number of characters and arbitrariness of character selection are key factors for secure passwords. Password complexity requiring for example digits and special characters to be used do not substantially add to password security except in case of short passwords.

## References

- [Identtiy Service](/identity-service)
- [Identity Service - JOC Cockpit](/identity-service-joc)
- [Settings](/settings)
- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
