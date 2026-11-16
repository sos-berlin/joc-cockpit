# Job: FileNotExistsJob
<summary>
Checks if a file exists.
</summary>

# Purpose
<detail>

The job checks the existence of a file, of a directory or of files inside a directory.

If at least one matching file is found then the job will terminate and an error will be raised.

[](include:include/file/notes/note_file_operations.md)
[](include:include/file/notes/description_result_set.md)
</detail>

# Features

[](include:include/common/features/feature_use_of_regexp.md)
[](include:include/common/features/feature_recurse_of_subdirectories.md)
[](include:include/common/features/feature_mask_substitution.md)
[](include:include/common/features/feature_result_set_creation.md)

# Arguments

[](include:include/file/params/param_file_spec_fileop.md)
[](include:include/file/params/param_recursive.md)
[](include:include/file/params/param_source_file.md)            
[](include:include/file/params/param_max_file_age.md)
[](include:include/file/params/param_max_file_size.md)
[](include:include/file/params/param_min_file_age.md)
[](include:include/file/params/param_min_file_size.md)
[](include:include/file/params/param_skip_first_files.md)
[](include:include/file/params/param_skip_last_files.md)
[](include:include/file/params/steady_state/param_steady_state_count.md)
[](include:include/file/params/steady_state/param_steady_state_interval.md)
[](include:include/file/params/result_set/param_result_set_file.md)
[](include:include/file/params/result_set/param_expected_size_of_result_set.md)
[](include:include/file/params/result_set/param_raise_error_if_result_set_is.md)

# Return Variables

[](include:include/file/params/params/return/param_fileoperations_result_set.md)
[](include:include/file/params/params/return/param_fileoperations_result_set_size.md)
