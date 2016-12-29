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
        .directive('contextMenu', contextMenu)
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

    ngSpinnerBar.$inject = ["$rootScope", "$state", "SOSAuth", "$window"];
    function ngSpinnerBar($rootScope, $state, SOSAuth, $window) {
        return {
            link: function (scope, element) {
                // by default hide the spinner bar
                element.addClass('hide'); // hide spinner bar by default
                var startTime, endTime;
                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function (event, toState) {
                    element.removeClass('hide'); // show spinner bar

                    if (toState.url === '/jobChainDetails') {
                        $state.go('app.jobChainDetails.orders');
                        event.preventDefault();
                    }
                    else if (toState.url === '/resources') {
                        $state.go('app.resources.agentClusters');
                        event.preventDefault();
                    }
                    if (!(toState.url == '/jobChain' || toState.url == '/orders' || toState.url == '/overview')) {
                        SOSAuth.jobChain = undefined;
                        // $window.sessionStorage.$SOS$TREE = {};
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
            $http.get(templateUrl, {cache: $templateCache}).success(
                function (tplContent) {
                    el.replaceWith($compile(tplContent)(scope));
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

    contextMenu.$inject = ["$q", "gettextCatalog"];
    function contextMenu($q, gettextCatalog) {
        var contextMenus = [];
        var $currentContextMenu = null;
        var defaultItemText = "New Item";

        var removeContextMenus = function (level) {
            /// <summary>Remove context menu.</summary>
            while (contextMenus.length && (!level || contextMenus.length > level)) {
                contextMenus.pop().remove();
            }
            if (contextMenus.length == 0 && $currentContextMenu) {
                $currentContextMenu.remove();
            }
        };


        var processTextItem = function ($scope, item, text, event, model, $promises, nestedMenu, $) {
            "use strict";

            var $a = $('<a>');
            $a.attr({tabindex: '-1', href: '#'});

            if (typeof item[0] === 'string') {
                text = item[0];
            }
            else if (typeof item[0] === "function") {
                text = item[0].call($scope, $scope, event, model);
            } else if (typeof item.text !== "undefined") {
                text = item.text;
            }

            var $promise = $q.when(text);
            $promises.push($promise);
            $promise.then(function (text) {
                if (nestedMenu) {
                    $a.css("cursor", "default");
                    $a.append($('<strong style="font-family:monospace;font-weight:bold;float:right;">&gt;</strong>'));
                }
                $a.append(text);
            });

            return $a;

        };

        var processItem = function ($scope, event, model, item, $ul, $li, $promises, $q, $, level) {
            /// <summary>Process individual item</summary>
            "use strict";
            // nestedMenu is either an Array or a Promise that will return that array.
            var nestedMenu = angular.isArray(item[1]) || (item[1] && angular.isFunction(item[1].then))
                ? item[1] : angular.isArray(item[2]) || (item[2] && angular.isFunction(item[2].then))
                ? item[2] : angular.isArray(item[3]) || (item[3] && angular.isFunction(item[3].then))
                ? item[3] : null;

            // if html property is not defined, fallback to text, otherwise use default text
            // if first item in the item array is a function then invoke .call()
            // if first item is a string, then text should be the string.

            var text = defaultItemText;
            if (typeof item[0] === 'function' || typeof item[0] === 'string' || typeof item.text !== "undefined") {
                text = processTextItem($scope, item, text, event, model, $promises, nestedMenu, $);
            }
            else if (typeof item.html === 'function') {
                // leave styling open to dev
                text = item.html($scope);
            }
            else if (typeof item.html !== "undefined") {
                // leave styling open to dev
                text = item.html;
            }

            $li.append(text);


            // if item is object, and has enabled prop invoke the prop
            // els if fallback to item[2]

            var isEnabled = function () {
                if (typeof item.enabled !== "undefined") {
                    return item.enabled.call($scope, $scope, event, model, text);
                } else if (typeof item[2] === "function") {
                    return item[2].call($scope, $scope, event, model, text);
                } else {
                    return true;
                }
            };

            registerEnabledEvents($scope, isEnabled(), item, $ul, $li, nestedMenu, model, text, event, $, level);
        };

        var handlePromises = function ($ul, level, event, $promises) {
            /// <summary>
            /// calculate if drop down menu would go out of screen at left or bottom
            /// calculation need to be done after element has been added (and all texts are set; thus thepromises)
            /// to the DOM the get the actual height
            /// </summary>
            "use strict";
            $q.all($promises).then(function () {
                var topCoordinate = event.pageY;
                var menuHeight = angular.element($ul[0]).prop('offsetHeight');
                var winHeight = event.view.innerHeight;
                if (topCoordinate > menuHeight && winHeight - topCoordinate < menuHeight) {
                    topCoordinate = event.pageY - menuHeight;
                } else if (winHeight <= menuHeight) {
                    // If it really can't fit, reset the height of the menu to one that will fit
                    angular.element($ul[0]).css({"height": winHeight - 5, "overflow-y": "scroll"});
                    // ...then set the topCoordinate height to 0 so the menu starts from the top
                    topCoordinate = 0;
                } else if (winHeight - topCoordinate < menuHeight) {
                    var reduceThreshold = 5;
                    if (topCoordinate < reduceThreshold) {
                        reduceThreshold = topCoordinate;
                    }
                    topCoordinate = winHeight - menuHeight - reduceThreshold;
                }

                var leftCoordinate = event.pageX;
                var menuWidth = angular.element($ul[0]).prop('offsetWidth');
                var winWidth = event.view.innerWidth;
                var rightPadding = 5;
                if (leftCoordinate > menuWidth && winWidth - leftCoordinate - rightPadding < menuWidth) {
                    leftCoordinate = winWidth - menuWidth - rightPadding;
                } else if (winWidth - leftCoordinate < menuWidth) {
                    var reduceThreshold = 5;
                    if (leftCoordinate < reduceThreshold + rightPadding) {
                        reduceThreshold = leftCoordinate + rightPadding;
                    }
                    leftCoordinate = winWidth - menuWidth - reduceThreshold - rightPadding;
                }

                $ul.css({
                    display: 'block',
                    position: 'absolute',
                    left: leftCoordinate + 'px',
                    top: topCoordinate + 'px'
                });
            });

        };

        var registerEnabledEvents = function ($scope, enabled, item, $ul, $li, nestedMenu, model, text, event, $, level) {
            /// <summary>If item is enabled, register various mouse events.</summary>
            if (enabled) {
                var openNestedMenu = function ($event) {
                    removeContextMenus(level + 1);
                    /*
                     * The object here needs to be constructed and filled with data
                     * on an "as needed" basis. Copying the data from event directly
                     * or cloning the event results in unpredictable behavior.
                     */
                    var ev = {
                        pageX: event.pageX + $ul[0].offsetWidth - 1,
                        pageY: $ul[0].offsetTop + $li[0].offsetTop - 3,
                        view: event.view || window
                    };

                    /*
                     * At this point, nestedMenu can only either be an Array or a promise.
                     * Regardless, passing them to when makes the implementation singular.
                     */
                    $q.when(nestedMenu).then(function (promisedNestedMenu) {
                        renderContextMenu($scope, ev, promisedNestedMenu, model, level + 1);
                    });
                };

                $li.on('click', function ($event) {
                    $event.preventDefault();
                    $scope.$apply(function () {
                        if (nestedMenu) {
                            openNestedMenu($event);
                        } else {
                            $(event.currentTarget).removeClass('context');
                            removeContextMenus();

                            if (angular.isFunction(item[1])) {
                                item[1].call($scope, $scope, event, model, text)
                            } else {
                                item.click.call($scope, $scope, event, model, text);
                            }
                        }
                    });
                });

                $li.on('mouseover', function ($event) {
                    $scope.$apply(function () {
                        if (nestedMenu) {
                            openNestedMenu($event);
                        }
                    });
                });
            } else {
                $li.on('click', function ($event) {
                    $event.preventDefault();
                });
                $li.addClass('disabled');
            }

        };


        var renderContextMenu = function ($scope, event, options, model, level, customClass) {
            /// <summary>Render context menu recursively.</summary>
            if (!level) {
                level = 0;
            }
            if (!$) {
                var $ = angular.element;
            }
            $(event.currentTarget).addClass('context');
            var $contextMenu = $('<div>');
            if ($currentContextMenu) {
                $contextMenu = $currentContextMenu;
            } else {
                $currentContextMenu = $contextMenu;
                $contextMenu.addClass('angular-bootstrap-contextmenu dropdown clearfix');
            }
            if (customClass) {
                $contextMenu.addClass(customClass);
            }
            var $ul = $('<ul>');
            $ul.addClass('dropdown-menu');
            $ul.attr({'role': 'menu'});
            $ul.css({
                display: 'block',
                position: 'absolute',
                left: event.pageX + 'px',
                top: event.pageY + 'px',
                "z-index": 10000
            });

            var $promises = [];

            angular.forEach(options, function (item) {

                var $li = $('<li>');
                if (typeof item[2] === "boolean") {

                    if (item[0] === gettextCatalog.getString('button.enableIgnoreList') && item[2] == false) {
                        processItem($scope, event, model, item, $ul, $li, $promises, $q, $, level);
                    }
                    if (item[0] === gettextCatalog.getString('button.disableIgnoreList') && item[2] == true) {
                        processItem($scope, event, model, item, $ul, $li, $promises, $q, $, level);
                    }
                } else {
                    processItem($scope, event, model, item, $ul, $li, $promises, $q, $, level);
                }

                $ul.append($li);
            });
            $contextMenu.append($ul);
            var height = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            );
            $contextMenu.css({
                width: '100%',
                height: height + 'px',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 9999,
                "max-height": window.innerHeight - 3
            });
            $(document).find('body').append($contextMenu);

            handlePromises($ul, level, event, $promises);

            $contextMenu.on("mousedown", function (e) {
                if ($(e.target).hasClass('dropdown')) {
                    $(event.currentTarget).removeClass('context');
                    removeContextMenus();
                }
            }).on('contextmenu', function (event) {
                $(event.currentTarget).removeClass('context');
                event.preventDefault();
                removeContextMenus(level);
            });

            $scope.$on("$destroy", function () {
                removeContextMenus();
            });

            contextMenus.push($ul);
        };

        function isTouchDevice() {
            return 'ontouchstart' in window        // works on most browsers
                || navigator.maxTouchPoints;       // works on IE10/11 and Surface
        }

        return function ($scope, element, attrs) {
            var openMenuEvent = "contextmenu";
            if (attrs.contextMenuOn && typeof(attrs.contextMenuOn) === "string") {
                openMenuEvent = attrs.contextMenuOn;
            }
            element.on(openMenuEvent, function (event) {
                event.stopPropagation();
                event.preventDefault();

                // Don't show context menu if on touch device and element is draggable
                if (isTouchDevice() && element.attr('draggable') === 'true') {
                    return false;
                }

                $scope.$apply(function () {
                    var options = $scope.$eval(attrs.contextMenu);
                    var customClass = attrs.contextMenuClass;
                    var model = $scope.$eval(attrs.model);
                    if (options instanceof Array) {
                        if (options.length === 0) {
                            return;
                        }
                        renderContextMenu($scope, event, options, model, undefined, customClass);
                    } else {
                        throw '"' + attrs.contextMenu + '" not an array';
                    }
                });
            });
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

        return function (scope, element, attrs) {

            var time = attrs.time;

            var timeoutId = '';
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
            if(time)
            updateLater();
        };

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
