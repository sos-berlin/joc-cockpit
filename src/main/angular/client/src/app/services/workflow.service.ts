import {Injectable} from '@angular/core';
import {isEmpty, isArray, clone, isNaN} from 'underscore';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from './core.service';
import {StringDatePipe} from '../pipes/core.pipe';

declare const mxHierarchicalLayout: any;
declare const mxTooltipHandler: any;
declare const mxUtils: any;
declare const saveSvgAsPng: any;
declare const $: any;

@Injectable()
export class WorkflowService {
  public merge = '';
  public finish = '';
  public fail = '';
  public expectNotice = '';
  public postNotice = '';
  public prompt = '';
  public fork = '';
  public forkList = '';
  public endForkList = '';
  public lock = '';
  public closeLock = '';
  preferences: any = {};
  searchResult: any;

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
  static executeLayout(graph: any): void {
    const layout = new mxHierarchicalLayout(graph);
    layout.execute(graph.getDefaultParent());
  }

  init(theme: string): void {
    if (theme === 'light') {
      this.merge = 'symbol;image=./assets/mxgraph/images/symbols/merge.svg';
      this.finish = 'symbol;image=./assets/mxgraph/images/symbols/finish.svg';
      this.fail = 'symbol;image=./assets/mxgraph/images/symbols/fail.svg';
      this.expectNotice = 'symbol;image=./assets/mxgraph/images/symbols/await.svg';
      this.fork = 'symbol;image=./assets/mxgraph/images/symbols/fork.svg';
      this.forkList = 'symbol;image=./assets/mxgraph/images/symbols/fork-list.svg';
      this.endForkList = 'symbol;image=./assets/mxgraph/images/symbols/merge-list.svg';
      this.postNotice = 'symbol;image=./assets/mxgraph/images/symbols/publish.svg';
      this.prompt = 'symbol;image=./assets/mxgraph/images/symbols/prompt.svg';
      this.lock = 'symbol;image=./assets/mxgraph/images/symbols/lock.svg';
      this.closeLock = 'symbol;image=./assets/mxgraph/images/symbols/lock-close.svg';
    } else {
      this.merge = 'symbol;image=./assets/mxgraph/images/symbols/merge-white.svg';
      this.finish = 'symbol;image=./assets/mxgraph/images/symbols/finish-white.svg';
      this.endForkList = 'symbol;image=./assets/mxgraph/images/symbols/merge-list-white.svg';
      this.fail = 'symbol;image=./assets/mxgraph/images/symbols/fail-white.svg';
      this.expectNotice = 'symbol;image=./assets/mxgraph/images/symbols/await-white.svg';
      this.fork = 'symbol;image=./assets/mxgraph/images/symbols/fork-white.svg';
      this.forkList = 'symbol;image=./assets/mxgraph/images/symbols/fork-list-white.svg';
      this.postNotice = 'symbol;image=./assets/mxgraph/images/symbols/publish-white.svg';
      this.prompt = 'symbol;image=./assets/mxgraph/images/symbols/prompt-white.svg';
      this.lock = 'symbol;image=./assets/mxgraph/images/symbols/lock-white.svg';
      this.closeLock = 'symbol;image=./assets/mxgraph/images/symbols/lock-close-white.svg';
    }
  }

  create_UUID(): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  createObject(type: string, node: any): any {
    const obj: any = {
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
    } else if (type === 'ForkList') {
      obj.children = node._children;
      obj.childToId = node._childToId;
    } else if (type === 'Lock') {
      obj.lockName = node._lockName;
      obj.count = node._count;
    } else if (type === 'Retry') {
      obj.maxTries = node._maxTries;
      obj.retryDelays = node._retryDelays;
    } else if (type === 'Fail') {
      let outcome = node._outcome;
      if (!outcome) {
        outcome = {returnCode: 0};
      } else {
        outcome = JSON.parse(outcome);
      }
      obj.outcome = outcome;
      obj.message = node._message;
      obj.uncatchable = node._uncatchable;
    } else if (type === 'FileWatcher') {
      obj.directory = node._directory;
      obj.regex = node._regex;
    } else if (type === 'PostNotice' || type === 'ExpectNotice') {
      obj.noticeBoardName = node._noticeBoardName;
    } else if (type === 'Prompt') {
      obj.question = node._question;
    }
    if (this.isInstructionCollapsible(type)) {
      obj.isCollapsed = node.mxCell._collapsed;
      if (type === 'Fork') {
        obj.joinVariables = node._joinVariables;
      }
    }
    return obj;
  }

