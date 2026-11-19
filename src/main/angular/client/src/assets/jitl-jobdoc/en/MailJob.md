# Job: MailJob
<summary>
Sends mail.
</summary>

# Purpose
<detail>

All *mail.\** properties for Java Mail can be used, see [JavaMail](https://javaee.github.io/javamail/docs/api/javax/mail/package-summary.html).

- *mail.transport.protocol* by default is set to `smtp`.
- *mail.smtp.class* by default is set to `com.sun.mail.SMTPTransport`.
- If *mail.smtp.user* is specified, then *mail.smtp.auth* is set to `true`, otherwise to `false`.
- If *security_protocol* is specified as `ssl`, then *mail.smtp.ssl.enable* is set to `true` and *mail.transport.protocol* is set to `smtps`.
- If *security_protocol* is specified as `starttls`, then *mail.smtp.starttls.enable* is set to `true` and *mail.transport.protocol* is set to `smtps`.

</detail>

# Arguments

## Argument: to
<article id="to">

Specifies the e-mail address of mail recipient(s). A number of e-mail addresses can be specified separated by comma or semicolon.
</article>

## Argument: from
<article id="from">

Specifies the e-mail address used to send mail.
</article>

## Argument: from_name
<article id="from_name">

Specifies the free-text name of the account that sends mail.
</article>

## Argument: reply_to
<article id="reply_to">

If no replies should be accepted, then typically an e-mail address such as `no-reply@example.com` is used for the respective domain.
Otherwise a valid e-mail address can be specified to receive replies.
</article>

## Argument: cc
<article id="cc">

Specifies the e-mail address of the carbon copy recipient(s). A number of e-mail addresses can be specified separated by comma or semicolon.
</article>

## Argument: bcc
<article id="bcc">

Specifies the e-mail address of the blind carbon copy recipient(s). A number of e-mail addresses can be specified separated by comma or semicolon.
</article>

## Argument: subject
<article id="subject">

Specifies the mail subject, it is recommended using ASCII 7bit characters.
</article>

## Argument: body
<article id="body">

Specifies the mail body as plain text or HTML depending on the *content_type* setting.
</article>

## Argument: content_type
<article id="content_type">

A content type `text/plain` specifies plain text for the mail *body*, a content type `text/html` specifies use of HTML for the mail *body*.
</article>

## Argument: encoding
<article id="encoding">

Specifies the character encoding of *subject* and *body*. Possible values include ASCII `7bit`, `Quoted-Printable` or `Base64`.
</article>

## Argument: charset
<article id="charset">

Specifies the character set used for the mail *body*. By default Latin 1 `iso-8859-1` is used.
</article>

## Argument: attachment
<article id="attachment">

Specifies the path to a file to be attached the mail, multiple files are separated by semicolon.
</article>

## Argument: attachment_content_type
<article id="attachment_content_type">

Specifies the attachment's content type that typically allows binary files. Possible values include `application/octet-stream` `application/pdf` etc.
</article>

## Argument: attachment_encoding
<article id="attachment_encoding">

Specifies the encoding of attachments. Typically attached files are encoded with printable base64 characters.
Possible values include `7bit`, `Quoted-Printable` and `Base64`.
</article>

## Argument: attachment_charset
<article id="attachment_charset">

Specifies the character set of attachments.
</article>

## Argument: security_protocol
<article id="security_protocol">

Specifies the protocol in use for connections to the mail server such as `smtp`, `smtps` and `starttls`.
</article>

## Argument: mail.smtp.host
<article id="mail.smtp.host">

Specifies the hostname or IP address of the mail server.
</article>

## Argument: mail.smtp.port
<article id="mail.smtp.port">

Specifies the port used for connections to the mail server.
</article>

## Argument: mail.smtp.user
<article id="mail.smtp.user">

Specifies the user account to be used in case that the mail server requires authentication.
</article>

## Argument: mail.smtp.password
<article id="mail.smtp.password">

Specifies the password used for the user account in case that the mail server requires authentication.
</article>

[](include:include/common/params/param_credential_store_file.md)
[](include:include/common/params/param_credential_store_key_file.md)
[](include:include/common/params/param_credential_store_entry_path.md)

# Return Variables

The job does not provide return variables.
