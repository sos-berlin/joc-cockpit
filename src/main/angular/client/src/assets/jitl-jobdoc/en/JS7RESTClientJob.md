# Job: JS7RESTClientJob
<summary>
The job is used to execute REST requests with JOC Cockpit.
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

# Return Variables

## Return Variable: return_variable
<article id="return_variable">

Specifies processing of the response provided by the Web Service. JS7 ships with [jackson-jq](https://github.com/eiiches/jackson-jq) tbat allows selecting elements form a JSON response.

The argument value is in JSON format and specifies an array of JSON objects holding two keys:
                                             
- *name*: The name of the variable that will receive the value extracted from the response using the jq query carried by the *path* key.
- *path*: The jq query used to extract a value from the JSON response. 
  - the value resulting from the query is assigned a dynamic workflow variable specified from its *name*.
  - Optionally, the key may also contain file output instructions in the format:<br/>`[jq-query] || [processing-instruction] [file-path]`
<br/>If `||` is present, it can indicate that the query result should be written to a file. In this case, the processing instruction and file path must be provided. Supported processing instructions are:

- `>`: overwrites the file with the query result.
- `>>`: appends the query result to the file.

Note: There must be at least one space between the processing instruction and the file path. 
</article>