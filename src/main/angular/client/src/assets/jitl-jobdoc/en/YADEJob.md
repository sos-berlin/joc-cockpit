# Job: YADEJob
<summary>
Transfers files by FTP, FTPS, SFTP, WebDAV, HTTPS, SMB, Azure including Jump Host transfer.
</summary>

# Purpose
<detail>

YADE is the Managed File Transfer utility that ships from a Command Line Client and from a JITL template job used with JS7 Agents.

File Transfer operations include

- `copy` files from source to target
- `move` files from source to target
- `getlist` of files in a directory
- `remove` file from source
</detail>

# Arguments

## Argument: settings
<article id="settings">

Specifies the path to the XML configuration file that holds the transfer configuration and profiles to be executed.
</article>

## Argument: profile
<article id="profile">

Specifies the identifier of the file transfer profile that should be executed.
</article>

## Argument: source_dir
<article id="source_dir">

Overwrites the `.../SourceFileOptions/Selection/.../Directory` element of the *profile* in use.
</article>

## Argument: source_excluded_directories
<article id="source_excluded_directories">

Overwrites the `.../SourceFileOptions/Selection/.../ExcludedDirectories` element of the *profile* in use.
</article>

## Argument: source_file_path
<article id="source_file_path">

Overwrites the `.../SourceFileOptions/Selection/FilePathSelection/FilePath|FileSpec|FileList` element of the *profile* in use.
</article>

## Argument: source_file_spec
<article id="source_file_spec">

Overwrites the `.../SourceFileOptions/Selection/FileSpecSelection/FileSpec|FilePath|FileList` element of the *profile* in use.
</article>

## Argument: source_file_list
<article id="source_file_list">

Overwrites the `.../SourceFileOptions/Selection/FileListSelection/FileList|FilePath|FileSpec` element of the *profile* in use.
</article>

## Argument: source_recursive
<article id="source_recursive">

Overwrites the `.../SourceFileOptions/Selection/.../Recursive` element of the *profile* in use.
</article>

## Argument: target_dir
<article id="target_dir">

Overwrites the `.../(Copy|Move)Target/Directory</em>` element of the *profile* in use.
</article>

## Argument: settings_replacer_case_sensitive
<article id="settings_replacer_case_sensitive">

Specifies how to handle placeholder variable names that can be specified for replacement in the configuration file.

Example: `<Directory>${PLACEHOLDER_VARIABLE}</Directory>`

- `true`: is case-insensitive, for example, *PLACEHOLDER_VARIABLE* and *placeholder_variable* etc. are resolved regardless of case.
- `false`: is case-sensitive, for example, only case-sensitive matches *PLACEHOLDER_VARIABLE* will be resolved.

The argument is a processing instruction that acts on the configuration.
</article>

## Argument: settings_replacer_keep_unresolved
<article id="settings_replacer_keep_unresolved">

Specifies how to handle placeholder variables that can be specified in the configuration file for replacement if the placeholder cannot be replaced.

Example: `<Directory>${PLACEHOLDER_VARIABLE}</Directory>`

- `true`: If a placeholder variable cannot be replaced, then the original value is returned: `${PLACEHOLDER_VARIABLE}`
- `false`: If a placeholder variable cannot be replaced, then an empty value is returned.

The argument is a processing instruction that acts on the configuration.
</article>

## Argument: parallelism
<article id="parallelism">

Execute transfer operations in parallel.

Affects all operations that support parallel execution, including:

- `Copy` and `Move` for parallel file transfer
- `Remove` for parallel deletion from source

Note:
The argument is ignored or is automatically set to the default value of 1 if parallel execution is not supported by the source or target data provider.

The argument is a processing instruction that acts on operation of transfers.
</article>

## Argument: source_sim_conn_faults
<article id="source_sim_conn_faults">

Simulates failures for connectivity to a source of transfer by fault injection.

A connectivity fault occurs after the specified interval in seconds that is specified by the argument.
The argument accepts integer values and float values incl. decimal separator: dot or comma:

- `1`: injects a single connectivity fault after 1s.
- `0.5;2.5;3`: injects connectivity faults 3 times (after 0.5s, then 2.5s, then 3s).

The argument is a processing instruction that acts on operation of transfers.
</article>

## Argument: target_sim_conn_faults
<article id="target_sim_conn_faults">

Simulates failures for connectivity to a target of transfer by fault injection.

Makes use of the same format as *source_sim_conn_faults* and is applied to the target data provider.

The argument is a processing instruction that acts on operation of transfers.
</article>

## Argument: sim_conn_faults
<article id="sim_conn_faults">

Simulates failures for connectivity to a source AND target of transfer by fault injection.

Shorthand for Source AND Target connectivity faults, e.g.:

- `0.2;2`: injects faults for both source and target data providers at the same intervals.

The argument is a processing instruction that acts on operation of transfers.
</article>

# Return Variables

## Return Variable: yade_return_values
<article id="yade_return_values">

Returns the serialized transfer result for the JOC Cockpit's File Transfer History.
</article>
