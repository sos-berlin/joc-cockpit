/**
 * Created by sourabhagrawal on 29/06/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('ResourceService', ResourceService)
        .service('ScheduleService', ScheduleService)
        .service('JobSchedulerService', JobSchedulerService);

    ResourceService.$inject = ["$resource", "$q", "apiUrl"];
    function ResourceService($resource, $q, apiUrl) {
        return {
            get: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'locks');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getLocksP: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'locks/p');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getProcessClass: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'process_classes');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getProcessClassP: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'process_classes/p');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (path,jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'lock/configuration');
                JobChain.save({lock : path,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            }
        }
    }


    ScheduleService.$inject = ["$resource", "$q", "apiUrl"];
    function ScheduleService($resource, $q, apiUrl) {
        return {
            get: function (jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource(apiUrl + 'schedules');
                Schedule.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getSchedulesP: function (jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource(apiUrl + 'schedules/p');
                Schedule.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getScheduleP: function (schedule,jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource(apiUrl + 'schedule/p');
                Schedule.save({schedule:schedule,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            substitute: function (substitute,jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource(apiUrl + 'schedules/substitute');
                Schedule.save({jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (path,jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'schedule/configuration');
                JobChain.save({schedule : path,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            }
        }
    }

    JobSchedulerService.$inject=["$resource", "$q", "APIUrl"];
    function JobSchedulerService($resource,$q,APIUrl){
        return{
            getSchedulerIds: function () {
                var deferred = $q.defer();
                var Schedule = $resource(APIUrl + 'jobscheduler/ids');
                Schedule.save(function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            switchSchedulerId: function (jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource(APIUrl + 'jobscheduler/switch');
                Schedule.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
             get: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(APIUrl + 'jobscheduler');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getJobSchedulerP: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(APIUrl + 'jobscheduler/p');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getAgents: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(APIUrl + 'jobscheduler/agents');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getPermanentAgent: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(APIUrl + 'jobscheduler/agents/p');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
              getSupervisor: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/supervisor');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getSupervisorP: function (jobschedulerId) {
                console.log("getSupervisorP ");
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/supervisor/p');
                JobScheduler.save(jobschedulerId, function (resP) {
                    JobScheduler = $resource(APIUrl + 'jobscheduler/supervisor');
                    JobScheduler.save(jobschedulerId, function (res) {
                        resP.jobscheduler.state = res.jobscheduler.state;
                        resP.jobscheduler.os.distribution = 'Linux release 7.2.1511';
                        deferred.resolve(resP);
                    }, function (err) {
                        deferred.resolve(err);
                    });
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },


            getClusterMembersP: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/cluster/members/p');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },

            getClusterMembers: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/cluster/members');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },

            getDatabase: function (jobschedulerId) {

                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/db');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getAgentCluster: function (filter) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/agent_clusters');
                JobScheduler.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getAgentClusterP: function (filter) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/agent_clusters/p');
                JobScheduler.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            terminate: function (host,port,jobschedulerId) {
                console.log("IN terminate "+host+" port "+port);
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/terminate');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
             restart: function (host,port,jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/restart');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
             abort: function (host,port,jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/abort');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
             abortAndRestart: function (host,port,jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/abort_and_restart');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            pause: function (host,port, jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/pause');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            continue: function (host,port,jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/continue');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            terminateCluster: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/cluster/terminate');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            restartCluster: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/cluster/restart');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            terminateFailsafeCluster: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource(APIUrl + 'jobscheduler/cluster/terminate_failsafe');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getPlans: function(filter){
                console.log("Get plans with filter "+filter.range);
                var deferred = $q.defer();
                deferred.resolve({});
                return deferred.promise;
            },
            getSampleData: function () {
                var to = new Date();
                to.setMonth(9);
                to.setDate(25);

                return [
                    {
                        name: 'CheckDaysSchedule',
                        path: '/sos/dailyschedule/CreateDaysSchedule',
                        planned: '2016-08-05 0:00:01',
                        executed: '2016-08-09 0:00:02',
                        endOfExecution: '2016-08-09 0:00:05',
                        duration: '00:00:03',
                        exitCode: '0',
                        status: 'waiting',
                        tasks: [
                            {name: 'CheckDaysSchedule', from: new Date(), to: to}
                        ]
                    },
                    {
                        name: 'event_processor',
                        path: '/sos/dailyschedule/event_processor',
                        planned: '2016-08-05 0:00:01',
                        executed: '2016-08-09 0:00:02',
                        endOfExecution: '2016-08-09 0:00:05',
                        duration: '00:00:03',
                        exitCode: '0',
                        status: 'waiting',
                        tasks: [
                            {name: 'event_processor', from: new Date(), to: to}
                        ]
                    },
                    {
                        name: 'createDaysSchedule',
                        path: '/sos/dailyschedule/createDaysSchedule',
                        planned: '2016-08-05 0:00:01',
                        executed: '2016-08-09 0:00:02',
                        endOfExecution: '2016-08-09 0:00:05',
                        duration: '00:00:03',
                        exitCode: '0',
                        status: 'executed',
                        tasks: [
                            {name: 'createDaysSchedule', from: new Date(), to: to}
                        ]
                    },
                    {
                        name: 'createDaysSchedule02',
                        path: '/sos/dailyschedule/createDaysSchedule02',
                        planned: '2016-08-05 0:00:01',
                        executed: '2016-08-09 0:00:02',
                        endOfExecution: '2016-08-09 0:00:05',
                        duration: '00:00:03',
                        exitCode: '0',
                        status: 'executed',
                        tasks: [
                            {name: 'createDaysSchedule02', from: new Date(), to: to}
                        ]
                    }


                ];
            },
            getSampleTimespans: function () {
                return [
                    {
                        from: new Date(2013, 9, 21, 8, 0, 0),
                        to: new Date(2013, 9, 25, 15, 0, 0),
                        name: 'Sprint 1 Timespan'
                        //priority: undefined,
                        //classes: [],
                        //data: undefined
                    }
                ];
            }
        }
    }

})();

