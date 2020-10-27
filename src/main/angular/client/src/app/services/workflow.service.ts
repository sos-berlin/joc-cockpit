import {Injectable} from '@angular/core';
import * as _ from 'underscore';
import {TranslateService} from '@ngx-translate/core';

declare const mxHierarchicalLayout;
declare const mxTooltipHandler;
declare const mxUtils;

@Injectable()
export class WorkflowService {
  // Declare Map object to store fork and join Ids
  public nodeMap;
  public merge;
  public finish;
  public fail;
  public await;
  public publish;
  public fork;

  constructor(public translate: TranslateService) {
    mxHierarchicalLayout.prototype.interRankCellSpacing = 45;
    mxTooltipHandler.prototype.delay = 0;
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
    } else {
      this.merge = 'symbol;image=./assets/mxgraph/images/symbols/merge-white.svg';
      this.finish = 'symbol;image=./assets/mxgraph/images/symbols/finish-white.svg';
      this.fail = 'symbol;image=./assets/mxgraph/images/symbols/fail-white.svg';
      this.await = 'symbol;image=./assets/mxgraph/images/symbols/await-white.svg';
      this.fork = 'symbol;image=./assets/mxgraph/images/symbols/fork-white.svg';
      this.publish = 'symbol;image=./assets/mxgraph/images/symbols/publish-white.svg';
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
    if (type === 'Fork' || type === 'If' || type === 'Try' || type === 'Retry') {
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
        if ((!value.executable || !value.executable.script || !value.agentRefPath)) {
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
      if (type === 'Node') {
        if (!value.label || value === '' || value == 'null' || value == 'undefined') {
          return false;
        } else if (!this.isValidObject(value.label)) {
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
          value.returnCodeMeaning.success = 0;
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

  public convertValueToString(cell, graph): string {
    function truncate(input) {
      if (input.length > 40) {
        return input.substring(0, 40) + '...';
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
      } else if (cell.value.tagName === 'FileOrder') {
        this.translate.get('workflow.label.fileOrder').subscribe(translatedValue => {
          str = translatedValue;
        });
        if (cell.getAttribute('directory')) {
          str = str + ' - ' + cell.getAttribute('directory');
        }
        return str;
      } else {
        let x = cell.getAttribute('label');
        if (x) {
          if (cell.value.tagName === 'Connection') {
            if (x === 'then' || x === 'else') {
              this.translate.get('workflow.label.' + x).subscribe(translatedValue => {
                str = translatedValue.toLowerCase();
              });
            } else if (cell.source.value.tagName === 'Fork' || (cell.source.value.tagName === 'Job' && cell.source.getAttribute('label'))) {
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
      } else if (cell.value.tagName === 'Finish' && cell.value.tagName === 'Fail') {
        let msg = '', returnCode;
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
