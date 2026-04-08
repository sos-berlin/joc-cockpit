# Profile

The *Profile* holds settings relevant for a user's interaction with JOC Cockpit.

A *Base Profile* is available, typically from the *root* account that is used

- to populate *User Profiles* of user accounts on first login,
- to provide settings relevant to all user accounts if JOC Cockpit is operated in *low* Security Level.

Users can switch the *Base Profile* to a different account from the [Settings - JOC Cockpit](/settings-joc) page.

Users should be aware that inactive profiles are subject to purge by the [Cleanup Service](/service-cleanup).

The *User Profile* allows managing preferences and settings that are applicable to the current user.

For details see [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles).

## Change Password

Clicking the related link, users can change their password if active [Identity Services](/identity-services) include a service of type *JOC* that was used for the current login.

- **Old Password** expects the currently used password being specified.
- **New Password** expects the new password being specified.
    - A minimum password length is required as configured with [Settings - Identity Service](/settings-identity-service).
    - The *Old Password* and *New Password* must be different.
- **Confirm Password** expects the new password being specified.

## Profile Sections

Settings for *User Profiles* are available from the following sections:

- [Profile - Preferences](/profile-preferences)
- [Profile - Permissions](/profile-permissions)
- [Profile - Signature Key Management](/profile-signature-key-management)
- [Profile - SSL Key Management](/profile-ssl-key-management)
- [Profile - Git Management](/profile-git-management)
- [Profile - Favorite Management](/profile-favorite-management)

## References

### Context Help

- [Cleanup Service](/service-cleanup)
- [Identity Services](/identity-services)
- [Settings - JOC Cockpit](/settings-joc)
- [Settings - Identity Service](/settings-identity-service)

### Product Knowledge Base

- [JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)
