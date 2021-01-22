import {Injectable} from '@angular/core';
import * as _ from 'underscore';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from './core.service';
import {StringDatePipe} from '../filters/filter.pipe';

declare const mxHierarchicalLayout;
declare const mxTooltipHandler;
declare const mxUtils;

@Injectable()
export class WorkflowService {
  // Declare Map object to store fork and join Ids
  public merge;
  public finish;
  public fail;
  public await;
  public publish;
  public fork;
  public lock;
  public closeLock;
  preferences: any = {};

  constructor(public translate: TranslateService, public coreService: CoreService,
              private stringDatePipe: StringDatePipe) {
    mxHierarchicalLayout.prototype.interRankCellSpacing = 45;
    mxTooltipHandler.prototype.delay = 0;
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
  }

  /**
   * Reformat the layout
   */
  static executeLayout(graph) {
    const layout = new mxHierarchicalLayout(graph);
    layout.execute(graph.getDefaultParent());
  }

  init(theme) {
    if (theme === 'light') {
      this.merge = 'symbol;image=./assets/mxgraph/images/symbols/merge.svg';
      this.finish = 'symbol;image=./assets/mxgraph/images/symbols/finish.svg';
      this.fail = 'symbol;image=./assets/mxgraph/images/symbols/fail.svg';
      this.await = 'symbol;image=./assets/mxgraph/images/symbols/await.svg';
      this.fork = 'symbol;image=./assets/mxgraph/images/symbols/fork.svg';
      this.publish = 'symbol;image=./assets/mxgraph/images/symbols/publish.svg';
      this.lock = 'symbol;image=./assets/mxgraph/images/symbols/lock.svg';
      this.closeLock = 'symbol;image=./assets/mxgraph/images/symbols/lock-close.svg';
    } else {
      this.merge = 'symbol;image=./assets/mxgraph/images/symbols/merge-white.svg';
      this.finish = 'symbol;image=./assets/mxgraph/images/symbols/finish-white.svg';
      this.fail = 'symbol;image=./assets/mxgraph/images/symbols/fail-white.svg';
      this.await = 'symbol;image=./assets/mxgraph/images/symbols/await-white.svg';
      this.fork = 'symbol;image=./assets/mxgraph/images/symbols/fork-white.svg';
      this.publish = 'symbol;image=./assets/mxgraph/images/symbols/publish-white.svg';
      this.lock = 'symbol;image=./assets/mxgraph/images/symbols/lock-white.svg';
      this.closeLock = 'symbol;image=./assets/mxgraph/images/symbols/lock-close-white.svg';
    }
  }

  create_UUID() {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  createObject(type, node): any {
    let obj: any = {
      id: node._id,
      uuid: node._uuid,
      TYPE: type
    };
    if (type === 'Job') {
      obj.jobName = node._jobName;
      obj.label = node._label;
      if (!node._defaultArguments || typeof node._defaultArguments !== 'string') {
        obj.defaultArguments = {};
      } else {
        obj.defaultArguments = JSON.parse(node._defaultArguments);
      }
    } else if (type === 'If') {
      obj.predicate = node._predicate;
    } else if (type === 'Lock') {
      obj.lockId = node._lockId;
      obj.count = node._count;
    } else if (type === 'Retry') {
      obj.maxTries = node._maxTries;
      obj.retryDelays = node._retryDelays;
    } else if (type === 'Finish' || type === 'Fail') {
      let outcome = node._outcome;
      if (!outcome) {
        outcome = type === 'Fail' ? {'TYPE': 'Failed', result: {}} : {'TYPE': 'Succeeded', result: {}};
      } else {
        outcome = JSON.parse(outcome);
      }
      obj.outcome = outcome;
    } else if (type === 'FileWatcher') {
      obj.directory = node._directory;
      obj.regex = node._regex;
    } else if (type === 'Await') {
      obj.junctionPath = node._junctionPath;
      obj.timeout = node._timeout;
      obj.joinVariables = node._joinVariables;
      obj.predicate = node._predicate;
      obj.match = node._match;
    } else if (type === 'Publish') {
      obj.junctionPath = node._junctionPath;
    }
    if (type === 'Fork' || type === 'If' || type === 'Try' || type === 'Retry' || type === 'Lock') {
      obj.isCollapsed = node.mxCell._collapsed;
      if (type === 'Fork') {
        obj.joinVariables = node._joinVariables;
      }
    }
    return obj;
  }

  convertTryInstruction(instruction) {
    let catchObj = _.clone(instruction.catch);
    instruction.try = {
      instructions: instruction.instructions
    };
    delete instruction['instructions'];
    delete instruction['catch'];
    instruction['catch'] = catchObj;
  }

  convertRetryToTryCatch(instruction) {
    instruction.try = {
      instructions: instruction.instructions
    };
    instruction.catch = {
      instructions: [
        {
          TYPE: 'Retry'
        }
      ]
    };
    if (typeof instruction.retryDelays == 'string') {
      instruction.retryDelays = instruction.retryDelays.split(',').map(Number);
    }
    const catchObj = _.clone(instruction.catch);
    const retryDelays = _.clone(instruction.retryDelays);
    const maxTries = _.clone(instruction.maxTries);
    delete instruction['instructions'];
    delete instruction['catch'];
    delete instruction['retryDelays'];
    delete instruction['maxTries'];
    instruction['catch'] = catchObj;
    instruction['maxTries'] = maxTries;
    instruction['retryDelays'] = retryDelays;
  }

  isValidObject(str) {
    if (/^([A-Z]|[a-z]|_|\$)([A-Z]|[a-z]|[0-9]|\$|_)*$/.test(str)) {
      return !/^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|double|do|else|enum|extends|false|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)$/.test(str);
    } else {
      return false;
    }
  }

