/**
 * Created by sourabhagrawal on 31/05/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('JobChainService', JobChainService)
        .service('JobService', JobService)
        .service('TaskService', TaskService);

    JobChainService.$inject = ["$resource", "$q", "apiUrl"];
    function JobChainService($resource, $q, apiUrl) {
        return {
            selectedJobChain:undefined,
            get: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'job_chains');
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getJobChainsP: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'job_chains/p');
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getJobChainP: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'job_chain/p');
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getJobChain: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'job_chain');
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },

            stop: function (jobChains) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'job_chains/stop');
                JobChain.save(jobChains, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            unstop: function (jobChains) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'job_chains/unstop');
                JobChain.save(jobChains,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (path, jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'job_chain/configuration');
                JobChain.save({jobChain : path, jobschedulerId: jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
             histories: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'job_chain/history');
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            tree: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'tree');
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            }
        }
    }

    JobService.$inject = ["$resource", "$q", "apiUrl"];
    function JobService($resource, $q, apiUrl) {
        return {
            get: function (filter) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'jobs');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getJobsP: function (filter) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'jobs/p');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getJobP: function (filter) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'job/p');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            start: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'jobs/start');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            stop: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'jobs/stop');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            unstop: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'jobs/unstop');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            setRunTime: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'jobs/set_run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getRunTime: function (jobs) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'job/run_time');
                Order.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            endRunTime: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'jobs/end_run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            suspendRunTime: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'jobs/suspend_run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            continueRunTime: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'jobs/continue_run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (path, jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'job/configuration');
                JobChain.save({job:path,  jobschedulerId: jobschedulerId},function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getQueueOrders: function (jobs) {
                var deferred = $q.defer();
                var JobChain = $resource(apiUrl + 'job/order_queue');
                JobChain.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            stopNode: function (nodes) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'job_chain_nodes/stop');
                Job.save(nodes,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            skipNode: function (nodes) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'job_chain_nodes/skip');
                Job.save(nodes,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            activateNode: function (nodes) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'job_chain_nodes/activate');
                Job.save(nodes,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            }
        }
    }

    TaskService.$inject = ["$resource", "$q", "apiUrl"];
    function TaskService($resource, $q, apiUrl) {
        return {
            historys: function (filters) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'tasks/history');
                Job.save(filters,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            terminateAll: function (tasks) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'tasks/terminate');
                Job.save(tasks,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            terminateWithAll: function (tasks) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'tasks/terminate_within');
                Job.save(tasks,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            killAll: function (tasks) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'tasks/kill');
                Job.save(tasks,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            history: function (filter) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'task/history');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            log: function (filter) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'task/log');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            end: function (filter) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'task/end');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            }
      ,
            terminate: function (filter) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'task/terminate');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            terminateWith: function (taskId, filter) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'task/terminate_within');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
              kill: function (taskId, filter) {
                var deferred = $q.defer();
                var Job = $resource(apiUrl + 'task/kill');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            }

        }
    }

})();

