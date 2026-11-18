# Job: OrderStateTransitionJob
<summary>
Transitions order states.
</summary>

# Purpose
<detail>

The job is used to perform state transitions on orders. Examples for state transitions include to

- continue orders from the *failed* state to the *in progress* state and possibly to the *running* state in case of a job instruction,
- continue orders from the *suspended* state to the state they had before being suspended,
- continue orders from the *prompting* state to the *in progress* state and possibly to the *running* state.

The job makes use of the [JS7 REST Web Service API](https://kb.sos-berlin.com/display/JS7/JS7+-+REST+Web+Service+API) to perform transitions, see [JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions).

The job  authenticates with the REST Web Service API, for details see [JS7 - JITL Common Authentication](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Common+Authentication).
</detail>

# Arguments

## Argument: controller_id
<article id="controller_id">

The identifier of a Controller can be specified to limit the list of resulting orders to the indicated Controller.

By default the current Controller is used.
</article>

## Argument: states
<article id="states">

Specifies the state of orders that should be transitioned. Possible values include `pending`, `failed`, `suspended`, `waiting`, `inprogress`, `scheduled`, `prompting`.

- Values can be specified in uppercase, lowercase or mixed letters. 
- Values can be specified from a semicolon separated list. Each state in the list is handled separately, for example    

Use with Transitions:
                  
- The `continue` transition for prompting orders will move orders to the `in progress` state and possibly to the `running` state,
- The `continue` transition for suspended orders will put orders to the state they had before being suspended.
</article>

## Argument: transition
<article id="transition">

Specifies the the operation to transition the order. Possible values are one of:

- `cancel`: executes the *cancel* operation on related orders.
- `continue`: executes the *resume* operation on failed and suspended orders. Executes the *confirm* operation on prompting orders.
- `suspend`: executes the *suspend* operation on orders that are not failed, not finished and not suspended.
</article>

## Argument: workflow_folders
<article id="workflow_folders">

Specifies a list of folders that hold workflows for which orders should be transitioned.

If more than one folder is specified, then folders are separated by semicolon. When used with the trailing characters `/*`, then the folder will be looked up recursively. By default all folders will be looked up recursively.

Example: `myWorkflow;your?orkflow/*`
</article>

## Argument: workflow_search_patterns
<article id="workflow_search_patterns">

Specifies a list of search patterns for workflow folders that contains the orders that should be transitioned.

- If more than one search pattern is specified, then they are separated by semicolon.
- Search patterns allow use of wildcards:
  - `*` is a placeholder for zero or more characters.
  - `?` is a placeholder for a single character.

Example: `*myWorkflow*;/folder/sub1/my?orkflow`
</article>

## Argument: order_search_patterns
<article id="order_search_patterns">

Specifies a list of search patterns for order names to identify orders that should be transitioned.

- If more than one search pattern is specified, then they are separated by semicolon.
- Search patterns allow use of wildcards:
  - `*` is a placeholder for zero or more characters.
  - `?` is a placeholder for a single character.

Example: `*daily*;critical`
</article>

## Argument: batch_size
<article id="batch_size">

Specifies the maximum number of orders for a single request to the JS7 REST Web Service API (default: 10000).

Orders are transitioned in a single transaction. This includes that either all orders in a transaction are transitioned or none. If the number of orders exceeds the batch size, then a further transaction is executed.

If the value 1 is used for the *batch_size*, then each order is transitioned individually with a successful or failed result.

The *batch_size* should not exceed a value of approx. 15000 to limit the size of requests to the Controller to approx. 4 MB which is a frequently applied limit of Proxy Servers that might be in place between the Agent running the job and JOC Cockpit.
</article>

## Argument: persist_duration
<article id="persist_duration">

Specifies the duration an order will persist in the failed state, if tranisitioned accordingly.

The argument is applicable to failed orders only.

The duration is specified from a period relative to the current time, for example, `6h`, `12h`, `1d`, `1w` that specifies the quantity followed by one of the qualifiers:

- s (seconds)
- m (minutes)
- h (hours)
- d (days)
- w (weeks)
- M (months)
- y (years)
</article>

# Return Variables

The job does not provide return variables.
