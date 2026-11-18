# Job: EncryptJob
<summary>
Encrypts a secret or file.
</summary>

# Purpose
<detail>

User jobs can make use of variables that hold secrets. Such variables should not be passed to jobs without encryption as their plain text value is exposed to logging.

The preferred solution is

- to create a temporary asymmetric key
- to encrypt a variable or a file using the assymetric key
- to encrypt the assymetric key using an Agent's encryption certificate or public key.

The JS7 encryption feature includes that

- encryption and decryption can be performed directly by JITL jobs.
- encryption and decryption can be performed outside of JS7 products.<br/>This includes that JS7 products have no knowledge of secret and private keys involved that potentially could be compromised by logging, database persistence etc.
</detail>

# Arguments

## Argument: in
<article id="in">

Specifies the input value that should be encrypted, typically a secret.

One of the arguments *in* or *infile* must be specified.
</article>

## Argument: infile
<article id="infile">

Specifies the path to a file that should be encrypted.

One of the arguments *in* or *infile* must be specified.
The *infile* argument requires use of the *outfile* argument.
</article>

## Argument: outfile
<article id="outfile">

Specifies the path to the output file that will be created holding the encrypted content of the input file.
The argument is used if *infile* is specified.
</article>

## Argument: encipherment_certificate
<article id="encipherment_certificate">

Specifies the path to the CA signed or self-signed X.509 certificate. Alternatively, the path to the public key file can be specified.
The argument is frequently provided via a job resource that is managed with the Encryption Key Management.
</article>

# Return Variables

## Return Variable: js7EncryptedValue
<article id="js7EncryptedValue">

When the *in* argument is specified, then the return variable holds the following base64-encode values separated by space:

- encrypted symmetric key: can be decrypted by use of the private key
- initialization vector: is used for decryption of the symmetric key
- encrypted value: can be decrypted using the symmetric key

When the *infile* argument is specified, then the return variable holds the following base64-encode values separated by space:

- encrypted symmetric key: can be decrypted by use of the private key
- initialization vector: is used for decryption of the symmetric key
- path to encrypted file: the file can be decrypted using the symmetric key
</article>