# Configuration - Inventory - Operations - Recall Object

Recalling objects deactivates them, for example, for use with the [Daily Plan](/daily-plan). This applies to objects such as Schedules and Calendars available from the *Automation* system folder.

The *Configuration->Inventory* view offers recalling a single object and recalling objects from folders, see [Configuration - Inventory - Operations - Recall Folder](/configuration-inventory-operations-recall-folder).

When recalling a single object from the *Recall* operation available from the object's 3-dots action menu in the navigation panel, a pop-up window will be displayed like this:

<img src="recall-schedule.png" alt="Recall Schedule" width="600" height="300" />

## Updating the Daily Plan

Recalling objects such as Schedules and Calendars impacts the [Daily Plan](/daily-plan). 

Existing Orders for Workflows referenced by related Schedules will be recalled from the Controller and will be removed from the Daily Plan.

## Including Dependencies

Inventory objects are related by dependencies, see [Dependency Matrix](/dependencies-matrix). For example, a Workflow referencing a Job Resource and a Resource Lock; a Schedule referencing a Calendar and one or more Workflows.

When recalling objects, consistency is considered, for example:

- If a Schedule is created and references a newly created Calendar, then releasing the Schedule includes releasing the Calendar too. This further includes deployment of a draft Workflow referenced by the Schedule.
- If a Calendar is referenced by a released Schedule and should be recalled or removed, then the Schedule must be recalled or removed too. This includes to revoke or remove the Workflow referenced by the Schedule.

Users control consistent deployment from the following options:

- **Include Dependencies**
  - when checked, this will include both referencing and referenced objects.
    - If related objects are in deployed/released status, then common recalling is offered. It will be enforced, if required by object relationships.
    - If related objects are in draft status, then common recalling is optional. Users can select related objects for common recalling.
  - when unchecked, this will not consider dependencies. Users must verify if related objects are valid and deployed/released. The Controller will raise error messages in case of missing objects due to inconsistent deployment.

## References

### Context Help

- [Configuration - Inventory - Operations - Recall Folder](/configuration-inventory-operations-recall-folder)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
