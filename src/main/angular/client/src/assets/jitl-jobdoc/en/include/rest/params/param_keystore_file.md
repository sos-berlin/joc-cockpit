## Argument: keystore_file
<article id="keystore_file">

Specifies the path to a PKCS12 keystore file holding the Private Key and Client Authentication Certificate used for access to a Web Service that requires mutual HTTP authentication:

- Absolute path to the JS7 Agent's `<agent-data>/config/private` sub-directory.<br/>Example: `/var/sos-berlin.com/js7/agent/config/private/https-keystore.p12`
- Relative path to the JS7 Agent's `<agent-data>/config/private` sub-directory.<br/>Example: `./config/private/https-keystore.p12`<br/>The relative path starts from the Agent's working directory which is `<agent-data>`.
</article>