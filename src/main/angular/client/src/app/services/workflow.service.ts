import {Injectable} from '@angular/core';
import * as _ from 'underscore';
import {TranslateService} from '@ngx-translate/core';

declare const mxHierarchicalLayout;
declare const mxTooltipHandler;
declare const mxUtils;

@Injectable()
export class WorkflowService {

  count = 11;
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
   * Function to add Start and End nodes
   *
   * @param json
   * @param mxJson
   */
  static connectWithDummyNodes(json, mxJson) {
    if (json.instructions && json.instructions.length > 0) {
      if (mxJson.Connection) {
        if (!_.isArray(mxJson.Connection)) {
          const _tempConn = _.clone(mxJson.Connection);
          mxJson.Connection = [];
          mxJson.Connection.push(_tempConn);
        }
      } else {
        mxJson.Connection = [];
      }
      const startObj: any = {
        _label: '',
        _type: '',
        _id: '4',
        mxCell: {
          _parent: '1',
          _source: '3',
          _target: json.instructions[0].id,
          _edge: '1',
          mxGeometry: {
            _relative: 1,
            _as: 'geometry'
          }
        }
      };
      const last = json.instructions[json.instructions.length - 1];
      let targetId = last.id;
      if (last.TYPE === 'Fork' || last.TYPE === 'If' || last.TYPE === 'Try' || last.TYPE === 'Retry') {
        let z: any;
        if (last.TYPE === 'Fork') {
          z = mxJson.Join;
        } else if (last.TYPE === 'If') {
          z = mxJson.EndIf;
        } else if (last.TYPE === 'Try') {
          z = mxJson.EndTry;
        } else if (last.TYPE === 'Retry') {
          z = mxJson.EndRetry;
        }
        if (z && _.isArray(z)) {
          for (let i = 0; i < z.length; i++) {
            if (z[i]._targetId === last.id) {
              targetId = z[i]._id;
              break;
            }
          }
        } else if (z) {
          targetId = z._id;
        }
      }

      const endObj: any = {
        _label: '',
        _type: '',
        _id: 6,
        mxCell: {
          _parent: '1',
          _source: targetId,
          _target: '5',
          _edge: '1',
          mxGeometry: {
            _relative: 1,
            _as: 'geometry'
          }
        }
      };
      mxJson.Connection.push(startObj);
      mxJson.Connection.push(endObj);
    }
  }

  /**
   * Reformat the layout
   */
  static executeLayout(graph) {
    const layout = new mxHierarchicalLayout(graph);
    layout.execute(graph.getDefaultParent());
  }

  /**
   * Function to centered the flow diagram
   */
  static makeCenter(graph) {
    setTimeout(() => {
      graph.zoomActual();
      graph.center(true, true, 0.5, 0.1);
    }, 0);
  }

  resetVariables() {
    this.nodeMap = new Map();
    this.count = 11;
  }

  getDummyNodes(): any {
    this.nodeMap = new Map();
    return [
      {
        '_id': '3',
        '_title': 'start',
        'mxCell': {
          '_parent': '1',
          '_vertex': '1',
          '_style': 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;',
          'mxGeometry': {
            '_as': 'geometry',
            '_width': '60',
            '_height': '60'
          }
        }
      }, {
        '_id': '5',
        '_title': 'end',
        'mxCell': {
          '_parent': '1',
          '_vertex': '1',
          '_style': 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;',
          'mxGeometry': {
            '_as': 'geometry',
            '_width': '60',
            '_height': '60'
          }
        }
      }
    ];
  }

