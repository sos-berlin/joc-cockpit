## Argument: credential_store_file
<article id="credential_store_file">
Specifies the location of the Credential Store database file.

The path to the KeepPass database file that contains the credentials for access to the database.

Alternatively, it is possible to specify the value in the URL from the `?file=` query parameter.
</article>
             
## Argument: credential_store_key_file
<article id="credential_store_key_file">
Specifies the location of the Credential Store Key File.

The path to the KeePass key file that represents the key for access to the credential store.
This requires a key file to be assigned the KeePass database file. If no KeePass key file is specified, 
then the file name is assumed from the basename of the KeePass database file and the extension .key.

Alternatively, it is possible to specify the value in the URL from the `?keyfile=` query parameter.
</article>

## Argument: credential_store_entry_path
<article id="credential_store_entry_path">
Specifies the path to entries in the Credential Store.

The argument is used to specify a common path that is added to all entries.

**Example**
- *credential_store_entry_path*: `/sos/jobscheduler`
- use with other argument values: `cs://mydb@password`.
In the KeePass database the entry is found in `/sos/jobscheduler/mydb@password`.

Alternatively, it is possible to specify the value in the URL from the `?entry_path=` query parameter.
