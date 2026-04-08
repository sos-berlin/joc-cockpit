# Resource Locks

The *Resource Locks* view displays live information about use of Resource Locks.

Resource Locks are used to limit parallelism of Jobs and Workflow Instructions across Workflows.
Resource Locks are block instructions that can span a number of Jobs and Workflow Instructions in the same Workflow.

- **Exclusive Locks** can be used by a single Job. Exclusive access is configured either from the Resource Lock or from use in the Workflow.
- **Shared Locks** can be used by a configurable number of Jobs.
  - The Resource Lock is assigned a *capacity*, for example 6.
  - Each use of the Resource Lock by a set of Jobs is assigned a *weight*, for example 3 and 4 for use in Workflows A and B. This allows 2 Orders for Workflow A to be executed in parallel and it denies parallel execution of Orders for Workflows A and B.

## Navigation Panel

The left panel displays the tree of inventory folders that hold Resource Locks.

- Clicking the folder displays Resource Locks from that folder.
- Clicking the chevron-down icon available when hovering on a folder displays Resource Locks from the folder and any sub-folders.

The Quick Search icon offers looking up Resource Locks based on user input:

- Typing **Test** will display Resource Locks with names such as *test-lock-1* and *TEST-lock-2*. 
- Typing **\*Test** will display Resource Locks with names such as *test-lock-1* and *my-TEST-lock-2*

## Resource Lock Panel

### Display of Resource Locks

The following information is displayed:

- **Name** is the unique name of a Resource Lock.
- **Deployment Date** is the date on which the Resource Lock was deployed.
- **Status** is one of *Synchronized* and *Not Synchronized* if the Resource Lock has not been deployed to the Controller.
- **Acquired Weight** indicates the cumulative *weight* by parallel Orders that acquired the lock.
- **Holding Orders** indicates the number of Orders that acquired the lock.
- **Waiting Orders** indicates the number of Orders that are waiting to acquire the lock.
- **Capacity** indicates the *capacity* available from the lock. *Exclusive Locks* hold a *capacity* of 1, *Shared Locks* hold an individual *capacity*.

### Display of Orders

Clicking the arrow-down icon will expand the Resource Lock and will display detailed information about holding Orders that acquired the Resource Lock and Orders that are waiting for the Resource Lock.

## Search

The *Search* offers criteria for looking up Resource Locks from dependencies, for example by searching for Workflows including a specific Job name, the Resource Locks used by the Workflow will be returned.

## References

- [Resources - Resource Locks - Search](/resources-resource-locks-search)
- [JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)
