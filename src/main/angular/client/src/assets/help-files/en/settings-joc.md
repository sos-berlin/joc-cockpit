# Settings - JOC Cockpit

The following settings are applied to JOC Cockpit. Changes become effective immediately.

The *Settings* page is accessible from the ![wheel icon](assets/images/wheel.png) icon in the menu bar.

## Audit Log Settings

### Setting: *force\_comments\_for\_audit\_log*, Default: *false*

Specifies that a reason has to be added for the [Audit Log](/audit-log) for any changes applied to objects such as adding an Order, cancelling an Order etc.

This applies to operations from the GUI and to operations from the [REST Web Service API](/rest-api)
Specifying the value *true* for this setting forces any API requests that modify objects to provide  arguments for the Audit Log.

Note that the [Profile - Preferences](/profile-preferences) include a related setting to Enable Reasons for Audit Log that has the same effect. However, its use is voluntary and is restricted to the profile's account. The force\_comments\_for\_audit\_log setting enforces this behavior for any user accounts regardless of the profile settings of individual user accounts.

### Setting: *comments\_for\_audit\_log*

Specifies a list of possible comments for selection by a user when performing a GUI operation that modifies an object. In addition to using list entries, users are free to use individual comments when performing such operations.

The list is populated with some well-known reasons for object modifications. Users are free to modify list entries and add their own entries for possible comments.

### Setting: *default\_profile\_account*, Default: *root*

When user accounts are added to the JOC Cockpit using the [Identity Services](/identity-services) then [Profile - Preferences](/profile-preferences) will be created with individual settings for each user account.

- This setting specifies the account that is used as a template for the profile when user accounts are created. 
- By default the *root* account is used which boils down to the fact that a new account's profile is populated from settings such as language, theme etc. of the default profile account.

## Login Settings

### Setting: *enable\_remember\_me*, Default: *true*

This setting enables the *Remember me* checkbox that is available from the login window and which stores user's credentials such as account and password in a site cookie. As a result the user account and password are populated with the next login.

- Some users might consider it a security risk to store credentials in browser data.
- This setting can be disabled in order not to offer storing user credentials.

## Inventory Settings

### Setting: *copy\_paste\_suffix*, *copy\_paste\_prefix*, Default: *copy*

Specifies the prefix/suffix to be used for object names when performing copy & paste operations in the JOC Cockpit GUI.

- In JS7 inventory object names are unique for each object type: for example, Workflows use unique names, however, a Job Resource can use the same name as a Workflow.
- Therefore a new object name has to be created when performing copy & paste operations. This is achieved by adding a prefix or suffix which can be chosen by users.

### Setting: *restore\_suffix*, *restore\_prefix*, Default: *restored*

When inventory objects are removed, they will be added to the inventory trash.

- When removed objects are restored from the inventory trash, then the original object name might be used by some newer object. 
- This setting allows the user to specify the prefix and suffix values to be used when restoring objects from the trash.

### Setting: *import\_suffix*, *import\_prefix*, Default: *imported*

The JS7 inventory export and import operations allow objects to be imported from an archive file.

- When objects are imported, then their names might conflict with existing object names.
- This setting allows the user to specify the prefix and suffix values to be used when importing objects.

## View Settings

### Setting: *show\_view\_\**

These settings can be used to disable individual views that are available from the JOC Cockpit GUI by main menu items such as Daily Plan, Monitor, Workflows etc.

- This setting works independently of default roles and permissions.
- As a result a user account might have permissions to view data from the Monitor view, although the view is not offered from the GUI. At the same time, data from the Monitor view will be available for this account when using the [REST Web Service API](/rest-api).

### Setting: *display\_folders\_in\_views*, Default: *true*

Specifies that in views such as *Workflows*, *Daily Plan*, *Resources - Calendars*, *Resources - Resource Locks*, *Resources - Notice Boards* scheduling object names and paths are displayed. If the *false* value is used for this setting, then the path is omitted from display of objects. In JS7 any objects names are unique.

## Controller Settings

### Setting: *controller\_connection\_joc\_password*, *controller\_connection\_history\_password*

JS7 offers consistent configuration without use of passwords. This includes the connection from JOC Cockpit to Controllers which can be secured by mutual HTTPS Server Authentication and Client Authentication. If users do not wish to configure mutual authentication for Controller connections, then a password has to be used to identify the JOC Cockpit with the Controller.

This applies to two connections established from JOC Cockpit to Controllers that are reflected by separate settings for the *controller\_connection\_joc\_password* and the *controller\_connection\_history\_password*:

- The JOC Cockpit GUI makes use of a connection to receive events, for example about Order state transitions.
- The History Service is connected to a Controller to receive history information such as the execution status of jobs and any log output of jobs.

