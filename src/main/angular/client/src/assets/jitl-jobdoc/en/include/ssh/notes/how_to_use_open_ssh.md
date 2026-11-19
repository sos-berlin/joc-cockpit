**How to use OpenSSH with JobScheduler**

SSH related jobs are using the [sshj](https://github.com/hierynomus/sshj) client implementation.

**Option 1: User and Password Authentication**

- This is a popular method to authenticate. The user account and password is send to the SSH server.
- It is an option to use encrypted passwords that are decrypted before being sent to the SSH server.

Note: password authentication must be enabled in the SSH configuration, for example, from the /etc/ssh/sshd_config file:

```
PasswordAuthentication yes
```

**Option 2: Private/Public Key Authentication**

The client holds the Private Key while the Public Key is stored with the SSH server.
  
The Private Key can be protected by a passphrase.

Note that the publickey authentication must be enabled in the SSH
configuration file /etc/ssh/sshd_config:

```
PubkeyAuthentication yes
```

The Private Key must be in OpenSSH Format.
