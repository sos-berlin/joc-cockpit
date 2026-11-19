## Argument: credential_store_password
<article id="credential_store_password">

Specifies the password to access a KeePass credential store.

Use of the argument is discouraged as it makes no sense to hide passwords, for example for database access, by openly specifying the password to the credential store with job arguments.

It is recommended to use the*credential_store_key_file* argument to specify a key file owned by the JS7 Agent and accesible to the Agent only to access a credential store.
</article>