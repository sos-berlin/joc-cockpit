/**
 * Created by sourabhagrawal on 25/09/19.
 */
(function () {
    'use strict';

    angular.module('app')
        .service('EditorService', EditorService);
    EditorService.$inject = ["$resource", "$q", "$http"];
    function EditorService($resource, $q, $http) {
        return {
            tree: function (filter) {
                let deferred = $q.defer();
                let File = $resource('tree');
                File.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getFolder: function (filter) {
                let deferred = $q.defer();
                let Tree = $resource('joe/read/folder');
                Tree.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getFile: function (filter) {
                let deferred = $q.defer();
                let File = $resource('joe/read/file');
                File.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            store: function (filter) {
                let deferred = $q.defer();
                let Store = $resource('joe/store');
                Store.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            delete: function (filter) {
                let deferred = $q.defer();
                let Delete = $resource('joe/delete');
                Delete.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            rename: function (filter) {
                let deferred = $q.defer();
                let Rename = $resource('joe/rename');
                Rename.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deploy: function (filter) {
                let deferred = $q.defer();
                let Deploy = $resource('joe/deploy');
                Deploy.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deployables: function (filter) {
                let deferred = $q.defer();
                let Deploy = $resource('joe/deployables');
                Deploy.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            toXML: function (filter, objectType) {
                return $http.post('joe/' + objectType + '/toxml', filter);
            },
            toJSON: function (filter) {
                return $http.post('joe/tojson', filter);
            },
            diff: function (data1, data2) {
                let dmp = new diff_match_patch();
                let a = dmp.diff_main(data1, data2, false);
                let b = dmp.diff_prettyHtml(a);
                return b.replace(/(&para;)+/gi, '');
            },
            highlight: function (language, data) {
                let str = hljs.highlight(language, data).value;
                return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
            },
            setLanguage: function (data) {
                if (data === 'shell' || data === 'java' || data === 'javascript' || data === 'powershell') {
                    return data;
                } else if (data === 'dotnet') {
                    return 'vbnet';
                } else if (data === 'perlScript') {
                    return 'perl';
                } else if (data === 'VBScript' || data === 'scriptcontrol:vbscript') {
                    return 'vbscript';
                } else {
                    return 'javascript'
                }
            },
            getFunctionalCode: function(data, language) {
                if (language === 'javascript') {
                    if (data === 'spooler_init') {
                        return `\nfunction spooler_init(){\n\treturn true|false;\n}`;
                    } else if (data === 'spooler_open') {
                        return `\nfunction spooler_open(){\n\treturn true|false;\n}`;
                    } else if (data === 'spooler_process') {
                        return `\nfunction spooler_process(){\n\treturn true|false;\n}`;
                    } else if (data === 'spooler_close') {
                        return `\nfunction spooler_close(){\n\n}`;
                    } else if (data === 'spooler_exit') {
                        return `\nfunction spooler_exit(){\n\n}`;
                    } else if (data === 'spooler_on_error') {
                        return `\nfunction spooler_on_error(){\n\n}`;
                    } else if (data === 'spooler_task_before') {
                        return `\nfunction spooler_task_before(){\n\treturn true|false;\n}`;
                    } else if (data === 'spooler_task_after') {
                        return `\nfunction spooler_task_after(){\n\treturn true|false;\n}`;
                    } else if (data === 'spooler_process_before') {
                        return `\nfunction spooler_process_before(){\n\treturn true|false;\n}`;
                    } else if (data === 'function spooler_process_after') {
                        return `\nfunction spooler_process_after(spooler_process_result){\n\treturn true|false;\n}`;
                    }
                } else if (language === 'perl') {
                    if (data === 'spooler_init') {
                        return `\nsub spooler_init() {\n\treturn 0|1\n} #End of spooler_init`;
                    } else if (data === 'spooler_open') {
                        return `\nsub spooler_open() {\n\treturn 0|1\n} #End of spooler_open`;
                    } else if (data === 'spooler_process') {
                        return `\nsub spooler_process() {\n\treturn 0|1\n #End of spooler_process`;
                    } else if (data === 'spooler_close') {
                        return `\nsub spooler_close() {\n\n} #End of spooler_close`;
                    } else if (data === 'spooler_exit') {
                        return `\nsub spooler_exit() {\n\n} #End of spooler_exit`;
                    } else if (data === 'spooler_on_error') {
                        return `\nsub spooler_on_error() {\n\n} #End of spooler_on_error`;
                    } else if (data === 'spooler_on_success') {
                        return `\nsub spooler_on_success() {\n\n} #End of spooler_on_success`;
                    }  else if (data === 'spooler_task_before') {
                        return `\nsub spooler_task_before {\n\treturn 0|1;\n} #End of spooler_task_after`;
                    } else if (data === 'spooler_task_after') {
                        return `\nsub spooler_task_after {\n\treturn 0|1;\n} #End of spooler_task_after`;
                    } else if (data === 'spooler_process_before') {
                        return `\nsub spooler_process_before {\n\treturn 0|1;\n} #End of spooler_process_before`;
                    } else if (data === 'function spooler_process_after') {
                        return `\nsub spooler_process_after {\n\tmy $return_value = $_[0];\nreturn 0|1;\n} #End of spooler_process_after`;
                    }
                } else if (language === 'vbscript') {
                    if (data === 'spooler_init') {
                        return `\nFunction spooler_init()\n\tspooler_init = true|false\nEnd Function`;
                    } else if (data === 'spooler_open') {
                        return `\nFunction spooler_open()\n\tspooler_init = true|false\nEnd Function`;
                    } else if (data === 'spooler_process') {
                        return `\nFunction spooler_process()\n\tspooler_process = true|false\nEnd Function`;
                    } else if (data === 'spooler_close') {
                        return `\nSub spooler_close()\n\nEnd Sub`;
                    } else if (data === 'spooler_exit') {
                        return `\nSub spooler_exit()\n\nEnd Sub`;
                    } else if (data === 'spooler_on_error') {
                        return `\nSub spooler_on_error()\n\nEnd Sub`;
                    } else if (data === 'spooler_on_success') {
                        return `\nSub spooler_on_success()\n\nEnd Sub`;
                    }  else if (data === 'spooler_task_before') {
                        return `\nFunction spooler_task_before()\n\n\tspooler_task_before = true|false\nEnd Function`;
                    } else if (data === 'spooler_task_after') {
                        return `\nSub spooler_task_after()\n\nEnd Sub`;
                    } else if (data === 'spooler_process_before') {
                        return `\nFunction spooler_process_before()\n\n\tspooler_process_before = true|false\nEnd Function`;
                    } else if (data === 'function spooler_process_after') {
                        return `\nFunction spooler_process_after(spooler_process_result){\n\tspooler_process_after = true|false\nEnd Function`;
                    }
                } else if(language === 'powershell'){
                    if (data === 'spooler_init') {
                        return `\nfunction spooler_init(){\n\treturn $true|$false;)\n}`;
                    } else if (data === 'spooler_open') {
                        return `\nfunction spooler_open(){\n\treturn $true|$false;\n}`;
                    } else if (data === 'spooler_process') {
                        return `\nfunction spooler_process(){\n\treturn $true|$false;\n}`;
                    } else if (data === 'spooler_close') {
                        return `\nfunction spooler_close(){\n\n}`;
                    } else if (data === 'spooler_exit') {
                        return `\nfunction spooler_exit(){\n\n}`;
                    } else if (data === 'spooler_on_error') {
                        return `\nfunction spooler_on_error(){\n\n}`;
                    }  else if (data === 'spooler_task_before') {
                        return `\nfunction spooler_task_before(){\n\treturn $true|$false;\n}`;
                    } else if (data === 'spooler_task_after') {
                        return `\nfunction spooler_task_after(){\n\treturn $true|$false;\n}`;
                    } else if (data === 'spooler_process_before') {
                        return `\nfunction spooler_process_before(){\n\treturn $true|$false;\n}`;
                    } else if (data === 'function spooler_process_after') {
                        return `\nfunction spooler_process_after(spooler_process_result){\n\treturn $true|$false;\n}`;
                    }
                }
            }
        }
    }
})();

