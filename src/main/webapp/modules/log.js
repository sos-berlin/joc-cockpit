/**
 * Created by sourabhagrawal on 25/04/17.
 *
 *
 * Main module of the application.
 */
(function () {
    'use strict';
    angular.module('myapp', []).controller('LogCtrl', ['$location', '$scope', '$http', '$sce', function ($location, $scope, $http, $sce) {
        $scope.downloading = false;

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

        let abs_url = $location.absUrl();
        abs_url = abs_url.substring(0, abs_url.indexOf('log.html'));

        if ($scope.shareData && getParam("orderId")) {
            let orders = {
                jobschedulerId: id,
                jobChain: getParam("jobChain"),
                orderId: getParam("orderId"),
                historyId: getParam("historyId"),
                filename: getParam("filename"),
                mime: ['HTML']
            };
            $scope.downloadUrl = abs_url + 'joc/api/order/log/download?jobschedulerId=' + id +
                '&filename=' + orders.filename + '&accessToken=' + token;
            $http.post('./api/order/log', orders, {
                headers: {
                    'X-Access-Token': token,
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                $scope.loading = false;
                $scope.logs = $sce.trustAsHtml(res.data);
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
            $scope.downloadUrl = abs_url + 'joc/api/task/log/download?filename=' + tasks.filename + '&jobschedulerId=' + id + '&accessToken=' + token;
            $http.post('./api/task/log', tasks, {
                headers: {
                    'X-Access-Token': token,
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                $scope.logs = $sce.trustAsHtml(res.data);
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
            $scope.downloading = true;
            if (getParam("orderId")) {
                $http.post('./api/order/log/info', {
                    jobschedulerId: id,
                    jobChain: getParam("jobChain"),
                    orderId: getParam("orderId"),
                    historyId: getParam("historyId"),
                }, {
                    headers: {
                        'X-Access-Token': token,
                        'Content-Type': 'application/json'
                    }
                }).then(function (res) {
                    console.log(res.data.log);
                    document.getElementById("tmpFrame").src = './api/order/log/download?jobschedulerId=' + id +
                        '&filename=' + res.data.log.filename + '&accessToken=' + token;
                    $scope.downloading = false;
                     document.getElementById("tmpFrame").contentWindow.onerror = function() {
                        alert('Download error!!');
                        return false;
                    };
                }, function (err) {
                    $scope.downloading = false;
                    alert(JSON.stringify(err));
                });
            } else if (getParam("taskId")) {
                $http.post('./api/task/log/info', {
                    jobschedulerId: id,
                    taskId: getParam("taskId")
                }, {
                    headers: {
                        'X-Access-Token': token,
                        'Content-Type': 'application/json'
                    }
                }).then(function (res) {
                    console.log(res.data.log);
                    document.getElementById("tmpFrame").src = './api/task/log/download?jobschedulerId=' + id +
                        '&filename=' + res.data.log.filename + '&accessToken=' + token;
                    $scope.downloading = false;
                     document.getElementById("tmpFrame").contentWindow.onerror = function() {
                        alert('Download error!!');
                        return false;
                    };
                }, function (err) {
                    $scope.downloading = false;
                    alert(JSON.stringify(err));
                });
            }
        };
    }]);
})();
