# Job: RESTClientJob
<summary>
Executes REST requests to 3rd-party web services.
</summary>

# Purpose
<detail>

The job executes REST requests to 3rd-party web services using

- Authentication
  - Basic Authentication (username and password base64-encoded)
  - OIDC Client Credential Authentication
- Protocols HTTP or HTTPS

The username and password used for Basic Authentication can be provided

- directly with the request using the base64-encoded "username:password" assigned the `Authorization: Basic dXNlcjpfzZWNyZXQ=` header.
- in a specific format required by the target web service API.

- For processing of JSON responses see [JS7 - JITL - jq Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+jq+Interface)
</detail>

# Arguments

## Argument: request
<article id="request">

The argument specifies the request in JSON format that holds the following key elements:
- *endpoint*: the endpoint URL of the API, for example, `https://example.com/api/users`.
- *method*: one of `GET`, `POST`, `PUT`, `DELETE`.
- *headers*: Optional headers, such as `Authorization`, sent with the request.
- *body*: the request body/payload for the API indictaed by the *endpoint*.

**Example**

```
{
  "endpoint": "https://example.com/api/users",
  "method": "POST",
  "headers": [
    { "key": "Authorization", "value": "Basic dXNlcjpfzZWNyZXQ=" }
  ],
  "body": {
    "id": "2",
    "details": { "name": "John", "age": "50", "email": "example@gmail.com" }
  }
}
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
