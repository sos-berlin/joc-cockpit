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

        function getParam(name) {
            var url = window.location.href;
            var regex = new RegExp("[?&}" + name + "(=([^&]*)|&)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ""));
        }

        var id = getCookie('$SOS$scheduleId');
        var token = getCookie('$SOS$accessTokenId');
        $scope.loading = true;
        $scope.shareData = $location.search();




        if ($scope.shareData && getParam("orderId")) {
            var orders = {};
            orders.jobschedulerId = id;
            orders.jobChain = getParam("jobChain");
            orders.orderId = getParam("orderId");
            orders.historyId = getParam("historyId");
            orders.mime = ['HTML'];

            $http.post('./api/order/log', orders, {
                headers: {
                    'access_token': token,
                    'X-Access-Token': token,
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.data && res.data.log)
                    $scope.logs = $sce.trustAsHtml(res.data.log.html);
                else
                    $scope.noData = 'No logs found';
                $scope.loading = false;
            }, function (err) {
                if (err.data && err.data.error) {
                    $scope.error = JSON.stringify(err.data.error);
                } else {
                    $scope.error = JSON.stringify(err.data);
                }
                 $scope.loading = false;
            });
        }
        else if ($scope.shareData && getParam("taskId")) {
            var tasks = {};
            tasks.jobschedulerId = id;
            tasks.taskId = getParam("taskId");
            tasks.mime = ['HTML'];

            $http.post('./api/task/log', tasks, {
                headers: {
                    'access_token': token,
                    'X-Access-Token': token,
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.data && res.data.log)
                    $scope.logs = $sce.trustAsHtml(res.data.log.html);
                else
                    $scope.noData = 'No logs found';
                 $scope.loading = false;
            }, function (err) {
                if (err.data && err.data.error) {
                    $scope.error = JSON.stringify(err.data.error);
                } else {
                    $scope.error = JSON.stringify(err.data);
                }
                 $scope.loading = false;
            });
        }else{
            $scope.loading = false;
            $scope.error = 'Internal error!! Please close the window and reopen.';
        }
    }]);
})();
