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
  public abort;
  public terminate;
  public await;
  public fork;

  constructor(public translate: TranslateService) {
    mxHierarchicalLayout.prototype.interRankCellSpacing = 50;
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
      if (last.TYPE === 'ForkJoin' || last.TYPE === 'If' || last.TYPE === 'Try' || last.TYPE === 'Retry') {
        let z: any;
        if (last.TYPE === 'ForkJoin') {
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
      graph.center(true, true, 0.5, 0);
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
            '_width': '70',
            '_height': '70'
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
            '_width': '70',
            '_height': '70'
          }
        }
      }
    ];
  }

  init(theme) {
    this.resetVariables();
    if (theme === 'light') {
      this.merge = 'symbol;image=./assets/mxgraph/images/symbols/merge.svg';
      this.abort = 'symbol;image=./assets/mxgraph/images/symbols/abort.svg';
      this.terminate = 'symbol;image=./assets/mxgraph/images/symbols/terminate.svg';
      this.await = 'symbol;image=./assets/mxgraph/images/symbols/await.svg';
      this.fork = 'symbol;image=./assets/mxgraph/images/symbols/fork.svg';
    } else {
      this.merge = 'symbol;image=./assets/mxgraph/images/symbols/merge-white.svg';
      this.abort = 'symbol;image=./assets/mxgraph/images/symbols/abort-white.svg';
      this.terminate = 'symbol;image=./assets/mxgraph/images/symbols/terminate-white.svg';
      this.await = 'symbol;image=./assets/mxgraph/images/symbols/await-white.svg';
      this.fork = 'symbol;image=./assets/mxgraph/images/symbols/fork-white.svg';
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
          obj._name = json.instructions[x].jobName;
          obj._title = json.instructions[x].title ? json.instructions[x].title : '';
          obj._agent = json.instructions[x].agentPath ? json.instructions[x].agentPath : '';
          obj._success = (json.instructions[x].returnCodeMeaning && json.instructions[x].returnCodeMeaning.success) ? json.instructions[x].returnCodeMeaning.success : '0';
          obj._failure = (json.instructions[x].returnCodeMeaning && json.instructions[x].returnCodeMeaning.failure) ? json.instructions[x].returnCodeMeaning.failure : '';
          obj._key = (json.instructions[x].variables && _.keys(json.instructions[x].variables).length > 0) ? _.keys(json.instructions[x].variables)[0] : '';
          obj._value = (json.instructions[x].variables && _.values(json.instructions[x].variables).length > 0) ? _.values(json.instructions[x].variables)[0] : '';
          obj.mxCell._style = 'job';
          obj.mxCell.mxGeometry._width = '200';
          obj.mxCell.mxGeometry._height = '50';
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
          obj._label = 'if';
          obj._predicate = json.instructions[x].predicate;
          obj.mxCell._style = 'if';
          obj.mxCell.mxGeometry._width = '150';
          obj.mxCell.mxGeometry._height = '80';

          if (json.instructions[x].then && json.instructions[x].then.instructions && json.instructions[x].then.instructions.length > 0) {
            self.jsonParser(json.instructions[x].then, mxJson, 'endIf', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].then.instructions[0], mxJson, 'then', obj._id);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions && json.instructions[x].else.instructions.length > 0) {
            self.jsonParser(json.instructions[x].else, mxJson, 'endIf', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].else.instructions[0], mxJson, 'else', obj._id);
          }
          self.endIf(json.instructions[x], mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.If.push(obj);
        } else if (json.instructions[x].TYPE === 'ForkJoin') {
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
          obj._label = 'fork';
          obj.mxCell._style = this.fork;
          obj.mxCell.mxGeometry._width = '90';
          obj.mxCell.mxGeometry._height = '90';

          if (json.instructions[x].branches && json.instructions[x].branches.length > 0) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              self.jsonParser(json.instructions[x].branches[i], mxJson, 'branch', obj._id);
              self.connectInstruction(json.instructions[x], json.instructions[x].branches[i], mxJson, 'branch', obj._id);
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
          obj._repeat = json.instructions[x].repeat;
          obj._delay = json.instructions[x].delay;
          obj.mxCell._style = 'retry';
          obj.mxCell.mxGeometry._width = '150';
          obj.mxCell.mxGeometry._height = '80';

          if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
            self.jsonParser(json.instructions[x], mxJson, '', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].instructions[0], mxJson, 'retry', obj._id);
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
          obj._label = 'try';
          obj.mxCell._style = 'try';
          obj.mxCell.mxGeometry._width = '94';
          obj.mxCell.mxGeometry._height = '94';

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
            self.connectInstruction(json.instructions[x].catch, json.instructions[x].catch.instructions[0], mxJson, 'catch', obj._id);
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
              self.connectInstruction(json.instructions[x].catch, json.instructions[x].catch.instructions[0], mxJson, 'catch', obj._id);
              _id = self.getCatchEnd(json.instructions[x].catch, mxJson);
            } else {
               catchObj.mxCell._style = 'dashRectangle';
              _id = json.instructions[x].catch.id;
            }
            mxJson.Catch.push(catchObj);
          } else {
            delete mxJson['Catch'];
          }

          if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
            self.jsonParser(json.instructions[x], mxJson, '', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].instructions[0], mxJson, 'try', obj._id);
            const _lastNode = json.instructions[x].instructions[json.instructions[x].instructions.length - 1];
            if (_lastNode.TYPE !== 'ForkJoin' && _lastNode.TYPE !== 'If' && _lastNode.TYPE !== 'Try' && _lastNode.TYPE !== 'Retry') {

              if (json.instructions[x].catch) {
                self.connectInstruction(_lastNode, json.instructions[x].catch, mxJson, 'try', obj._id);
              } else {
                _id = _lastNode.id;
              }
            } else {
              if (_lastNode && (_lastNode.TYPE === 'If')) {
                if (mxJson.EndIf && mxJson.EndIf.length) {
                  for (let j = 0; j < mxJson.EndIf.length; j++) {
                    if (_lastNode.id === mxJson.EndIf[j]._targetId) {
                      if (json.instructions[x].catch) {
                        self.connectInstruction({id: mxJson.EndIf[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
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
                        self.connectInstruction({id: mxJson.EndRetry[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
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
                        self.connectInstruction({id: mxJson.EndTry[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
                      } else {
                        _id = mxJson.EndTry[j]._id;
                      }
                      break;
                    }
                  }
                }
              } else if (_lastNode && (_lastNode.TYPE === 'ForkJoin')) {
                if (mxJson.Join && mxJson.Join.length) {
                  for (let j = 0; j < mxJson.Join.length; j++) {
                    if (_lastNode.id === mxJson.Join[j]._targetId) {

                      if (json.instructions[x].catch) {
                        self.connectInstruction({id: mxJson.Join[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
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
              self.connectInstruction(json.instructions[x], json.instructions[x].catch, mxJson, 'try', obj._id);
            }
          }

          self.endTry(_id, mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.Try.push(obj);
        } else if (json.instructions[x].TYPE === 'Abort') {
          if (mxJson.Abort) {
            if (!_.isArray(mxJson.Abort)) {
              const _tempExit = _.clone(mxJson.Abort);
              mxJson.Abort = [];
              mxJson.Abort.push(_tempExit);
            }
          } else {
            mxJson.Abort = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = 'abort';
          obj._message = json.instructions[x].message;
          obj.mxCell._style = this.abort;
          obj.mxCell.mxGeometry._width = '75';
          obj.mxCell.mxGeometry._height = '75';
          mxJson.Abort.push(obj);
        } else if (json.instructions[x].TYPE === 'Terminate') {
          if (mxJson.Terminate) {
            if (!_.isArray(mxJson.Terminate)) {
              const _tempExit = _.clone(mxJson.Terminate);
              mxJson.Terminate = [];
              mxJson.Terminate.push(_tempExit);
            }
          } else {
            mxJson.Terminate = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = 'terminate';
          obj._message = json.instructions[x].message;
          obj.mxCell._style = this.terminate;
          obj.mxCell.mxGeometry._width = '75';
          obj.mxCell.mxGeometry._height = '75';
          mxJson.Terminate.push(obj);
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
          obj._label = 'await';
          obj.mxCell._style = this.await;
          obj.mxCell.mxGeometry._width = '90';
          obj.mxCell.mxGeometry._height = '90';

          if (json.instructions[x].events && json.instructions[x].events.length > 0) {
            for (let i = 0; i < json.instructions[x].events.length; i++) {
              self.jsonParseForAwait(json.instructions[x].events[i], mxJson, obj._id);
              if (i === 0) {
                self.connectInstruction(json.instructions[x], json.instructions[x].events[i], mxJson, 'await', obj._id);
              } else {
                self.connectInstruction(json.instructions[x].events[i - 1], json.instructions[x].events[i], mxJson, 'await', obj._id);
              }
            }
          }
          mxJson.Await.push(obj);
        } else {
          console.log('Workflow yet to parse : ' + json.instructions[x].TYPE);
        }
        if (json.instructions[x].TYPE !== 'ForkJoin' && json.instructions[x].TYPE !== 'If' && json.instructions[x].TYPE !== 'Try' && json.instructions[x].TYPE !== 'Retry') {
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
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            json.instructions[x].catch.id = ++self.count;
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
          if (json.instructions[x].events) {
            for (let i = 0; i < json.instructions[x].events.length; i++) {
              json.instructions[x].events[i].id = ++self.count;
            }
          }
        }
      }
    }

    recursive(_json);
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

  private connectInstruction(source, target, mxJson, label, parentId) {
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
      _type: label,
      _id: ++this.count,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _source: source.id,
        _target: (source.TYPE === 'ForkJoin' && target.instructions) ? target.instructions[0].id : target.id,
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
          _width: '150',
          _height: '80'
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
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endRetry', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.EndRetry && mxJson.EndRetry.length) {
          for (let j = 0; j < mxJson.EndRetry.length; j++) {
            if (x.id === mxJson.EndRetry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndRetry[j]._id}, {id: id}, mxJson, 'endRetry', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endRetry', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'ForkJoin')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endRetry', parentId);
              break;
            }
          }
        }
      } else {
        this.connectInstruction(x, {id: id}, mxJson, 'endRetry', parentId);
      }
    } else {
      this.connectInstruction(branches, {id: id}, mxJson, '', parentId);
    }

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
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
          _width: '90',
          _height: '90'
        }
      }
    };
    mxJson.Join.push(joinObj);
    if (_.isArray(branches)) {
      for (let i = 0; i < branches.length; i++) {
        const x = branches[i].instructions[branches[i].instructions.length - 1];
        if (x && (x.TYPE === 'If')) {
          if (mxJson.EndIf && mxJson.EndIf.length) {
            for (let j = 0; j < mxJson.EndIf.length; j++) {
              if (x.id === mxJson.EndIf[j]._targetId) {
                this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else if (x && (x.TYPE === 'ForkJoin')) {
          if (mxJson.Join && mxJson.Join.length) {
            for (let j = 0; j < mxJson.Join.length; j++) {
              if (x.id === mxJson.Join[j]._targetId) {
                this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else if (x && (x.TYPE === 'Retry')) {
          if (mxJson.EndRetry && mxJson.EndRetry.length) {
            for (let j = 0; j < mxJson.EndRetry.length; j++) {
              if (x.id === mxJson.EndRetry[j]._targetId) {
                this.connectInstruction({id: mxJson.EndRetry[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else if (x && (x.TYPE === 'Try')) {
          if (mxJson.EndTry && mxJson.EndTry.length) {
            for (let j = 0; j < mxJson.EndTry.length; j++) {
              if (x.id === mxJson.EndTry[j]._targetId) {
                this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else {
          this.connectInstruction(x, {id: id}, mxJson, 'join', parentId);
        }
      }
    } else {
      this.connectInstruction(branches, {id: id}, mxJson, '', parentId);
    }

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
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
          _width: '150',
          _height: '80'
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
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'ForkJoin')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.EndRetry && mxJson.EndRetry.length) {
          for (let j = 0; j < mxJson.EndRetry.length; j++) {
            if (x.id === mxJson.EndRetry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndRetry[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x) {
        this.connectInstruction(x, {id: id}, mxJson, 'endIf', parentId);
      }
    }
    if (branches.else && branches.else.instructions) {
      flag = false;
      const x = branches.else.instructions[branches.else.instructions.length - 1];
      if (x && (x.TYPE === 'If')) {
        if (mxJson.EndIf && mxJson.EndIf.length) {
          for (let j = 0; j < mxJson.EndIf.length; j++) {
            if (x.id === mxJson.EndIf[j]._targetId) {
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'ForkJoin')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.EndRetry && mxJson.EndRetry.length) {
          for (let j = 0; j < mxJson.EndRetry.length; j++) {
            if (x.id === mxJson.EndRetry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndRetry[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x) {
        this.connectInstruction(x, {id: id}, mxJson, 'endIf', parentId);
      }
    }

    if (flag) {
      this.connectInstruction(branches, {id: id}, mxJson, '', parentId);
    }
    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
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
          _width: '94',
          _height: '94'
        }
      }
    };

    mxJson.EndTry.push(joinObj);
    this.connectInstruction({id: x}, {id: id}, mxJson, 'endTry', parentId);
    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
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
    } else if (x && (x.TYPE === 'ForkJoin')) {
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

  private jsonParseForAwait(eventObj, mxJson, parentId) {
    if (eventObj.TYPE === 'OfferedOrder') {
      if (mxJson.OfferedOrder) {
        if (!_.isArray(mxJson.OfferedOrder)) {
          const _tempOfferedOrder = _.clone(mxJson.OfferedOrder);
          mxJson.OfferedOrder = [];
          mxJson.OfferedOrder.push(_tempOfferedOrder);
        }
      } else {
        mxJson.OfferedOrder = [];
      }
      let obj: any = {
        _id: eventObj.id,
        _label: 'offeredOrder',
        mxCell: {
          _parent: parentId ? parentId : '1',
          _vertex: '1',
          _style: 'rectangle',
          mxGeometry: {
            _as: 'geometry',
            _width: '120',
            _height: '50'
          }
        }
      };
      mxJson.OfferedOrder.push(obj);

    } else if (eventObj.TYPE === 'FileOrder') {
      if (mxJson.FileOrder) {
        if (!_.isArray(mxJson.FileOrder)) {
          const _tempFileOrder = _.clone(mxJson.FileOrder);
          mxJson.FileOrder = [];
          mxJson.FileOrder.push(_tempFileOrder);
        }
      } else {
        mxJson.FileOrder = [];
      }
      let obj: any = {
        _id: eventObj.id,
        _label: 'fileOrder',
        _agent: eventObj.agentPath,
        _regex: eventObj.regex,
        _directory: eventObj.directory,
        _checkSteadyState: eventObj.checkSteadyState,
        mxCell: {
          _parent: parentId ? parentId : '1',
          _vertex: '1',
          _style: 'rectangle',
          mxGeometry: {
            _as: 'geometry',
            _width: '120',
            _height: '50'
          }
        }
      };
      mxJson.FileOrder.push(obj);
    }
  }

  public convertValueToString(cell): string {
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
        let name = cell.getAttribute('name');
        let title = cell.getAttribute('title');
        if (title != null && title.length > 0) {
          return name + ' - ' + title;
        }
        return name;
      } else if (cell.value.tagName === 'Retry') {
        str = 'Retry ' + cell.getAttribute('repeat') + ' times';
        if (cell.getAttribute('delay') && cell.getAttribute('delay') !== 0) {
          str = str + '\nwith delay ' + cell.getAttribute('delay');
        }
        return str;
      } else if (cell.value.tagName === 'FileOrder') {
        this.translate.get('workflow.label.fileOrder').subscribe(translatedValue => {
          str = translatedValue;
        });
        if (cell.getAttribute('directory')) {
          str = str + ' - ' + cell.getAttribute('directory');
        }
        return str;
      } else if (cell.value.tagName === 'If') {
        return cell.getAttribute('predicate') || 'If';
      } else {
        let x = cell.getAttribute('label');
        if (x) {
          if (cell.value.tagName === 'Connection') {
            if (x === 'then' || x === 'else' || x === 'await') {
              this.translate.get('workflow.label.' + x).subscribe(translatedValue => {
                str = translatedValue;
              });
            } else {
              // str = x;
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
        let name = '', title = '', agent = '';
        this.translate.get('workflow.label.name').subscribe(translatedValue => {
          name = translatedValue;
        });
        this.translate.get('workflow.label.title').subscribe(translatedValue => {
          title = translatedValue;
        });
        this.translate.get('workflow.label.agent').subscribe(translatedValue => {
          agent = translatedValue;
        });
        return '<b>' + name + '</b> : ' + (cell.getAttribute('name') || '-') + '</br>' +
          '<b>' + title + '</b> : ' + (cell.getAttribute('title') || '-') + '</br>' +
          '<b>' + agent + '</b> : ' + (cell.getAttribute('agent') || '-');
      } else if (cell.value.tagName === 'Retry') {
        let repeat = '', delay = '';
        this.translate.get('workflow.label.repeat').subscribe(translatedValue => {
          repeat = translatedValue;
        });
        this.translate.get('workflow.label.delay').subscribe(translatedValue => {
          delay = translatedValue;
        });
        return '<b>' + repeat + '</b> : ' + (cell.getAttribute('repeat') || '-') + '</br>' +
          '<b>' + delay + '</b> : ' + (cell.getAttribute('delay') || '-');
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
      } else if (cell.value.tagName === 'Abort' || cell.value.tagName === 'Terminate') {
        let msg = '';
        this.translate.get('workflow.label.message').subscribe(translatedValue => {
          msg = translatedValue;
        });
        return '<b>' + msg + '</b> : ' + (cell.getAttribute('message') || '-');
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
}
