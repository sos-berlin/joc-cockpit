/**
 * Created by sourabhagrawal on 29/06/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('ResourceService', ResourceService)
        .service('ScheduleService', ScheduleService)
        .service('JobSchedulerService', JobSchedulerService)
        .service('DailyPlanService', DailyPlanService)
        .service('CalendarService', CalendarService)
        .service('EventService', EventService);

    ResourceService.$inject = ["$resource", "$q"];

    function ResourceService($resource, $q) {
        return {
            get: function (jobschedulerId) {
                let deferred = $q.defer();
                let Lock = $resource('locks');
                Lock.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getLocksP: function (jobschedulerId) {
                let deferred = $q.defer();
                let Lock = $resource('locks/p');
                Lock.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getProcessClass: function (jobschedulerId) {
                let deferred = $q.defer();
                let ProcessClass = $resource('process_classes');
                ProcessClass.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getProcessClassP: function (jobschedulerId) {
                let deferred = $q.defer();
                let ProcessClass = $resource('process_classes/p');
                ProcessClass.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getProcessClassConfig: function (filter) {
                let deferred = $q.defer();
                let ProcessClass = $resource('process_class/read');
                ProcessClass.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            updateProcessClassConfig: function (filter) {
                let deferred = $q.defer();
                let ProcessClass = $resource('process_class/save');
                ProcessClass.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deleteProcessClassConfig: function (filter) {
                let deferred = $q.defer();
                let ProcessClass = $resource('process_class/delete');
                ProcessClass.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (type, filter) {
                let deferred = $q.defer();
                let Configuration = $resource(type+'/configuration');
                Configuration.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            tree: function (filter) {
                let deferred = $q.defer();
                let Tree = $resource('tree');
                Tree.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getAgentTask: function (filter) {
                let deferred = $q.defer();
                let AgentTask = $resource('report/agents');
                AgentTask.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getDocumentations: function (filter) {
                let deferred = $q.defer();
                let Documentations = $resource('documentations');
                Documentations.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            exportDocumentations: function (filter) {
                let deferred = $q.defer();
                let Documentations = $resource('documentations/export/info');
                Documentations.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deleteDocumentations: function (filter) {
                let deferred = $q.defer();
                let Documentations = $resource('documentations/delete');
                Documentations.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            documentationUsed: function (filter) {
                let deferred = $q.defer();
                let Documentations = $resource('documentation/used');
                Documentations.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            assign: function (objType, filter) {
                let deferred = $q.defer();
                let resType = objType === 'processClass' ? 'process_class' : objType;
                let Job = $resource(resType + '/documentation/assign');
                Job.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            unassign: function (objType, filter) {
                let deferred = $q.defer();
                let resType = objType === 'processClass' ? 'process_class' : objType;
                let Job = $resource(resType + '/documentation/unassign');
                Job.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }

    ScheduleService.$inject = ["$resource", "$q"];

    function ScheduleService($resource, $q) {
        return {
            get: function (jobschedulerId) {
                let deferred = $q.defer();
                let Schedule = $resource('schedules');
                Schedule.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getSchedulesP: function (jobschedulerId) {
                let deferred = $q.defer();
                let Schedule = $resource('schedules/p');
                Schedule.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getScheduleP: function (schedule, jobschedulerId) {
                let deferred = $q.defer();
                let Schedule = $resource('schedule/p');
                Schedule.save({schedule: schedule, jobschedulerId: jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getSchedule: function (schedule, jobschedulerId) {
                let deferred = $q.defer();
                let Schedule = $resource('schedule');
                Schedule.save({schedule: schedule, jobschedulerId: jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            setRunTime: function (filter) {
                let deferred = $q.defer();
                let Schedule = $resource('schedule/set_run_time');
                Schedule.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getRunTime: function (filter) {
                let deferred = $q.defer();
                let Schedule = $resource('schedule/run_time');
                Schedule.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }

        }
    }

    JobSchedulerService.$inject = ["$resource", "$q"];

    function JobSchedulerService($resource, $q) {
        return {
            getSchedulerIds: function () {
                let deferred = $q.defer();
                let Schedule = $resource('jobscheduler/ids');
                Schedule.save(function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            switchSchedulerId: function (jobschedulerId) {
                let deferred = $q.defer();
                let Schedule = $resource('jobscheduler/switch');
                Schedule.save({jobschedulerId: jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            get: function (jobschedulerId) {
                let deferred = $q.defer();
                let JobChain = $resource('jobscheduler');
                JobChain.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobSchedulerP: function (jobschedulerId) {
                let deferred = $q.defer();
                let JobChain = $resource('jobscheduler/p');
                JobChain.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getAgents: function (jobschedulerId) {
                let deferred = $q.defer();
                let JobChain = $resource('jobscheduler/agents');
                JobChain.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getPermanentAgent: function (jobschedulerId) {
                let deferred = $q.defer();
                let JobChain = $resource('jobscheduler/agents/p');
                JobChain.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getSupervisor: function (jobschedulerId) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/supervisor');
                JobScheduler.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getSupervisorP: function (jobschedulerId) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/supervisor/p');
                JobScheduler.save(jobschedulerId, function (resP) {
                    JobScheduler = $resource('jobscheduler/supervisor');
                    JobScheduler.save(jobschedulerId, function (res) {
                        resP.jobscheduler.state = res.jobscheduler.state;
                        resP.jobscheduler.startedAt = res.jobscheduler.startedAt;
                        deferred.resolve(resP);
                    }, function (err) {
                        deferred.resolve(resP);
                    });
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getClusterMembersP: function (jobschedulerId) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/cluster/members/p');
                JobScheduler.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getClusterMembers: function (jobschedulerId) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/cluster/members');
                JobScheduler.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getDatabase: function (jobschedulerId) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/db');
                JobScheduler.save(jobschedulerId, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getAgentCluster: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/agent_clusters');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getAgentClusterP: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/agent_clusters/p');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminate: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/terminate');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            restart: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/restart');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            cleanup: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/cleanup');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            restartWithin: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/restart');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            abort: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/abort');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            abortAndRestart: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/abort_and_restart');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            pause: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/pause');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            continue: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/continue');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateCluster: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/cluster/terminate');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            restartCluster: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/cluster/restart');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateFailsafeCluster: function (filter) {
                let deferred = $q.defer();
                let JobScheduler = $resource('jobscheduler/cluster/terminate_failsafe');
                JobScheduler.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            info: function (filter) {
                let deferred = $q.defer();
                let Info = $resource('jobscheduler/log/info');
                Info.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            debugInfo: function (filter) {
                let deferred = $q.defer();
                let Debug = $resource('jobscheduler/debuglog/info');
                Debug.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            reactivate: function (filter) {
                let deferred = $q.defer();
                let Reactivate = $resource('jobscheduler/cluster/reactivate');
                Reactivate.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }

    DailyPlanService.$inject = ["$resource", "$q"];

    function DailyPlanService($resource, $q) {
        return {
            getPlans: function (filter) {
                let deferred = $q.defer();
                let Plan = $resource('plan');
                Plan.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getPlansFromRuntime: function (filter) {
                let deferred = $q.defer();
                let Runtime = $resource('plan/from_run_time');
                Runtime.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }

    CalendarService.$inject = ["$resource", "$q"];

    function CalendarService($resource, $q) {
        return {
            getListOfCalendars: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendars');
                Calendar.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getCalendar: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendar');
                Calendar.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            calendarsUsed: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendars/used');
                Calendar.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            calendarUsed: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendar/used');
                Calendar.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            delete: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendars/delete');
                Calendar.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getListOfDates: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendar/dates');
                Calendar.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getCalendarCategories: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendars/categories');
                Calendar.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            storeCalendar: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendar/store');
                Calendar.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            saveAs: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendar/save_as');
                Calendar.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }, export: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendars/export');
                Calendar.save(filter, function (res, headers) {
                    let response = {};
                    response.data = res;
                    response.headers = headers;
                    deferred.resolve(response);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }, import: function (filter) {
                let deferred = $q.defer();
                let Calendar = $resource('calendars/import');
                Calendar.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }

    EventService.$inject = ["$resource", "$q"];

    function EventService($resource, $q) {
        return {
            getEvents: function (filter) {
                let deferred = $q.defer();
                let Event = $resource('events/custom');
                Event.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            addEvent: function (filter) {
                let deferred = $q.defer();
                let Event = $resource('events/custom/add_event');
                Event.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deleteEvent: function (filter) {
                let deferred = $q.defer();
                let Event = $resource('events/custom/delete_events');
                Event.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }
})();

