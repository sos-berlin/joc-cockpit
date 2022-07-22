(function() {
    'use strict';
    angular.module('gantt.overlap', ['gantt', 'gantt.overlap.templates']).directive('ganttOverlap', ['moment', '$timeout', function(moment, $timeout) {
        return {
            restrict: 'E',
            require: '^gantt',
            scope: {
                enabled: '=?',
                global: '=?'
            },
            link: function(scope, element, attrs, ganttCtrl) {
                var api = ganttCtrl.gantt.api;

                // Load options from global options attribute.
                if (scope.options && typeof(scope.options.overlap) === 'object') {
                    for (var option in scope.options.overlap) {
                        scope[option] = scope.options.overlap[option];
                    }
                }

                if (scope.enabled === undefined) {
                    scope.enabled = true;
                }

                if (scope.global === undefined) {
                    scope.global = false;
                }

                function getStartEnd(task) {
                    var start, end;

                    if (task.model.from.isBefore(task.model.to)) {
                        start = task.model.from;
                        end = task.model.to;
                    } else {
                        start = task.model.to;
                        end = task.model.from;
                    }

                    return [start, end];
                }

                function getRange(task) {
                    var startEnd = getStartEnd(task);
                    return moment().range(startEnd[0], startEnd[1]);
                }

                function handleTaskOverlap(overlapsList, task) {
                    if (!(task.model.id in overlapsList) && task.$element) {
                        task.$element.addClass('gantt-task-overlaps');
                        overlapsList[task.model.id] = task;
                    }
                }

                function handleTaskNonOverlaps(overlapsList, allTasks) {
                    for (var i = 0, l = allTasks.length; i < l; i++) {
                        var task = allTasks[i];
                        if (!(task.model.id in overlapsList) && task.$element) {
                            task.$element.removeClass('gantt-task-overlaps');
                        }
                    }
                }

                function handleOverlaps(tasks) {
                    // Assume that tasks are ordered with from date.
                    var newOverlapsTasks = {};

                    if (tasks.length > 1) {
                        var previousTask = tasks[0];
                        var previousRange = getRange(previousTask);

                        for (var i = 1, l = tasks.length; i < l; i++) {
                            var task = tasks[i];
                            var range = getRange(task);

                            if (range.overlaps(previousRange)) {
                                handleTaskOverlap(newOverlapsTasks, task);
                                handleTaskOverlap(newOverlapsTasks, previousTask);
                            }

                            if (previousTask.left + previousTask.width < task.left + task.width) {
                                previousTask = task;
                                previousRange = range;
                            }
                        }
                    }

                    handleTaskNonOverlaps(newOverlapsTasks, tasks);
                }

                function sortOn(array, supplier) {
                    return array.sort(function(a, b) {
                        if (supplier(a) < supplier(b)) {
                            return -1;
                        } else if (supplier(a) > supplier(b)) {
                            return 1;
                        }
                        return 0;
                    });
                }

                function handleGlobalOverlaps(rows) {
                    var globalTasks = [];
                    for (var i = 0; i < rows.length; i++) {
                        globalTasks.push.apply(globalTasks, rows[i].tasks);
                    }

                    globalTasks = sortOn(globalTasks, function(task) {
                        return task.model.from;
                    });

                    handleOverlaps(globalTasks);
                }

                if (scope.enabled) {
                    api.data.on.change(scope, function() {
                        $timeout(function() {
                            var rows = api.gantt.rowsManager.rows;

                            if (scope.global) {
                                handleGlobalOverlaps(rows);
                            } else {
                                for (var i = 0; i < rows.length; i++) {
                                    handleOverlaps(rows[i].tasks);
                                }
                            }
                        });
                    });

                    api.tasks.on.change(scope, function(task) {
                        if (scope.global) {
                            var rows = task.row.rowsManager.rows;
                            handleGlobalOverlaps(rows);
                        } else {
                            handleOverlaps(task.row.tasks);
                        }
                    });

                    api.tasks.on.rowChange(scope, function(task, oldRow) {
                        if (scope.global) {
                            var rows = task.row.rowsManager.rows;
                            handleGlobalOverlaps(rows);
                        } else {
                            handleOverlaps(oldRow.tasks);
                            handleOverlaps(task.row.tasks);
                        }
                    });

                    api.tasks.on.add(scope, function(task) {
                        // TODO: Mimicked functionality from api.data.on.change to defer until element creation, but not ideal.  Refactor necessary to raise 'add' event after task is fully drawn.
                        $timeout(function() {
                            if (scope.global) {
                                var rows = task.row.rowsManager.rows;
                                handleGlobalOverlaps(rows);
                            } else {
                                handleOverlaps(task.row.tasks);
                            }
                        });
                    });
                }
            }
        };
    }]);
}());
