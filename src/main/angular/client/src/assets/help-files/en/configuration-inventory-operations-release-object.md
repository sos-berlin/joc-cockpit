# Configuration - Inventory - Operations - Release Object

Releasing objects activates them, for example, for use with the [Daily Plan](/daily-plan). This applies to objects such as Schedules and Calendars available from the *Automation* system folder.

The *Configuration->Inventory* view offers releasing a single object and releasing objects from folders, see [Configuration - Inventory - Operations - Release Folder](/configuration-inventory-operations-release-folder).

When releasing a single object from the related *Release* button, a pop-up window will be displayed like this:

<img src="release-schedule.png" alt="Release Schedule" width="600" height="330" />

## Updating the Daily Plan

Releasing objects such as Schedules and Calendars impacts the [Daily Plan](/daily-plan). Frequently, the updated version of an object should be used for Orders in the Daily Plan. Users control the behavior from the following options:

- **Update Daily Plan**
  - **Now** specifies updating the Daily Plan for Orders scheduled for a point in time starting from now.
  - **Start Date** when selected will add an input field for the target date starting from which the Daily Plan will be updated.
  - **No** specifies that the Daily Plan will not be updated. Existing Orders will stick to using previously deployed versions of objects.
- **Include today's late Orders** when checked this will include Orders that have been scheduled for a past time in the current day but that are delayed and did not start.

## Including Dependencies

Inventory objects are related by dependencies, see [Dependency Matrix](/dependencies-matrix). For example, a Workflow referencing a Job Resource and a Resource Lock; a Schedule referencing a Calendar and one or more Workflows.

When releasing objects, consistency is considered, for example:

- If a Schedule is created and references a newly created Calendar, then releasing the Schedule includes releasing the Calendar too. This further includes deployment of a draft Workflow referenced by the Schedule.
- If a Calendar is referenced by a released Schedule and should be recalled or removed, then the Schedule must be recalled or removed too. This includes to revoke or remove the Workflow referenced by the Schedule.

Users control consistent deployment from the following options:

- **Include Dependencies**
  - when checked, this will include both referencing and referenced objects.
    - If related objects are in draft status, then common deployment is offered. It will be enforced, if required by changes to object relationships.
    - If related objects are in deployed/released status, then common deployment is optional. Users can select related objects for common deployment.
  - when unchecked, this will not consider dependencies. Users must verify if related objects are valid and deployed/released. The Controller will raise error messages in case of missing objects due to inconsistent deployment.

## References

### Context Help

- [Configuration - Inventory - Operations - Release Folder](/configuration-inventory-operations-release-folder)
- [Configuration - Inventory - Workflows](/configuration-inventory-workflows)
- [Daily Plan](/daily-plan)
- [Dependency Matrix](/dependencies-matrix)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
