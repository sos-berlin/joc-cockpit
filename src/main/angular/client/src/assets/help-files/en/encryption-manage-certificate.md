# Manage Encryption Certificate

The [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption) offers a secure way of handling secrets used in Jobs. Users can encrypt and decrypt sensitive data such as passwords by use of asymmetric keys.

For details see [Manage Encryption Keys](/encryption-manage-keys).

The *Manage Encryption Certificate* page is used for specifying properties of the Certificate.

## Certificate

The following properties are specified for a Certificate:

- **Certificate Alias** is the unique name that users assign a Certificate. Users are free to choose the name. The Certificate and properties will be stored with a Job Resource using the indicated name.
- **Certificate** allows copying/pasting a Certificate in PEM format. A Certificate can look like this:

<pre>
-----BEGIN CERTIFICATE-----
MIIB9TCCAZqgAwIBAgIJAIFT2KH9txb9MAoGCCqGSM49BAMCMFgxCzAJBgNVBAYT
AkRFMQ8wDQYDVQQIDAZCZXJsaW4xDzANBgNVBAcMBkJlcmxpbjEMMAoGA1UECgwD
U09TMQswCQYDVQQLDAJJVDEMMAoGA1UEAwwDSlM3MB4XDTI0MDYyNzA5MzU0MloX
DTI5MDYyNjA5MzU0MlowWDELMAkGA1UEBhMCREUxDzANBgNVBAgMBkJlcmxpbjEP
MA0GA1UEBwwGQmVybGluMQwwCgYDVQQKDANTT1MxCzAJBgNVBAsMAklUMQwwCgYD
VQQDDANKUzcwVjAQBgcqhkjOPQIBBgUrgQQACgNCAATBF6yXinah6K/x2TikPNaT
447gK2SxCH8vgO5NygZzUonzhaGOK5n1jktvhhmxmrn5V4VSHMC0NzU6O87nUKpA
o1AwTjAdBgNVHQ4EFgQUcovwh3OMrSXjP02VHG5cj03xHxswHwYDVR0jBBgwFoAU
covwh3OMrSXjP02VHG5cj03xHxswDAYDVR0TBAUwAwEB/zAKBggqhkjOPQQDAgNJ
ADBGAiEAwjGLIhLfV0q/cOYVAnXSZ+jWp8Og/lG5YdvtLcj9CD0CIQCK8O4wURQj
SbNCv0bJswLadTFEcz8ZoYP7alXJzj9FQQ== 
-----END CERTIFICATE-----
</pre>

- **Path to Private Key file** specifies the location of the Private Key with related Agents.
- **Job Resource Folder** specifies the inventory folder in which the Job Resource holding the Certificate will be stored. A folder hierarchy can be specified using forward slashes as in /a/b/c. Non-existing folders will be created.

## Operations on Certificate

The following operations are available from links:

- **Use of Certificate by Agents** displays the *Agent Name* and URL of Agents assigned the Certificate. 
- **Assign Certificate to Agents** offers selecting Standalone Agents and Cluster Agents that are assigned the Certificate. Users have to take care that the related Agent holds the Private Key file in the location specified with the *Path to Private Key file* property. Users can select Agents that know the Private Key.
- **Encryption Test** allows to perform a test encryption:
  - Clicking the link opens the *Plain Text* input field to which a string such as *secret* can be added.
  - Right to the input field the encryption icon is offered. Clicking the icon displays the *Encryption Result* label with the related result.

## References

### Context Help

- [Manage Encryption Keys](/encryption-manage-keys)

### Product Knowledge Base

- [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption)
  - [JS7 - Encryption - Management of Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Management+of+Encryption+Keys)
  - [JS7 - Encryption - Integration with Workflows - Jobs - Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Workflows+-+Jobs+-+Orders)
  - [JS7 - Encryption - Integration with Shell CLI](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Shell+CLI)
  - [JS7 - Encryption - Integration with Secret Manager Products](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+-+Integration+with+Secret+Manager+Products)
- [JS7 - How to create X.509 Encryption Keys](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+create+X.509+Encryption+Keys)
