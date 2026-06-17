# Configuration - Inventory - Operations - Git - Clone Repository

Inventory objects can be rolled out using Git Repositories, see [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration).

This includes Git operations to commit, to push and to pull objects.

Git Repositories are mapped to top-level inventory folders. 

- The initial operation includes to clone a remote repository to a local repository that is managed by JOC Cockpit.
- The JOC Cockpit's repositories are located in the *\<jetty-base\>/resources/joc/repositories* file system directory. 
  - The *local* sub-directory indicates a repository used for objects that are local to a JOC Cockpit instance, for example, Job Resources that hold settings specific for an environment.
  - The *rollout* sub-directories indicates a repository used for objects that will be rolled out to other environments, for example Workflows that should be used in every environment without changes.
  - For the mapping of inventory object types to Git repository types see [Settings - Git](/settings-git).
- Users can access the JOC Cockpit's repositories from the file system and can use a Git Client for related operations, for example managing branches.

The *Clone* operation is available from the *Navigation* panel and is offered for top-level folders from their related 3-dots action menu. The menu hierarchy includes *Git Repository->Local|Rollout->Git->Clone*.

## Clone Repository

<img src="git-clone.png" alt="Git Clone Repository" width="400" height="130" />

The input field expects the Git URL used for cloning, for example, *git@github.com:sos-berlin/js7-demo-inventory-rollout.git*

- *git@* is a constant prefix,
- *github.com* specifies the hostname of the Git server,
- *sos-berlin* is the repository owner,
- *js7-demo-inventory-rollout* is the repository name,
- *.git* is a constant suffix.

Above values represent an example. Please specify values matching the desired Git server.

## References

### Context Help

- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
- [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration)
- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