  init(theme) {
    this.resetVariables();
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

  /**
   * Function to generate flow diagram with the help of JSON
   *
   * @param json
   * @param mxJson
   * @param type
   * @param parentId
   */
  jsonParser(json, mxJson, type, parentId) {
    const self = this;
    if (json.instructions) {
      for (let x = 0; x < json.instructions.length; x++) {
        let obj: any = {
          mxCell: {
            _parent: parentId ? parentId : '1',
            _vertex: '1',
            mxGeometry: {
              _as: 'geometry'
            }
          }
        };

        if (json.instructions[x].TYPE === 'Job') {
          if (mxJson.Job) {
            if (!_.isArray(mxJson.Job)) {
              let _tempJob = _.clone(mxJson.Job);
              mxJson.Job = [];
              mxJson.Job.push(_tempJob);
            }

          } else {
            mxJson.Job = [];
          }

          obj._id = json.instructions[x].id;
          obj._uuid = json.instructions[x].uuid;
          obj._jobName = json.instructions[x].jobName;
          obj._label = json.instructions[x].label || '';
          if (json.instructions[x].defaultArguments && typeof json.instructions[x].defaultArguments === 'object') {
            obj._defaultArguments = JSON.stringify(json.instructions[x].defaultArguments);
          } else {
            obj._defaultArguments = '';
          }
          obj.mxCell._style = 'job';
          obj.mxCell.mxGeometry._width = '180';
          obj.mxCell.mxGeometry._height = '40';
          mxJson.Job.push(obj);
        } else if (json.instructions[x].TYPE === 'If') {
          if (mxJson.If) {
            if (!_.isArray(mxJson.If)) {
              let _tempIf = _.clone(mxJson.If);
              mxJson.If = [];
              mxJson.If.push(_tempIf);
            }
          } else {
            mxJson.If = [];
          }
          obj._id = json.instructions[x].id;
          obj._uuid = json.instructions[x].uuid;
          obj._label = 'if';
          obj._predicate = json.instructions[x].predicate;
          obj.mxCell._style = 'if';
          if (json.instructions[x].isCollapsed == '1') {
            obj.mxCell._collapsed = '1';
          }
          obj.mxCell.mxGeometry._width = '75';
          obj.mxCell.mxGeometry._height = '75';

          if (json.instructions[x].then && json.instructions[x].then.instructions && json.instructions[x].then.instructions.length > 0) {
            self.jsonParser(json.instructions[x].then, mxJson, 'endIf', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].then.instructions[0], mxJson, 'then', 'then', obj._id);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions && json.instructions[x].else.instructions.length > 0) {
            self.jsonParser(json.instructions[x].else, mxJson, 'endIf', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].else.instructions[0], mxJson, 'else', 'else', obj._id);
          }
          self.endIf(json.instructions[x], mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.If.push(obj);
        } else if (json.instructions[x].TYPE === 'Fork') {
          if (mxJson.Fork) {
            if (!_.isArray(mxJson.Fork)) {
              let _tempFork = _.clone(mxJson.Fork);
              mxJson.Fork = [];
              mxJson.Fork.push(_tempFork);
            }
          } else {
            mxJson.Fork = [];
          }
          obj._id = json.instructions[x].id;
          obj._uuid = json.instructions[x].uuid;
          obj._label = 'fork';
          obj.mxCell._style = this.fork;
          if (json.instructions[x].isCollapsed == '1') {
            obj.mxCell._collapsed = '1';
          }
          obj.mxCell.mxGeometry._width = '68';
          obj.mxCell.mxGeometry._height = '68';
          obj._joinVariables = json.instructions[x].joinVariables || '';

          if (json.instructions[x].branches && json.instructions[x].branches.length > 0) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              if (json.instructions[x].branches[i].instructions && json.instructions[x].branches[i].instructions.length > 0) {
                self.jsonParser(json.instructions[x].branches[i], mxJson, 'branch', obj._id);
                self.connectInstruction(json.instructions[x], json.instructions[x].branches[i], mxJson, json.instructions[x].branches[i].id, 'branch', obj._id);
              }
            }
            self.joinFork(json.instructions[x].branches, mxJson, json.instructions, x, json.instructions[x].id, parentId);
          } else {
            self.joinFork(json.instructions[x], mxJson, json.instructions, x, json.instructions[x].id, parentId);
          }
          mxJson.Fork.push(obj);
        } else if (json.instructions[x].TYPE === 'Retry') {
          if (mxJson.Retry) {
            if (!_.isArray(mxJson.Retry)) {
              const _tempRetry = _.clone(mxJson.Retry);
              mxJson.Retry = [];
              mxJson.Retry.push(_tempRetry);
            }
          } else {
            mxJson.Retry = [];
          }
          obj._id = json.instructions[x].id;
          obj._uuid = json.instructions[x].uuid;
          obj._label = 'retry';
          obj._maxTries = json.instructions[x].maxTries || '';
          obj._retryDelays = json.instructions[x].retryDelays ? json.instructions[x].retryDelays.toString() : '';
          obj.mxCell._style = 'retry';
          if (json.instructions[x].isCollapsed == '1') {
            obj.mxCell._collapsed = '1';
          }
          obj.mxCell.mxGeometry._width = '75';
          obj.mxCell.mxGeometry._height = '75';

          if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
            self.jsonParser(json.instructions[x], mxJson, '', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].instructions[0], mxJson, 'retry', 'retry', obj._id);
          }

