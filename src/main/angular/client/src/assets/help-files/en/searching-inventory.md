# Inventory Search Help

## Getting Started

The Inventory Search is used to limit search results by object dependencies. For example,

- to return Workflows that are triggered by File Order Sources matching the search string,
- to return Workflows that include Resource Locks matching the search string.

## Advanced Search

The feature is available when clicking the link: > Advanced

### Basic Search Tips

Criteria added to the Advanced Search have to be matched before an object will appear in the search results.

- Searching for **Agent Name** will only return results that include jobs executed with the specified Agent.<br/><br/>
- Searching for **Count Jobs** limits search results to workflows that use the minimum number of jobs specified with the **From** term. If used with the **To** term, then workflows are returned that include a number of jobs in a range between *From* and *To*. If only the *To* term is used, then  workflows will be returned that do not include a number of jobs exceeding the *To* term.<br/><br/>
- Searching for **Job Name** returns workflows that include jobs matching the given name<br/><br/>
-- When using the *Exact Match* for **Job Name** checkbox, then the search term entered has to fully match a job name including case-sensitive spelling.
-- In addition, searching for job names allows bulk operations on jobs.

### Search Operators

Search terms can occur anywhere in an object name or title.

The search meta character **\*** can be used to specify that a dependency is required, e.g. from a Resource Lock, whatever name the Resource Lock might use. For example:

- search with the meta character \* for **File Order Sources** will return any workflows making use of a File Order Source.
- search with the meta character \* for **Resource Locks** will return any workflows using a Resource Lock.

In addition, search meta characters can be used as wildcards in search terms:

- the **\*** meta character suggests zero or more characters.
- the **?** meta character suggests a single character.
