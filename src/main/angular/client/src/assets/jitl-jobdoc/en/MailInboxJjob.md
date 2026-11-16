# Job: MailInboxJob
<summary id="summary">
The job reads a mail inbox for incoming mail.
</summary>

# Purpose
<detail id="detail">

The job reads a mail inbox and provides actions for incoming mail. The actions to be executed for incoming mail are specified with the *mail_action* argument.

Any general *mail.\**, POP3 *mail.pop3.\** and IMAP *mail.imap.\** properties for Java Mail can be used for connections to mail servers. For details see

- [general mail properties](https://javaee.github.io/javamail/docs/api/javax/mail/package-summary.html)
- [POP3 mail properties](https://javaee.github.io/javamail/docs/api/com/sun/mail/pop3/package-summary.html)
- [IMAP mail properties](https://javaee.github.io/javamail/docs/api/com/sun/mail/imap/package-summary.html)
</detail>

# Arguments

[](include:./includes/com.sos.jitl.jobs.mail/params/param_store_protocol.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_imap_host.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_imap_port.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_imap_user.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_imap_password.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_imap_ssl.md)

[](include:./includes/com.sos.jitl.jobs.mail/params/param_pop3_host.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_pop3_port.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_pop3_user.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_pop3_password.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_pop3_ssl.md)

[](include:./includes/com.sos.jitl.jobs.mail/params/param_source_folders.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_max_checked_mails.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_only_unread.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_min_mail_age.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_from_filter.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_subject_filter.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_subject_pattern.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_body_pattern.md)

[](include:./includes/com.sos.jitl.jobs.mail/params/param_action.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_file_directory.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_attachments_directory.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_body_as_attachment.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_attachment_file_name_pattern.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_post_action.md)
[](include:./includes/com.sos.jitl.jobs.mail/params/param_mail_target_folder.md)

[](include:./includes/common/params/params_credential_store.md)
