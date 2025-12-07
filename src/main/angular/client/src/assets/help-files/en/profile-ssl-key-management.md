# Profile - SSL Key Management

The *Profile - SSL Key Management* tab offers the built-in Certificate Authority (CA) that allows creating Server Authentication Certificates and Client Authentication Certificates for TLS/SSL connections to JS7 products.

For details see [JS7 - Profiles - SSL Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+SSL+Key+Management).

<img src="profile-ssl-key-management.png" alt="SSL Key Management" width="800" height="75" />

## SSL CA Certificate

JS7 ships with a default SSL CA Certificate. Users should consider the validity period of the Certificate. Newer Certificates ship with JS7 versions approx. six months before certificate expiration. Instead of updating JS7, users can upload a newer Certificate.

Users can create their own SSL CA Certificate:

- from a Private Certificate Authority (CA) or Public CA. Use of a Private CA is explained from [JS7 - How to create X.509 SSL TLS Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+SSL+TLS+Certificates).
- from the built-in SSL CA that ships with JOC Cockpit.

## Operations on SSL CA Certificate

The following operations are offered:

- **Show** is available when clicking the icon right to the validity period. This will display the Private Key and SSL CA Certificate.
- **Update** invokes a pop-up window that allows to paste an updated Private Key and SSL CA Certificate.
- **Import** invokes a pop-up window that offers to upload the Private Key and SSL CA Certificate.
- **Generate** invokes a pop-up window to generate the Private Key and self-issued SSL CA Certificate.

## References

### Context Help

- [Profile](/profile)
- [Profile - SSL Key Management](/profile-ssl-key-management)

### Product Knowledge Base

- [JS7 - Certificate Authority](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority)
  - [JS7 - Certificate Authority - Manage Certificates with JOC Cockpit](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority+-+Manage+Certificates+with+JOC+Cockpit)
  - [JS7 - Certificate Authority - Rollout Certificates for HTTPS Connections](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Authority+-+Rollout+Certificates+for+HTTPS+Connections)
- [JS7 - How to create X.509 SSL TLS Certificates](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+SSL+TLS+Certificates)
- [JS7 - Profiles - SSL Key Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+SSL+Key+Management)
