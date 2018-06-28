/**
 * Created by sourabhagrawal on 25/04/17.
 *
 *
 * Main module of the application.
 */
(function () {
    'use strict';
    angular.module('myapp', []).controller('LogCtrl', ['$location', '$scope', '$http', '$sce','$q','$interval', function ($location, $scope, $http, $sce, $q, $interval) {

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
        $scope.isCancel = false;
        $scope.shareData = $location.search();
        var canceller, logElems=[], interval;

        function init() {
            logElems=[];
            if ($scope.shareData && getParam("orderId")) {
                let orders = {
                    jobschedulerId: id,
                    jobChain: getParam("jobChain"),
                    orderId: getParam("orderId"),
                    historyId: getParam("historyId")
                };
                renderData('./api/order/log', orders);
            } else if ($scope.shareData && getParam("taskId")) {
                let tasks = {
                    jobschedulerId: id,
                    taskId: getParam("taskId")
                };
                renderData('./api/task/log', tasks);

            } else {
                $scope.loading = false;
                $scope.error = 'Internal error!! Please close the window and reopen.';
            }
        }
        init();

        function renderData(url, obj) {
            canceller = $q.defer();
            $http.post(url, obj, {
                timeout: canceller.promise,
                headers: {'X-Access-Token': token, 'Content-Type': 'application/json'}
            }).then(function (res) {
                $scope.loading = false;
                document.getElementById("logs").innerHTML = "";

                res.data = ("\n" + res.data).replace(/\r?\n([^\r\n]+\[)(error|info\s?|warn\s?|debug\d?|stderr)(\][^\r\n]*)/img, function (match, prefix, level, suffix, offset) {
                    var div = window.document.createElement("div"); //Now create a div element and append it to a non-appended span.
                    div.className = "log_" + ((level) ? level.toLowerCase() : "info");
                    div.textContent = match.replace(/^\r?\n/, "");
                    var j = 0;
                    while (true) {
                        if (offset < (j + 1) * 1024 * 512) {
                            if (logElems.length == j) {
                                logElems.push(window.document.createElement("span"));
                            }
                            logElems[j].appendChild(div);
                            return "";
                        }
                        j++;
                    }
                    return "";
                });
                let firstLogs = logElems.shift(); //first MB of log
                if (firstLogs !== undefined) {
                    window.document.getElementById('logs').appendChild(firstLogs);
                }

                // now the scroll simulation. It loads the next MB for each 50ms.
                interval = $interval(function () {
                    let nextLogs = logElems.shift();
                    if (nextLogs !== undefined) {
                        window.document.getElementById('logs').appendChild(nextLogs);
                    } else {
                        $scope.finished = true;
                        $interval.cancel(interval)
                    }
                }, 50);

            }, function (err) {
                document.getElementById("logs").innerHTML = "";
                $scope.loading = false;
                if (err.data && err.data.error) {
                    $scope.error = JSON.stringify(err.data.error);
                } else {
                    $scope.error = JSON.stringify(err.data);
                }
            });
        }

        $scope.cancel = function () {
            $scope.loading = false;
            $scope.isCancel = true;
            if (canceller) {
                canceller.resolve("user cancelled");
            }
            if (interval) {
                $interval.cancel(interval);
            }
        };

        $scope.reload = function () {
             $scope.isCancel = false;
             $scope.finished = false;
            init();
        };

        $scope.download = function () {
            $scope.cancel();
            if (getParam("orderId")) {
                document.getElementById("tmpFrame").src = './api/order/log/download?orderId=' + getParam("orderId") + '&jobChain=' + getParam("jobChain") + '&historyId=' + getParam("historyId") + '&jobschedulerId=' + id +
                    '&accessToken=' + token;
            } else if (getParam("taskId")) {
                document.getElementById("tmpFrame").src = './api/task/log/download?taskId=' + getParam("taskId") + '&jobschedulerId=' + id +
                    '&accessToken=' + token;
            }
            document.getElementById("tmpFrame").contentWindow.onerror = function () {
                alert('Download error!!');
                return false;
            }
        };
    }]);
})();
