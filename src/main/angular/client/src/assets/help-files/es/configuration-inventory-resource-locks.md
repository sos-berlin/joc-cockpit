# Configuration - Inventory - Resource Locks

The *Resource Lock Panel* offers specifying Resource Locks for use with Workflows.

Resource Locks limit parallelism of Jobs and other Workflow Instructions. They can be considered a traffic light, more precisely a [Semaphore](https://en.wikipedia.org/wiki/Semaphore_%28programming%29) with the implication that 

- Orders have to acquire the lock to proceed in the Workflow and otherwise will remain in the *waiting* state until the lock becomes available.
- Orders waiting for a lock will not consume computing resources such as CPU,
- Orders' attempts to acquire a lock will be considered for any Jobs and other Workflow Instructions across Workflows and Agents.

The following flavors are available for Resource Locks:

- **Exclusive Locks** allow single use of a lock by a [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction).
- **Shared Locks** allow parallel use of a lock by a number of *Lock Instructions* from the same or from different Workflows.
  - The underlying use case is a resource such as a database table that can be accessed by a limited number of Jobs at the same time. To prevent database deadlocks, the number of Jobs accessing the table is limited.
  - Each *Lock Instruction* specifies a *Weight* that is counted towards the Resource Lock's *Capacity*. If the *Weight* matches the available *Capacity*, then the Order can proceed and otherwise the Order will wait until the required share in *Capacity* becomes available.

The following applies to use of Resource Locks by *Lock Instructions*:

- *Lock Instructions* are block instructions used in a Workflow that can spawn any number of Jobs and other Workflow Instructions.
- *Lock Instructions* can be nested at any number of levels.
- In case of Job errors by default the Order will release the lock and will be moved to the begin of the *Lock Instruction*. Users who wish a *failed* Order to continue use of a lock can apply the [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction) with the *false* value for the *StopOnFailure* option.

Resource Locks are managed from the following panels:

- The [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) on the left side of the window offers navigation by folders holding Resource Locks. In addition, the panel offers operations on Resource Locks.
- The *Resource Lock Panel* on the right side of the window holds details for Resource Lock configuration.

## Resource Lock Panel

For a Resource Lock the following inputs are available:

- **Name** is the unique identifier of a Resource Lock, see [Object Naming Rules](/object-naming-rules).
- **Title** holds an optional explanation of the Resource Lock's purpose.
- **Capacity** is a number that represents the maximum acceptance of *Weights* from parallel *Lock Instructions*:
  - a *Capacity* of 1 limits the Resource Lock to single use independently from *Exclusive* or *Shared* *Lock Instructions*.
  - a larger *Capacity* allows parallel use of the Resource Lock by *Shared Locks*. Related *Lock Instructions* can specify use of the Lock's *Capacity* :
    - *Exclusive* use will try to acquire the lock exclusively independently from its *Capacity*. 
    - *Shared* use will check if the *Lock Instruction*s *Weight* matches the remaining *Capacity*.

### Operations on Resource Locks

For available operations see [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation).

### Order Priorities

Resource Locks consider Order *Priorities*. When adding orders from [Configuration - Inventory - Schedules](/configuration-inventory-schedules) and when adding ad hoc orders using [Workflows - Add Orders](/workflows-orders-add), the *Priority* can be specified.

If a number of Orders are waiting in front of a Resource Lock, then the Order with the highest *Priority* will be the first to acquire the Resource Lock.

## References

### Context Help

- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
- [Object Naming Rules](/object-naming-rules)
- [Workflow - Inventory - Navigation Panel](/configuration-inventory-navigation)

### Product Knwoledge Base

- [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
- [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
- [Semaphore](https://en.wikipedia.org/wiki/Semaphore_%28programming%29)
