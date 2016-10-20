/**
 * Created by sourabhagrawal on 03/03/16.
 */

(function () {
    'use strict';

    angular.module('app')
        .service('SOSAuth', SOSAuth)
        .service('Base64', Base64)
        .service('UserService', UserService);

    SOSAuth.$inject = ['$window'];
    function SOSAuth($window) {

        var props = ['accessTokenId', 'currentUserData','jobChain','permission','scheduleIds'];

        var propsPrefix = '$SOS$';

        function SOSAuth() {
            var self = this;
            props.forEach(function (name) {
                self[name] = load(name);
            });
            this.rememberMe = undefined;
        }
        SOSAuth.prototype.save = function () {
            var self = this;
            var storage = this.rememberMe ? $window.localStorage : $window.sessionStorage;
            props.forEach(function (name) {
                save(storage, name, self[name]);
            });
        };

        SOSAuth.prototype.setUser = function (userData, permission) {
            this.accessTokenId = userData.accessToken;
            this.currentUserData = userData.user;
            this.permission = JSON.stringify(permission);
        };

        SOSAuth.prototype.setPermission = function (permission) {
            this.permission = JSON.stringify(permission);
        };

        SOSAuth.prototype.setIds = function (scheduleIds) {
            this.scheduleIds = JSON.stringify(scheduleIds);
        };

        SOSAuth.prototype.clearUser = function () {
            this.accessTokenId = null;
            this.currentUserData = null;
            this.permission = null;
            this.scheduleIds = null;
            $window.sessionStorage.setItem('$SOS$URL', null);
            $window.sessionStorage.setItem('$SOS$URLPARAMS', {});
        };

         SOSAuth.prototype.setJobChain = function (jobChain) {
             this.jobChain = jobChain;
              var self =this;
              var prop = 'jobChain';
             save($window.sessionStorage, prop, self[prop]);
        };

        SOSAuth.prototype.getJobChain = function () {
            return this.jobChain;
        };

        SOSAuth.prototype.clearStorage = function () {
            props.forEach(function (name) {
                save($window.sessionStorage, name, null);
                save($window.localStorage, name, null);
            });
        };


        return new SOSAuth();

        // Note: LocalStorage converts the value to string
        // We are using empty string as a marker for null/undefined values.
        function save(storage, name, value) {
            var key = propsPrefix + name;
            if (value == null) value = '';
            storage[key] = value;
        }

        function load(name) {
            var key = propsPrefix + name;
            return $window.localStorage[key] || $window.sessionStorage[key] || null;
        }
    }

    function Base64() {
        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        return {
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";
                } while (i < input.length);

                return output;
            }
        };
    }

    UserService.$inject = ["$resource","$q","SOSAuth", "$http", "Base64", "$location"];
    function UserService($resource,$q, SOSAuth, $http, Base64, $location) {

        return {

            /**
             * Logout user
             */
            logout: function () {

               var Logout = $resource('security/logout');

                Logout.save(function () {
                    SOSAuth.clearUser();
                    SOSAuth.clearStorage();
                     $location.path('/login');
                }, function () {
                    SOSAuth.clearUser();
                    SOSAuth.clearStorage();
                     $location.path('/login');
                });

            },

            authenticate: function (username, password) {
                var deferred = $q.defer();
                $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode(username + ':' + password);
                $http.post('security/login').then(function(res){
                    deferred.resolve(res.data);
                }, function(err){
                     deferred.reject(err);
                });

                return deferred.promise;
            },
            getPermissions: function (id) {
                var deferred = $q.defer();
                var Permission = $resource('security/joc_cockpit_permissions');

                Permission.save({jobschedulerId:id},function (res) {
                    deferred.resolve(res);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        }
    }

})();

