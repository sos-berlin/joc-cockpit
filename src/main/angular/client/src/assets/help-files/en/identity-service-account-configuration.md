# Identity Service - Account Configuration

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

For a number of Identity Services the operations to add, update and delete accounts are available, for example for the [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service).

## Account Configuration

For an account the following properties are available:

- **Account** specifies the account that is used to login.
- **Password** is available for the *JOC* Identity Service Type. The *Password* will be hashed before being stored to the database. On login a similar hash operation is performed to compare passwords. 
  - An individual *Password* can be specified. If left empty, then the *initial_password* specified with the [Settings - Identity Service](/settings-identity-service) page will be used. The *Password* has to match the *minimum_password_length* requirement from the same Settings page.
  - Whichever source is used for the *Password*, on next login the user has to change the account's *Password*.
- **Confirm Password** is used to repeat an individually specified *Password*. If the *Password* property is empty, then the *Confirm Password* property must be empty too.
- **Roles** specifies the list of [Identity Service - Roles](/identity-service-roles) that are assigned the account.
- **Force Password Change** indicates if on next login the user account must change its *Password*. Password change is enforced to prevent ongoing use of the individually specified *Password* and of the initial *Password*.
- Properties available for existing accounts include:
  - **Blocked** specifies that the account should be added to the [Identity Service - Blocklist](/identity-service-blocklist) and will be denied access.
  - **Disabled** specifies that the account is inactive and is denied access.

## References

### Context Help

- [Identity Service - Blocklist](/identity-service-blocklist)
- [Identity Service - Roles](/identity-service-roles) 
- [Identity Services](/identity-services)
- [Settings - Identity Service](/settings-identity-service)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
