# Identity Service - Active Sessions

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

Users can identify accounts holding active sessions when invoking the *Manage Identity Services* view from the wheel icon in the menu bar.

Active sessions are displayed from the account in use, from the Identity Service used for login and from the remaining session time.

- JOC Cockpit does not limit the number of sessions per account.
- The remaining session time is limited by the following factors:
  - The *session_idle_timeout* setting configured with the [Settings - Identity Service](/settings-identity-service) page limits the maximum duration a session can remain active without user activity.
  - Identity Service Providers such as OIDC and Keycloak can limit the maximum duration of a user session.

## Operations on Active Sessions

Users find the following operations on Active Sessions:

- **Add to Blocklist** will add the related account to the [Identity Service - Blocklist](/identity-service-blocklist) which denies future login. The operation will not terminate the account's current session.
- **Cancel Session** will forcibly terminate the account's current session. This will not prevent the account from performing a new login operation.
- **Cancel all Sessions for Account** similarly to *Cancel Session* will terminate all sessions of the given account.

When selecting one or more sessions, then the *Cancel Session* operation is available from a bulk operation with the related button in the upper-right corner of the sub-view.

## References

### Context Help

- [Identity Service - Blocklist](/identity-service-blocklist)
- [Identity Services](/identity-services)
- [Settings - Identity Service](/settings-identity-service)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
