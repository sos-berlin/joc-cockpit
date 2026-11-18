## Argument: truststore_file
<article id="truststore_file">

Specifies the truststore file in PKCS12 format that holds the CA certificates used to verify the identity of remote HTTPS servers:

- Absolute path to the JS7 Agent's `<agent-data>/config/private` sub-directory.<br/>Example: `/var/sos-berlin.com/js7/agent/config/private/https-truststore.p12`
- Relative path to the JS7 Agent's `<agent-data>/config/private` sub-directory.<br/>Example: `./config/private/https-truststore.p12`<br/>The relative path starts from the Agent's working directory which is `<agent-data>`.
</article>