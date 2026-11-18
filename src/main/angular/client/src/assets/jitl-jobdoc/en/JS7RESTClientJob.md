# Job: JS7RESTClientJob
<summary>
Executes REST requests to JOC Cockpit.
</summary>

# Purpose
<detail>

The job offers access to the [JS7 REST Web Service API](https://kb.sos-berlin.com/display/JS7/JS7+-+REST+Web+Service+API).

- See [Technincal Documentation of JS7 REST Web Service API](https://www.sos-berlin.com/JOC/latest/raml-doc/JOC-API/index.html).
- The JOC Cockpit GUI supports creating requests for a number of relevant REST APIs, see [JS7 - JITL REST Editor](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+REST+Editor).
- For processing of responses of the JS7 REST Web Service see [JS7 - JITL - qj Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+jq+Interface)
</detail>

# Arguments

## Argument: request
<article id="request">

The argument specifies the request in JSON format that holds the following key elements:
- *endpoint*: the endpoint of the API.<br/>Example: If you want to execute a REST request to `http://localhost:2101/joc/api/orders/add`, then the endpoint will be `/orders/add`.
- *method*: in most cases the `POST` method is used.
- *headers*: HTTP headers are used applicable to the related *endpoint*.
- *body*: the request body/payload for the API indictaed by the *endpoint*.

**Example**

```
{
  "endpoint": "/orders/add",
  "method": "POST",
  "headers": [],
  "body": {
    "controllerId": "testsuite",
    "orders": [
      {
        "workflowPath": "/apJS7RESTClient-Workflow",
        "orderName": "",
        "forceJobAdmission": false,
        "tags": [],
        "arguments": {},
        "scheduledFor": "now"
      }
    ],
    "auditLog": {}
  }
}'
```
</article>

[](include:include/rest/params/param_return_variable.md)
[](include:include/rest/params/param_log_items.md)
[](include:include/rest/params/param_url.md)
[](include:include/rest/params/param_username.md)
[](include:include/rest/params/param_password.md)
[](include:include/rest/params/param_client_id.md)
[](include:include/rest/params/param_client_secret.md)
[](include:include/rest/params/param_encipherment_private_key_path.md)
[](include:include/rest/params/param_keystore_file.md)
[](include:include/rest/params/param_keystore_alias.md)
[](include:include/rest/params/param_keystore_password.md)
[](include:include/rest/params/param_keystore_key_password.md)
[](include:include/rest/params/param_truststore_file.md)
[](include:include/rest/params/param_truststore_password.md)

[](include:include/common/params/param_credential_store_file.md)
[](include:include/common/params/param_credential_store_key_file.md)
[](include:include/common/params/param_credential_store_entry_path.md)

# Return Variables

The job creates return variables as specified by the *return_variable* argument.
