# Manage Encryption Keys

The [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) offers a secure way of handling secrets used in Jobs. Users can encrypt and decrypt sensitive data such as passwords by use of asymmetric keys.

Encryption and Decryption make use of asymmetric X.509 Private Keys and Certificates. This includes the following roles:

- Sender: has access to the receiver's Certificate or Public Key and encrypts a secret based on the receiver's Public Key that is directly available or that can be calculated from a Certificate.
- Receiver: has access to the Private Key that allows decryption of the encrypted secret.

For creation of Encryption Keys see [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys).

For management of Encryption Keys see [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys).

The process of encryption works like this:

<img src="encryption-process.png" alt="Encryption Process" width="750" height="240" />

The process of decryption works like this:

<img src="decryption-process.png" alt="Decryption Process" width="880" height="210" />

The *Manage Encryption Keys* page is used for managing Certificates and specifying properties of the Certificate.

## List of Certificates

Existing Encryption Certificates are displayed from a list:

- **Action Menu** offers to update and to delete the Certificate entry.
- **Certificate Alias** is the unique name that users assign a Certificate.
- **Display Icon** allows to click the icon to display the related Certificate.
- **Path to Private Key file** specifies the location of the Private Key with related Agents.

## Operations on Certificates

From the top of the screen the following buttons are available:

- **Add Certificate** offers adding a Certificate from copying/pasting. Find details from [Manage Encryption Certificate](/encryption-manage-certificate).
- **Import Certificate** offers uploading a Certificate file.

From the *List of Certificates* the following operations are offered with the related 3-dots action menu:

- **Update Certificate** allows modifying the Certificate entry. Find details from [Manage Encryption Certificate](/encryption-manage-certificate).
- **Delete Certificate** will remove the Certificate entry.

## References

### Context Help

- [Manage Encryption Certificate](/encryption-manage-certificate)

### Product Knowledge Base

- [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  - [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  - [JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  - [JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  - [JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
- [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)
