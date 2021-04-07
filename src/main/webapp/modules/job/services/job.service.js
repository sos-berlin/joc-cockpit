/**
 * Created by sourabhagrawal on 31/05/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('JobChainService', JobChainService)
        .service('JobService', JobService)
        .service('TaskService', TaskService)
        .service('ConditionService', ConditionService);

    JobChainService.$inject = ["$resource", "$q","$window"];
    function JobChainService($resource, $q,$window) {
        return {
            selectedJobChain:undefined,
            get: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chains');
                JobChain.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobChainsP: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chains/p');
                JobChain.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobChainP: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chain/p');
                JobChain.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobChain: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chain');
                JobChain.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },

            stop: function (jobChains) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chains/stop');
                JobChain.save(jobChains, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            unstop: function (jobChains) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chains/unstop');
                JobChain.save(jobChains,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
             histories: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chain/history');
                 filter.maxLastHistoryItems =JSON.parse($window.sessionStorage.preferences).maxHistoryPerJobchain;
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            tree: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('tree');
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            assign: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chain/documentation/assign');
                JobChain.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            unassign: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chain/documentation/unassign');
                JobChain.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }

    JobService.$inject = ["$resource", "$q","$window"];
    function JobService($resource, $q,$window) {
        return {
            get: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('jobs');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobsP: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('jobs/p');
                filter.withoutDuration = true;
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobP: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('job/p');
                filter.withoutDuration = true;
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJob: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('job');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            start: function (jobs) {
                let deferred = $q.defer();
                let Job = $resource('jobs/start');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            stop: function (jobs) {
                let deferred = $q.defer();
                let Job = $resource('jobs/stop');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            unstop: function (jobs) {
                let deferred = $q.defer();
                let Job = $resource('jobs/unstop');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            setRunTime: function (jobs) {
                let deferred = $q.defer();
                let Job = $resource('jobs/set_run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            resetRunTime: function (jobs) {
                let deferred = $q.defer();
                let Job = $resource('jobs/reset_run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getRunTime: function (jobs) {
                let deferred = $q.defer();
                let Job = $resource('job/run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getQueueOrders: function (jobs) {
                let deferred = $q.defer();
                let Job = $resource('job/order_queue');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            stopNode: function (nodes) {
                let deferred = $q.defer();
                let Job = $resource('job_chain_nodes/stop');
                Job.save(nodes,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            skipNode: function (nodes) {
                let deferred = $q.defer();
                let Job = $resource('job_chain_nodes/skip');
                Job.save(nodes,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            activateNode: function (nodes) {
                let deferred = $q.defer();
                let Job = $resource('job_chain_nodes/activate');
                Job.save(nodes,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            tree: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('tree');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            history: function (filter) {
                let deferred = $q.defer();
                filter.maxLastHistoryItems=JSON.parse($window.sessionStorage.preferences).maxHistoryPerTask;
                let Job = $resource('job/history');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getcalendars: function (jobs) {
                let deferred = $q.defer();
                let Calendar = $resource('job/calendars');
                Calendar.save(jobs, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getSnapshot: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('jobs/overview/snapshot');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getSummary: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('jobs/overview/summary');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            assign: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('job/documentation/assign');
                Job.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            unassign: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('job/documentation/unassign');
                Job.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }

    TaskService.$inject = ["$resource", "$q","$http"];
    function TaskService($resource, $q,$http) {
        return {
            histories: function (filters) {
                let deferred = $q.defer();
                let Job = $resource('tasks/history');
                Job.save(filters,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateAll: function (tasks) {
                let deferred = $q.defer();
                let Job = $resource('tasks/terminate');
                Job.save(tasks,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateWithAll: function (tasks) {
                let deferred = $q.defer();
                let Job = $resource('tasks/terminate_within');
                Job.save(tasks,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            killAll: function (tasks) {
                let deferred = $q.defer();
                let Job = $resource('tasks/kill');
                Job.save(tasks,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            log: function (filter, timout) {
                return $http.post('task/log', filter, timout);
            },
            end: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('tasks/end');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminate: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('tasks/terminate');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateWith: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('tasks/terminate_within');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
              kill: function (filter) {
                let deferred = $q.defer();
                let Job = $resource('tasks/kill');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            info: function (obj) {
                let deferred = $q.defer();
                let Info = $resource('task/log/info');
                Info.save(obj, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }

        }
    }

    ConditionService.$inject = ["$resource", "$q"];
    function ConditionService($resource, $q) {
        return {
            workflowTree: function (filter) {
                let deferred = $q.defer();
                let Conditions = $resource('jobstreams/jobstream_folders');
                Conditions.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            inCondition: function (filters) {
                let deferred = $q.defer();
                let Condition = $resource('jobstreams/in_conditions');
                Condition.save(filters, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            outCondition: function (tasks) {
                let deferred = $q.defer();
                let Condition = $resource('jobstreams/out_conditions');
                Condition.save(tasks, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            updateInCondition: function (tasks) {
                let deferred = $q.defer();
                let Condition = $resource('jobstreams/edit/in_condition');
                Condition.save(tasks, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            updateOutCondition: function (filter) {
                let deferred = $q.defer();
                let Condition = $resource('jobstreams/edit/out_condition');
                Condition.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            resetWorkflow: function (filter) {
                let deferred = $q.defer();
                let Condition = $resource('jobstreams/resetjobstream');
                Condition.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }, startConditionResolver: function (filter) {
                let deferred = $q.defer();
                let Condition = $resource('jobstreams/start_condition_resolver');
                Condition.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getEvents: function (filter) {
                let deferred = $q.defer();
                let Event = $resource('jobstreams/eventlist');
                Event.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getExpressionEvents: function (filter) {
                let deferred = $q.defer();
                let Event = $resource('jobstreams/expression_events');
                Event.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            addEvent: function (filter) {
                let deferred = $q.defer();
                let Event = $resource('jobstreams/event/add');
                Event.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }, deleteEvent: function (filter) {
                let deferred = $q.defer();
                let Event = $resource('jobstreams/event/delete');
                Event.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            addJobStream: function (filter) {
                const deferred = $q.defer();
                let JobStream = $resource('jobstreams/add');
                JobStream.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            editJobStream: function (filter) {
                const deferred = $q.defer();
                let JobStream = $resource('jobstreams/edit_jobstream');
                JobStream.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deleteJobStream: function (filter) {
                const deferred = $q.defer();
                let JobStream = $resource('jobstreams/delete');
                JobStream.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobStreams: function (filter) {
                const deferred = $q.defer();
                let JobStream = $resource('jobstreams/list');
                JobStream.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getSessions: function (filter) {
                const deferred = $q.defer();
                let Session = $resource('jobstreams/sessions');
                Session.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            updateState: function (filter) {
                const deferred = $q.defer();
                let Session = $resource('jobstreams/sessions/updatestate');
                Session.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            editJobStreamStarter: function (filter) {
                const deferred = $q.defer();
                let JobStream = $resource('jobstreams/edit_jobstream_starters');
                JobStream.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deleteJobStreamStarter: function (filter) {
                const deferred = $q.defer();
                let JobStream = $resource('jobstreams/delete_jobstream_starters');
                JobStream.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            startJobStreamStarter: function (filter) {
                const deferred = $q.defer();
                let JobStream = $resource('jobstreams/start');
                JobStream.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            startJob: function (filter) {
                const deferred = $q.defer();
                let Job = $resource('jobstreams/startjob');
                Job.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            history: function (filter) {
                let deferred = $q.defer();
                let History = $resource('jobstreams/history');
                History.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }

})();

