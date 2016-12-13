/**
 * Created by sourabhagrawal on 31/05/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('JobChainService', JobChainService)
        .service('JobService', JobService)
        .service('TaskService', TaskService);

    JobChainService.$inject = ["$resource", "$q"];
    function JobChainService($resource, $q) {
        return {
            selectedJobChain:undefined,
            get: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chains');
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobChainsP: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chains/p');
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobChainP: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chain/p');
                JobChain.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobChain: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chain');
                JobChain.save(filter,function (res) {
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
            getConfiguration: function (path, jobschedulerId) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chain/configuration');
                JobChain.save({jobChain : path, jobschedulerId: jobschedulerId,mime:['HTML'] },function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
             histories: function (filter) {
                var deferred = $q.defer();
                var JobChain = $resource('job_chain/history');
                 filter.maxLastHistoryItems =30;
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
            }
        }
    }

    JobService.$inject = ["$resource", "$q"];
    function JobService($resource, $q) {
        return {
            get: function (filter) {
                var deferred = $q.defer();
                var Job = $resource('jobs');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobsP: function (filter) {
                var deferred = $q.defer();
                var Job = $resource('jobs/p');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJobP: function (filter) {
                var deferred = $q.defer();
                var Job = $resource('job/p');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJob: function (filter) {
                var deferred = $q.defer();
                var Job = $resource('job');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            start: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource('jobs/start');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            stop: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource('jobs/stop');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            unstop: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource('jobs/unstop');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            setRunTime: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource('jobs/set_run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getRunTime: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource('job/run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            endRunTime: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource('jobs/end_run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            suspendRunTime: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource('jobs/suspend_run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            continueRunTime: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource('jobs/continue_run_time');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (path, jobschedulerId) {
                var deferred = $q.defer();
                var Job = $resource('job/configuration');
                Job.save({job:path,  jobschedulerId: jobschedulerId,mime:['HTML'] },function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getQueueOrders: function (jobs) {
                var deferred = $q.defer();
                var Job = $resource('job/order_queue');
                Job.save(jobs,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            stopNode: function (nodes) {
                var deferred = $q.defer();
                var Job = $resource('job_chain_nodes/stop');
                Job.save(nodes,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            skipNode: function (nodes) {
                var deferred = $q.defer();
                var Job = $resource('job_chain_nodes/skip');
                Job.save(nodes,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            activateNode: function (nodes) {
                var deferred = $q.defer();
                var Job = $resource('job_chain_nodes/activate');
                Job.save(nodes,function (res) {
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
            },
            history: function (filter) {
                var deferred = $q.defer();
                filter.maxLastHistoryItems=30;
                var Job = $resource('job/history');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }

    TaskService.$inject = ["$resource", "$q"];
    function TaskService($resource, $q) {
        return {
            histories: function (filters) {
                var deferred = $q.defer();
                var Job = $resource('tasks/history');
                Job.save(filters,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateAll: function (tasks) {
                var deferred = $q.defer();
                var Job = $resource('tasks/terminate');
                Job.save(tasks,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateWithAll: function (tasks) {
                var deferred = $q.defer();
                var Job = $resource('tasks/terminate_within');
                Job.save(tasks,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            killAll: function (tasks) {
                var deferred = $q.defer();
                var Job = $resource('tasks/kill');
                Job.save(tasks,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            history: function (filter) {
                var deferred = $q.defer();
                var Job = $resource('task/history');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            log: function (filter) {
                var deferred = $q.defer();
                var Job = $resource('task/log');
                Job.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            end: function (filter) {
                var deferred = $q.defer();
                var Job = $resource('task/end');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
      ,
            terminate: function (filter) {
                var deferred = $q.defer();
                var Job = $resource('task/terminate');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            terminateWith: function (taskId, filter) {
                var deferred = $q.defer();
                var Job = $resource('task/terminate_within');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
              kill: function (taskId, filter) {
                var deferred = $q.defer();
                var Job = $resource('task/kill');
                Job.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }

        }
    }

})();

