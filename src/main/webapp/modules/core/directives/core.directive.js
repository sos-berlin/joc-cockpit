/**
 * Created by sourabhagrawal on 26/05/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .directive('a', a)
        .directive('ngSpinnerBar', ngSpinnerBar)
        .directive("uiInclude", uiInclude).value('uiJpConfig', {})
        .directive('uiNav', uiNav)
        .directive('checklistModel', checklistModel)
        .directive('toggleView', toggleView)
        .directive('letterAvatar', letterAvatar)
        .directive('time', time)
        .directive('time1', time1)

        .constant('defaultAvatarSettings', {
            alphabetcolors: ["#5A8770", "#B2B7BB", "#6FA9AB", "#F5AF29", "#0088B9", "#F18636", "#D93A37", "#A6B12E", "#5C9BBC", "#F5888D", "#9A89B5", "#407887", "#9A89B5", "#5A8770", "#D33F33", "#A2B01F", "#F0B126", "#0087BF", "#F18636", "#0087BF", "#B2B7BB", "#72ACAE", "#9C8AB4", "#5A8770", "#EEB424", "#407887"],
            textColor: '#ffffff',
            defaultBorder: 'border:5px solid white',
            fontsize: 16, // unit in pixels
            height: 35, // unit in pixels
            width: 35, // unit in pixels
            fontWeight: 400, //
            charCount: 1,
            fontFamily: 'HelveticaNeue-Light,Helvetica Neue Light,Helvetica Neue,Helvetica, Arial,Lucida Grande, sans-serif',
            base: 'data:image/svg+xml;base64,',
            radius: 'border-radius:50%;'
        });
    // Handle global LINK click
    function a() {
        return {
            restrict: 'E',
            link: function (scope, elem, attrs) {
                if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                    elem.on('click', function (e) {
                        e.preventDefault(); // prevent link click for above criteria
                    });
                }
            }
        };
    }

    ngSpinnerBar.$inject = ["$rootScope", "$state", "SOSAuth"];
    function ngSpinnerBar($rootScope, $state, SOSAuth) {
        return {
            link: function (scope, element) {
                // by default hide the spinner bar
                element.addClass('hide'); // hide spinner bar by default
                var startTime, endTime;
                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function (event, toState, toParam, fromState) {
                    element.removeClass('hide'); // show spinner bar

                    if (toState.url === '/jobChainDetails') {
                        $state.go('app.jobChainDetails.orders');
                        event.preventDefault();
                        return;
                    }
                    else if (toState.url === '/resources' && fromState.name != "app.resources.agentClusters") {
                        $state.go('app.resources.agentClusters');
                        event.preventDefault();
                        return;
                    }else if(toState.url === '/resources' && fromState.name == "app.resources.agentClusters"){
                        element.addClass('hide');
                         event.preventDefault();
                        return;
                    }
                    if (!(toState.url == '/jobChain' || toState.url == '/orders')) {
                        SOSAuth.jobChain = undefined;
                    }
                    if ($rootScope.clientLogFilter.state) {
                        startTime = new Date();
                        var info = {
                            message: 'START LOADING ' + toState.url,
                            logTime: startTime,
                            level: 'debug2'
                        };
                        $rootScope.clientLogs.push(info);
                    }
                });

                // hide the spinner bar on rounte change success(after the content loaded)
                $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                    element.addClass('hide'); // hide spinner bar

                    $('body, html').animate({
                        scrollTop: 0
                    }, 1000);
                    element.addClass('hide'); // hide spinner bar
                    if ($rootScope.clientLogFilter.state) {
                        endTime = new Date();
                        var info = {
                            message: 'ELAPSED TIME FOR UPDATE ' + toState.url + ' ' + ((endTime.getTime() - startTime.getTime()) / 1000) + 's',
                            logTime: endTime,
                            level: 'debug2'
                        };
                        $rootScope.clientLogs.push(info);
                    }
                });

                // handle errors
                $rootScope.$on('$stateNotFound', function () {
                    element.addClass('hide'); // hide spinner bar
                });

                $rootScope.$on('$viewContentLoading', function () {
                    var date = new Date();
                    if (endTime && endTime.getTime() < date.getTime()) {
                        var info = {
                            message: 'ELAPSED TIME FOR UPDATE CONTENT ' + ((date.getTime() - endTime.getTime()) / 1000) + 's',
                            logTime: date,
                            level: 'debug2'
                        };
                        $rootScope.clientLogs.push(info);
                    }
                });

                // handle errors
                $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                    element.addClass('hide'); // hide spinner bar
                    if (error === "login") {
                        $state.go("login");
                    } else {
                        if ($rootScope.clientLogFilter.state) {
                            var error = {
                                message: 'ERROR ON LOADING : ' + toState.url,
                                logTime: new Date(),
                                level: 'error'
                            };
                            $rootScope.clientLogs.push(error);
                        }
                    }
                });
            }
        };
    }


    uiInclude.$inject = ['$http', '$templateCache', '$compile'];
    function uiInclude($http, $templateCache, $compile) {
        var directive = {
            restrict: 'A',
            link: link
        };
        return directive;
        function link(scope, el, attr) {
            var templateUrl = scope.$eval(attr.uiInclude);
            $http.get(templateUrl, {cache: $templateCache}).then(
                function (tplContent) {
                    el.replaceWith($compile(tplContent.data)(scope));
                }
            );
        }
    }


    function uiNav() {
        var directive = {
            restrict: 'AC',
            link: link
        };
        return directive;

        function link(scope, el, attr) {
            el.find('a').bind('click', function (e) {
                var li = angular.element(this).parent();
                var active = li.parent()[0].querySelectorAll('.active');
                li.toggleClass('active');
                angular.element(active).removeClass('active');
            });
        }
    }

    checklistModel.$inject = ['$parse', '$compile'];
    function checklistModel($parse, $compile) {
        // contains
        function contains(arr, item, comparator) {
            if (angular.isArray(arr)) {
                for (var i = arr.length; i--;) {
                    if (comparator(arr[i], item)) {
                        return true;
                    }
                }
            }
            return false;
        }

        // add
        function add(arr, item, comparator) {
            arr = angular.isArray(arr) ? arr : [];
            if (!contains(arr, item, comparator)) {
                arr.push(item);
            }
            return arr;
        }

        // remove
        function remove(arr, item, comparator) {
            if (angular.isArray(arr)) {
                for (var i = arr.length; i--;) {
                    if (comparator(arr[i], item)) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            return arr;
        }

        // http://stackoverflow.com/a/19228302/1458162
        function postLinkFn(scope, elem, attrs) {
            // exclude recursion, but still keep the model
            var checklistModel = attrs.checklistModel;
            attrs.$set("checklistModel", null);
            // compile with `ng-model` pointing to `checked`
            $compile(elem)(scope);
            attrs.$set("checklistModel", checklistModel);

            // getter / setter for original model
            var getter = $parse(checklistModel);
            var setter = getter.assign;
            var checklistChange = $parse(attrs.checklistChange);

            // value added to list
            var value = attrs.checklistValue ? $parse(attrs.checklistValue)(scope.$parent) : attrs.value;


            var comparator = angular.equals;

            if (attrs.hasOwnProperty('checklistComparator')) {
                if (attrs.checklistComparator[0] == '.') {
                    var comparatorExpression = attrs.checklistComparator.substring(1);
                    comparator = function (a, b) {
                        return a[comparatorExpression] === b[comparatorExpression];
                    }

                } else {
                    comparator = $parse(attrs.checklistComparator)(scope.$parent);
                }
            }

            // watch UI checked change
            scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                var current = getter(scope.$parent);
                if (angular.isFunction(setter)) {
                    if (newValue === true) {
                        setter(scope.$parent, add(current, value, comparator));
                    } else {
                        setter(scope.$parent, remove(current, value, comparator));
                    }
                }

                if (checklistChange) {
                    checklistChange(scope);
                }
            });

            // declare one function to be used for both $watch functions
            function setChecked(newArr, oldArr) {
                scope[attrs.ngModel] = contains(newArr, value, comparator);
            }

            // watch original model change
            // use the faster $watchCollection method if it's available
            if (angular.isFunction(scope.$parent.$watchCollection)) {
                scope.$parent.$watchCollection(checklistModel, setChecked);
            } else {
                scope.$parent.$watch(checklistModel, setChecked, true);
            }
        }

        return {
            restrict: 'A',
            priority: 1000,
            terminal: true,
            scope: true,
            compile: function (tElement, tAttrs) {
                if ((tElement[0].tagName !== 'INPUT' || tAttrs.type !== 'checkbox')
                    && (tElement[0].tagName !== 'MD-CHECKBOX')
                    && (!tAttrs.btnCheckbox)) {
                    throw 'checklist-model should be applied to `input[type="checkbox"]` or `md-checkbox`.';
                }

                if (!tAttrs.checklistValue && !tAttrs.value) {
                    throw 'You should provide `value` or `checklist-value`.';
                }

                // by default ngModel is 'checked', so we set it if not specified
                if (!tAttrs.ngModel) {
                    // local scope var storing individual checkbox model
                    tAttrs.$set("ngModel", "checked");
                }

                return postLinkFn;
            }
        };
    }

    function toggleView() {
        return {
            restrict: 'E',
            templateUrl: 'modules/core/template/toggle-view.html',
            controller: ['CoreService', '$scope', '$rootScope', function (CoreService, $scope, $rootScope) {
                var vm = $scope;
                vm.pageView = CoreService.getView();
                vm.setView = function () {
                    $rootScope.$broadcast('rebuild:me');
                    CoreService.setView($scope.pageView);
                };

            }]
        };
    }

    letterAvatar.$inject = ['defaultAvatarSettings'];
    function letterAvatar(defaultAvatarSettings) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                alphabetcolors: '=alphabetcolors'

            },
            link: function (scope, element, attrs) {
                var params = {
                    charCount: isNotNull(attrs.charcount) ? attrs.charcount : defaultAvatarSettings.charCount,
                    data: attrs.data,
                    textColor: defaultAvatarSettings.textColor,
                    height: isNotNull(attrs.height) ? attrs.height : defaultAvatarSettings.height,
                    width: isNotNull(attrs.width) ? attrs.width : defaultAvatarSettings.width,
                    fontsize: isNotNull(attrs.fontsize) ? attrs.fontsize : defaultAvatarSettings.fontsize,
                    fontWeight: isNotNull(attrs.fontweight) ? attrs.fontweight : defaultAvatarSettings.fontWeight,
                    fontFamily: isNotNull(attrs.fontfamily) ? attrs.fontfamily : defaultAvatarSettings.fontFamily,
                    avatarBorderStyle: attrs.avatarcustomborder,
                    avatardefaultBorder: attrs.avatarborder,
                    defaultBorder: defaultAvatarSettings.defaultBorder,
                    shape: attrs.shape,
                    alphabetcolors: scope.alphabetcolors || defaultAvatarSettings.alphabetcolors
                };

                if (attrs.alphabetcolors) {
                    console.log(params.alphabetcolors.length);
                }

                var c = params.data.substr(0, params.charCount).toUpperCase();


                var cobj = getCharacterObject(c, params.textColor, params.fontFamily, params.fontWeight, params.fontsize);
                var colorIndex = '';
                var color = '';

                if (c.charCodeAt(0) < 65) {
                    color = getRandomColors();
                } else {
                    colorIndex = Math.floor((c.charCodeAt(0) - 65) % params.alphabetcolors.length);
                    color = params.alphabetcolors[colorIndex];
                }


                var svg = getImgTag(params.width, params.height, color);
                svg.append(cobj);
                var lvcomponent = angular.element('<div>').append(svg.clone()).html();
                var svgHtml = window.btoa(decodeURIComponent(encodeURIComponent(lvcomponent)));
                var component;
                var base = defaultAvatarSettings.base;
                var _style = '';
                if (params.avatarBorderStyle) {
                    _style = params.avatarBorderStyle;
                } else if (params.avatardefaultBorder) {
                    _style = params.defaultBorder;
                }

                if (params.shape) {
                    if (params.shape === 'round') {
                        var round_style = defaultAvatarSettings.radius + _style;
                        component = "<img src=" + base + svgHtml + " style='" + round_style + "' />";
                    }
                } else {
                    component = "<img src=" + base + svgHtml + " style='" + _style + "' />";
                }
                element.replaceWith(component);

            }
        };
    }


    function getRandomColors() {
        var letters = '0123456789ABCDEF'.split('');
        var _color = '#';
        for (var i = 0; i < 6; i++) {
            _color += letters[Math.floor(Math.random() * 16)];
        }
        return _color;
    }

    function isNotNull(obj) {
        if (obj) {
            return true;
        }
        return false;
    }

    function getImgTag(width, height, color) {

        var svgTag = angular.element('<svg></svg>')
            .attr({
                'xmlns': 'http://www.w3.org/2000/svg',
                'pointer-events': 'none',
                'width': width,
                'height': height
            })
            .css({
                'background-color': color,
                'width': width + 'px',
                'height': height + 'px'
            });

        return svgTag;
    }

    function getCharacterObject(character, textColor, fontFamily, fontWeight, fontsize) {
        var textTag = angular.element('<text text-anchor="middle"></text>')
            .attr({
                'y': '50%',
                'x': '50%',
                'dy': '0.35em',
                'pointer-events': 'auto',
                'fill': textColor,
                'font-family': fontFamily
            })
            .html(character)
            .css({
                'font-weight': fontWeight,
                'font-size': fontsize + 'px'
            });

        return textTag;
    }

    time.$inject = ['$timeout', '$filter'];
    function time($timeout, $filter) {

        return {
            link: function (scope, element, attrs) {

                var time = attrs.time;
                 var timeoutId = '';
                attrs.$observe('time', function (data) {
                    time = data;
                    if(!timeoutId)
                    updateLater();
                }, true);

                var intervalLength = 1000 * 5; // 5 seconds
                var filter = $filter('remainingTime');

                function updateTime() {
                    element.text(filter(time));
                }

                function updateLater() {
                    timeoutId = $timeout(function () {
                        updateTime();
                        updateLater();
                    }, intervalLength);
                }

                element.bind('$destroy', function () {
                    $timeout.cancel(timeoutId);
                });

                updateTime();
                if (time)
                    updateLater();
            }
        }
    }

    time1.$inject = ['$timeout', '$filter'];
    function time1($timeout, $filter) {

        return function (scope, element, attrs) {
            var time = attrs.time1;
            var timeoutId = '';
            var intervalLength = 1000 * 30; // 30 seconds
            var filter = $filter('timeDifferenceFilter');

            function updateTime() {
                element.text(filter(time));
            }

            function updateLater() {
                timeoutId = $timeout(function () {
                    updateTime();
                    updateLater();
                }, intervalLength);
            }

            element.bind('$destroy', function () {
                $timeout.cancel(timeoutId);
            });

            updateTime();
            if (time)
                updateLater();
        };
    }

})();
