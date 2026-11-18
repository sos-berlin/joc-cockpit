# Job: SetJobResourceJob
<summary>
Sets a Job Resource in the inventory.
</summary>

# Purpose
<detail>

The job is used to populate the JS7 inventory from Job Resources

- adding or updating a variable in a Job Resource,
- deploying a Job Resource.

The job can be used, for example, to set a variable holding a business date:

- the variable in the Job Resource can be updated with the current date and time on a daily basis.
- the updated Job Resource is automatically deployed and becomes available to related Agents.
- any workflow that is assigned the Job Resource has access to the updated variable.

The job connects to JOC Cockpit using user/password authentication and/or certificate based authentication.
The job makes use of authentication settings as explained with [JS7 - JITL Common Authentication](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Common+Authentication)
</detail>

# Arguments

## Argument: job_resource
<article id="job_resource">

The path to the Job Resource that should be created or updated in the inventory.

- for use with an existing Job Resource the path or name can be specified.
- for use with a new Job Resource the path must be specified.

Example: `/resources/my_vars`
</article>

## Argument: key
<article id="key">

The name of the variable in the Job Resource (case-sensitive).

Example: `var1`
</article>

## Argument: value
<article id="value">

The value of the Job Resource variable can be assigned from strings, numbers etc.

The following syntax is supported for date values: `[java-date-pattern]`:

- for example `[dd/MM/yyyy]`, `[yyyy-MM-dd]`, `[yyyy-MM-dd hh:mm:ss]`, `[yyyy-MM-dd hh:mm:ssZ]`
- The Java date pattern will by replaced by the job with current date and time values.

One of the *value* and *file* arguments must be used.
</article>

## Argument: file
<article id="file">

Specifies the path to a file that holds data to be assigned the *key* variable in the Job Resource. The content of the file is stored together with the `to_file()` function.

The argument is used alternatively to the *value* argument.

In case that the *encipherment_certificate* argument is used to encrypt the file's data, the variable *key_\<name-of-key\>* is created with *\<name-of-key\>* being the value of the *key* argument. The *key_\<name-of-key\>* variable holds the base64-encoded encryption result separated by spaces:

- encrypted symmetric key
- initialization vector
- path to encrypted file which is a temporary file created during the encryption.	

The encryption result is used for later decryption:

- The encrypted symmetric key is decrypted with the Agent's Private Key.
- The encrypted file is decrypted using the decrypted symmetric key and the initialization vector.
- The path to the file can optionally be used in later processing.

One of the *value* and *file* arguments must be used.
</article>

## Argument: encipherment_certificate
<article id="encipherment_certificate">

Specifies that the value of the Job Resource variable should be encrypted.

The argument specifies the CA signed or self-signed X.509 Certificate used for encryption of the Job Resource variable indicated by the *key* argument. Alternatively, a Public Key can be specified. The argument takes the base64-encoded Certificate or Public Key.

The argument can be provided from a Job Resource that is managed with the JOC Cockpit's Management of Encryption Keys.

If the variable is set, then the *value* or *file* will be encrypted. The encryption result will contain:

- encrypted symmetric key
- initialization vector
- encrypted value	

Later decryption from a job works like this:

- The encrypted symmetric key is decrypted with the Agent's Private Key.
- The encrypted *value* or *file* will be decrypted using the decrypted symmetric key and the initialization vector.
</article>

## Argument: time_zone
<article id="time_zone">

Specifies the time zone that will be applied to date calculation if a Java date pattern such as `[yyyy-MM-dd]` is specified with the *value* argument.

The time zone is specified from a string, for example `GMT`, `Europe/London`. Valid time zone strings as explained with [List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

If the argument is omitted, then the time zone will be used the Agent is operated for.
</article>

## Argument: environment_variable
<article id="environment_variable">

Job Resources hold workflow variables and matching environment variables for use with JVM jobs and shell jobs.

The argument specifies the name of the environment variable that should be created or updated in the Job Resource and that will be populated from a reference to the variable indicated by the *key* argument.
</article>

## Argument: controller_id
<article id="controller_id">

Specifies the Controller ID that identifies the Controller to which the updated Job Resource will be deployed.

If the argument is omitted, then the default Controller will be used that is available from the JOC Cockpit's user preferences.
</article>

# Return Variables

The job does not provide return variables.