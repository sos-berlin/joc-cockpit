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
            }, deleteDraft: function (filter) {
                let deferred = $q.defer();
                let Delete = $resource('joe/deletedraft');
                Delete.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            restore: function (filter) {
                let deferred = $q.defer();
                let Delete = $resource('joe/undelete');
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
            lock: function (filter) {
                let deferred = $q.defer();
                let Lock = $resource('joe/lock');
                Lock.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }, releaseLock: function (filter) {
                let deferred = $q.defer();
                let Lock = $resource('joe/lock/release');
                Lock.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }, lockInfo: function (filter) {
                let deferred = $q.defer();
                let Lock = $resource('joe/lock/info');
                Lock.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJitlJobs: function (filter) {
                let deferred = $q.defer();
                let job = $resource('joe/wizard/jobs');
                job.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            getJitlJob: function (filter) {
                let deferred = $q.defer();
                let Param = $resource('joe/wizard/job');
                Param.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            readXML: function (filter) {
                let deferred = $q.defer();
                let xsdRead = $resource('xmleditor/read');
                xsdRead.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            xmlToJson: function (filter) {
                let deferred = $q.defer();
                let xsdRead = $resource('xmleditor/xml2json');
                xsdRead.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            storeXML: function (filter) {
                let deferred = $q.defer();
                let xsdStore = $resource('xmleditor/store');
                xsdStore.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            validateXML: function (filter) {
                let deferred = $q.defer();
                let xmlValidate = $resource('xmleditor/validate');
                xmlValidate.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deployXML: function (filter) {
                let deferred = $q.defer();
                let deployXML = $resource('xmleditor/deploy');
                deployXML.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deleteXML: function (filter) {
                let deferred = $q.defer();
                let deployXML = $resource('xmleditor/delete');
                deployXML.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            deleteAllXML: function (filter) {
                let deferred = $q.defer();
                let deployXML = $resource('xmleditor/delete/all');
                deployXML.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            renameXML: function (filter) {
                let deferred = $q.defer();
                let rename = $resource('xmleditor/rename');
                rename.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            assignSchema: function (filter) {
                let deferred = $q.defer();
                let assign = $resource('xmleditor/schema/assign');
                assign.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            applySchema: function (filter) {
                let deferred = $q.defer();
                let assign = $resource('xmleditor/apply');
                assign.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            reassignSchema: function (filter) {
                let deferred = $q.defer();
                let assign = $resource('xmleditor/schema/reassign');
                assign.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },
            isFolderLock: function (tree, path) {
                let lockedBy = '';
                if (tree.length > 0) {
                    function traverseTree(data) {
                        if (data.folders) {
                            for (let i = 0; i < data.folders.length; i++) {
                                if (path === data.path) {
                                    lockedBy = data.lockedBy;
                                    break;
                                } else {
                                    traverseTree(data.folders[i]);
                                }
                            }
                        }
                    }

                    traverseTree(tree[0]);
                }
                return lockedBy;
            },
            diff: function (data1, data2) {
                let dmp = new diff_match_patch();
                let a = dmp.diff_main(data1, data2, false);
                let b = dmp.diff_prettyHtml(a);
                b = b.replace(/(&para;)+/gi, '');
                b = b.replace(/<br>(\s+&lt;)/gi, '$1');
                return b;
            },
            getTextContent: function (content) {
                content = content.replace(/<br>(\s*)/gi, '\n$1');
                return content.replace(/<[^>]+>/gm, '').replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
            },
            getFunctionalCode: function (data, language) {
                if (language === 'javascript' || language === 'java:javascript' || language === 'javax.script:rhino' || language === 'javax.script:ecmascript') {
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
                    } else if (data === 'spooler_on_success') {
                        return `\nfunction spooler_on_success(){\n\n}`;
                    } else if (data === 'spooler_task_before') {
                        return `\nfunction spooler_task_before(){\n\treturn true|false;\n}`;
                    } else if (data === 'spooler_task_after') {
                        return `\nfunction spooler_task_after(){\n\treturn true|false;\n}`;
                    } else if (data === 'spooler_process_before') {
                        return `\nfunction spooler_process_before(){\n\treturn true|false;\n}`;
                    } else if (data === 'spooler_process_after') {
                        return `\nfunction spooler_process_after(spooler_process_result){\n\treturn true|false;\n}`;
                    }
                } else if (language === 'perlScript') {
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
                    } else if (data === 'spooler_task_before') {
                        return `\nsub spooler_task_before {\n\treturn 0|1;\n} #End of spooler_task_after`;
                    } else if (data === 'spooler_task_after') {
                        return `\nsub spooler_task_after {\n\treturn 0|1;\n} #End of spooler_task_after`;
                    } else if (data === 'spooler_process_before') {
                        return `\nsub spooler_process_before {\n\treturn 0|1;\n} #End of spooler_process_before`;
                    } else if (data === 'spooler_process_after') {
                        return `\nsub spooler_process_after {\n\tmy $return_value = $_[0];\nreturn 0|1;\n} #End of spooler_process_after`;
                    }
                } else if (language === 'VBScript' || language === 'scriptcontrol:vbscript') {
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
                    } else if (data === 'spooler_task_before') {
                        return `\nFunction spooler_task_before()\n\n\tspooler_task_before = true|false\nEnd Function`;
                    } else if (data === 'spooler_task_after') {
                        return `\nSub spooler_task_after()\n\nEnd Sub`;
                    } else if (data === 'spooler_process_before') {
                        return `\nFunction spooler_process_before()\n\n\tspooler_process_before = true|false\nEnd Function`;
                    } else if (data === 'spooler_process_after') {
                        return `\nFunction spooler_process_after(spooler_process_result){\n\tspooler_process_after = true|false\nEnd Function`;
                    }
                } else if (language === 'powershell') {
                    if (data === 'spooler_init') {
                        return `\nfunction spooler_init(){\n\treturn $true|$false;\n}`;
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
                    } else if (data === 'spooler_on_success') {
                        return `\nfunction spooler_on_success(){\n\n}`;
                    } else if (data === 'spooler_task_before') {
                        return `\nfunction spooler_task_before(){\n\treturn $true|$false;\n}`;
                    } else if (data === 'spooler_task_after') {
                        return `\nfunction spooler_task_after(){\n\treturn $true|$false;\n}`;
                    } else if (data === 'spooler_process_before') {
                        return `\nfunction spooler_process_before(){\n\treturn $true|$false;\n}`;
                    } else if (data === 'spooler_process_after') {
                        return `\nfunction spooler_process_after(spooler_process_result){\n\treturn $true|$false;\n}`;
                    }
                }
            },
            getFunctionalCodeForMonitor: function (data, language) {
                if (language === 'javascript' || language === 'java:javascript' || language === 'javax.script:rhino' || language === 'javax.script:ecmascript') {
                    if (data === 'spooler_task_before') {
                        return `\nfunction spooler_task_before(){\n\treturn true|false;\n}`;
                    } else if (data === 'spooler_task_after') {
                        return `\nfunction spooler_task_after(){\n}`;
                    } else if (data === 'spooler_process_before') {
                        return `\nfunction spooler_process_before(){\n\treturn true|false;\n}`;
                    } else if (data === 'spooler_process_after') {
                        return `\nfunction spooler_process_after(spooler_process_result){\n\treturn true|false;\n}`;
                    }
                } else if (language === 'perlScript') {
                    if (data === 'spooler_task_before') {
                        return `\nsub spooler_task_before {\n\treturn 0|1;\n} #End of spooler_task_after`;
                    } else if (data === 'spooler_task_after') {
                        return `\nsub spooler_task_after {\n\treturn 0|1;\n} #End of spooler_task_after`;
                    } else if (data === 'spooler_process_before') {
                        return `\nsub spooler_process_before {\n\treturn 0|1;\n} #End of spooler_process_before`;
                    } else if (data === 'spooler_process_after') {
                        return `\nsub spooler_process_after {\n\tmy $return_value = $_[0];\nreturn 0|1;\n} #End of spooler_process_after`;
                    }
                } else if (language === 'VBScript' || language === 'scriptcontrol:vbscript') {
                    if (data === 'spooler_task_before') {
                        return `\nFunction spooler_task_before()\n\n\tspooler_task_before = true|false\nEnd Function`;
                    } else if (data === 'spooler_task_after') {
                        return `\nSub spooler_task_after()\n\nEnd Sub`;
                    } else if (data === 'spooler_process_before') {
                        return `\nFunction spooler_process_before()\n\n\tspooler_process_before = true|false\nEnd Function`;
                    } else if (data === 'spooler_process_after') {
                        return `\nFunction spooler_process_after(spooler_process_result)\n\n\tspooler_process_after = true|false\nEnd Function`;
                    }
                } else if (language === 'powershell') {
                   if (data === 'spooler_task_before') {
                        return `\nfunction spooler_task_before(){\n\treturn $true|$false;\n}`;
                    } else if (data === 'spooler_task_after') {
                        return `\nfunction spooler_task_after(){\n}`;
                    } else if (data === 'spooler_process_before') {
                        return `\nfunction spooler_process_before(){\n\treturn $true|$false;\n}`;
                    } else if (data === 'spooler_process_after') {
                        return `\nfunction spooler_process_after(spooler_process_result){\n\treturn $true|$false;\n}`;
                    }
                }
            },
            isLastEntryEmpty: function (list, key1, key2) {
                let flag = false;
                if (list && list.length > 0) {
                    let x = list[list.length - 1];
                    if ((x[key1] !== undefined && x[key1] === '') || (x[key2] !== undefined && x[key2] === '')) {
                        flag = true;
                    }
                }
                return flag;
            },
            clearEmptyData: function (obj) {
                if (!obj) {
                    return obj;
                }
                if (obj.params) {
                    if (obj.params.includes) {
                        if (obj.params.includes.length === 0) {
                            delete obj.params['includes']
                        } else {
                            if (this.isLastEntryEmpty(obj.params.includes, 'file', 'liveFile')) {
                                obj.params.includes.splice(obj.params.includes.length - 1, 1);
                                if (obj.params.includes.length === 0) {
                                    delete obj.params['includes']
                                }
                            }
                        }
                    }
                    if (obj.params.paramList) {
                        if (obj.params.paramList.length === 0) {
                            delete obj.params['paramList']
                        } else {
                            if (this.isLastEntryEmpty(obj.params.paramList, 'name', '')) {
                                obj.params.paramList.splice(obj.params.paramList.length - 1, 1);
                                if (obj.params.paramList.length === 0) {
                                    delete obj.params['paramList']
                                }
                            }
                        }
                    }
                    if (_.isEmpty(obj.params)) {
                        delete obj['params']
                    }
                }
                if (obj.environment) {
                    if (obj.environment.variables) {
                        if (obj.environment.variables.length === 0) {
                            delete obj.environment['variables']
                        } else {
                            if (this.isLastEntryEmpty(obj.environment.variables, 'name', '')) {
                                obj.environment.variables.splice(obj.environment.variables.length - 1, 1);
                                if (obj.environment.variables.length === 0) {
                                    delete obj.environment['variables']
                                }
                            }
                        }
                    }
                }
                if (obj.lockUses) {
                    if (obj.lockUses.length === 0) {
                        delete obj['lockUses']
                    } else {
                        if (this.isLastEntryEmpty(obj.lockUses, 'lock', '')) {
                            obj.lockUses.splice(obj.lockUses.length - 1, 1);
                            if (obj.lockUses.length === 0) {
                                delete obj['lockUses']
                            }
                        }
                    }

                }
                if (obj.monitorUses) {
                    if (obj.monitorUses.length === 0) {
                        delete obj['monitorUses']
                    } else {
                        if (this.isLastEntryEmpty(obj.monitorUses, 'name', '')) {
                            obj.monitorUses.splice(obj.monitorUses.length - 1, 1);
                            if (obj.monitorUses.length === 0) {
                                delete obj['monitorUses']
                            }
                        }
                    }
                }
                if (obj.jobChainNodes) {
                    if (obj.jobChainNodes.params) {
                        if (obj.jobChainNodes.params.paramList) {
                            if (obj.jobChainNodes.params.paramList.length === 0) {
                                delete obj.jobChainNodes.params['paramList']
                            } else {
                                if (this.isLastEntryEmpty(obj.jobChainNodes.params.paramList, 'name', '')) {
                                    obj.jobChainNodes.params.paramList.splice(obj.jobChainNodes.params.paramList.length - 1, 1);
                                    if (obj.jobChainNodes.params.paramList.length === 0) {
                                        delete obj.jobChainNodes.params['paramList']
                                    }
                                }
                            }
                        }
                    }
                }
                return obj;
            },
            xsdAnyURIValidation: function (value) {
                return /^((ht|f)tp(s?)\:\/\/)?(www.|[a-zA-Z].)[a-zA-Z0-9\-\.]+\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk)(\:[0-9]+)*(\/($|[a-zA-Z0-9\.\,\;\?\'\\\+&amp;%\$#\=~_\-]+))*$/.test(value)
                    || /^(?:(<protocol>http(?:s?)|ftp)(?:\:\/\/))(?:(<usrpwd>\w+\:\w+)(?:\@))?(<domain>[^/\r\n\:]+)?(<port>\:\d+)?(<path>(?:\/.*)*\/)?(<filename>.*?\.(<ext>\w{2,4}))?(<qrystr>\??(?:\w+\=[^\#]+)(?:\&?\w+\=\w+)*)*(<bkmrk>\#.{})?$/.test(value)
                    || /^([a-zA-Z]\:|\\\\[^\/\\:*?"<>|]+\\[^\/\\:*?"<>|]+)(\\[^\/\\:*?"<>|]+)+(|([a-zA-Z0-9]{0,*}))$/.test(value)
                    || /^((?:2[0-5]{2}|1\d{2}|[1-9]\d|[1-9])\.(?:(?:2[0-5]{2}|1\d{2}|[1-9]\d|\d)\.){2}(?:2[0-5]{2}|1\d{2}|[1-9]\d|\d))(:((\d|[1-9]\d|[1-9]\d{2,3}|[1-5]\d{4}|6[0-4]\d{3}|654\d{2}|655[0-2]\d|6553[0-5]))|(\d{0}))$/.test(value)
                    || /^(((..\/){0,1})([A-Za-z0-9é\%]+)(\.([a-zA-Z]+((\#{0,1})([a-zA-Z]{0,})))))$/.test(value)
                    || /^((mailto:){0,1}([A-Za-z0-9]{0,}(\@){0,1}([a-zA-Z0-9]{0,})(\.{0,1}(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk))))$/.test(value);
            }, popover: function () {
                $('[data-toggle="popover"]').popover({
                    html: true,
                    container: '.modal-body',
                    trigger: "manual",
                }).on("mouseenter", function () {
                    const _this = this;
                    $(this).popover("show");
                    const dom = $('.popover');
                    let y = dom.css('transform').split(',')[5];
                    if (y) {
                        y = parseInt(y);
                        if (y < -10) {
                            dom.css({top: Math.abs(y) + 'px'});
                            $('.popover-arrow').css({'margin-top': y + 'px'});
                        }
                    }
                    dom.on("mouseleave", function () {
                        $(_this).popover('hide');
                    });
                }).on("mouseleave", function () {
                    const _this = this;
                    setTimeout(function () {
                        if (!$(".popover:hover").length) {
                            $(_this).popover("hide");
                        }
                    }, 100);
                });
            }
        }
    }
})();

