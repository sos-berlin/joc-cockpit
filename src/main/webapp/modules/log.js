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
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
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
            let url = window.location.href;
            if (!url) url = location.href;
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            let regexS = "[\\?&]" + name + "=([^&]*)";
            let regex = new RegExp(regexS);
            let results = regex.exec(url);
            return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, ""));
        }


        let id = getCookie('$SOS$scheduleId');
        let token = getCookie('$SOS$accessTokenId');
        $scope.loading = true;
        $scope.downloadUrl = '';
        $scope.shareData = $location.search();

        if ($scope.shareData && getParam("orderId")) {
            let orders = {
                jobschedulerId: id,
                jobChain: getParam("jobChain"),
                orderId: getParam("orderId"),
                historyId: getParam("historyId"),
                filename: getParam("filename"),
                mime: ['HTML']
            };
            $scope.downloadUrl = './api/order/log/download?historyId='+orders.historyId+'&jobschedulerId='+id+
                     '&orderId='+orders.orderId+'&jobChain='+orders.jobChain+'&filename='+orders.filename+'&accessToken='+ token;
            $http.post('./api/order/log', orders, {
                headers: {
                    'X-Access-Token': token,
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                $scope.loading = false;
                if (res.data)
                    $scope.logs = $sce.trustAsHtml(res.data);
                else
                    $scope.noData = 'No logs found';
            }, function (err) {
                if (err.data && err.data.error) {
                    $scope.error = JSON.stringify(err.data.error);
                } else {
                    $scope.error = JSON.stringify(err.data);
                }
                $scope.loading = false;
            });
        } else if ($scope.shareData && getParam("taskId")) {
            let tasks = {
                jobschedulerId: id,
                taskId: getParam("taskId"),
                filename: getParam("filename"),
                mime: ['HTML']
            };
            $scope.downloadUrl = './api/task/log/download?taskId='+tasks.taskId+'&filename='+tasks.filename+'&jobschedulerId='+id+'&accessToken='+ token;
            $http.post('./api/task/log', tasks, {
                headers: {
                    'X-Access-Token': token,
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.data)
                    $scope.logs = $sce.trustAsHtml(res.data);
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
        } else {
            $scope.loading = false;
            $scope.error = 'Internal error!! Please close the window and reopen.';
        }

        $scope.download = function () {
            document.getElementById("tmpFrame").src= $scope.downloadUrl;
        };
    }]);
})();
