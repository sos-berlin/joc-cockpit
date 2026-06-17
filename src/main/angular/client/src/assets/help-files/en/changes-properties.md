# Change Properties

JOC Cockpit offers managing [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) to objects such as Workflows. A Change is a collection of inventory objects that are subject to common deployment operations

- for deployment to Controllers,
- for rollout using [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import),
- for rollout using [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface).

Changes include inventory objects such as Workflows, Schedules etc. and they include referenced objects, for example a Job Resource referenced by a Workflow.

- Users can add inventory objects directly to a Change.
- Referenced objects are automatically associated a Change.

The *Change - Properties* pop-up window is used for specifying properties of Changes.

## Properties

Changes hold the following properties:

- **Name** is the unique name that users assign a Change.
- **Title** explains the purpose of the Change.
- **Status** is one of *Open* or *Closed*. Closed changes are not offered for deployment or export operations.

## References

### Context Help

- [Changes](/changes)

### Product Knowledge Base

- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)
