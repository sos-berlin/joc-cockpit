## Argument: credential_store_entry_path
<article id="credential_store_entry_path">

Specifies a default path to be used when accessing entries in a KeePass credential store.

The syntax `cs://path/entry` must be used. If the argument is used, then subsequent references to a credential store do not have to specify the full path to an entry, but the property only that is retrieved from the credential store, for example `cs://@password` with the full path being `cs://path/entry@password`.
</article>