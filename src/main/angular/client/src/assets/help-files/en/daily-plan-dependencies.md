# Daily Plan Dependencies

Workflow dependencies can be enforced for all days and for specific Daily Plan dates, for example:

- Workflow 1 runs Mon-Fri.
- Workflow 2 runs Mon-Sun and depends on previous execution of Workflow 1.
- During weekends Workflow 1 will not start. To allow Workflow 2 starting on weekends, the dependency is mapped to the Daily Plan by use of *Schedulable Notice Boards*: if no Order is announced for Workflow 1, then the dependency will be ignored.

## Calendar

The calendar widget offers selecting a Daily Plan date for which dependencies will be displayed.

- **Light Red Color**: Past plan dates that are closed and that will not allow adding Orders.
- **Green Color**: Past and future plan dates that are open and that will allow adding Orders.

Operations on plan dates include:

- **Open Plan**: This happens automatically if new Orders are added for a plan date. Users can re-open a closed plan.
- **Close Plan**: An open plan is closed and will not allow adding Orders. This happens automatically for past plan dates with a delay of one day. Users can adjust the related setting from the [Settings - Daily Plan](/settings-daily-plan) page. Users can close an open plan earlier to prevent further Orders from being added.

## Display of Dependencies

The following objects are displayed:

- **Posting Workflow**: On the left side the Workflow is displayed that posts Notices.
- **Notice**: In the middle section the name of the Notice Board is displayed that creates the Notice.
- **Receiving Workflow**: On the right side the Workflow is displayed that expects or consumes the Notice.

The following relationships are indicated:

- **Posting Workflow**: Creates one or more Notices that are expected/consumed by one or more *Receiving Workflows*.
- **Receiving Workflow**: Expects/consumes one or more Notices from the same or different *Posting Workflows*.

The fulfilment status of dependencies is indicated by lines:

- **Line in Blue Color**: A Notice is announced for a future point in time when the *Posting Workflow's* Order will start and will create the Notice.
- **Line in Greenish Color**: The dependency is unresolved, a Notice has been posted but is not yet processed by all *Receiving Workflows*.
  - **Receiving Workflow in Greenish Color**: The *Receiving Workflow*'s Order is started but did not proceed to the Workflow instruction that checks Notices.
  - **Receiving Workflow in Blue Color**: The *Receiving Workflow*'s Order is scheduled to start at a later point in time during the day.
- **Line in Grey Color**: The dependency is resolved, the Notice has been posted and has been consumed by a *Receiving Workflow*.

## Filters

Filters allow limiting the display of Workflows and dependencies:

- **Notices Announced**: Displays Workflows for which Notices are announced, i.e. Orders are scheduled but did not yet start and did not yet post the Notice. When a Notice is posted, its announcement is dropped.
- **Notices Present**: Displays Workflows for which Notices have been posted and can be processed. If a Notice is consumed by a Workflow, then it will be dropped and will no longer be present.

If both filter buttons are active, then this includes announced and posted Notices but excludes dependencies that have been resolved and for which Notices have been consumed and are no longer present.

If both filter buttons are inactive then all Workflows and dependencies will be displayed including Notices that have been announced, that are present or that have been consumed.

## References

### Context Help

- [Configuration - Inventory - Notice Boards](/configuration-inventory-notice-boards)
- [Daily Plan](/daily-plan)
- [Resources - Notice Boards](/resources-notice-boards)
- [Settings - Daily Plan](/settings-daily-plan)

### Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  - [JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  - [JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
