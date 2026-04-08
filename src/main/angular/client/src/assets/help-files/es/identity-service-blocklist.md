# Identity Service - Blocklist

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

Administrative user accounts can add accounts from any Identity Service to a blocklist:

- Blocked accounts are denied access to JOC Cockpit, they are not blocked with the Identity Service Provider such as LDAP, OIDC etc.
- Blocked accounts remain in the blocklist until they will be removed from the list.

## Adding Accounts to the Blocklist

The *Blocklist* sub-view offers adding accounts to the blocklist from the related button in the upper-right corner of the view.

User accounts can be added to the blocklist from the following sub-views:

- [Audit Log - Failed Logins](/identity-service-faíled-logins): if accounts are identified raising frequently failed logins then this can indicate an attack. Such accounts can be added to the blocklist.
- [Identity Service - Active Sessions](/identity-service-active-sessions): if accounts in active sessions are identified being unwanted, then they can be added to the blocklist.

Both sub-views offer adding single accounts to the blocklist and adding selected accounts from a bulk operation.

### Removing Accounts from the Blocklist

In the *Blocklist* sub-view per account displayed the action menu item is offered to *Remove from Blocklist*.

A bulk operation is offered from using the *Remove from Blocklist* button in the upper-right corner of the sub-view for selected accounts.

## References

### Context Help

- [Audit Log - Failed Logins](/identity-service-faíled-logins)
- [Identity Service - Active Sessions](/identity-service-active-sessions)
- [Identity Services](/identity-services)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
