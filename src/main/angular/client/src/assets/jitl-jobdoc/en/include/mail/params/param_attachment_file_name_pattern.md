## Argument: attachment_file_name_pattern
<article id="attachment_file_name_pattern">

Specifies a pattern for file names used when storing attachments.

The argument is considered if the *mail_action* argument is used with the `dump_attachments` value. The following patterns will be substituted:

- `${filename}`
- `${subject}`
- `${messageId}`

If the file exists, then an underscore "_" and a running number will be added.
</article>