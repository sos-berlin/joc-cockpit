## Argument: credential_store_entry_path
<article id="credential_store_entry_path">

Specifies the path to entries in the Credential Store.

The argument is used to specify a common path that is added to all entries.

**Example**
- *credential_store_entry_path*: `/sos/jobscheduler`
- use with other argument values: `cs://mydb@password`.
In the KeePass database the entry is found in `/sos/jobscheduler/mydb@password`.

Alternatively, it is possible to specify the value in the URL from the `?entry_path=` query parameter.
</article>