          self.endRetry(json.instructions[x], mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.Retry.push(obj);
        } else if (json.instructions[x].TYPE === 'Try') {
          if (mxJson.Try) {
            if (!_.isArray(mxJson.Try)) {
              const _tempRetry = _.clone(mxJson.Try);
              mxJson.Try = [];
              mxJson.Try.push(_tempRetry);
            }
          } else {
            mxJson.Try = [];
          }
          if (mxJson.Catch) {
            if (!_.isArray(mxJson.Catch)) {
              const _tempRetry = _.clone(mxJson.Catch);
              mxJson.Catch = [];
              mxJson.Catch.push(_tempRetry);
            }
          } else {
            mxJson.Catch = [];
          }
          obj._id = json.instructions[x].id;
          obj._uuid = json.instructions[x].uuid;
          obj._label = 'try';
          obj.mxCell._style = 'try';
          if (json.instructions[x].isCollapsed == '1') {
            obj.mxCell._collapsed = '1';
          }
          obj.mxCell.mxGeometry._width = '75';
          obj.mxCell.mxGeometry._height = '75';

          let catchObj: any = {
            mxCell: {
              _parent: obj._id,
              _vertex: '1',
              _style: 'catch',
              mxGeometry: {
                _as: 'geometry',
                _width: '100',
                _height: '40'
              }
            },
            _label: 'catch'
          };
          let _id = obj._id;

          /*          if (json.instructions[x].catch && json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                      catchObj._id = json.instructions[x].catch.id;
                      catchObj._targetId = json.instructions[x].id;
                      self.jsonParser(json.instructions[x].catch, mxJson, 'endTry', obj._id);
                      self.connectInstruction(json.instructions[x].catch, json.instructions[x].catch.instructions[0], mxJson, 'catch','catch', obj._id);
                      _id = self.getCatchEnd(json.instructions[x].catch, mxJson);
                      mxJson.Catch.push(catchObj);
                    }  else {
                      delete mxJson['Catch'];
                      delete json.instructions[x]['catch'];
                    }*/

          if (json.instructions[x].catch && json.instructions[x].catch.instructions) {
            catchObj._id = json.instructions[x].catch.id;
            catchObj._targetId = json.instructions[x].id;
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              self.jsonParser(json.instructions[x].catch, mxJson, 'endTry', obj._id);
              self.connectInstruction(json.instructions[x].catch, json.instructions[x].catch.instructions[0], mxJson, 'catch', 'catch', obj._id);
              _id = self.getCatchEnd(json.instructions[x].catch, mxJson);
            } else {
              catchObj.mxCell._style = 'dashRectangle';
              _id = json.instructions[x].catch.id;
            }
            mxJson.Catch.push(catchObj);
          } else {
            if (mxJson.Catch && mxJson.Catch.length === 0) {
              delete mxJson['Catch'];
            }
          }