  validateFields(value, type): boolean {
    if (value) {
      if (value.defaultArguments && _.isEmpty(value.defaultArguments)) {
        delete value['defaultArguments'];
      }
      if (type === 'Job') {
        if (typeof value.jobClass !== 'string') {
          delete value['jobClass'];
        }
        if ((!value.executable || !value.executable.script || !value.agentId)) {
          return false;
        }
      }
      if (type === 'Await') {
        if (!value.junctionPath) {
          return false;
        }
        if (value.match && !this.isValidObject(value.match)) {
          return false;
        }
      }
      if (type === 'Lock') {
        if (!value.count) {
          delete value['count'];
        }
        if (!value.lockId) {
          return false;
        }
      }
      if (type === 'Node') {
        if (!value.label || value.label === '' || value.label == 'null' || value.label == 'undefined') {
          return false;
        } else if (value.label && !this.isValidObject(value.label)) {
          value.label = '';
          return false;
        }
        if (!this.isValidObject(value.jobName)) {
          return false;
        }
      }
      if (type === 'Fork') {
        if (!value.branches || value.branches.length < 2) {
          return false;
        }
        for (let i = 0; i < value.branches.length; i++) {
          if (!value.branches[i].id) {
            return false;
          } else {
            if (!this.isValidObject(value.branches[i].id)) {
              return false;
            }
          }
        }
      }
      if (value.returnCodeMeaning) {
        if (value.returnCodeMeaning.success && typeof value.returnCodeMeaning.success == 'string') {
          value.returnCodeMeaning.success = value.returnCodeMeaning.success.split(',').map(Number);
          delete value.returnCodeMeaning['failure'];
        } else if (value.returnCodeMeaning.failure && typeof value.returnCodeMeaning.failure == 'string') {
          value.returnCodeMeaning.failure = value.returnCodeMeaning.failure.split(',').map(Number);
          delete value.returnCodeMeaning['success'];
        }
        if (value.returnCodeMeaning.failure === '') {
          delete value.returnCodeMeaning['failure'];
        }
        if (value.returnCodeMeaning.success === '' && !value.returnCodeMeaning.failure) {
          value.returnCodeMeaning = {};
        }
        if (_.isEmpty(value.returnCodeMeaning)) {
          delete value['returnCodeMeaning'];
        }
      }
      if (value.returnCode && value.returnCode != 'null' && value.returnCode != 'undefined' && typeof value.returnCode == 'string') {
        value.returnCode = parseInt(value.returnCode, 10);
        if (_.isNaN(value.returnCode)) {
          delete value['returnCode'];
        }
      } else {
        delete value['returnCode'];
      }

      if (value.joinVariables && value.joinVariables != 'null' && value.joinVariables != 'undefined' && typeof value.joinVariables == 'string') {
        value.joinVariables = value.joinVariables == 'true';
      } else {
        delete value['joinVariables'];
      }

      if (value.timeout1) {
        delete value['timeout1'];
      }
      if (value.graceTimeout1) {
        delete value['graceTimeout1'];
      }
      if (typeof value.taskLimit === 'string') {
        value.taskLimit = parseInt(value.taskLimit, 10);
        if (_.isNaN(value.taskLimit)) {
          value.taskLimit = 1;
        }
      }
      if (typeof value.timeout === 'string') {
        value.timeout = parseInt(value.timeout, 10);
        if (_.isNaN(value.timeout)) {
          delete value['timeout'];
        }
      }
      if (typeof value.graceTimeout === 'string') {
        value.graceTimeout = parseInt(value.graceTimeout, 10);
        if (_.isNaN(value.graceTimeout)) {
          delete value['graceTimeout'];
        }
      }
    }
    return true;
  }

