/**
 * Created by sourabhagrawal on 31/05/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('OrderService', OrderService);

    OrderService.$inject = ["$resource", "$q", "apiUrl"];
    function OrderService($resource, $q, apiUrl) {
        return {
            get: function (filter) {

                var deferred = $q.defer();
                var Orders = $resource(apiUrl + 'orders');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getSimulated: function (res) {

                var deferred = $q.defer();
                deferred.resolve(res);
                return deferred.promise;
            },
            getOrdersP: function (filter) {

                var deferred = $q.defer();
                var Orders = $resource(apiUrl + 'orders/p');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },

            getJobOrdersP: function (jobChain,jobschedulerId) {
                var deferred = $q.defer();
                var jobChains = [];
                jobChains.job_chain = jobChain;
                var Orders = $resource(apiUrl + 'orders/p');
                Orders.save({orders: jobChains,jobschedulerId:jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getJobOrders: function (jobChain, jobschedulerId) {
                var deferred = $q.defer();
                var jobChains = [];
                jobChains.job_chain = jobChain;
                var Orders = $resource(apiUrl + 'orders');
                Orders.save({orders: jobChains,jobschedulerId:jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            log: function (filter) {
                var deferred = $q.defer();
                var Orders = $resource(apiUrl + 'order/log');
                Orders.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getSnapshot: function (filter) {
                var deferred = $q.defer();

                var Snapshot = $resource(apiUrl + 'orders/overview/snapshot');
                Snapshot.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getConfiguration: function (path,jobschedulerId) {
                var deferred = $q.defer();
                var Configuration = $resource(apiUrl + 'order/configuration');
                Configuration.save({order: path,jobschedulerId:jobschedulerId}, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            setOrderState: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/set_state');
                Order.save(orders, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            setRunTime: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/set_run_time');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            startOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/start');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            suspendOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/suspend');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            resumeOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/resume');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            resetOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/reset');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            removeOrder: function (orders) {

                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/remove');
                Order.save(orders, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            deleteOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/delete');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            addOrder: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'orders/add');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getRunTime: function (orders) {
                var deferred = $q.defer();
                var Order = $resource(apiUrl + 'order/run_time');
                Order.save(orders,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            historys: function (filter) {
                var deferred = $q.defer();
                var History = $resource(apiUrl + 'orders/history');
                History.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            histories: function (filter) {
                var deferred = $q.defer();
                var History = $resource(APIUrl + 'orders/history');
                History.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            history: function (filter) {
                var deferred = $q.defer();
                var History = $resource(apiUrl + 'order/history');
                History.save(filter,function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.resolve(err);
                });
                return deferred.promise;
            },
            getDailyPlanData: function(){
                return [

  {
    "processedBy": "",
    "job": "/sos/jitl/JobChainStart",
    "jobChain": "/examples/49_CriticalPath/02_JobChainB",
    "orderId": "02_Every_Saturday",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-10T12:06:11.483Z",
    "expectedEnd": "2016-09-10T13:42:11.483Z",
    "start": "",
    "end": "",
    "processClass": "",
    "stateText": "",
    "inProcessSince": "",
    "processingState": {
      "_text": "WAITING",
      "severity": 3
    },
    "taskId": 0,
    "state": "Start",
    "setback": "",
    "path": "/examples/49_CriticalPath/02_JobChainB,02_Every_Saturday",
    "surveyDate": "2016-09-06T12:25:50Z",
    "_type": "permanent"
  },
  {
    "processedBy": "",
    "job": "/examples/56_NestedJobChains/JobA100",
    "jobChain": "/examples/56_NestedJobChains/JobChainA",
    "orderId": "EOD",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-10T11:40:11.483Z",
    "expectedEnd": "2016-09-10T13:26:11.483Z",
    "start": "",
    "end": "",
    "processClass": "",
    "stateText": "JobB400 : job starting",
    "inProcessSince": "",
    "processingState": {
      "_text": "WAITING",
      "severity": 3
    },
    "taskId": 0,
    "state": "1",
    "setback": "",
    "path": "/examples/56_NestedJobChains/DailyProcess,EOD",
    "surveyDate": "2016-09-06T12:25:50Z",
    "_type": "permanent"
  },
  {
    "processedBy": "",
    "job": "/examples/09_VersionControl/01_Process01/01_TaskA1",
    "jobChain": "/examples/09_VersionControl/01_Process01/01_JobChainA",
    "orderId": "01_daily_morning",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-10T10:33:11.483Z",
    "expectedEnd": "2016-09-10T12:14:11.483Z",
    "start": "",
    "end": "",
    "processClass": "",
    "stateText": "01_TaskA5 : job starting",
    "inProcessSince": "",
    "processingState": {
      "_text": "WAITING",
      "severity": 3
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/09_VersionControl/01_Process01/01_JobChainA,01_daily_morning",
    "surveyDate": "2016-09-06T12:25:50Z",
    "_type": "permanent",
    "params": [
      {
        "value": "oracle.jdbc.driver.OracleDriver",
        "name": "include_db_driver"
      },
      {
        "value": "supersercret",
        "name": "include_db_password"
      },
      {
        "value": "jdbc:oracle:thin:@:1521:IORCL01",
        "name": "include_db_url"
      },
      {
        "value": "SOSOracleConnection",
        "name": "include_db_class"
      },
      {
        "value": "integration",
        "name": "include_system_type"
      },
      {
        "value": "strict",
        "name": "include_batch_failover"
      },
      {
        "value": "true",
        "name": "include_default_commit"
      },
      {
        "value": "int_scheduler",
        "name": "include_db_user"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/sos/jitl/JobChainStart",
    "jobChain": "/examples/31_Monitoring/03_JobChainMonMax",
    "orderId": "03_Start",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-10T09:16:11.483Z",
    "expectedEnd": "2016-09-10T11:22:11.483Z",
    "start": "",
    "end": "",
    "processClass": "",
    "stateText": "",
    "inProcessSince": "",
    "processingState": {
      "_text": "WAITING",
      "severity": 3
    },
    "taskId": 0,
    "state": "Start_JobChain",
    "setback": "",
    "path": "/examples/31_Monitoring/03_JobChainMonMax,03_Start",
    "surveyDate": "2016-09-06T12:25:50Z",
    "_type": "permanent"
  },
  {
    "processedBy": "",
    "job": "/examples/31_Monitoring/31_01_helper/ExecShell",
    "jobChain": "/examples/31_Monitoring/31_01_helper/ErrorRecoveryHelper",
    "orderId": "CreateFile",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-09T18:38:11.483Z",
    "expectedEnd": "2016-09-09T19:56:11.483Z",
    "start": "2016-09-09T18:38:11.483Z",
    "end": "2016-09-09T19:52:11.483Z",
    "processClass": "",
    "stateText": "",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/31_Monitoring/31_01_helper/ErrorRecoveryHelper,CreateFile",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "touch /var/tmp/FileMove.txt",
        "name": "command"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/20_SchedulingJobChains/01_Orderjob1",
    "jobChain": "/examples/20_SchedulingJobChains/01_JobChainDaily",
    "orderId": "DailyOrder",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-09T17:14:11.483Z",
    "expectedEnd": "2016-09-09T19:06:11.483Z",
    "start": "2016-09-09T17:18:11.483Z",
    "end": "2016-09-09T19:08:11.483Z",
    "processClass": "",
    "stateText": "01_Orderjob3 : job starting",
    "inProcessSince": "",
    "processingState": {
      "_text": "LATE",
      "severity": 5
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/20_SchedulingJobChains/01_JobChainDaily,DailyOrder",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent"
  },
  {
    "processedBy": "",
    "job": "/sos/jitl/JobChainStart",
    "jobChain": "/examples/03_DatabaseStatement/02_DatabaseStatments",
    "orderId": "02_execute_database_statement",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-09T16:38:11.484Z",
    "expectedEnd": "2016-09-09T17:51:11.483Z",
    "start": "2016-09-09T16:38:11.483Z",
    "end": "2016-09-09T17:48:11.483Z",
    "processClass": "",
    "stateText": "",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "taskId": 0,
    "state": "Start",
    "setback": "",
    "path": "/examples/03_DatabaseStatement/02_DatabaseStatments,02_execute_database_statement",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "select \"SCHEDULER_ID\", \"HOSTNAME\", \"TCP_PORT\" from SCHEDULER_INSTANCES;",
        "name": "command"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/Demo/RBCCM/job1",
    "jobChain": "/Demo/RBCCM/DailyBatchProcessing",
    "orderId": "daily_evening",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-09T15:51:11.484Z",
    "expectedEnd": "2016-09-09T17:47:11.483Z",
    "start": "2016-09-09T15:51:11.483Z",
    "end": "2016-09-09T16:24:11.483Z",
    "processClass": "",
    "stateText": "job7 : job starting",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 2
    },
    "taskId": 0,
    "state": "1",
    "setback": "",
    "path": "/Demo/RBCCM/DailyBatchProcessing,daily_evening",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent"
  },
  {
    "processedBy": "",
    "job": "/Demo/MCEBankEU/yade_upload_files",
    "jobChain": "/Demo/MCEBankEU/OutboundFileWorkflow",
    "orderId": "OutboundFile",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-09T14:34:11.484Z",
    "expectedEnd": "2016-09-09T15:56:11.483Z",
    "start": "2016-09-09T14:34:11.483Z",
    "end": "2016-09-09T15:52:11.483Z",
    "processClass": "",
    "stateText": "4 files found for regexp '^OUT[0-9]{3}.DAT$'.",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "taskId": 0,
    "state": "Outbound",
    "setback": "",
    "path": "/Demo/MCEBankEU/OutboundFileWorkflow,OutboundFile",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "/home/sos/data/to_galadriel/archive/outbound",
        "name": "archive_dir"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/57_BankCalendar/hello_world",
    "jobChain": "/examples/57_BankCalendar/hello",
    "orderId": "hello",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-09T13:42:11.484Z",
    "expectedEnd": "2016-09-09T15:36:11.483Z",
    "start": "2016-09-09T13:48:11.483Z",
    "end": "2016-09-09T15:42:11.483Z",
    "processClass": "",
    "stateText": "hello world2",
    "inProcessSince": "",
    "processingState": {
      "_text": "LATE",
      "severity": 5
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/57_BankCalendar/hello,hello",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent"
  },
  {
    "processedBy": "",
    "job": "/examples/31_Monitoring/02_ExecShell",
    "jobChain": "/examples/31_Monitoring/02_ErrorSuccess",
    "orderId": "Error",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-09T12:28:11.484Z",
    "expectedEnd": "2016-09-09T13:16:11.483Z",
    "start": "2016-09-09T12:28:11.483Z",
    "end": "2016-09-09T13:14:11.483Z",
    "processClass": "",
    "stateText": "",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/31_Monitoring/02_ErrorSuccess,Error",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "invalid command",
        "name": "command"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/31_Monitoring/02_ExecShell",
    "jobChain": "/examples/31_Monitoring/02_ErrorSuccess",
    "orderId": "02_Error",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-09T10:06:11.484Z",
    "expectedEnd": "2016-09-09T12:23:11.483Z",
    "start": "2016-09-09T10:06:11.483Z",
    "end": "2016-09-09T12:21:11.483Z",
    "processClass": "",
    "stateText": "",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/31_Monitoring/02_ErrorSuccess,02_Error",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "invalid command",
        "name": "command"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/31_Monitoring/02_ExecShell",
    "jobChain": "/examples/31_Monitoring/02_ErrorSuccess",
    "orderId": "02_Success",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-08T16:22:11.484Z",
    "expectedEnd": "2016-09-08T19:12:11.483Z",
    "start": "2016-09-08T16:22:11.483Z",
    "end": "2016-09-08T18:09:11.483Z",
    "processClass": "",
    "stateText": "'hello word'",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 2
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/31_Monitoring/02_ErrorSuccess,02_Success",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "echo 'hello word'",
        "name": "command"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/06_YADEFileTransfer/01_yade_file_transfer",
    "jobChain": "/examples/06_YADEFileTransfer/01_YADEFileTransfer",
    "orderId": "01_01_CopyLocahost2RemoteServer",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-08T15:48:11.484Z",
    "expectedEnd": "2016-09-08T18:29:11.483Z",
    "start": "2016-09-08T15:53:11.483Z",
    "end": "2016-09-08T18:34:11.483Z",
    "processClass": "",
    "stateText": "4 files found for regexp 'TRXDDLW[0-9]{4}.PDF'.",
    "inProcessSince": "",
    "processingState": {
      "_text": "LATE",
      "severity": 5
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/06_YADEFileTransfer/01_YADEFileTransfer,01_01_CopyLocahost2RemoteServer",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "CopyLocalhost2RemoteServer",
        "name": "profile"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/06_YADEFileTransfer/01_yade_file_transfer",
    "jobChain": "/examples/06_YADEFileTransfer/01_YADEFileTransfer",
    "orderId": "01_02_CopyRemoteServer2Localhost",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-08T14:31:11.484Z",
    "expectedEnd": "2016-09-08T15:48:11.483Z",
    "start": "2016-09-08T14:31:11.483Z",
    "end": "2016-09-08T15:43:11.483Z",
    "processClass": "",
    "stateText": "2 files found for regexp '^SOS-.*\\.xls$'.",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/06_YADEFileTransfer/01_YADEFileTransfer,01_02_CopyRemoteServer2Localhost",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "CopyRemoteServer2Localhost",
        "name": "profile"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/06_YADEFileTransfer/01_yade_file_transfer",
    "jobChain": "/examples/06_YADEFileTransfer/01_YADEFileTransfer",
    "orderId": "01_03_CopyAndRenameLocahost2RemoteServer",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-08T13:04:11.484Z",
    "expectedEnd": "2016-09-08T15:28:11.483Z",
    "start": "2016-09-08T13:04:11.483Z",
    "end": "2016-09-08T15:22:11.483Z",
    "processClass": "",
    "stateText": "checking file(s) for steady state",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/06_YADEFileTransfer/01_YADEFileTransfer,01_03_CopyAndRenameLocahost2RemoteServer",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "CopyRenameLocalhost2RemoteServer",
        "name": "profile"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/06_YADEFileTransfer/01_yade_file_transfer",
    "jobChain": "/examples/06_YADEFileTransfer/01_YADEFileTransfer",
    "orderId": "01_04_CopyServer2Server",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-08T12:11:11.484Z",
    "expectedEnd": "2016-09-08T13:14:11.483Z",
    "start": "2016-09-08T12:14:11.483Z",
    "end": "2016-09-08T13:21:11.483Z",
    "processClass": "",
    "stateText": "3 files found for regexp '^Test[0-9]{2}.txt$'.",
    "inProcessSince": "",
    "processingState": {
      "_text": "LATE",
      "severity": 5
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/06_YADEFileTransfer/01_YADEFileTransfer,01_04_CopyServer2Server",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "CopyServer2Server",
        "name": "profile"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/06_YADEFileTransfer/01_yade_file_transfer",
    "jobChain": "/examples/06_YADEFileTransfer/01_YADEFileTransfer",
    "orderId": "01_05_PollingCopyRemoteServer2Localhost",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-08T11:50:11.484Z",
    "expectedEnd": "2016-09-08T15:05:11.483Z",
    "start": "2016-09-08T11:50:11.483Z",
    "end": "2016-09-08T14:02:11.483Z",
    "processClass": "",
    "stateText": "1 files found for regexp '^SOS-.*20.02.2015.xls$'.",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 2
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/06_YADEFileTransfer/01_YADEFileTransfer,01_05_PollingCopyRemoteServer2Localhost",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "true",
        "name": "remove_files"
      },
      {
        "value": "PollingCopyRemoteServer2Localhost",
        "name": "profile"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/06_YADEFileTransfer/01_yade_file_transfer",
    "jobChain": "/examples/06_YADEFileTransfer/01_YADEFileTransfer",
    "orderId": "01_06_CopyWebDAV2LocalServer",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-08-09T10:03:11.484Z",
    "expectedEnd": "2016-09-08T11:22:11.483Z",
    "start": "2016-09-08T10:03:11.483Z",
    "end": "2016-09-08T11:18:11.483Z",
    "processClass": "",
    "stateText": "1 files found for regexp '.*'.",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/06_YADEFileTransfer/01_YADEFileTransfer,01_06_CopyWebDAV2LocalServer",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent",
    "params": [
      {
        "value": "false",
        "name": "remove_files"
      },
      {
        "value": "CopyWebDAV2LocalServer",
        "name": "profile"
      }
    ]
  },
  {
    "processedBy": "",
    "job": "/examples/20_SchedulingJobChains/01_Orderjob1",
    "jobChain": "/examples/20_SchedulingJobChains/01_JobChainWeekly",
    "orderId": "WeeklyOrder",
    "lock": "",
    "endState": "",
    "nextStartTime": "2016-09-08T09:15:11.484Z",
    "expectedEnd": "2016-09-08T11:00:11.483Z",
    "start": "2016-09-08T09:15:11.483Z",
    "end": "2016-09-08T11:00:11.483Z",
    "processClass": "",
    "stateText": "01_Orderjob3 : job starting",
    "inProcessSince": "",
    "processingState": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "taskId": 0,
    "state": "100",
    "setback": "",
    "path": "/examples/20_SchedulingJobChains/01_JobChainWeekly,WeeklyOrder",
    "surveyDate": "2016-09-06T12:25:51Z",
    "_type": "permanent"
  },
  {
    "nextPeriodBegin": "",
    "name": "01_TaskA1",
    "numOfQueuedTasks": 0,
    "allTasks": 234,
    "stateText": "01_TaskA1 : job starting",
    "state": {
      "_text": "WAITING",
      "severity": 3
    },
    "numOfRunningTasks": 0,
    "path": "/examples/37_JobChainExitCodeHandling/01_TaskA1",
    "surveyDate": "2016-09-06T12:25:16Z",
    "allSteps": 234,
    "nextStartTime": "2016-09-10T15:38:13.952Z",
    "expectedEnd": "2016-09-10T17:17:11.483Z",
    "start": "",
    "end": ""
  },
  {
    "nextPeriodBegin": "",
    "name": "02_JobChainStart",
    "numOfQueuedTasks": 0,
    "allTasks": 1,
    "stateText": "",
    "state": {
      "_text": "WAITING",
      "severity": 3
    },
    "numOfRunningTasks": 0,
    "path": "/examples/16_SplitAndSync/02_JobChainStart",
    "surveyDate": "2016-09-06T12:25:16Z",
    "allSteps": 1,
    "nextStartTime": "2016-09-10T13:21:13.954Z",
    "expectedEnd": "2016-09-10T14:44:11.483Z",
    "start": "",
    "end": ""
  },
  {
    "nextPeriodBegin": "",
    "name": "01_TaskA2",
    "numOfQueuedTasks": 0,
    "allTasks": 234,
    "stateText": "01_TaskA2 : job starting",
    "state": {
      "_text": "WAITING",
      "severity": 3
    },
    "numOfRunningTasks": 0,
    "path": "/examples/37_JobChainExitCodeHandling/01_TaskA2",
    "surveyDate": "2016-09-06T12:25:16Z",
    "allSteps": 234,
    "nextStartTime": "2016-09-10T11:25:13.956Z",
    "expectedEnd": "2016-09-10T12:48:11.483Z",
    "start": "",
    "end": ""
  },
  {
    "nextPeriodBegin": "",
    "name": "01_TaskA3",
    "numOfQueuedTasks": 0,
    "allTasks": 330,
    "stateText": "Order restarts job in 1 hour",
    "ordersSummary": {
      "suspended": 1
    },
    "state": {
      "_text": "WAITING",
      "severity": 3
    },
    "numOfRunningTasks": 0,
    "orderQueue": [
      {
        "processedBy": "",
        "job": "/examples/37_JobChainExitCodeHandling/01_TaskA3",
        "jobChain": "/examples/37_JobChainExitCodeHandling/01_JobChainA",
        "orderId": "ExitCode_1",
        "lock": "",
        "endState": "",
        "processClass": "",
        "stateText": "01_TaskA3 : job starting",
        "inProcessSince": "",
        "historyId": 487302,
        "processingState": {
          "_text": "SUSPENDED",
          "severity": 2
        },
        "taskId": 0,
        "state": "300",
        "setback": "",
        "path": "/examples/37_JobChainExitCodeHandling/01_JobChainA,ExitCode_1",
        "surveyDate": "2016-09-06T12:25:16Z",
        "_type": "permanent",
        "params": [
          {
            "value": "1",
            "name": "process_exit_code"
          },
          {
            "value": "1",
            "name": "order_param_exit_code"
          }
        ]
      }
    ],
    "path": "/examples/37_JobChainExitCodeHandling/01_TaskA3",
    "surveyDate": "2016-09-06T12:25:16Z",
    "allSteps": 330,
    "nextStartTime": "2016-09-10T09:08:13.957Z",
    "expectedEnd": "2016-09-10T11:17:11.483Z",
    "start": "",
    "end": ""
  },
  {
    "nextPeriodBegin": "",
    "name": "02_yade_file_transfer_dmz",
    "numOfQueuedTasks": 0,
    "allTasks": 2,
    "stateText": "*** ended without Errors ***",
    "ordersSummary": {
      "pending": 2
    },
    "state": {
      "_text": "LATE",
      "severity": 5
    },
    "numOfRunningTasks": 0,
    "params": [
      {
        "value": "/mnt/r2d2/backup/sos/JADE-Demo-Examples/jade_settings.ini",
        "name": "settings"
      },
      {
        "value": "myprofile",
        "name": "profile"
      }
    ],
    "orderQueue": [
      {
        "processedBy": "",
        "job": "/examples/06_YADEFileTransfer/02_yade_file_transfer_dmz",
        "jobChain": "/examples/06_YADEFileTransfer/02_YADEFIleTransferDMZ",
        "orderId": "02_01_CopyLocalhost2RemoteViaDMZ",
        "lock": "",
        "endState": "",
        "nextStartTime": "2016-09-09T18:24:11.483Z",
        "expectedEnd": "2016-09-09T19:33:11.483Z",
        "start": "2016-09-09T18:24:11.483Z",
        "end": "2016-09-09T19:31:11.483Z",
        "processClass": "",
        "stateText": "",
        "inProcessSince": "",
        "processingState": {
          "_text": "EXECUTED",
          "severity": 0
        },
        "taskId": 0,
        "state": "100",
        "setback": "",
        "path": "/examples/06_YADEFileTransfer/02_YADEFIleTransferDMZ,02_01_CopyLocalhost2RemoteViaDMZ",
        "surveyDate": "2016-09-06T12:25:16Z",
        "_type": "permanent",
        "params": [
          {
            "value": "CopyToInternetViaDMZ",
            "name": "profile"
          }
        ]
      },
      {
        "processedBy": "",
        "job": "/examples/06_YADEFileTransfer/02_yade_file_transfer_dmz",
        "jobChain": "/examples/06_YADEFileTransfer/02_YADEFIleTransferDMZ",
        "orderId": "02_02_CopyRemote2LocalhostViaDMZ",
        "lock": "",
        "endState": "",
        "nextStartTime": "2016-09-09T19:35:11.483Z",
        "expectedEnd": "2016-09-09T20:54:11.483Z",
        "start": "2016-09-09T19:35:11.483Z",
        "end": "2016-09-09T20:51:11.483Z",
        "processClass": "",
        "stateText": "",
        "inProcessSince": "",
        "processingState": {
          "_text": "EXECUTED",
          "severity": 0
        },
        "taskId": 0,
        "state": "100",
        "setback": "",
        "path": "/examples/06_YADEFileTransfer/02_YADEFIleTransferDMZ,02_02_CopyRemote2LocalhostViaDMZ",
        "surveyDate": "2016-09-06T12:25:16Z",
        "_type": "permanent",
        "params": [
          {
            "value": "CopyFromInternetViaDMZ",
            "name": "profile"
          }
        ]
      }
    ],
    "path": "/examples/06_YADEFileTransfer/02_yade_file_transfer_dmz",
    "surveyDate": "2016-09-06T12:25:16Z",
    "allSteps": 1,
    "nextStartTime": "2016-09-09T18:07:13.958Z",
    "expectedEnd": "2016-09-09T21:18:11.483Z",
    "start": "2016-09-09T18:11:11.483Z",
    "end": "2016-09-09T21:20:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "01_TaskA4",
    "numOfQueuedTasks": 0,
    "allTasks": 78,
    "stateText": "01_TaskA4 : job starting",
    "state": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "numOfRunningTasks": 0,
    "path": "/examples/37_JobChainExitCodeHandling/01_TaskA4",
    "surveyDate": "2016-09-06T12:25:16Z",
    "allSteps": 78,
    "nextStartTime": "2016-09-09T17:48:13.959Z",
    "expectedEnd": "2016-09-09T19:29:11.483Z",
    "start": "2016-09-09T17:48:11.483Z",
    "end": "2016-09-09T19:25:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "01_TaskA5",
    "numOfQueuedTasks": 0,
    "allTasks": 156,
    "stateText": "01_TaskA5 : job starting",
    "state": {
      "_text": "LATE",
      "severity": 5
    },
    "numOfRunningTasks": 0,
    "path": "/examples/37_JobChainExitCodeHandling/01_TaskA5",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 156,
    "nextStartTime": "2016-09-09T16:36:13.960Z",
    "expectedEnd": "2016-09-09T18:20:11.483Z",
    "start": "2016-09-09T16:41:11.483Z",
    "end": "2016-09-09T18:23:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "02_TaskE2_P1",
    "numOfQueuedTasks": 0,
    "allTasks": 0,
    "stateText": "",
    "state": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "numOfRunningTasks": 0,
    "params": [
      {
        "value": "echo hello world",
        "name": "command"
      }
    ],
    "path": "/examples/14_JobChainsEvents/02_TaskE2_P1",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 0,
    "nextStartTime": "2016-09-09T15:47:13.961Z",
    "expectedEnd": "2016-09-09T18:06:11.483Z",
    "start": "2016-09-09T15:47:11.483Z",
    "end": "2016-09-09T18:05:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "02_TaskD7_P3",
    "numOfQueuedTasks": 0,
    "allTasks": 0,
    "stateText": "",
    "state": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "numOfRunningTasks": 0,
    "path": "/examples/14_JobChainsEvents/02_TaskD7_P3",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 0,
    "nextStartTime": "2016-09-09T14:36:13.962Z",
    "expectedEnd": "2016-09-09T15:57:11.483Z",
    "start": "2016-09-09T14:36:11.483Z",
    "end": "2016-09-09T15:55:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "01_SendMail",
    "numOfQueuedTasks": 0,
    "allTasks": 0,
    "stateText": "",
    "state": {
      "_text": "EXECUTED",
      "severity": 2
    },
    "numOfRunningTasks": 0,
    "params": [
      {
        "value": "mail address from parameter file",
        "name": "body"
      },
      {
        "value": "mail.sos-berlin.com",
        "name": "host"
      },
      {
        "value": "using parameter file",
        "name": "Subject"
      },
      {
        "value": "mp@sos-berlin.com",
        "name": "to"
      }
    ],
    "path": "/examples/34_ParameterFile/01_SendMail",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 0,
    "nextStartTime": "2016-09-09T13:49:13.963Z",
    "expectedEnd": "2016-09-09T15:34:11.483Z",
    "start": "2016-09-09T13:49:11.483Z",
    "end": "2016-09-09T14:58:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "01_TaskB1",
    "numOfQueuedTasks": 0,
    "allTasks": 156,
    "stateText": "01_TaskB1 : job starting",
    "state": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "numOfRunningTasks": 0,
    "path": "/examples/17_DynamicProcessRouting/01_TaskB1",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 156,
    "nextStartTime": "2016-09-09T12:21:13.964Z",
    "expectedEnd": "2016-09-09T13:43:11.483Z",
    "start": "2016-09-09T12:21:11.483Z",
    "end": "2016-09-09T13:43:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "01_TaskB2",
    "numOfQueuedTasks": 0,
    "allTasks": 156,
    "stateText": "01_TaskB2 : job starting",
    "state": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "numOfRunningTasks": 0,
    "path": "/examples/17_DynamicProcessRouting/01_TaskB2",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 156,
    "nextStartTime": "2016-09-09T10:08:13.965Z",
    "expectedEnd": "2016-09-09T11:48:11.483Z",
    "start": "2016-09-09T10:08:11.483Z",
    "end": "2016-09-09T11:47:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "job1",
    "numOfQueuedTasks": 0,
    "allTasks": 78,
    "stateText": "job1 : job starting",
    "ordersSummary": {
      "pending": 1
    },
    "state": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "numOfRunningTasks": 0,
    "orderQueue": [
      {
        "processedBy": "",
        "job": "/Demo/RBCCM/job1",
        "jobChain": "/Demo/RBCCM/DailyBatchProcessing",
        "orderId": "daily_evening",
        "lock": "",
        "endState": "",
        "nextStartTime": "2016-09-08T18:51:11.483Z",
        "expectedEnd": "2016-09-08T19:38:11.483Z",
        "start": "2016-09-08T18:51:11.483Z",
        "end": "2016-09-08T19:32:11.483Z",
        "processClass": "",
        "stateText": "job7 : job starting",
        "inProcessSince": "",
        "processingState": {
          "_text": "EXECUTED",
          "severity": 2
        },
        "taskId": 0,
        "state": "1",
        "setback": "",
        "path": "/Demo/RBCCM/DailyBatchProcessing,daily_evening",
        "surveyDate": "2016-09-06T12:25:17Z",
        "_type": "permanent"
      }
    ],
    "path": "/Demo/RBCCM/job1",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 78,
    "nextStartTime": "2016-09-08T18:42:13.966Z",
    "expectedEnd": "2016-09-08T20:11:11.483Z",
    "start": "2016-09-08T18:42:11.483Z",
    "end": "2016-09-08T20:08:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "01_TaskB3",
    "numOfQueuedTasks": 0,
    "allTasks": 78,
    "stateText": "01_TaskB3 : job starting",
    "state": {
      "_text": "LATE",
      "severity": 5
    },
    "numOfRunningTasks": 0,
    "path": "/examples/17_DynamicProcessRouting/01_TaskB3",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 78,
    "nextStartTime": "2016-09-08T17:08:13.967Z",
    "expectedEnd": "2016-09-08T18:29:11.483Z",
    "start": "2016-09-08T17:11:11.483Z",
    "end": "2016-09-08T18:30:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "job2",
    "numOfQueuedTasks": 0,
    "allTasks": 78,
    "stateText": "job2 : job starting",
    "state": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "numOfRunningTasks": 0,
    "path": "/Demo/RBCCM/job2",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 78,
    "nextStartTime": "2016-09-08T15:51:13.968Z",
    "expectedEnd": "2016-09-08T17:14:11.483Z",
    "start": "2016-09-08T15:51:11.483Z",
    "end": "2016-09-08T17:14:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "01_TaskB4",
    "numOfQueuedTasks": 0,
    "allTasks": 156,
    "stateText": "01_TaskB4 : job starting",
    "state": {
      "_text": "EXECUTED",
      "severity": 2
    },
    "numOfRunningTasks": 0,
    "path": "/examples/17_DynamicProcessRouting/01_TaskB4",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 156,
    "nextStartTime": "2016-09-08T14:33:13.969Z",
    "expectedEnd": "2016-09-08T15:56:11.483Z",
    "start": "2016-09-08T14:33:11.483Z",
    "end": "2016-09-08T15:03:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "job3",
    "numOfQueuedTasks": 0,
    "allTasks": 78,
    "stateText": "job3 : job starting",
    "state": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "numOfRunningTasks": 0,
    "path": "/Demo/RBCCM/job3",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 78,
    "nextStartTime": "2016-09-08T12:51:13.970Z",
    "expectedEnd": "2016-09-08T14:17:11.483Z",
    "start": "2016-09-08T13:51:11.483Z",
    "end": "2016-09-08T14:15:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "01_TaskB5",
    "numOfQueuedTasks": 0,
    "allTasks": 156,
    "stateText": "01_TaskB5 : job starting",
    "state": {
      "_text": "LATE",
      "severity": 5
    },
    "numOfRunningTasks": 0,
    "path": "/examples/17_DynamicProcessRouting/01_TaskB5",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 156,
    "nextStartTime": "2016-09-08T11:23:13.970Z",
    "expectedEnd": "2016-09-08T13:06:11.483Z",
    "start": "2016-09-08T11:27:11.483Z",
    "end": "2016-09-08T13:07:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "job4",
    "numOfQueuedTasks": 0,
    "allTasks": 78,
    "stateText": "job4 : job starting",
    "state": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "numOfRunningTasks": 0,
    "path": "/Demo/RBCCM/job4",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 78,
    "nextStartTime": "2016-09-08T10:18:13.971Z",
    "expectedEnd": "2016-09-08T11:49:11.483Z",
    "start": "2016-09-08T10:18:11.483Z",
    "end": "2016-09-08T11:43:11.483Z"
  },
  {
    "nextPeriodBegin": "",
    "name": "01_Job04",
    "numOfQueuedTasks": 0,
    "allTasks": 1,
    "stateText": "01_Job04 : job starting",
    "state": {
      "_text": "EXECUTED",
      "severity": 0
    },
    "numOfRunningTasks": 0,
    "path": "/examples/16_SplitAndSync/01_Job04",
    "surveyDate": "2016-09-06T12:25:17Z",
    "allSteps": 1,
    "nextStartTime": "2016-09-08T09:08:13.972Z",
    "expectedEnd": "2016-09-08T10:12:11.483Z",
    "start": "2016-09-08T09:08:11.483Z",
    "end": "2016-09-08T10:12:11.483Z"
  }

                ]
            }


        }
    }


})();

