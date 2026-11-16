## Argument: mail_action
<article id="mail_action">

Specifies actions to be performed on incoming mail.

The following actions are available:

- `none`: no action
- `dump`: stores the content of the mail to a file located in the directory specified with the *mail_file_directory* argument with the messageId of the mail being used as the file name.
- `dump_attachments`: stores the attachments of the mail to files located in the directory specified with the *mail_attachments_directory* argument.<br/>
With the *attachment_file_name_pattern* argument resulting file names can be specified.<br/>
With the *body_as_attachment* argument the mail body should can be stored to a file too.

Actions can be concatenated using a semicolon.
</article>