# Job: MaintenanceWindowJob
<summary>
The job enables/disables JS7 products during a Maintenance Window.
</summary>

# Purpose
<detail>

The job enables/disables JS7 products during a Maintenance Window. it enforces the specified state for the given Controller and/or JOC Cockpit instances, Agents and Subagents.

The job considers Controller instances, JOC Cockpit instances, Agents and Subagents as specified.
</detail>

# Arguments

## Argument: state
<article id="state">

Specifies the resulting state for the given Controller, JOC Cockpit or Agent.

Possible values are (case-insensitive):

- active
- incactive

### Actions

**Controller**

If the given Controller instance in a cluster is not assigned the specified *state*, then a switch-over will be performed.

**JOC Cockpit**

If the given JOC Cockpit instance in a cluster is not assigned the specified *state*, then a switch-over will be performed.

**Agent**

If the given Agent or Subagent is enabled and the specified *state* is `inactive`, then the Agent will be disabled.
If the given Agent or Subagent is disabled and the specified *state* is `active`, then the Agent will be enabled.
</article>

## Argument: controller_id
<article id="controller_id">

Specifies the Controller ID of the given Controller or Agent.
</article>

## Argument: controller_host
<article id="controller_host">

Specifies the Controller instance host name for which the indicated *state* should be enforced. 
</article>

## Argument: joc_host
<article id="joc_host">

Specifies the JOC Cockpit host name for which the indicated *state* should be enforced. 
</article>

## Argument: subagent_ids
<article id="subagent_ids">

Specifies the list of Subagent IDs for which the indicted *state* should be enforced.

List entries are separated by semicolon. 
</article>

## Argument: agent_ids
<article id="agent_ids">

Specifies the list of Agent IDs for which the indicted *state* should be enforced.

List entries are separated by semicolon. 
</article>


# Return Variables

The job does not provide return variables
