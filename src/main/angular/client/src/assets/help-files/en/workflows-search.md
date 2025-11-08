# Workflow Search

Workflow Search is used to look up Workflows based on criteria such as

- **User Input** matching a given name or title, optionally limited by folders,
- Workflow Availability
  - **Synchronized** Workflows are deployed to a Controller.
  - **Suspended** Workflows are frozen, i.e. they accept Orders but will not allow Orders to start.
  - **Outstanding** Workflows await an Agent's confirmation that the Workflows have been suspended.
- Job Availability
  - **Skipped** Jobs will not be considered for execution as Orders pass by.
  - **Stopped** Jobs will suspend Orders arriving.

## Meta Characters

- **?** meta character replaces any single character.
- **\*** meta character replaces zero or more characters.

Search is performed case-insensitive and partially qualified, for example

- **rest** will find Workflows with the name "pdfNon**Rest**artable" and "**REST**-RunningTaskLog"
- **re?t** will find Workflows with the name "ActivePassiveDi**rect**or" and "JITL-JS7**REST**ClientJob"
- **re\*t** will find Workflows with the name "pdSQLExecuto**rExt**ractJSON" and "pdu**Reset**Subagent"

## Advanced Search

The feature is available when clicking the link:<br/>**> Advanced**

### Attribute Search

Advanced Search allows searching by object attributes:

- **Agent Name** will return Workflows that include Jobs executed with the specified Agent.
- **Count Jobs** will return Workflows that use the minimum number of Jobs specified with the **From** term. If used with the **To** term, then Workflows will be returned that include a number of Jobs in the range between *From* and *To*. If the *To* term is used only, then Workflows will be returned that do not include a number of Jobs exceeding the *To* term.
- **Job Name** returns Workflows that include Jobs matching the given name. When using the *Exact Match* checkbox for **Job Name**, then the search term entered has to fully match a job name including case-sensitive spelling.

### Dependency Search

The search meta character **\*** is used to specify that dependencies are looked up, for example to a Resource Lock whichever name it might use:

- **\*** meta character for **Resource Locks** will return Workflows using a Resource Lock,
- **\*** meta character for **File Order Sources** will return Workflows referenced by a File Order Source.
