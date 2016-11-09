/**
 * Created by sourabhagrawal on 29/06/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('ResourceService', ResourceService)
        .service('ScheduleService', ScheduleService)
        .service('JobSchedulerService', JobSchedulerService)
        .service('DailyPlanService', DailyPlanService);

    ResourceService.$inject = ["$resource", "$q"];
    function ResourceService($resource, $q ) {
        return {
            get: function (jobschedulerId) {
                var deferred = $q.defer();
                var Lock = $resource('locks');
                Lock.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getLocksP: function (jobschedulerId) {
                var deferred = $q.defer();
                var Lock = $resource('locks/p');
                Lock.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getProcessClass: function (jobschedulerId) {
                var deferred = $q.defer();
                var ProcessClass = $resource('process_classes');
                ProcessClass.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getProcessClassP: function (jobschedulerId) {
                var deferred = $q.defer();
                var ProcessClass = $resource('process_classes/p');
                ProcessClass.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getLockConfiguration: function (path, jobschedulerId) {
                var deferred = $q.defer();
                var Configuration = $resource('lock/configuration');
                Configuration.save({lock: path, jobschedulerId: jobschedulerId,mime:['HTML'] },function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getProcessClassConfiguration: function (path, jobschedulerId) {
                var deferred = $q.defer();
                var Configuration = $resource('process_class/configuration');
                Configuration.save({processClass: path,jobschedulerId: jobschedulerId,mime:['HTML'] },function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            tree: function (filter) {
                var deferred = $q.defer();
                var Job = $resource('tree');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }


    ScheduleService.$inject = ["$resource", "$q" ];
    function ScheduleService($resource, $q ) {
        return {
            get: function (jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource('schedules');
                Schedule.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getSchedulesP: function (jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource('schedules/p');
                Schedule.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getScheduleP: function (schedule,jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource('schedule/p');
                Schedule.save({schedule:schedule,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getSchedule: function (schedule,jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource('schedule');
                Schedule.save({schedule:schedule,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            substitute: function (substitute,jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource('schedules/substitute');
                Schedule.save({jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (path,jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource('schedule/configuration');
                Schedule.save({schedule : path,jobschedulerId:jobschedulerId,mime:['HTML'] },function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            setRunTime: function (filter) {
                var deferred = $q.defer();
                var Schedule = $resource('schedule/set_run_time');
                Schedule.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getRunTime: function (filter) {
                var deferred = $q.defer();
                var Schedule = $resource('schedule/run_time');
                Schedule.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }

        }
    }

    JobSchedulerService.$inject=["$resource", "$q"];
    function JobSchedulerService($resource,$q){
        var clusterMembers;
        return{
            getSchedulerIds: function () {
                var deferred = $q.defer();
                var Schedule = $resource('jobscheduler/ids');
                Schedule.save(function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            switchSchedulerId: function (jobschedulerId) {
                var deferred = $q.defer();
                var Schedule = $resource('jobscheduler/switch');
                Schedule.save({jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            get: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource('jobscheduler');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobSchedulerP: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource('jobscheduler/p');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getAgents: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource('jobscheduler/agents');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getPermanentAgent: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource('jobscheduler/agents/p');
                JobChain.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
              getSupervisor: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/supervisor');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getSupervisorP: function (jobschedulerId) {
                console.log("getSupervisorP ");
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/supervisor/p');
                JobScheduler.save(jobschedulerId, function (resP) {
                    JobScheduler = $resource('jobscheduler/supervisor');
                    JobScheduler.save(jobschedulerId, function (res) {
                        resP.jobscheduler.state = res.jobscheduler.state;
                        resP.jobscheduler.os.distribution = 'Linux release 7.2.1511';
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
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/cluster/members/p');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },

            getClusterMembers: function (jobschedulerId) {
                var deferred = $q.defer();
                if(clusterMembers){
                     deferred.resolve(clusterMembers);
                }else{
                   var JobScheduler = $resource('jobscheduler/cluster/members');
                JobScheduler.save(jobschedulerId,function (res) {
                    clusterMembers=res;
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                }

                return deferred.promise;
            },

            getDatabase: function (jobschedulerId) {

                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/db');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getAgentCluster: function (filter) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/agent_clusters');
                JobScheduler.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getAgentClusterP: function (filter) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/agent_clusters/p');
                JobScheduler.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminate: function (host,port,jobschedulerId) {
                console.log("IN terminate "+host+" port "+port);
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/terminate');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
             restart: function (host,port,jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/restart');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateWithin: function (host,port,jobschedulerId,timeout) {
                console.log("IN terminate "+host+" port "+port);
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/terminate');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId,timeout:timeout},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
             restartWithin: function (host,port,jobschedulerId,timeout) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/restart');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId,timeout:timeout},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
             abort: function (host,port,jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/abort');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
             abortAndRestart: function (host,port,jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/abort_and_restart');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            pause: function (host,port, jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/pause');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            continue: function (host,port,jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/continue');
                JobScheduler.save({host:host,port:port,jobschedulerId:jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateCluster: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/cluster/terminate');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            restartCluster: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/cluster/restart');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateFailsafeCluster: function (jobschedulerId) {
                var deferred = $q.defer();
                var JobScheduler = $resource('jobscheduler/cluster/terminate_failsafe');
                JobScheduler.save(jobschedulerId,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
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

    DailyPlanService.$inject = ["$resource", "$q"];
    function DailyPlanService($resource, $q) {
        return{
            getPlans:function(filter){
                var deferred = $q.defer();
                var Plan = $resource('plan');
                Plan.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }

})();

