## Argument: encipherment_private_key_path
<article id="encipherment_private_key_path">

Specifies the path to the Private Key file used for decryption of encrypted *username* and *password* arguments. The file must be accessible to the Agent executing the job.

- Absolute path to the JS7 Agent's `<agent-data>/config/private` sub-directory.<br/>Example: `/var/sos-berlin.com/js7/agent/config/private/encryption.key`
- Relative path to the JS7 Agent's `<agent-data>/config/private` sub-directory.<br/>Example: `./config/private/encryption.key`<br/>The relative path starts from the Agent's working directory which is `<agent-data>`.

For details see [JS7 - Encryption and Decryption](https://kb.sos-berlin.com/display/JS7/JS7+-+Encryption+and+Decryption).
</article>