## Argument: return_variable
<article id="return_variable">

Specifies processing of the response provided by the Web Service and creates return variables. JS7 ships with [jackson-jq](https://github.com/eiiches/jackson-jq) tbat allows selecting elements from a JSON response.

The argument value is in JSON format and specifies an array of JSON objects holding two keys:

- *name*: The name of the return variable that will receive the value extracted from the response using the jq query indicated by the *path* key.
- *path*: The jq query used to extract a value from the JSON response.
  - the value resulting from the query is assigned a dynamic return variable specified from its *name*.
  - Optionally, the key may also contain file output instructions in the format:<br/>`[jq-query] || [processing-instruction] [file-path]`<br/>If `||` is present, it can indicate that the query result should be written to a file. In this case, the processing instruction and file path must be provided. Supported processing instructions include:

- `>`: overwrites the file with the query result.
- `>>`: appends the query result to the file.

Note: There must be at least one space between the processing instruction and the file path.

**Example**

Assuming the following response from a call to the JS7 REST API `/orders/add` endpoint:

```
{
  "deliveryDate": "2025-06-20T14:24:34.403+00:00",
  "orderIds": [
    "#2025-06-20#T42947440212",
  ]
}
```

Resulting Order IDs can be extracted using jq and can be added to the *order_ids* return variable like this:

```
[
  {
    "name": "order_ids",
    "path": ".orderIds"
  }
]
```
</article>