# Dependencies

Add support for dependency links between tasks using [jsPlumb](https://jsplumbtoolkit.com/).

## Dependency

[jsPlumb](https://jsplumbtoolkit.com/)

## Usage

    angular.module('myApp', ['gantt', 'gantt.dependencies']);

<!-- -->

    <div gantt>
        <gantt-dependencies enabled="true"
                            read-only="false"
                            js-plumb-defaults="{
                                             Endpoint: ['Dot', {radius: 7}],
                                             Connector: 'Flowchart'
                                             }"
                            endpoints="[...]"
                            fallback-endpoints="[...]">
        </gantt-dependencies>
    </div>


## Attributes

- ### enabled

    Enable dependencies display.

    default: `true`

- ### read-only

    If enabled, existing dependencies will be displayed, but it won't be possible to edit existing dependencies or 
    create new dependencies using mouse.
    
    default: `false`

- ### js-plumb-defaults

    Default settings object for the underlying jsPlumb instance. See 
    [Configuring Defaults](https://jsplumbtoolkit.com/community/doc/defaults.html) of 
    [jsPlumb documentation](https://jsplumbtoolkit.com/community/doc/home.html).
    
    default: 

        Endpoint: ['Dot', {radius: 4}],
        EndpointStyle: {fillStyle: '#456', strokeStyle: '#456', lineWidth: 1},
        PaintStyle: {
            strokeWidth: 3,
            stroke: 'rgb(68, 85, 102)'
        },
        Connector: 'Flowchart',
        ConnectionOverlays: [['Arrow', {location: 1, length: 12, width: 12}]]

- ### endpoints

    Array of endpoints that will be create for each task. See
    [Endpoint class](https://jsplumbtoolkit.com/community/apidocs/classes/Endpoint.html) of 
    [jsPlumb documentation](https://jsplumbtoolkit.com/community/doc/home.html).

    default:

       [
           {
               anchor:'Left',
               isSource:false,
               isTarget:true,
               maxConnections: -1,
               cssClass: 'gantt-endpoint start-endpoint target-endpoint'
               overlays:[
                   ['Custom', {create:createLeftOverlay}]
               ]
           },
           {
               anchor:'Right',
               isSource:true,
               isTarget:false,
               maxConnections: -1,
               cssClass: 'gantt-endpoint end-endpoint source-endpoint'
               overlays:[
                   ['Custom', {create:createRightOverlay}]
               ]
           }
       ];

- ### fallback-endpoints

    Endpoints used to display start/end of connections that links invisible tasks (out of range, collapsed, ...).
    
    default : 

        [
            {
                endpoint: 'Blank',
                anchor: 'Left',
                isSource: false,
                isTarget: true,
                maxConnections: 0,
                cssClass: 'gantt-endpoint start-endpoint fallback-endpoint',
                overlays: [
                    ['Custom', {create: createLeftFallbackOverlay}]
                ]
            },
            {
                endpoint: 'Blank',
                anchor: 'Right',
                isSource: true,
                isTarget: false,
                maxConnections: 0,
                cssClass: 'gantt-endpoint end-endpoint fallback-endpoint',
                overlays: [
                    ['Custom', {create: createRightFallbackOverlay}]
                ]
            }
        ]

- ### conflict-checker

    Check for conflicts in dependent tasks and mark invalid tasks with `gantt-task-overlaps` CSS class.
    
    default : false


## Model

Task can specify a `dependencies` field containing a single or a list of objects.

Each object defines the opposite side or the dependency, using either `from` or `to` property. `connectParameters` field
can optionnaly be set to an object that will be used for each related 
[jsPlumb.connect(...)](https://jsplumbtoolkit.com/community/doc/connections.html#programmatic) function call.

    {
      ...
      // Inside Task object
      'dependencies': [{
        'from': <taskId>,
        'connectParameters': {...} // Parameters given to jsPlumb.connect() function call.
      }]
    }

    {
      ...
      // Inside Task object
      'dependencies': [{
        'to': <taskId>,
        'connectParameters': {...} // Parameters given to jsPlumb.connect() function call.
      }]
    }
    
    {
      ...
      // Inside Task object or Row object
      'dependencies': false // Disable dependencies support for this task or row
    }

## API

### Methods
    
- **api.dependencies.refresh(tasks)**

  Refresh the view with dependencies data from the model.
  tasks is an array of Task objects to refresh, or undefined to refresh the whole chart.

### Events

- **api.dependencies.on.add(dependency)**, **api.dependencies.on.remove(dependency)**, **api.dependencies.on.change(dependency, oldDependency)**

  A dependency was created, removed or changed.

## Tips

- Display dependencies related to a task only

`data-fromId` and `data-toId` attributes are added to svg canvas used to display dependency links.

So it's possible with CSS to hide all dependencies but thoses related to a given task id.

```css
.jtk-connector {
    display: none;
}

.jtk-connector.jtk-dragging {
    display: inherit;
}

.jtk-connector[data-fromId='Product list view'] {
    display: inherit;
}

.jtk-connector[data-toId='Product list view'] {
    display: inherit;
}
```

For more information, see [Styling via css](https://jsplumbtoolkit.com/community/doc/styling-via-css.html) from [jsPlumb documentation](https://jsplumbtoolkit.com/community/doc/home.html).
