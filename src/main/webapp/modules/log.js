/**
 * Created by sourabhagrawal on 25/04/17.
 *
 *
 * Main module of the application.
 */
(function () {
    'use strict';
     angular.module('myapp', []).controller('LogCtrl', function ($window, $location, $scope, $http, $sce) {

        var id = JSON.parse($window.sessionStorage.$SOS$scheduleIds).selected;
        var token = $window.sessionStorage.$SOS$accessTokenId;
        $scope.shareData = $location.search();
         if ($scope.shareData && $scope.shareData.orderId) {
             var orders = {};
             orders.jobschedulerId = id;
             orders.jobChain = $scope.shareData.jobChain;
             orders.orderId = $scope.shareData.orderId;
             orders.historyId = $scope.shareData.historyId;
             orders.mime = ['HTML'];

             $http.post('./api/order/log', orders, {
                 headers: {
                     'access_token': token,
'X-Access-Token': token,
                     'Content-Type': 'application/json'
                 }
             }).then(function (res) {
                 if (res.data.log)
                     $scope.logs = $sce.trustAsHtml(res.data.log.html);
             });
         }
        if($scope.shareData && $scope.shareData.taskId) {
            var tasks = {};
            tasks.jobschedulerId = id;
            tasks.taskId = $scope.shareData.taskId;
            tasks.mime = ['HTML'];

            $http.post('./api/task/log',tasks,{
                 headers: {
                     'access_token': token,
                     'X-Access-Token': token,
                     'Content-Type': 'application/json'
                 }
             }).then(function (res) {
                if (res.data.log)
                    $scope.logs = $sce.trustAsHtml(res.data.log.html);
            });
        }
    });
})();