          if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
            self.jsonParser(json.instructions[x], mxJson, '', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].instructions[0], mxJson, 'try', 'try', obj._id);
            const _lastNode = json.instructions[x].instructions[json.instructions[x].instructions.length - 1];
            if (_lastNode.TYPE !== 'Fork' && _lastNode.TYPE !== 'If' && _lastNode.TYPE !== 'Try' && _lastNode.TYPE !== 'Retry') {

              if (json.instructions[x].catch) {
                self.connectInstruction(_lastNode, json.instructions[x].catch, mxJson, 'try', 'try', obj._id);
              } else {
                _id = _lastNode.id;
              }
            } else {
              if (_lastNode && (_lastNode.TYPE === 'If')) {
                if (mxJson.EndIf && mxJson.EndIf.length) {
                  for (let j = 0; j < mxJson.EndIf.length; j++) {
                    if (_lastNode.id === mxJson.EndIf[j]._targetId) {
                      if (json.instructions[x].catch) {
                        self.connectInstruction({id: mxJson.EndIf[j]._id}, json.instructions[x].catch, mxJson, 'try', 'try', obj._id);
                      } else {
                        _id = mxJson.EndIf[j]._id;
                      }
                      break;
                    }
                  }
                }
              } else if (_lastNode && (_lastNode.TYPE === 'Retry')) {
                if (mxJson.EndRetry && mxJson.EndRetry.length) {
                  for (let j = 0; j < mxJson.EndRetry.length; j++) {
                    if (_lastNode.id === mxJson.EndRetry[j]._targetId) {

                      if (json.instructions[x].catch) {
                        self.connectInstruction({id: mxJson.EndRetry[j]._id}, json.instructions[x].catch, mxJson, 'try', 'try', obj._id);
                      } else {
                        _id = mxJson.EndRetry[j]._id;
                      }
                      break;
                    }
                  }
                }
              } else if (_lastNode && (_lastNode.TYPE === 'Try')) {
                if (mxJson.EndTry && mxJson.EndTry.length) {
                  for (let j = 0; j < mxJson.EndTry.length; j++) {
                    if (_lastNode.id === mxJson.EndTry[j]._targetId) {

                      if (json.instructions[x].catch) {
                        self.connectInstruction({id: mxJson.EndTry[j]._id}, json.instructions[x].catch, mxJson, 'try', 'try', obj._id);
                      } else {
                        _id = mxJson.EndTry[j]._id;
                      }
                      break;
                    }
                  }
                }
              } else if (_lastNode && (_lastNode.TYPE === 'Fork')) {
                if (mxJson.Join && mxJson.Join.length) {
                  for (let j = 0; j < mxJson.Join.length; j++) {
                    if (_lastNode.id === mxJson.Join[j]._targetId) {

                      if (json.instructions[x].catch) {
                        self.connectInstruction({id: mxJson.Join[j]._id}, json.instructions[x].catch, mxJson, 'try', 'try', obj._id);
                      } else {
                        _id = mxJson.Join[j]._id;
                      }
                      break;
                    }
                  }
                }
              }
            }
          } else {
            if (json.instructions[x].catch) {
              self.connectInstruction(json.instructions[x], json.instructions[x].catch, mxJson, 'try', 'try', obj._id);
            }
          }

          self.endTry(_id, mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.Try.push(obj);
        } else if (json.instructions[x].TYPE === 'Finish') {
          if (mxJson.Finish) {
            if (!_.isArray(mxJson.Finish)) {
              const _tempFinish = _.clone(mxJson.Finish);
              mxJson.Finish = [];
              mxJson.Finish.push(_tempFinish);
            }
          } else {
            mxJson.Finish = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = 'finish';
          const outcome = json.instructions[x].outcome || {'TYPE': 'Succeeded', result: ''};
          obj._outcome = JSON.stringify(outcome);
          obj.mxCell._style = this.finish;
          obj.mxCell.mxGeometry._width = '68';
          obj.mxCell.mxGeometry._height = '68';
          mxJson.Finish.push(obj);
        } else if (json.instructions[x].TYPE === 'Fail') {
          if (mxJson.Fail) {
            if (!_.isArray(mxJson.Fail)) {
              const _tempFail = _.clone(mxJson.Fail);
              mxJson.Fail = [];
              mxJson.Fail.push(_tempFail);
            }
          } else {
            mxJson.Fail = [];
          }

          obj._id = json.instructions[x].id;
          obj._uuid = json.instructions[x].uuid;
          obj._label = 'fail';
          const outcome = json.instructions[x].outcome || {'TYPE': 'Failed', result: ''};
          obj._outcome = JSON.stringify(outcome);
          obj.mxCell._style = this.fail;
          obj.mxCell.mxGeometry._width = '68';
          obj.mxCell.mxGeometry._height = '68';
          mxJson.Fail.push(obj);
        } else if (json.instructions[x].TYPE === 'Await') {
          if (mxJson.Await) {
            if (!_.isArray(mxJson.Await)) {
              const _tempAwait = _.clone(mxJson.Await);
              mxJson.Await = [];
              mxJson.Await.push(_tempAwait);
            }
          } else {
            mxJson.Await = [];
          }
          obj._id = json.instructions[x].id;
          obj._uuid = json.instructions[x].uuid;
          obj._label = 'await';
          obj._junctionPath = json.instructions[x].junctionPath || '';
          obj._timeout = json.instructions[x].timeout || '';
          obj._joinVariables = json.instructions[x].joinVariables || '';
          obj._predicate = json.instructions[x].predicate || '';
          obj._match = json.instructions[x].match || '';
          obj.mxCell._style = this.await;
          obj.mxCell.mxGeometry._width = '68';
          obj.mxCell.mxGeometry._height = '68';
          mxJson.Await.push(obj);
        } else if (json.instructions[x].TYPE === 'Publish') {
          if (mxJson.Publish) {
            if (!_.isArray(mxJson.Publish)) {
              const _tempPublish = _.clone(mxJson.Publish);
              mxJson.Publish = [];
              mxJson.Publish.push(_tempPublish);
            }
          } else {
            mxJson.Publish = [];
          }
          obj._id = json.instructions[x].id;
          obj._uuid = json.instructions[x].uuid;
          obj._label = 'publish';
          obj._junctionPath = json.instructions[x].junctionPath || '';
          obj.mxCell._style = this.publish;
          obj.mxCell.mxGeometry._width = '68';
          obj.mxCell.mxGeometry._height = '68';
          mxJson.Publish.push(obj);
        } else {
          console.log('Workflow yet to parse : ' + json.instructions[x].TYPE);
        }
        if (json.instructions[x].TYPE !== 'Fork' && json.instructions[x].TYPE !== 'If' && json.instructions[x].TYPE !== 'Try' && json.instructions[x].TYPE !== 'Retry') {
          self.connectEdges(json.instructions, x, mxJson, type, parentId);
        }
      }
    } else {
      console.log('No instruction..');
    }
  }

  /**
   * Function : To generating dynamic unique Id
   *
   * @param _json
   */
  appendIdInJson(_json) {
    this.count = 11;
    const self = this;

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          json.instructions[x].id = ++self.count;
          if (!json.instructions[x].uuid) {
            json.instructions[x].uuid = self.create_UUID();
          }
          if (json.instructions[x].TYPE === 'Execute.Named') {
            json.instructions[x].TYPE = 'Job';
          }
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            json.instructions[x].catch.id = ++self.count;
            if (!json.instructions[x].catch.uuid) {
              json.instructions[x].catch.uuid = self.create_UUID();
            }
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
              if (json.instructions[x].branches[i].instructions) {
                recursive(json.instructions[x].branches[i]);
              }
            }
          }
        }
      }
    }

    recursive(_json);
  }

  create_UUID() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  private connectEdges(list, index, mxJson, type, parentId) {
    if (mxJson.Connection) {
      if (!_.isArray(mxJson.Connection)) {
        const _tempJob = _.clone(mxJson.Connection);
        mxJson.Connection = [];
        mxJson.Connection.push(_tempJob);
      }
    } else {
      mxJson.Connection = [];
    }

    if (list.length > (index + 1)) {
      let obj: any = {
        _label: type,
        _type: type,
        _id: ++this.count,
        mxCell: {
          _parent: parentId ? parentId : '1',
          _source: list[index].id,
          _target: list[index + 1].id,
          _edge: '1',
          mxGeometry: {
            _relative: 1,
            _as: 'geometry'
          }
        }
      };
      mxJson.Connection.push(obj);
    }
  }

  private connectInstruction(source, target, mxJson, label, type, parentId) {
    if (mxJson.Connection) {
      if (!_.isArray(mxJson.Connection)) {
        const _tempJob = _.clone(mxJson.Connection);
        mxJson.Connection = [];
        mxJson.Connection.push(_tempJob);
      }
    } else {
      mxJson.Connection = [];
    }

    let obj: any = {
      _label: label,
      _type: type,
      _id: ++this.count,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _source: source.id,
        _target: (source.TYPE === 'Fork' && target.instructions) ? target.instructions[0].id : target.id,
        _edge: '1',
        mxGeometry: {
          _relative: 1,
          _as: 'geometry'
        }
      }
    };

    mxJson.Connection.push(obj);
  }

  private endRetry(branches, mxJson, list, index, targetId, parentId) {
    if (mxJson.EndRetry) {
      if (!_.isArray(mxJson.EndRetry)) {
        const _tempEndRetry = _.clone(mxJson.EndRetry);
        mxJson.EndRetry = [];
        mxJson.EndRetry.push(_tempEndRetry);
      }

    } else {
      mxJson.EndRetry = [];
    }
    let id = ++this.count;
    this.nodeMap.set(targetId.toString(), id.toString());
    let joinObj: any = {
      _id: id,
      _label: 'retryEnd',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'retry',
        mxGeometry: {
          _as: 'geometry',
          _width: '75',
          _height: '75'
        }
      }
    };
    mxJson.EndRetry.push(joinObj);

    if (branches.instructions && branches.instructions.length > 0) {
      const x = branches.instructions[branches.instructions.length - 1];
      if (x && (x.TYPE === 'If')) {
        if (mxJson.EndIf && mxJson.EndIf.length) {
          for (let j = 0; j < mxJson.EndIf.length; j++) {
            if (x.id === mxJson.EndIf[j]._targetId) {
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endRetry', 'endRetry', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.EndRetry && mxJson.EndRetry.length) {
          for (let j = 0; j < mxJson.EndRetry.length; j++) {
            if (x.id === mxJson.EndRetry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndRetry[j]._id}, {id: id}, mxJson, 'endRetry', 'endRetry', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endRetry', 'endRetry', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Fork')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endRetry', 'endRetry', parentId);
              break;
            }
          }
        }
      } else {
        this.connectInstruction(x, {id: id}, mxJson, 'endRetry', 'endRetry', parentId);
      }
    } else {
      this.connectInstruction(branches, {id: id}, mxJson, '', '', parentId);
    }

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', '', parentId);
    }
  }

  private joinFork(branches, mxJson, list, index, targetId, parentId) {
    if (mxJson.Join) {
      if (!_.isArray(mxJson.Join)) {
        const _tempJoin = _.clone(mxJson.Join);
        mxJson.Join = [];
        mxJson.Join.push(_tempJoin);
      }

    } else {
      mxJson.Join = [];
    }

    let id = ++this.count;
    this.nodeMap.set(targetId.toString(), id.toString());
    let joinObj: any = {
      _id: id,
      _label: 'join',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: this.merge,
        mxGeometry: {
          _as: 'geometry',
          _width: '68',
          _height: '68'
        }
      }
    };
    mxJson.Join.push(joinObj);
    if (_.isArray(branches)) {
      for (let i = 0; i < branches.length; i++) {
        if (branches[i].instructions && branches[i].instructions.length > 0) {
          const x = branches[i].instructions[branches[i].instructions.length - 1];
          if (x && (x.TYPE === 'If')) {
            if (mxJson.EndIf && mxJson.EndIf.length) {
              for (let j = 0; j < mxJson.EndIf.length; j++) {
                if (x.id === mxJson.EndIf[j]._targetId) {
                  this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'join', 'join', parentId);
                  break;
                }
              }
            }
          } else if (x && (x.TYPE === 'Fork')) {
            if (mxJson.Join && mxJson.Join.length) {
              for (let j = 0; j < mxJson.Join.length; j++) {
                if (x.id === mxJson.Join[j]._targetId) {
                  this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'join', 'join', parentId);
                  break;
                }
              }
            }
          } else if (x && (x.TYPE === 'Retry')) {
            if (mxJson.EndRetry && mxJson.EndRetry.length) {
              for (let j = 0; j < mxJson.EndRetry.length; j++) {
                if (x.id === mxJson.EndRetry[j]._targetId) {
                  this.connectInstruction({id: mxJson.EndRetry[j]._id}, {id: id}, mxJson, 'join', 'join', parentId);
                  break;
                }
              }
            }
          } else if (x && (x.TYPE === 'Try')) {
            if (mxJson.EndTry && mxJson.EndTry.length) {
              for (let j = 0; j < mxJson.EndTry.length; j++) {
                if (x.id === mxJson.EndTry[j]._targetId) {
                  this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'join', 'join', parentId);
                  break;
                }
              }
            }
          } else {
            this.connectInstruction(x, {id: id}, mxJson, 'join', 'join', parentId);
          }
        }
      }
    } else {
      this.connectInstruction(branches, {id: id}, mxJson, '', '', parentId);
    }

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', '', parentId);
    }
  }

  private endIf(branches, mxJson, list, index, targetId, parentId) {
    if (mxJson.EndIf) {
      if (!_.isArray(mxJson.EndIf)) {
        const _tempJoin = _.clone(mxJson.EndIf);
        mxJson.EndIf = [];
        mxJson.EndIf.push(_tempJoin);
      }

    } else {
      mxJson.EndIf = [];
    }
    let id = ++this.count;
    this.nodeMap.set(targetId.toString(), id.toString());
    let endIfObj: any = {
      _id: id,
      _label: 'ifEnd',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'if',
        mxGeometry: {
          _as: 'geometry',
          _width: '75',
          _height: '75'
        }
      }
    };
    mxJson.EndIf.push(endIfObj);

    let flag = true;
    if (branches.then && branches.then.instructions) {
      flag = false;
      const x = branches.then.instructions[branches.then.instructions.length - 1];
      if (x && (x.TYPE === 'If')) {
        if (mxJson.EndIf && mxJson.EndIf.length) {
          for (let j = 0; j < mxJson.EndIf.length; j++) {
            if (x.id === mxJson.EndIf[j]._targetId) {
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endIf', 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Fork')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endIf', 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.EndRetry && mxJson.EndRetry.length) {
          for (let j = 0; j < mxJson.EndRetry.length; j++) {
            if (x.id === mxJson.EndRetry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndRetry[j]._id}, {id: id}, mxJson, 'endIf', 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endIf', 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x) {
        this.connectInstruction(x, {id: id}, mxJson, 'endIf', 'endIf', parentId);
      }
    }
    if (branches.else && branches.else.instructions) {
      flag = false;
      const x = branches.else.instructions[branches.else.instructions.length - 1];
      if (x && (x.TYPE === 'If')) {
        if (mxJson.EndIf && mxJson.EndIf.length) {
          for (let j = 0; j < mxJson.EndIf.length; j++) {
            if (x.id === mxJson.EndIf[j]._targetId) {
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endIf', 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Fork')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endIf', 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.EndRetry && mxJson.EndRetry.length) {
          for (let j = 0; j < mxJson.EndRetry.length; j++) {
            if (x.id === mxJson.EndRetry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndRetry[j]._id}, {id: id}, mxJson, 'endIf', 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endIf', 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x) {
        this.connectInstruction(x, {id: id}, mxJson, 'endIf', 'endIf', parentId);
      }
    }

    if (flag) {
      this.connectInstruction(branches, {id: id}, mxJson, '', '', parentId);
    }
    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', '', parentId);
    }
  }

  private endTry(x, mxJson, list, index, targetId, parentId) {
    if (mxJson.EndTry) {
      if (!_.isArray(mxJson.EndTry)) {
        const _tempEndTry = _.clone(mxJson.EndTry);
        mxJson.EndTry = [];
        mxJson.EndTry.push(_tempEndTry);
      }
    } else {
      mxJson.EndTry = [];
    }
    let id = ++this.count;
    this.nodeMap.set(targetId.toString(), id.toString());
    let joinObj: any = {
      _id: id,
      _label: 'tryEnd',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'try',
        mxGeometry: {
          _as: 'geometry',
          _width: '75',
          _height: '75'
        }
      }
    };

    mxJson.EndTry.push(joinObj);
    this.connectInstruction({id: x}, {id: id}, mxJson, 'endTry', 'endTry', parentId);
    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', '', parentId);
    }
  }

  private getCatchEnd(branches, mxJson): number {
    let id;
    let x = branches.instructions[branches.instructions.length - 1];
    if (!x) {
      x = branches;
    }
    if (x && (x.TYPE === 'If')) {
      if (mxJson.EndIf && mxJson.EndIf.length) {
        for (let j = 0; j < mxJson.EndIf.length; j++) {
          if (x.id === mxJson.EndIf[j]._targetId) {
            id = mxJson.EndIf[j]._id;
            break;
          }
        }
      }
    } else if (x && (x.TYPE === 'Retry')) {
      if (mxJson.EndRetry && mxJson.EndRetry.length) {
        for (let j = 0; j < mxJson.EndRetry.length; j++) {
          if (x.id === mxJson.EndRetry[j]._targetId) {
            id = mxJson.EndRetry[j]._id;
            break;
          }
        }
      }
    } else if (x && (x.TYPE === 'Try')) {
      if (mxJson.EndTry && mxJson.EndTry.length) {
        for (let j = 0; j < mxJson.EndTry.length; j++) {
          if (x.id === mxJson.EndTry[j]._targetId) {
            id = mxJson.EndTry[j]._id;
            break;
          }
        }
      }
    } else if (x && (x.TYPE === 'Fork')) {
      if (mxJson.Join && mxJson.Join.length) {
        for (let j = 0; j < mxJson.Join.length; j++) {
          if (x.id === mxJson.Join[j]._targetId) {
            id = mxJson.Join[j]._id;
            break;
          }
        }
      }
    } else if (x) {
      id = x.id;
    }
    return id;
  }

  createObject(type, node): any {
    let obj: any = {
      id: node._id,
      uuid: node._uuid || this.create_UUID(),
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
    instruction.try = {
      instructions: instruction.instructions
    };
    delete instruction['instructions'];
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
    delete instruction['instructions'];
  }

  isValidObject(str) {
    if (/^([A-Z]|[a-z]|_|\$)([A-Z]|[a-z]|[0-9]|\$|_)*$/.test(str)) {
      if (/^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|double|do|else|enum|extends|false|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)$/.test(str)) {
        return false;
      } else {
        return true;
      }
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
          return false;
        }
        if (!this.isValidObject(value.jobName)) {
          return false;
        }
      }
      if (type === 'Fork') {
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

  convertTryToRetry(_json) {
    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].TYPE === 'Try') {
            let isRetry = false;
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length === 1
                && json.instructions[x].catch.instructions[0].TYPE === 'Retry') {
                json.instructions[x].TYPE = 'Retry';
                // json.instructions[x].catch = undefined;
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
