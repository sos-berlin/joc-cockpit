# Profile - Signature Key Management

The *Profile - Signature Key Management* tab holds the Signing Certificate used for deployment of Workflows and Job Resources.

- If JOC Cockpit is operated for the *low* Security Level, then the Signing Certificate is stored with the *root* account and is used for deployment operations of any user account.
- If JOC Cockpit is operated for the *medium* Security Level, then the Signing Certificate is stored individually with the user account and is used for deployment operations of the related user account.
- If JOC Cockpit is operated for the *high* Security Level, then the Signing Certificate is stored outside of JOC Cockpit and the *Signature Key Management* tab is not available.

For details see [JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management).

<img src="profile-signature-key-management.png" alt="Signature Key Management" width="800" height="75" />

## Signing Certificate

JS7 ships with a default Signing Certificate. Users should consider the validity period of the Certificate. Newer Certificates ship with JS7 versions approx. six months before certificate expiration. Instead of updating JS7, users can upload a newer Certificate that becomes available from [JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment).

Users can create their own Signing Certificate:

- from a Private Certificate Authority (CA) or Public CA. Use of a Private CA is explained from [JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates).
- from the built-in CA that ships with JOC Cockpit.

When using a Private CA or Public CA, then the Root CA Certificate or Intermediate CA Certificate that was used to sign the Signing Certificate has to be made available to Controller and Agent instances. The Certificate must be available from a file in PEM format that is located in the Controller's and Agent's *./config/private/trusted-x509-keys* directory.

## Operations on Signing Certificate

The following operations are offered:

- **Show** is available when clicking the icon right to the validity period. This will display the Private Key and Signing Certificate.
- **Update** invokes a pop-up window that allows to paste an updated Private Key and Signing Certificate.
- **Import** invokes a pop-up window that offers to upload the Private Key and Signing Certificate.
- **Generate** invokes a pop-up window to generate the Private Key and Signing Certificate from the built-in CA.
  - Users should check that the [Profile - SSL Key Management](/profile-ssl-key-management) tab holds a valid Root CA Certificate or Intermediate CA Certificate.
  - When generating keys, users should select the *Use SSL CA* option to use the built-in CA when creating and signing a new Signing Certificate.
- **Delete** will remove the Private Key and Signing Certificate. In *low* and *medium* Security Levels this will prevent Workflows and Job Resources from being deployed.

## References

### Context Help

- [Profile](/profile)
- [Profile - SSL Key Management](/profile-ssl-key-management)

### Product Knowledge Base

- [JS7 - How to create X.509 Signing Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Signing+Certificates)
- [JS7 - How to update the Digital Signing Certificate for deployment](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+update+the+Digital+Signing+Certificate+for+deployment)
- [JS7 - Profiles - Signature Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Signature+Key+Management)
