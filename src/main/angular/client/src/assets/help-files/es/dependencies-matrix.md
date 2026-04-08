# Dependency Matrix

JS7 inventory objects  are related by dependencies. For example, a Workflow referencing a Job Resource and a Resource Lock; a Schedule referencing a Calendar and one or more Workflows.

When deploying objects, consistency is considered, for example:

- If a Job Resource is created and is referenced by a newly created Workflow, then deployment of the Workflow includes deploying the Job Resource.
- If a Job Resource is referenced by a deployed Workflow and should be revoked or removed, then the Workflow must be revoked or removed too.

For details see [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies).

The Dependency Matrix of inventory objects looks like this:

| Area |Object Type | Incoming References	 |     | Outgoing References |      |       |       |       |       |
| ----- | ----- | ----- | ----- |
| Controller |
|      | Workflow | Workflow | Schedule | Workflow | Job Resource | Notice Board | Resource Lock | Job Template | Script Include |
|      | File Order Source |      |      | Workflow |
|      | Job Resource | Workflow |
|      | Notice Board | Workflow |
|      | Resource Lock | Workflow |
| Automation |
|      | Schedule |      |      | Workflow | Calendar |
|      | Calendar | Schedule |
|      | Job Template | Workflow |
|      | Script Include | Workflow |

## References

### Context Help

- [Configuration - Inventory - Operations - Deploy Folder](/configuration-inventory-operations-deploy-folder)
- [Configuration - Inventory - Operations - Deploy Object](/configuration-inventory-operations-deploy-object)

### Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