  convertTryInstruction(instruction: any): void {
    const catchObj = clone(instruction.catch);
    instruction.try = {
      instructions: instruction.instructions
    };
    delete instruction.instructions;
    delete instruction.catch;
    instruction.catch = catchObj;
  }

  convertRetryToTryCatch(instruction: any): void {
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
    if (typeof instruction.retryDelays === 'string') {
      instruction.retryDelays = instruction.retryDelays.split(',').map(Number);
    }
    const catchObj = clone(instruction.catch);
    const retryDelays = clone(instruction.retryDelays);
    const maxTries = clone(instruction.maxTries);
    delete instruction.instructions;
    delete instruction.catch;
    delete instruction.retryDelays;
    delete instruction.maxTries;
    instruction.catch = catchObj;
    instruction.maxTries = parseInt(maxTries, 10);
    instruction.retryDelays = retryDelays;
  }

  isValidObject(v: string): boolean {
    if (!v.match(/[!?~'"}\[\]{@:;#\/\\^$%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(v) && /^(?!-)(?!.*--)/.test(v)
      && !v.substring(0, 1).match(/[-]/) && !v.substring(v.length - 1).match(/[-]/) && !/\s/.test(v)) {
      return !/^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|double|do|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)$/.test(v);
    } else {
      return false;
    }
  }

  isValidLabel(v: string): boolean {
    return !v.match(/[?~'"}\[\]{@;\/\\^%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(v) && /^(?!-)(?!.*--)/.test(v)
      && !v.substring(0, 1).match(/[-,/|:!#$]/) && !v.substring(v.length - 1).match(/[-,/|:!#$]/) && !/\s/.test(v);
  }

  validateFields(value: any, type: string): boolean {
    if (value) {
      if (value.defaultArguments && isEmpty(value.defaultArguments)) {
        delete value.defaultArguments;
      }
      if (type === 'Job') {
        if (!value.executable || (!value.executable.className && value.executable.TYPE === 'InternalExecutable')
          || (!value.executable.script && value.executable.TYPE === 'ShellScriptExecutable') || !value.agentName) {
          return false;
        }
      }
      if (type === 'ExpectNotice' || type === 'PostNotice') {
        if (!value.noticeBoardName) {
          return false;
        }
      }
      if (type === 'Lock') {
        if (!value.count) {
          delete value.count;
        }
        if (!value.lockName) {
          return false;
        }
      }
      if (type === 'ForkList') {
        if (!value.children) {
          return false;
        }
      }
      if (type === 'Node') {
        if (!value.label || value.label === '' || value.label == 'null' || value.label == 'undefined') {
          return false;
        } else if (value.label && !this.isValidLabel(value.label)) {
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
      if (value.executable && value.executable.returnCodeMeaning) {
        if (value.executable.returnCodeMeaning.success && typeof value.executable.returnCodeMeaning.success === 'string') {
          value.executable.returnCodeMeaning.success = value.executable.returnCodeMeaning.success.split(',').map(Number);
          delete value.executable.returnCodeMeaning.failure;
        } else if (value.executable.returnCodeMeaning.failure && typeof value.executable.returnCodeMeaning.failure === 'string') {
          value.executable.returnCodeMeaning.failure = value.executable.returnCodeMeaning.failure.split(',').map(Number);
          delete value.executable.returnCodeMeaning.success;
        }
        if (value.executable.returnCodeMeaning.failure === '') {
          delete value.executable.returnCodeMeaning.failure;
        }
        if (value.executable.TYPE !== 'ShellScriptExecutable' || (value.executable.returnCodeMeaning.success === '' && !value.executable.returnCodeMeaning.failure)) {
          value.executable.returnCodeMeaning = {};
        }
        if (isEmpty(value.executable.returnCodeMeaning)) {
          delete value.executable.returnCodeMeaning;
        }
      }
      if (value.returnCode && value.returnCode != 'null' && value.returnCode != 'undefined' && typeof value.returnCode === 'string') {
        value.returnCode = parseInt(value.returnCode, 10);
        if (isNaN(value.returnCode)) {
          delete value.returnCode;
        }
      } else {
        delete value.returnCode;
      }

      if (value.joinVariables && value.joinVariables != 'null' && value.joinVariables != 'undefined' && typeof value.joinVariables === 'string') {
        value.joinVariables = value.joinVariables == 'true';
      } else {
        delete value.joinVariables;
      }

      if (value.uncatchable && value.uncatchable != 'null' && value.uncatchable != 'undefined' && typeof value.uncatchable === 'string') {
        value.uncatchable = value.uncatchable == 'true';
      } else {
        delete value.uncatchable;
      }

      if (value.timeout1) {
        delete value.timeout1;
      }
      if (value.graceTimeout1) {
        delete value.graceTimeout1;
      }
      if (typeof value.taskLimit === 'string') {
        value.taskLimit = parseInt(value.taskLimit, 10);
        if (isNaN(value.taskLimit)) {
          value.taskLimit = 1;
        }
      }
      if (typeof value.timeout === 'string') {
        value.timeout = parseInt(value.timeout, 10);
        if (isNaN(value.timeout)) {
          delete value.timeout;
        }
      }
      if (typeof value.graceTimeout === 'string') {
        value.graceTimeout = parseInt(value.graceTimeout, 10);
        if (isNaN(value.graceTimeout)) {
          delete value.graceTimeout;
        }
      }
    }
    return true;
  }

  checkEmptyObjects(mainJson: any, cb: any): void {
    function recursive(json: any) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then) {
            if (json.instructions[x].then.instructions) {
              recursive(json.instructions[x].then);
            } else {
              delete json.instructions[x].then;
            }
          }
          if (json.instructions[x].else) {
            if (json.instructions[x].else.instructions) {
              recursive(json.instructions[x].else);
            } else {
              delete json.instructions[x].else;
            }
          }
          if (json.instructions[x].branches) {
            json.instructions[x].branches = json.instructions[x].branches.filter((branch: any) => {
              return (branch.instructions && branch.instructions.length > 0);
            });
            if (json.instructions[x].branches.length > 0) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i]) {
                  recursive(json.instructions[x].branches[i]);
                }
              }
            }
          }
        }
      }
    }