  convertTryToRetry(_json, cb) {
    let count = 1;

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (!cb) {
            json.instructions[x].id = ++count;
          }
          if (json.instructions[x].TYPE === 'Execute.Named') {
            json.instructions[x].TYPE = 'Job';
          }
          if (json.instructions[x].TYPE === 'Try') {
            let isRetry = false;
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length === 1
                && json.instructions[x].catch.instructions[0].TYPE === 'Retry') {
                json.instructions[x].TYPE = 'Retry';
                json.instructions[x].instructions = json.instructions[x].try.instructions;
                isRetry = true;
                delete json.instructions[x]['try'];
                delete json.instructions[x]['catch'];
              }
            }
            if (!isRetry) {
              if (json.instructions[x].try) {
                json.instructions[x].instructions = json.instructions[x].try.instructions || [];
                delete json.instructions[x]['try'];
              }
              if (json.instructions[x].catch) {
                if (!json.instructions[x].catch.instructions) {
                  json.instructions[x].catch.instructions = [];
                }
              } else {
                json.instructions[x].catch = {instructions: []};
              }
            }
          }
          if (json.instructions[x].TYPE === 'Lock') {
            if (json.instructions[x].lockedWorkflow) {
              json.instructions[x].instructions = json.instructions[x].lockedWorkflow.instructions;
              delete json.instructions[x]['lockedWorkflow'];
            }
          }
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            recursive(json.instructions[x].else);
          }
          if (json.instructions[x].branches) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              if (json.instructions[x].branches[i].workflow) {
                json.instructions[x].branches[i].instructions = json.instructions[x].branches[i].workflow.instructions;
                delete json.instructions[x].branches[i]['workflow'];
              }
              if (json.instructions[x].branches[i].instructions) {
                recursive(json.instructions[x].branches[i]);
              } else if (!json.instructions[x].branches[i].instructions && !json.instructions[x].branches[i].workflow) {
                json.instructions[x].branches.splice(i, 1);
              }
            }
          }
        }
      }
    }

    recursive(_json);
    if (cb) {
      cb();
    }
  }

  createWorkflow(_json, editor, mapObj) {
    mapObj.nodeMap = new Map();
    if(mapObj.vertixMap) {
      mapObj.vertixMap = new Map();
    }
    let graph = editor.graph;
    const self = this;
    const doc = mxUtils.createXmlDocument();
    let vertexMap = new Map();
    const defaultParent = graph.getDefaultParent();

    function connectWithDummyNodes(json) {
      if (json.instructions && json.instructions.length > 0) {
        let _node = doc.createElement('Process');
        _node.setAttribute('title', 'start');
        let v1 = graph.insertVertex(defaultParent, null, _node, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;');

        const start = vertexMap.get(json.instructions[0].uuid);
        const last = json.instructions[json.instructions.length - 1];
        let end = vertexMap.get(last.uuid);
        if (last.TYPE === 'Fork' || last.TYPE === 'If' || last.TYPE === 'Try' || last.TYPE === 'Retry' || last.TYPE === 'Lock') {
          let targetId = mapObj.nodeMap.get(last.id);
          if (targetId) {
            end = graph.getModel().getCell(targetId);
          }
        }
        let _node2 = doc.createElement('Process');
        _node2.setAttribute('title', 'end');
        let v2 = graph.insertVertex(defaultParent, null, _node2, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;');

        connectInstruction(v1, start, '', '', defaultParent);
        connectInstruction(end, v2, '', '', defaultParent);
      }
    }

    function recursive(json, type, parent) {
      if (json.instructions) {
        let v1, endNode;
        for (let x = 0; x < json.instructions.length; x++) {
          let v2;
          let _node = doc.createElement(json.instructions[x].TYPE);
          if(json.instructions[x].position) {
            _node.setAttribute('position', JSON.stringify(json.instructions[x].position));
          }
          if (!json.instructions[x].uuid) {
            json.instructions[x].uuid = self.create_UUID();
          }
          if (json.instructions[x].TYPE === 'Job') {
            _node.setAttribute('jobName', json.instructions[x].jobName);
            _node.setAttribute('label', json.instructions[x].label || '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            if (json.instructions[x].defaultArguments && typeof json.instructions[x].defaultArguments === 'object') {
              _node.setAttribute('defaultArguments', JSON.stringify(json.instructions[x].defaultArguments));
            } else {
              _node.setAttribute('defaultArguments', '');
            }
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 180, 40, 'job');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Finish') {
            _node.setAttribute('label', 'finish');
            const outcome = json.instructions[x].outcome || {'TYPE': 'Succeeded', result: ''};
            _node.setAttribute('outcome', JSON.stringify(outcome));
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.finish);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Fail') {
            _node.setAttribute('label', 'fail');
            const outcome = json.instructions[x].outcome || {'TYPE': 'Failed', result: ''};
            _node.setAttribute('outcome', JSON.stringify(outcome));
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.fail);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Publish') {
            _node.setAttribute('label', 'publish');
            _node.setAttribute('junctionPath', json.instructions[x].junctionPath || '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.publish);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Await') {
            _node.setAttribute('label', 'await');
            _node.setAttribute('junctionPath', json.instructions[x].junctionPath || '');
            _node.setAttribute('timeout', json.instructions[x].timeout || '');
            _node.setAttribute('joinVariables', json.instructions[x].joinVariables || '');
            _node.setAttribute('predicate', json.instructions[x].predicate || '');
            _node.setAttribute('match', json.instructions[x].match || '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.await);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Fork') {
            _node.setAttribute('label', 'fork');
            _node.setAttribute('joinVariables', json.instructions[x].joinVariables || '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.fork);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions && json.instructions[x].branches[i].instructions.length > 0) {
                  recursive(json.instructions[x].branches[i], 'branch', v1);
                  connectInstruction(v1, vertexMap.get(json.instructions[x].branches[i].instructions[0].uuid), json.instructions[x].branches[i].id, 'branch', v1);
                }
              }
              v2 = joinFork(json.instructions[x].branches, v1, parent);
            } else {
              v2 = joinFork(v1, v1, parent);
            }
          } else if (json.instructions[x].TYPE === 'If') {
            _node.setAttribute('label', 'if');
            _node.setAttribute('predicate', json.instructions[x].predicate);
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'if');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].then && json.instructions[x].then.instructions && json.instructions[x].then.instructions.length > 0) {
              recursive(json.instructions[x].then, 'endIf', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].then.instructions[0].uuid), 'then', 'then', v1);
            }
            if (json.instructions[x].else && json.instructions[x].else.instructions && json.instructions[x].else.instructions.length > 0) {
              recursive(json.instructions[x].else, 'endIf', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].else.instructions[0].uuid), 'else', 'else', v1);
            }
            v2 = endIf(json.instructions[x], v1, parent);
          } else if (json.instructions[x].TYPE === 'Retry') {
            _node.setAttribute('label', 'retry');
            _node.setAttribute('maxTries', json.instructions[x].maxTries || '');
            _node.setAttribute('retryDelays', json.instructions[x].retryDelays ? json.instructions[x].retryDelays.toString() : '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'retry');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'retry', 'retry', v1);
              v2 = endRetry(json.instructions[x], v1.id, parent);
            } else {
              v2 = endRetry(v1, v1.id, parent);
            }
          } else if (json.instructions[x].TYPE === 'Lock') {
            _node.setAttribute('label', 'lock');
            _node.setAttribute('lockId', json.instructions[x].lockId || '');
            _node.setAttribute('count', json.instructions[x].count || '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.lock);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'lock', 'lock', v1);
              v2 = endLock(json.instructions[x], v1.id, parent);
            } else {
              v2 = endLock(v1, v1.id, parent);
            }
          } else if (json.instructions[x].TYPE === 'Try') {
            _node.setAttribute('label', 'try');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'try');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            const node = doc.createElement('Catch');
            node.setAttribute('label', 'catch');
            node.setAttribute('targetId', v1.id);
            node.setAttribute('uuid', json.instructions[x].uuid);
            let cv1 = graph.insertVertex(v1, null, node, 0, 0, 110, 40, (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) ?
              'catch' : 'dashRectangle');
            if (mapObj.vertixMap && json.instructions[x].catch.position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].catch.position), cv1);
            }
            let _id = v1;
            if (json.instructions[x].catch) {
              json.instructions[x].catch.id = cv1.id;
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                recursive(json.instructions[x].catch, 'endTry', v1);
                connectInstruction(cv1, vertexMap.get(json.instructions[x].catch.instructions[0].uuid), 'catch', 'catch', v1);
                _id = catchEnd(json.instructions[x].catch);
              } else {
                json.instructions[x].catch.instructions = [];
                _id = cv1;
              }
            }

            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'try', 'try', v1);
              const _lastNode = json.instructions[x].instructions[json.instructions[x].instructions.length - 1];
              if (_lastNode.TYPE === 'If' || _lastNode.TYPE === 'Fork' || _lastNode.TYPE === 'Try' || _lastNode.TYPE === 'Retry' || _lastNode.TYPE === 'Lock') {
                const end = graph.getModel().getCell(mapObj.nodeMap.get(_lastNode.id));
                connectInstruction(end, cv1, 'try', 'try', v1);
              } else {
                const end = graph.getModel().getCell(_lastNode.id);
                if (json.instructions[x].catch) {
                  connectInstruction(end, cv1, 'try', 'try', v1);
                } else {
                  _id = end;
                }
              }
            } else {
              if (json.instructions[x].catch) {
                connectInstruction(v1, cv1, 'try', 'try', v1);
              }
            }

            v2 = endTry(_id, v1.id, parent);
          }
          if (endNode) {
            connectInstruction(endNode, v1, type, type, parent);
            endNode = null;
          }
          if (json.instructions.length > (x + 1) && v2) {
            endNode = v2;
          }

          if (!vertexMap.has(json.instructions[x].uuid)) {
            vertexMap.set(json.instructions[x].uuid, v1);
          }
          if (v1) {
            json.instructions[x].id = v1.id;
            if (json.instructions[x].TYPE === 'Fork' || json.instructions[x].TYPE === 'If' ||
              json.instructions[x].TYPE === 'Try' || json.instructions[x].TYPE === 'Retry' || json.instructions[x].TYPE === 'Lock') {
              v1.collapsed = json.instructions[x].isCollapsed == '1';
            }
          }

          if (x > 0) {
            let prev = json.instructions[x - 1];
            if (prev.TYPE !== 'Fork' && prev.TYPE !== 'If' && prev.TYPE !== 'Try' && prev.TYPE !== 'Retry' && prev.TYPE !== 'Lock' && vertexMap.get(prev.uuid)) {
              connectInstruction(vertexMap.get(prev.uuid), v1, type, type, parent);
            }
          }
        }
      }
    }

    function connectInstruction(source, target, label, type, parent) {
      // Create new Connection object
      const connNode = doc.createElement('Connection');
      let str = label;
      if (label.substring(0, 6) === '$TYPE$') {
        type = 'branch';
        str = label.substring(6);
      }
      connNode.setAttribute('label', str);
      connNode.setAttribute('type', type);
      graph.insertEdge(parent, null, connNode, source, target);
    }

    function joinFork(branches, target, parent) {
      let _node = doc.createElement('Join');
      _node.setAttribute('label', 'join');
      if (target.id) {
        _node.setAttribute('targetId', target.id);
      }
      let v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.merge);
      mapObj.nodeMap.set(target.id.toString(), v1.id.toString());
      if (_.isArray(branches)) {
        for (let i = 0; i < branches.length; i++) {
          if (branches[i].instructions && branches[i].instructions.length > 0) {
            const x = branches[i].instructions[branches[i].instructions.length - 1];
            if (x) {
              let endNode;
              if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry' || x.TYPE === 'Lock') {
                endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
              } else {
                endNode = vertexMap.get(x.uuid);
              }
              connectInstruction(endNode, v1, 'join', 'join', parent);
            }
          } else {
            connectInstruction(target, v1, '', '', parent);
          }
        }
      } else {
        connectInstruction(branches, v1, '', '', parent);
      }
      return v1;
    }

    function endIf(branches, target, parent) {
      let _node = doc.createElement('EndIf');
      _node.setAttribute('label', 'ifEnd');
      if (target.id) {
        _node.setAttribute('targetId', target.id);
      }
      let v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'if');
      mapObj.nodeMap.set(target.id.toString(), v1.id.toString());
      let flag = true;
      if (branches.then && branches.then.instructions) {
        flag = false;
        const x = branches.then.instructions[branches.then.instructions.length - 1];
        if (x) {
          let endNode;
          if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry' || x.TYPE === 'Lock') {
            endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          connectInstruction(endNode, v1, 'endIf', 'endIf', parent);
        }
      }
      if (branches.else && branches.else.instructions) {
        flag = false;
        const x = branches.else.instructions[branches.else.instructions.length - 1];
        let endNode;
        if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry' || x.TYPE === 'Lock') {
          endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
        } else {
          endNode = vertexMap.get(x.uuid);
        }
        connectInstruction(endNode, v1, 'endIf', 'endIf', parent);
      }

      if (flag) {
        connectInstruction(target, v1, '', '', parent);
      }
      return v1;
    }

    function endLock(branches, targetId, parent) {
      let _node = doc.createElement('EndLock');
      _node.setAttribute('label', 'lockEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      let v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.closeLock);
      mapObj.nodeMap.set(targetId.toString(), v1.id.toString());

      if (branches.instructions && branches.instructions.length > 0) {
        const x = branches.instructions[branches.instructions.length - 1];
        if (x) {
          let endNode;
          if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry' || x.TYPE === 'Lock') {
            endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          connectInstruction(endNode, v1, 'endLock', 'endLock', parent);
        }
      } else {
        connectInstruction(branches, v1, '', '', parent);
      }
      return v1;
    }

    function endRetry(branches, targetId, parent) {
      let _node = doc.createElement('EndRetry');
      _node.setAttribute('label', 'retryEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      let v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'retry');
      mapObj.nodeMap.set(targetId.toString(), v1.id.toString());

      if (branches.instructions && branches.instructions.length > 0) {
        const x = branches.instructions[branches.instructions.length - 1];
        if (x) {
          let endNode;
          if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry' || x.TYPE === 'Lock') {
            endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          connectInstruction(endNode, v1, 'endRetry', 'endRetry', parent);
        }
      } else {
        connectInstruction(branches, v1, '', '', parent);
      }
      return v1;
    }

    function endTry(x, targetId, parent) {
      let _node = doc.createElement('EndTry');
      _node.setAttribute('label', 'tryEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      let v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'try');
      mapObj.nodeMap.set(targetId.toString(), v1.id.toString());

      connectInstruction(x, v1, 'endTry', 'endTry', parent);
      return v1;
    }

    function catchEnd(branches) {
      let x = branches.instructions[branches.instructions.length - 1];
      if (!x) {
        x = branches;
      }
      if (x) {
        let endNode;
        if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry' || x.TYPE === 'Lock') {
          endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
        } else {
          endNode = vertexMap.get(x.uuid);
        }
        return endNode;
      }
    }

    recursive(_json, '', defaultParent);
    connectWithDummyNodes(_json);
  }

  public convertValueToString(cell, graph): string {
    function truncate(input) {
      if (input.length > 22) {
        return input.substring(0, 22) + '...';
      } else {
        return input;
      }
    }

    let str = '';
    if (mxUtils.isNode(cell.value)) {
      if (cell.value.tagName === 'Process') {
        let title = cell.getAttribute('title');
        if (title != null && title.length > 0) {
          this.translate.get('workflow.label.' + title).subscribe(translatedValue => {
            str = translatedValue;
          });
          return str;
        }
        return '';
      } else if (cell.value.tagName === 'Job') {
        let lb = cell.getAttribute('label');
        if (lb) {
          const edge = graph.getOutgoingEdges(cell)[0];
          if (edge) {
            edge.setAttribute('label', lb);
          }
        }
        return '<div class="workflow-title">' + truncate(cell.getAttribute('jobName')) + '</div>';
      } else if (cell.value.tagName === 'Order') {
        let data = cell.getAttribute('order');
        data = JSON.parse(data);
        let color = '';
        if (data.state) {
          color = this.coreService.getColor(data.state.severity, 'text');
        }
        str = '<div class="vertex-text"><div class="block-ellipsis-job"><i class="fa fa-circle text-xs p-r-xs ' + color + '"></i>' + data.orderId + '</div>';
        if (data.scheduledFor) {
          str = str + ' <span class="text-xs" >' + this.stringDatePipe.transform(data.scheduledFor) + '</span>';
        }
        str = str + '</div>';
        return str;
      } else if (cell.value.tagName === 'Count') {
        let count = cell.getAttribute('count');
        return '<i class="text-white text-xs cursor">' + count + '</i>';
      } else {
        let x = cell.getAttribute('label');
        if (x) {
          if (cell.value.tagName === 'Connection') {
            if (x === 'then' || x === 'else') {
              this.translate.get('workflow.label.' + x).subscribe(translatedValue => {
                str = translatedValue.toLowerCase();
              });
            } else if (cell.source.value.tagName === 'Fork') {
              str = x;
            } else if ((cell.source.value.tagName === 'Job' && cell.source.getAttribute('label'))) {
              str = cell.source.getAttribute('label');
            }
          } else {
            this.translate.get('workflow.label.' + x).subscribe(translatedValue => {
              str = translatedValue;
            });
          }
        }
        return str;
      }
    }
    return str;
  }

  public getTooltipForCell(cell): string {
    let str = '';
    if (mxUtils.isNode(cell.value)) {
      if (cell.value.tagName === 'Process' || cell.value.tagName === 'Connection') {
        return '';
      } else if (cell.value.tagName === 'Job') {
        let name = '', label = '';
        this.translate.get('workflow.label.name').subscribe(translatedValue => {
          name = translatedValue;
        });
        this.translate.get('workflow.label.label').subscribe(translatedValue => {
          label = translatedValue;
        });
        return '<b>' + name + '</b> : ' + (cell.getAttribute('jobName') || '-') + '</br>' +
          '<b>' + label + '</b> : ' + (cell.getAttribute('label') || '-');
      } else if (cell.value.tagName === 'Retry') {
        let maxTries = '', delay = '';
        this.translate.get('workflow.label.maxTries').subscribe(translatedValue => {
          maxTries = translatedValue;
        });
        this.translate.get('workflow.label.delay').subscribe(translatedValue => {
          delay = translatedValue;
        });
        return '<b>' + maxTries + '</b> : ' + (cell.getAttribute('maxTries') || '-') + '</br>' +
          '<b>' + delay + '</b> : ' + (cell.getAttribute('retryDelays') || '-');
      } else if (cell.value.tagName === 'FileOrder') {
        let regex = '', directory = '', agent = '';
        this.translate.get('workflow.label.agent').subscribe(translatedValue => {
          agent = translatedValue;
        });
        this.translate.get('workflow.label.regex').subscribe(translatedValue => {
          regex = translatedValue;
        });
        this.translate.get('workflow.label.directory').subscribe(translatedValue => {
          directory = translatedValue;
        });

        return '<b>' + agent + '</b> : ' + (cell.getAttribute('agent') || '-') + '</br>' +
          '<b>' + regex + '</b> : ' + (cell.getAttribute('regex') || '-') + '</br>' +
          '<b>' + directory + '</b> : ' + (cell.getAttribute('directory') || '-');
      } else if (cell.value.tagName === 'If') {
        let msg = '';
        this.translate.get('workflow.label.predicate').subscribe(translatedValue => {
          msg = translatedValue;
        });
        return '<b>' + msg + '</b> : ' + (cell.getAttribute('predicate') || '-');
      } else if (cell.value.tagName === 'Lock') {
        let msg = '', limit = '';
        this.translate.get('workflow.label.lockId').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.translate.get('workflow.label.count').subscribe(translatedValue => {
          limit = translatedValue;
        });
        return '<b>' + msg + '</b> : ' + (cell.getAttribute('lockId') || '-') + '</br>' +
          '<b>' + limit + '</b> : ' + (cell.getAttribute('count') || '-');
      } else if (cell.value.tagName === 'Finish' && cell.value.tagName === 'Fail') {
        let msg = '', returnCode = '';
        this.translate.get('workflow.label.message').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.translate.get('workflow.label.returnCode').subscribe(translatedValue => {
          returnCode = translatedValue;
        });
        const outcome = JSON.parse(cell.getAttribute('outcome'));
        const result = typeof outcome.result === 'object' ? outcome.result : {};
        return '<b>' + msg + '</b> : ' + (result.message || '-') + '</br>' +
          '<b>' + returnCode + '</b> : ' + (result.returnCode || '-');
      } else if (cell.value.tagName === 'Order') {
        let data = cell.getAttribute('order');
        data = JSON.parse(data);
        let state = '', orderId = '', _text = '', scheduledFor = '';
        this.translate.get('workflow.label.orderId').subscribe(translatedValue => {
          orderId = translatedValue;
        });
        this.translate.get('order.label.state').subscribe(translatedValue => {
          state = translatedValue;
        });
        this.translate.get('order.label.scheduledFor').subscribe(translatedValue => {
          scheduledFor = translatedValue;
        });
        this.translate.get(data.state._text).subscribe(translatedValue => {
          _text = translatedValue;
        });
        return '<b>' + orderId + '</b> : ' + (data.orderId || '-') + '</br>' +
          '<b>' + state + '</b> : ' + _text + '</br>' +
          '<b>' + scheduledFor + '</b> : ' + this.stringDatePipe.transform(data.scheduledFor);
      } else {
        const x = cell.getAttribute('label');
        if (x) {
          this.translate.get('workflow.label.' + x).subscribe(translatedValue => {
            str = translatedValue;
          });
        }
        return str;
      }
    }
    return str;
  }

  convertDurationToString(time): string {
    let seconds = Number(time);
    const y = Math.floor(seconds / (3600 * 365 * 24));
    const m = Math.floor((seconds % (3600 * 365 * 24)) / (3600 * 30 * 24));
    const w = Math.floor(((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) / (3600 * 7 * 24));
    const d = Math.floor((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) / (3600 * 24));
    const h = Math.floor(((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) / 3600);
    const M = Math.floor((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) / 60);
    const s = Math.floor(((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) % 60));
    if (y == 0 && m == 0 && w == 0 && d == 0) {
      if (h == 0 && M == 0) {
        return s + 's';
      } else {
        return (h < 10 ? '0' + h : h) + ':' + (M < 10 ? '0' + M : M) + ':' + (s < 10 ? '0' + s : s);
      }
    } else {
      return (y != 0 ? y + 'y ' : '') + (m != 0 ? m + 'm ' : '') + (w != 0 ? w + 'w ' : '') + (d != 0 ? d + 'd ' : '') + (h != 0 ? h + 'h ' : '') + (M != 0 ? M + 'M ' : '') + (s != 0 ? s + 's ' : '');
    }
  }

  convertStringToDuration(string): number {
    if (/^((\d+)y[ ]?)?((\d+)m[ ]?)?((\d+)w[ ]?)?((\d+)d[ ]?)?((\d+)h[ ]?)?((\d+)M[ ]?)?((\d+)s[ ]?)?|(\d{2}:\d{2}:\d{2})\s*$/.test(string)) {
      let seconds = 0;
      let a = string.split(' ');
      for (let i = 0; i < a.length; i++) {
        let frmt = a[i].charAt(a[i].length - 1);
        let val = a[i].slice(0, a[i].length - 1);
        if (frmt === 'y') {
          seconds += val * 365 * 24 * 3600;
        }
        if (frmt === 'm') {
          seconds += val * 30 * 24 * 3600;
        }
        if (frmt === 'w') {
          seconds += val * 7 * 24 * 3600;
        }
        if (frmt === 'd') {
          seconds = val * 24 * 3600;
        }
        if (frmt === 'h') {
          seconds += val * 3600;
        }
        if (frmt === 'M') {
          seconds += val * 60;
        }
        if (frmt === 's') {
          seconds += Number(val);
        }
      }
      return seconds;
    } else if (/^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/i.test(string)) {
      const a = string.split(':');
      return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    }
  }
}
