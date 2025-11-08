# Manage Changes

JOC Cockpit offers managing [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes) to objects such as Workflows. A Change is considered a list of inventory objects that are subject to joint deployment operations

- for deployment to Controllers,
- for rollout using [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import),
- for rollout using [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface).

Changes include inventory objects such as Workflows, Schedules etc. and they include referenced objects, for example a Job Resource referenced by a Workflow.

- Users can add inventory objects directly to a Change.
- Referenced objects are automatically associated with a Change.

The *Manage Changes* page is used for adding, updating and deleting Changes.

## List of Changes

Existing Changes are displayed from a list:

- **Action Menu** offers to update and to delete the Change entry.
- **Name** is the unique name that users assign a Change.
- **Title** explains the purpose of the Change.
- **Status** is one of *Open* or *Closed*. Closed changes are not offered for deployment or export operations.
- **Owner** indicates the account that owns the Change.
- **Objects** offers an icon to display objects subject to the Change.

## Operations on Changes

From the top of the screen the following buttons are available:

- **Add Change** offers adding a Change. Find details from [Changes - Properties](/changes-properties).

From the *List of Changes* the following operations are offered with the related 3-dots action menu:

- **Edit** allows updating the properties of the Change. Find details from [Changes - Properties](/changes-properties).
- **Delete** will remove the Change entry.

## References

### Context Help

- [Changes - Properties](/changes-properties)

### Product Knowledge Base

- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)
- [JS7 - Inventory Export and Import](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Export+and+Import)
- [JS7 - Inventory Changes](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Changes)