The password is specified as plain text in the Settings page and as a hashed value in the Controller's private.conf file.

The **Show Hash Value** link is available on the Settings page and allows to display the hashed value of the password.

If a password is modified in the Settings page, then it has to be modified in the Controller's private.conf file too to make passwords match.

It is recommended that the password in the active Controller instance's private.conf file is modified first and then in the Settings page. Then the Controller instance should be restarted. The JOC Cockpit will then reconnect to the active Controller instance. If a Controller Cluster is used, then the same change has to be applied to the passive Controller instance's private.conf file.

## Unicode Settings

### Setting: *encoding*

The encoding is applied if JOC Cockpit is operated for Windows environments. Windows does not support Unicode but makes use of code pages. In case that the Windows code page cannot be detected automatically, users can specify the code page. A frequently used value is *UTF-8*.

## License Settings

### Setting: *disable\_warning\_on\_license\_expiration*, Default: *false*

JS7 offers to display warnings in case of upcoming license expiration. The feature to display license expiration warnings can be disabled by assigning this setting the *true* value.

## Log Settings

### Setting: *log\_ext\_directory*

Specifies a directory that is accessible to JOC Cockpit and to which copies of Order log files and task log files will be written.

### Setting: *log\_ext\_order\_history*

Specifies that a JSON file holding information about the Order History is created in case of successful Orders, failed Orders or both. Possible values include:

- **all**: create history file for all successful and failed Orders.
- **failed**: create history file for failed Orders.
- **successful**: create history file for successful Orders.

### Setting: *log\_ext\_order*

Specifies that an Order log file is created in case of successful Orders, failed Orders or both. Possible values include:

- **all**: create Order log file for all successful and failed Orders.
- **failed**: create Order log file for failed Orders.
- **successful**: create Order log file for successful Orders.

### Setting: *log\_ext\_task*

Specifies that a task log file is created in case of successful task, failed tasks or both. Possible values include:

- **all**: create task log file for all successful and failed tasks.
- **failed**: create task log file for failed tasks.
- **successful**: create task log file for successful tasks.

### Setting: *log\_maximum\_display\_size*, Default: *10* MB

JOC Cockpit offers log output for display with the Log View window if the size of uncompressed log output does not exceed this value. Otherwise the log is offered for download only. The size is specified in MB.

### Setting: *log\_applicable\_size*, Default: *500* MB

If the value for the size of a job's log output is exceeded, then the History Service will truncate the log output and will use the first and last 100 KB for the task log. The original log file will be removed. The size is specified in MB.

### Setting: *log\_maximum\_size*, Default: *1000* MB

If this value for the size of a job's log output is exceeded, then the History Service will truncate the log output and will use the first 100 KB for the task log. The original log file will be removed. The size is specified in MB.

## Link Settings

### Setting: *joc\_reverse\_proxy\_url*

If JOC Cockpit is not accessible from its original URL but from a reverse proxy service only, then this value specifies the URL to be used, for example with e-mail notifications,

## Job Settings

### Setting: *allow\_empty\_arguments*, Default: *false*

By default arguments that are specified for jobs have to hold values as otherwise the Workflow is considered invalid. This setting overrides the default behavior and allows empty values to be specified.

## Order Settings

### Setting: *allow\_undeclared\_variables*, Default: *false*

By default any Order variables have to be declared with the Workflow. This setting changes the default behavior and allows Orders to specify arbitrary variables. Users should be aware that jobs and related instructions will fail if they reference variables that are not specified by incoming orders.

## Tag Settings

### Setting: *num\_of\_tags\_displayed\_as\_order\_id*, Default: *0*

Specifies the number of Tags displayed with each Order. A value 0 will suppress display of Tags. Consider that display of a larger number of Tags per Order can cause performance penalties.

### Setting: *num\_of\_workflow\_tags\_displayed*, Default: *0*

Specifies the number of Tags displayed with each Workflow. A value 0 will suppress display of Tags.

## Approval Settings

### Setting: *approval\_requestor\_role*

Specifies the name of the Requestor role that is assigned accounts which are subject to the Approval Process.

## Report Settings

### Setting: *report\_java\_options*, Default: *-Xmx54M*

Specifies the Java options used when creating Reports. The default value considers the minimum Java heap space required to create Reports. Users who find a larger number of job executions per day might have to increase this value to match memory needs.

## References

### Context Help

- [Audit Log](/audit-log)
- [Identity Services](/identity-services)
- [Profile - Preferences](/profile-preferences)
- [REST Web Service API](/rest-api)
- [Settings](/settings)

### Product Knowledge Base

- [JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
- [JS7 - Audit Trail](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Trail)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)