    recursive(mainJson);
    if (cb) {
      cb();
    }
  }

  convertTryToRetry(mainJson: any, cb: any, jobs = {}): void {
    let count = 1;
    function recursive(json: any) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (!cb) {
            json.instructions[x].id = ++count;
          }
          if (json.instructions[x].TYPE === 'Execute.Named') {
            json.instructions[x].TYPE = 'Job';
            if (!isEmpty(jobs) && !json.instructions[x].documentationName) {
              const job = jobs[json.instructions[x].jobName];
              json.instructions[x].documentationName = job ? job.documentationName : null;
            }
          }
          if (json.instructions[x].TYPE === 'Try') {
            let isRetry = false;
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length === 1
                && json.instructions[x].catch.instructions[0].TYPE === 'Retry') {
                json.instructions[x].TYPE = 'Retry';
                json.instructions[x].instructions = json.instructions[x].try.instructions;
                isRetry = true;
                delete json.instructions[x].try;
                delete json.instructions[x].catch;
              }
            }
            if (!isRetry) {
              if (json.instructions[x].try) {
                json.instructions[x].instructions = json.instructions[x].try.instructions || [];
                delete json.instructions[x].try;
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
              delete json.instructions[x].lockedWorkflow;
            }
          }
          if (json.instructions[x].TYPE === 'ForkList') {
            if (json.instructions[x].workflow) {
              json.instructions[x].instructions = json.instructions[x].workflow.instructions;
              delete json.instructions[x].workflow;
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
            json.instructions[x].branches = json.instructions[x].branches.filter((branch: any) => {
              branch.instructions = branch.workflow.instructions;
              delete branch.workflow;
              return (branch.instructions && branch.instructions.length > 0);
            });
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              if (json.instructions[x].branches[i]) {
                recursive(json.instructions[x].branches[i]);
              }
            }
          }
        }
      }
    }

    recursive(mainJson);
    if (cb) {
      cb();
    }
  }

  createWorkflow(mainJson: any, editor: any, mapObj: any): void {
    mapObj.nodeMap = new Map();
    if (mapObj.vertixMap) {
      mapObj.vertixMap = new Map();
    }
    const graph = editor.graph;
    const self = this;
    const doc = mxUtils.createXmlDocument();
    const vertexMap = new Map();
    const defaultParent = graph.getDefaultParent();

    function connectWithDummyNodes(json: any): void {
      if (json.instructions && json.instructions.length > 0) {
        const _node = doc.createElement('Process');
        _node.setAttribute('title', 'start');
        const v1 = graph.insertVertex(defaultParent, null, _node, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;');

        const start = vertexMap.get(json.instructions[0].uuid);
        const last = json.instructions[json.instructions.length - 1];
        connectInstruction(v1, start, '', '', defaultParent);
        if (last.TYPE !== 'ImplicitEnd') {
          let end = vertexMap.get(last.uuid);
          if (self.isInstructionCollapsible(last.TYPE)) {
            const targetId = mapObj.nodeMap.get(last.id);
            if (targetId) {
              end = graph.getModel().getCell(targetId);
            }
          }
          const _node2 = doc.createElement('Process');
          _node2.setAttribute('title', 'end');
          const v2 = graph.insertVertex(defaultParent, null, _node2, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;');

          connectInstruction(end, v2, '', '', defaultParent);
        }
      }
    }

    function recursive(json: any, type: any, parent: any): void {
      if (json.instructions) {
        let v1, endNode;
        for (let x = 0; x < json.instructions.length; x++) {
          let v2;
          const _node = doc.createElement(json.instructions[x].TYPE);
          if (json.instructions[x].position) {
            _node.setAttribute('position', JSON.stringify(json.instructions[x].position));
          }
          if (!json.instructions[x].uuid) {
            json.instructions[x].uuid = self.create_UUID();
          }
          if (json.instructions[x].TYPE === 'Job') {
            _node.setAttribute('jobName', json.instructions[x].jobName);
            if (json.instructions[x].label !== undefined) {
              _node.setAttribute('label', json.instructions[x].label);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            if (json.instructions[x].documentationName !== undefined) {
              _node.setAttribute('documentationName', json.instructions[x].documentationName);
            }
            if (json.instructions[x].defaultArguments && typeof json.instructions[x].defaultArguments === 'object') {
              _node.setAttribute('defaultArguments', JSON.stringify(json.instructions[x].defaultArguments));
            }
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 180, 40, 'job');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Finish') {
            _node.setAttribute('label', 'finish');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.finish);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Fail') {
            _node.setAttribute('label', 'fail');
            const outcome = json.instructions[x].outcome || {returnCode: 0};
            _node.setAttribute('outcome', JSON.stringify(outcome));
            if (json.instructions[x].message !== undefined) {
              _node.setAttribute('message', json.instructions[x].message);
            }
            if (json.instructions[x].uncatchable !== undefined) {
              _node.setAttribute('uncatchable', json.instructions[x].uncatchable);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.fail);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'PostNotice') {
            _node.setAttribute('label', 'postNotice');
            if (json.instructions[x].noticeBoardName !== undefined) {
              _node.setAttribute('noticeBoardName', json.instructions[x].noticeBoardName);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.postNotice);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Prompt') {
            _node.setAttribute('label', 'prompt');
            if (json.instructions[x].question !== undefined) {
              _node.setAttribute('question', json.instructions[x].question);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.prompt);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'ImplicitEnd') {
            _node.setAttribute('label', 'end');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'ExpectNotice') {
            _node.setAttribute('label', 'expectNotice');
            if (json.instructions[x].noticeBoardName !== undefined) {
              _node.setAttribute('noticeBoardName', json.instructions[x].noticeBoardName);
            }

            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.expectNotice);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Fork') {
            _node.setAttribute('label', 'fork');
            if (json.instructions[x].joinVariables !== undefined) {
              _node.setAttribute('joinVariables', json.instructions[x].joinVariables);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.fork);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].branches) {
              json.instructions[x].branches = json.instructions[x].branches.filter((branch: any) => {
                return (branch.instructions && branch.instructions.length > 0);
              });
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                recursive(json.instructions[x].branches[i], 'branch', v1);
                connectInstruction(v1, vertexMap.get(json.instructions[x].branches[i].instructions[0].uuid), json.instructions[x].branches[i].id, 'branch', v1);
              }
              v2 = joinFork(json.instructions[x].branches, v1, parent);
            } else {
              v2 = joinFork(v1, v1, parent);
            }
          } else if (json.instructions[x].TYPE === 'ForkList') {
            _node.setAttribute('label', 'forkList');
            if (json.instructions[x].childToId !== undefined) {
              _node.setAttribute('childToId', json.instructions[x].childToId);
            }
            if (json.instructions[x].children !== undefined) {
              _node.setAttribute('children', json.instructions[x].children);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.forkList);
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'forkList', 'forkList', v1);
              v2 = joinForkList(json.instructions[x], v1.id, parent);
            } else {
              v2 = joinForkList(v1, v1.id, parent);
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
            _node.setAttribute('maxTries', json.instructions[x].maxTries || '10');
            _node.setAttribute('retryDelays', json.instructions[x].retryDelays ? json.instructions[x].retryDelays.toString() : '0');
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
            if (json.instructions[x].lockName !== undefined) {
              _node.setAttribute('lockName', json.instructions[x].lockName);
            }
            if (json.instructions[x].count !== undefined) {
              _node.setAttribute('count', json.instructions[x].count);
            }
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
            const cv1 = graph.insertVertex(v1, null, node, 0, 0, 110, 40, (json.instructions[x].catch && json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) ?
              'catch' : 'dashRectangle');
            if (mapObj.vertixMap && json.instructions[x].catch && json.instructions[x].catch.position) {
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
              if (self.isInstructionCollapsible(_lastNode.TYPE)) {
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
            if (self.isInstructionCollapsible(json.instructions[x].TYPE)) {
              v1.collapsed = json.instructions[x].isCollapsed == '1';
            }
          }

          if (x > 0) {
            const prev = json.instructions[x - 1];
            if (prev.TYPE !== 'Fork' && prev.TYPE !== 'ForkList' && prev.TYPE !== 'If' && prev.TYPE !== 'Try' && prev.TYPE !== 'Retry' && prev.TYPE !== 'Lock' && vertexMap.get(prev.uuid)) {
              connectInstruction(vertexMap.get(prev.uuid), v1, type, type, parent);
            }
          }
        }
      }
    }

    function connectInstruction(source: any, target: any, label: any, type: any, parent: any): void {
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

    function joinFork(branches: any, target: any, parent: any): any {
      const _node = doc.createElement('Join');
      _node.setAttribute('label', 'join');
      if (target.id) {
        _node.setAttribute('targetId', target.id);
      }
      const v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.merge);
      mapObj.nodeMap.set(target.id.toString(), v1.id.toString());
      if (isArray(branches)) {
        if(branches.length === 0){
          connectInstruction(target, v1, '', '', parent);
        } else {
          for (let i = 0; i < branches.length; i++) {
            if (branches[i].instructions && branches[i].instructions.length > 0) {
              const x = branches[i].instructions[branches[i].instructions.length - 1];
              if (x) {
                let endNode;
                if (self.isInstructionCollapsible(x.TYPE)) {
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
        }
      } else {
        connectInstruction(branches, v1, '', '', parent);
      }
      return v1;
    }

    function endIf(branches: any, target: any, parent: any): any {
      const _node = doc.createElement('EndIf');
      _node.setAttribute('label', 'ifEnd');
      if (target.id) {
        _node.setAttribute('targetId', target.id);
      }
      const v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'if');
      mapObj.nodeMap.set(target.id.toString(), v1.id.toString());
      let flag = true;
      if (branches.then && branches.then.instructions) {
        flag = false;
        const x = branches.then.instructions[branches.then.instructions.length - 1];
        if (x) {
          let endNode;
          if (self.isInstructionCollapsible(x.TYPE)) {
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
        if (x) {
          let endNode;
          if (self.isInstructionCollapsible(x.TYPE)) {
            endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          connectInstruction(endNode, v1, 'endIf', 'endIf', parent);
        }
      }

      if (flag) {
        connectInstruction(target, v1, '', '', parent);
      }
      return v1;
    }

    function endLock(branches: any, targetId: any, parent: any): any {
      const _node = doc.createElement('EndLock');
      _node.setAttribute('label', 'lockEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      const v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.closeLock);
      mapObj.nodeMap.set(targetId.toString(), v1.id.toString());

      if (branches.instructions && branches.instructions.length > 0) {
        const x = branches.instructions[branches.instructions.length - 1];
        if (x) {
          let endNode;
          if (self.isInstructionCollapsible(x.TYPE)) {
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

    function joinForkList(branches: any, targetId: any, parent: any): any {
      const _node = doc.createElement('EndForkList');
      _node.setAttribute('label', 'forkListEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      const v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.endForkList);
      mapObj.nodeMap.set(targetId.toString(), v1.id.toString());

      if (branches.instructions && branches.instructions.length > 0) {
        const x = branches.instructions[branches.instructions.length - 1];
        if (x) {
          let endNode;
          if (self.isInstructionCollapsible(x.TYPE)) {
            endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          connectInstruction(endNode, v1, 'endForkList', 'endForkList', parent);
        }
      } else {
        connectInstruction(branches, v1, '', '', parent);
      }
      return v1;
    }

    function endRetry(branches: any, targetId: any, parent: any): any {
      const _node = doc.createElement('EndRetry');
      _node.setAttribute('label', 'retryEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      const v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'retry');
      mapObj.nodeMap.set(targetId.toString(), v1.id.toString());

      if (branches.instructions && branches.instructions.length > 0) {
        const x = branches.instructions[branches.instructions.length - 1];
        if (x) {
          let endNode;
          if (self.isInstructionCollapsible(x.TYPE)) {
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

    function endTry(x: any, targetId: any, parent: any): any {
      const _node = doc.createElement('EndTry');
      _node.setAttribute('label', 'tryEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      const v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'try');
      mapObj.nodeMap.set(targetId.toString(), v1.id.toString());

      connectInstruction(x, v1, 'endTry', 'endTry', parent);
      return v1;
    }

    function catchEnd(branches: any) {
      let x = branches.instructions[branches.instructions.length - 1];
      if (!x) {
        x = branches;
      }
      if (x) {
        let endNode;
        if (self.isInstructionCollapsible(x.TYPE)) {
          endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
        } else {
          endNode = vertexMap.get(x.uuid);
        }
        return endNode;
      }
    }

    recursive(mainJson, '', defaultParent);
    connectWithDummyNodes(mainJson);
  }

  public convertValueToString(cell: any, graph: any): string {
    function truncate(input: string): string {
      if (input.length > 22) {
        return input.substring(0, 22) + '...';
      } else {
        return input;
      }
    }

    let str = '';
    if (mxUtils.isNode(cell.value)) {
      if (cell.value.tagName === 'Process') {
        const title = cell.getAttribute('title');
        if (title != null && title.length > 0) {
          this.translate.get('workflow.label.' + title).subscribe(translatedValue => {
            str = translatedValue;
          });
          return str;
        }
        return '';
      } else if (cell.value.tagName === 'Job') {
        const lb = cell.getAttribute('label');
        if (lb) {
          const edge = graph.getOutgoingEdges(cell)[0];
          if (edge) {
            edge.setAttribute('label', lb);
          }
        }
        const docName = cell.getAttribute('documentationName');
        let className = 'hide';
        if (docName) {
          className = 'show-block';
        }
        return '<div class="workflow-title"><i id="doc-type" class="cursor fa fa-book p-r-xs ' + className + '"></i>' + truncate(cell.getAttribute('jobName')) + '</div>';
      } else if (cell.value.tagName === 'PostNotice' || cell.value.tagName === 'ExpectNotice') {
        const noticeBoardName = cell.getAttribute('noticeBoardName');
        if (noticeBoardName) {
          const edge = graph.getOutgoingEdges(cell)[0];
          if (edge) {
            edge.setAttribute('noticeBoardName', noticeBoardName);
          }
        }
      } else if (cell.value.tagName === 'Order') {
        let data = cell.getAttribute('order');
        data = JSON.parse(data);
        let className = 'hide';
        if (data.cyclicOrder) {
          className = 'show';
        }
        const class1 = data.state ? this.coreService.getColor(data.state.severity, data.marked ? 'bg' : 'text') : '';
        const class2 = data.marked ? this.coreService.getColor(data.marked.severity, 'bg') : '';
        str = '<div class="vertex-text"><div class="block-ellipsis-job">' +
          '<i style="position: absolute;margin-top: -2px;margin-left: -10px;" class="fa fa-repeat ' + className + '" aria-hidden="true"></i>';
        if (data.marked) {
          str = str + '<span class="half-circle half-circle-left ' + class1 + '"></span><span class="half-circle half-circle-right m-r-xs ' + class2 + '"></span>';
        } else {
          str = str + '<i class="fa fa-circle text-xs p-r-xs ' + class1 + '"></i>';
        }
        str = str + data.orderId + '</div>';
        if (data.scheduledFor) {
          if (!data.scheduledNever) {
            str = str + ' <span class="text-xs" >' + this.stringDatePipe.transform(data.scheduledFor) + '</span>';
          } else {
            let never = '';
            this.translate.get('common.label.never').subscribe(translatedValue => {
              never = translatedValue;
            });
            str = str + ' <span class="text-xs" >' + never + '</span>';
          }
        }
        str = str + '</div>';
        return str;
      } else if (cell.value.tagName === 'Count') {
        const count = cell.getAttribute('count');
        return '<i class="text-white text-xs cursor">' + count + '</i>';
      } else {
        const x = cell.getAttribute('label') || cell.getAttribute('noticeBoardName');
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
            } else if (((cell.source.value.tagName === 'PostNotice' || cell.source.value.tagName === 'ExpectNotice'))) {
              str = x;
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

  public getTooltipForCell(cell: any): string {
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
      } else if (cell.value.tagName === 'ForkList') {
        let msg = '';
        this.translate.get('workflow.label.children').subscribe(translatedValue => {
          msg = translatedValue;
        });
        return '<b>' + msg + '</b> : ' + (cell.getAttribute('children') || '-');
      } else if (cell.value.tagName === 'Lock') {
        let msg = '', limit = '';
        this.translate.get('workflow.label.name').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.translate.get('workflow.label.count').subscribe(translatedValue => {
          limit = translatedValue;
        });
        return '<b>' + msg + '</b> : ' + (cell.getAttribute('lockName') || '-') + '</br>' +
          '<b>' + limit + '</b> : ' + (cell.getAttribute('count') || '-');
      } else if (cell.value.tagName === 'Fail') {
        let msg = '', returnCode = '';
        this.translate.get('workflow.label.message').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.translate.get('workflow.label.returnCode').subscribe(translatedValue => {
          returnCode = translatedValue;
        });
        const outcome = cell.getAttribute('outcome') ? JSON.parse(cell.getAttribute('outcome')) : {};
        return '<b>' + msg + '</b> : ' + (cell.getAttribute('message') || '-') + '</br>' +
          '<b>' + returnCode + '</b> : ' + (outcome.returnCode || '-');
      } else if (cell.value.tagName === 'Prompt') {
        let question = '';
        this.translate.get('workflow.label.question').subscribe(translatedValue => {
          question = translatedValue;
        });
        return '<b>' + question + '</b> : ' + (cell.getAttribute('question') || '-');
      } else if (cell.value.tagName === 'Order') {
        let data = cell.getAttribute('order');
        data = JSON.parse(data);
        let state = '', orderId = '', _text = '', _markedText = '', scheduledFor = '',
          cyclicOrder = '', begin = '', end = '', orders = '';
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
        if (data.marked) {
          this.translate.get(data.marked._text).subscribe(translatedValue => {
            _markedText = translatedValue;
          });
        }
        if (data.cyclicOrder) {
          this.translate.get('dailyPlan.label.cyclicOrder').subscribe(translatedValue => {
            cyclicOrder = translatedValue;
          });
          this.translate.get('dailyPlan.label.begin').subscribe(translatedValue => {
            begin = translatedValue;
          });
          this.translate.get('dailyPlan.label.end').subscribe(translatedValue => {
            end = translatedValue;
          });
          this.translate.get('order.label.orders').subscribe(translatedValue => {
            orders = translatedValue;
          });
        }
        const class1 = this.coreService.getColor(data.state.severity, 'text');
        const class2 = data.marked ? this.coreService.getColor(data.marked.severity, 'text') : '';
        let div = '<div><b>' + orderId + '</b> : ' + (data.orderId || '-') + '</br>' +
          '<b>' + state + '</b> : <span class="' + class1 + '">' + _text + '</span><span class="' + class2 + '">' + (_markedText ? '/' + _markedText : '') + '</span>' + '</br>';
        if (data.cyclicOrder) {
          div = div + '<b class="m-b-xs">' + cyclicOrder + '</b></br>';
          div = div + '<b class="p-l-sm">' + begin + '</b> : ' + this.stringDatePipe.transform(data.cyclicOrder.firstStart) + '</br>';
          div = div + '<b class="p-l-sm">' + end + '</b> : ' + this.stringDatePipe.transform(data.cyclicOrder.lastStart) + '</br>';
          div = div + '<b class="p-l-sm">' + orders + '</b> : ' + data.cyclicOrder.count;
        } else {
          if (data.scheduledFor) {
            if (!data.scheduledNever) {
              div = div + '<b>' + scheduledFor + '</b> : ' + this.stringDatePipe.transform(data.scheduledFor);
            } else {
              let never = '';
              this.translate.get('common.label.never').subscribe(translatedValue => {
                never = translatedValue;
              });
              if (never) {
                never = never.toLowerCase();
              }
              div = div + '<b>' + scheduledFor + '</b> : ' + never;
            }
          }
        }
        div = div + '</div>';
        return div;
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

  convertDurationToString(time: any): string {
    const seconds = Number(time);
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

  convertStringToDuration(str: string): number {
    if (/^((\d+)y[ ]?)?((\d+)m[ ]?)?((\d+)w[ ]?)?((\d+)d[ ]?)?((\d+)h[ ]?)?((\d+)M[ ]?)?((\d+)s[ ]?)?\s*$/.test(str)) {
      let seconds = 0;
      const a = str.split(' ');
      for (let i = 0; i < a.length; i++) {
        const frmt: string = a[i].charAt(a[i].length - 1);
        const val: number = Number(a[i].slice(0, a[i].length - 1));
        if (frmt && val) {
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
            seconds += val * 24 * 3600;
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
      }
      return seconds;
    } else if (/^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/i.test(str)) {
      const a = str.split(':');
      return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    } else {
      return parseInt(str, 10);
    }
  }

  isInstructionCollapsible(tagName: string): boolean {
    return (tagName === 'Fork' || tagName === 'ForkList' || tagName === 'If' || tagName === 'Retry'
      || tagName === 'Lock' || tagName === 'Try');
  }

  exportInPng(name): void {
    const dom = $('#graph');
    let ht = $(document).height();
    let wt = $(document).width();
    if (wt < dom.first()[0].scrollWidth) {
      wt = dom.first()[0].scrollWidth;
    }
    if (ht < dom.first()[0].scrollHeight) {
      ht = dom.first()[0].scrollHeight;
    }
    let bg = dom.css('background-color');
    bg = bg.substring(0, bg.length - 4);
    saveSvgAsPng(dom.first()[0].firstChild, name + '.png', {
      backgroundColor: bg + '1)',
      height: ht + 200,
      width: wt + 200,
      left: -50,
      top: -80
    });
  }

  setSearchResult(result): void {
    this.searchResult = result;
  }

  getSearchResult(): any {
    return this.searchResult;
  }
}
