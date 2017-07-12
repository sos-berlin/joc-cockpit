/**
 * Created by sourabhagrawal on 25/04/17.
 *
 *
 * Main module of the application.
 */
(function () {
    'use strict';
    angular.module('myapp', []).controller('LogCtrl', ['$location', '$scope', '$http', '$sce', function ($location, $scope, $http, $sce) {
        function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }

        var id = getCookie('$SOS$scheduleId');
        var token = getCookie('$SOS$accessTokenId');

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
            }, function (err) {
                if (err.data && err.data.error) {
                    $scope.error = JSON.stringify(err.data.error);
                } else {
                    $scope.error = JSON.stringify(err.data);
                }
            });
        }
        else if ($scope.shareData && $scope.shareData.taskId) {
            var tasks = {};
            tasks.jobschedulerId = id;
            tasks.taskId = $scope.shareData.taskId;
            tasks.mime = ['HTML'];

            $http.post('./api/task/log', tasks, {
                headers: {
                    'access_token': token,
                    'X-Access-Token': token,
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.data.log)
                    $scope.logs = $sce.trustAsHtml(res.data.log.html);
            }, function (err) {
                if (err.data && err.data.error) {
                    $scope.error = JSON.stringify(err.data.error);
                } else {
                    $scope.error = JSON.stringify(err.data);
                }
            });
        }else{
            $scope.error = 'Missing Ids in URL';
        }
    }]);
})();
