# Identity Service - Profiles

Identity Services rule access to JOC Cockpit by authentication and authorization, see [Identity Services](/identity-services).

For users who login with an Identity Service, on first login a *Profile* will be created for the related Identity Service.

- If more than one Identity Service is available for login, then the user will have a *Profile* with each Identity Service to which a successful login was performed.
- The *Profile* is created from the account specified with the *default_profile_account* setting in the [Settings - JOC Cockpit](/settings-joc) page. By default, the *root* account's *Profile* will be used.
- *Profiles* will be purged if not used for a longer period. The [Settings - Cleanup Service](/settings-cleanup) page specifies the maximum period for which a *Profile* will remain in place when no login occurs from the related user account.

## Operations on Profiles

The sub-view displays the list of active *Profiles* and the last login date. The following operations are available for *Profiles* individually:

- Clicking the *Profile* navigates to the [Identity Service - Roles](/identity-service-roles) sub-view to display roles used by the given *Profile*.
- A *Profile's* action menu offers the following operations:
  - **Delete Profile Preferences** will reset the [Profile - Preferences](/profile-preferences) to their default. Other *Profile* settings such as *Git Management* and *Favorite Management* remain in place. The operation can be used to enforce application of the default account's *Profile*.
  - **Delete Profile** wipes the user account's *Profile*. On next login of the related account a new *Profile* will be created.

Users can select one or more *Profiles* to perform above operations in bulk for selected *Profiles*.

## References

### Context Help

- [Identity Service - Configuration](/identity-service-configuration)
- [Identity Service - Accounts](/identity-service-accounts) 
- [Identity Service - Roles](/identity-service-roles) 
- [Identity Services](/identity-services)
- [Profile - Preferences](/profile-preferences) 
- [Settings - Cleanup Service](/settings-cleanup)
- [Settings - JOC Cockpit](/settings-joc)

### Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
