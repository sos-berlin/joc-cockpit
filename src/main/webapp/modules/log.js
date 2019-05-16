/**
 * Created by sourabhagrawal on 25/04/17.
 *
 *
 * Main module of the application.
 */
(function () {
    'use strict';
    angular.module('myapp', []).controller('LogCtrl', ['$location', '$scope', '$http', '$sce','$q','$interval', function ($location, $scope, $http, $sce, $q, $interval) {
        $scope.loading = true;
        $scope.object = {
            debug: 'Debug'
        };
        $scope.isDeBugLevel = false;
        $scope.isStdErrLevel = false;
        $scope.isDebugLevels = [false, false, false, false, false, false, false, false, false];
        $scope.debugLevels = ['Debug', 'Debug2', 'Debug3', 'Debug4', 'Debug5', 'Debug6', 'Debug7', 'Debug8', 'Debug9'];

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
        let accountName = getCookie('$SOS$accountName');
        let accountId = 0;
        $scope.loading = true;
        $scope.isCancel = false;
        $scope.shareData = $location.search();
        var canceller, logElems = [], interval, preferences = {};

        function getUserPreference() {
            let configObj = {};
            configObj.jobschedulerId = id;
            configObj.account = accountName;
            configObj.configurationType = "PROFILE";
            $http.post('./api/configurations', configObj, {
                headers: {'X-Access-Token': token, 'Content-Type': 'application/json'}
            }).then(function (res) {
                if (res.data && res.data.configurations && res.data.configurations.length > 0) {
                    let conf = res.data.configurations[0];
                    accountId = conf.id;
                    preferences = JSON.parse(conf.configurationItem);
                    if (!preferences.logFilter) {
                        preferences.logFilter = {
                            scheduler: true,
                            stdout: true,
                            stderr: true,
                            info: true,
                            debug: false
                        };
                    }
                    $scope.object.checkBoxs = preferences.logFilter;
                }
                init();
            }, function (err) {
                $scope.loading = false;
                document.getElementById("logs").innerHTML = "";
                if (err.data && err.data.error) {
                    $scope.error = err.data.error.message;
                } else if(err.data && err.data.message){
                    $scope.error = err.data.message;
                }
                $scope.errStatus = err.status;
            });
        }

        getUserPreference();

        function init() {
            $scope.error = '';
            logElems = [];
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

        function renderData(url, obj) {
            canceller = $q.defer();
            $http.post(url, obj, {
                timeout: canceller.promise,
                headers: {'X-Access-Token': token, 'Content-Type': 'application/json'}
            }).then(function (res) {
                $scope.loading = false;
                document.getElementById("logs").innerHTML = "";
                res.data = ("\n" + res.data).replace(/\r?\n([^\r\n]+\[)(error|info\s?|warn\s?|debug\d?|trace|stdout|stderr)(\][^\r\n]*)/img, function (match, prefix, level, suffix, offset) {
                    var div = window.document.createElement("div"); //Now create a div element and append it to a non-appended span.
                    level = (level) ? level.trim().toLowerCase() : "info";
                    if (level === "trace") {
                        level = "debug9";
                    }
                    div.className = "log_" + level;
                    if (level === "info" && !$scope.object.checkBoxs.info) {
                        div.className += " hide-block";
                    } else if (level === "stdout") {
                        div.className += " stdout";
                        if (!$scope.object.checkBoxs.stdout) {
                            div.className += " hide-block";
                        }
                    } else if (level === "stderr") {
                        div.className += " stderr";
                        if (!$scope.object.checkBoxs.stderr) {
                            div.className += " hide-block";
                        }
                    } else if (prefix.search(/\[stdout\]/i) > -1) {
                        div.className += " stdout stdout_" + level;
                        if (!$scope.object.checkBoxs.stdout) {
                            div.className += " hide-block";
                        }
                    } else if (prefix.search(/\[stderr\]/i) > -1) {
                        div.className += " stderr stderr_" + level;
                        if (!$scope.object.checkBoxs.stderr) {
                            div.className += " hide-block";
                        }
                    } else {
                        div.className += " scheduler scheduler_" + level;
                        if (!$scope.object.checkBoxs.scheduler) {
                            div.className += " hide-block";
                        }
                    }
                    if(level.match("^debug") && !$scope.object.checkBoxs.debug){
                        div.className += " hide-block";
                    }
                    div.textContent = match.replace(/^\r?\n/, "");
                    if (!$scope.isDeBugLevel) {
                        $scope.isDeBugLevel = !!level.match("^debug");
                    }
                    if ($scope.isDeBugLevel && level.match("^debug")) {
                        if (level === 'debug') {
                            $scope.isDebugLevels[0] = true;
                        } else {
                            for (let x = 2; x < 10; x++) {
                                if (level == 'debug' + x) {
                                    $scope.isDebugLevels[x - 1] = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!$scope.isStdErrLevel) {
                        $scope.isStdErrLevel = div.className.indexOf('stderr') > -1;
                    }
                    let j = 0;
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
                if ($scope.isDeBugLevel) {
                    $scope.debugLevels = [];
                    if ($scope.isDebugLevels[0]) {
                        $scope.debugLevels.push('Debug');
                    }
                    for (let x = 2; x < 10; x++) {
                        if ($scope.isDebugLevels[x - 1]) {
                            $scope.debugLevels.push('Debug' + x);
                        }
                    }
                }

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
                $scope.loading = false;
                document.getElementById("logs").innerHTML = "";
                if (err.data && err.data.error) {
                    $scope.error = err.data.error.message;
                } else if(err.data && err.data.message){
                    $scope.error = err.data.message;
                }
                $scope.errStatus = err.status;
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
                $http.post('./api/order/log/info',{
                    jobschedulerId: id,
                    orderId: getParam("orderId"),
                    jobChain: getParam("jobChain"),
                    historyId: getParam("historyId")
                }, {
                headers: {'X-Access-Token': token, 'Content-Type': 'application/json'}
            }).then(function (res) {
                    document.getElementById("tmpFrame").src = './api/order/log/download?orderId=' + getParam("orderId") + '&jobChain=' + getParam("jobChain") + '&historyId=' + getParam("historyId") + '&jobschedulerId=' + id + '&filename=' + res.data.log.filename +
                        '&accessToken=' + token;
                }, function (err) {
                    if (err && err.data) {
                        if (err.data.message) {
                            alert(err.data.message);
                        } else if (err.data.error && err.data.error.message) {
                            alert(err.data.error.message);
                        }
                    }
                });
            } else if (getParam("taskId")) {
                $http.post('./api/task/log/info',{
                    jobschedulerId: id,
                    taskId: getParam("taskId")
                }, {
                headers: {'X-Access-Token': token, 'Content-Type': 'application/json'}
            }).then(function (res) {
                    document.getElementById("tmpFrame").src = './api/task/log/download?taskId=' + getParam("taskId") + '&jobschedulerId=' + id + '&filename=' + res.data.log.filename +
                        '&accessToken=' + token;
                }, function (err) {
                    if (err && err.data) {
                        if (err.data.message) {
                            alert(err.data.message);
                        } else if (err.data.error && err.data.error.message) {
                            alert(err.data.error.message);
                        }
                    }
                });
            }
        };

        $scope.sheetContent = '';
        $scope.checkLogLevel = function (type) {
            $scope.sheetContent = '';
            if (type === 'STDOUT') {
                if (!$scope.object.checkBoxs.stdout) {
                    $scope.sheetContent += "div.stdout {display: none;}\n";
                } else {
                    $scope.sheetContent += "div.stdout {display: block;}\n";
                    $scope.changeInfoLevel(type);
                    $scope.changeDebugLevel(type, false);
                }
            } else if (type === 'STDERR') {
                if (!$scope.object.checkBoxs.stderr) {
                    $scope.sheetContent += "div.stderr {display: none;}\n";
                } else {
                    $scope.sheetContent += "div.stderr {display: block;}\n";
                    $scope.changeInfoLevel(type);
                    $scope.changeDebugLevel(type, false);
                }
            } else if (type === 'SCHEDULER') {
                if (!$scope.object.checkBoxs.scheduler) {
                    $scope.sheetContent += "div.scheduler {display: none;}\n";
                } else {
                    $scope.sheetContent += "div.scheduler {display: block;}\n";
                    $scope.changeInfoLevel(type);
                    $scope.changeDebugLevel(type, false);
                }
            } else if (type === 'INFO') {
                if (!$scope.object.checkBoxs.info) {
                    $scope.sheetContent += "div.log_info {display: none;}\n";
                    $scope.sheetContent += "div.scheduler_info {display: none;}\n";
                    $scope.sheetContent += "div.stdout_info {display: none;}\n";
                    $scope.sheetContent += "div.stderr_info {display: none;}\n";
                } else {
                    $scope.sheetContent += "div.log_info {display: block;}\n";
                    if ($scope.object.checkBoxs.scheduler) {
                        $scope.sheetContent += "div.scheduler_info {display: block;}\n";
                    }
                    if ($scope.object.checkBoxs.stdout) {
                        $scope.sheetContent += "div.stdout_info {display: block;}\n";
                    }
                    if ($scope.object.checkBoxs.stderr) {
                        $scope.sheetContent += "div.stderr_info {display: block;}\n";
                    }
                }
            } else if (type === 'DEBUG') {
                if (!$scope.object.checkBoxs.debug) {
                    $scope.changeDebugLevel('SCHEDULER', false);
                    $scope.changeDebugLevel('STDOUT', false);
                    $scope.changeDebugLevel('STDERR', false);
                } else {
                    $scope.changeDebugLevel();
                    $scope.sheetContent = '';
                }
            }
            if ($scope.sheetContent != '') {
                let sheet = document.createElement('style');
                sheet.innerHTML = $scope.sheetContent;
                document.body.appendChild(sheet);
            }
            $scope.saveUserPreference();
        };

        $scope.changeInfoLevel = function (type) {
            if (!$scope.object.checkBoxs.info) {
                $scope.sheetContent += "div." + type.toLowerCase() + "_info {display: none;}\n";
            }
        };

        $scope.changeDebugLevel = function (type, setBlock) {
            if (type) {
                let num = $scope.object.debug.substring(5);
                if (!num) {
                    num = 1;
                }
                if ($scope.object.checkBoxs.debug) {
                    if (setBlock) {
                        for (let x = 1; x <= num; x++) {
                            let level = x === 1 ? '' : x;
                            $scope.sheetContent += "div." + type.toLowerCase() + "_debug" + level + " {display: block;}\n";
                        }
                    }
                    if (num < 9) {
                        for (let x = num + 1; x < 10; x++) {
                            let level = x === 1 ? '' : x;
                            $scope.sheetContent += "div." + type.toLowerCase() + "_debug" + level + " {display: none;}\n";
                        }
                    }
                } else {
                    for (let x = 1; x < 10; x++) {
                        let level = x === 1 ? '' : x;
                        $scope.sheetContent += "div." + type.toLowerCase() + "_debug" + level + " {display: none;}\n";
                    }
                }
            } else {
                $scope.sheetContent = '';
                if ($scope.object.checkBoxs.scheduler) {
                    $scope.changeDebugLevel('SCHEDULER', true);
                }
                if ($scope.object.checkBoxs.stdout) {
                    $scope.changeDebugLevel('STDOUT', true);
                }
                if ($scope.object.checkBoxs.stderr) {
                    $scope.changeDebugLevel('STDERR', true);
                }
                if ($scope.sheetContent != '') {
                    let sheet = document.createElement('style');
                    sheet.innerHTML = $scope.sheetContent;
                    document.body.appendChild(sheet);
                }
            }
        };

        /**
         * Save the user preference of log filter
         *
         */
        $scope.saveUserPreference = function () {
            preferences.logFilter = $scope.object.checkBoxs;
            let configObj = {};
            configObj.jobschedulerId = id;
            configObj.account = accountName;
            configObj.configurationType = "PROFILE";
            configObj.id = accountId;
            configObj.configurationItem = JSON.stringify(preferences);
            sessionStorage.setItem('changedPreferences', configObj.configurationItem);
            $http.post('./api/configuration/save', configObj, {
                headers: {'X-Access-Token': token, 'Content-Type': 'application/json'}
            });
        };

    }]);
})();
