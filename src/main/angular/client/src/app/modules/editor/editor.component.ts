import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {saveAs} from 'file-saver/FileSaver';
import * as _ from 'underscore';
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster";

declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxObjectCodec;
declare const mxEdgeHandler;
declare const mxCodec;
declare const mxAutoSaveManager;
declare const mxGraphHandler;
declare const mxCellAttributeChange;
declare const mxGraph;
declare const mxForm;
declare const mxHierarchicalLayout;
declare const mxImageExport;
declare const mxXmlCanvas2D;
declare const mxOutline;
declare const mxDragSource;
declare const mxConstants;
declare const mxRectangle;
declare const mxPoint;
declare const mxUndoManager;
declare const mxEventObject;

declare const X2JS;
declare const $;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  host: {
    '(window:resize)': 'onResize()'
  }
})
export class EditorComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  tree: any = [];
  isLoading: boolean = true;
  view: string;
  editor: any;
  xmlTest: any;
  workFlows: any = [];
  object: any = {checkbox: false, workflows: []};
  lastId: any;
  joinId: any =[];
  endIfId: any = [];
  isPropertyHide: boolean = false;
  json: any = {};
  options: any = {};
  count = 2;

  @ViewChild('treeCtrl') treeCtrl;

  constructor(private authService: AuthService, public coreService: CoreService, public translate: TranslateService, public toasterService: ToasterService) {

  }

  ngOnInit() {
    this.init();
    EditorComponent.setGraphHt();
    this.coreService.get("workflow.json").subscribe((data) => {
      let x2js = new X2JS();
      this.xmlTest = x2js.json2xml_str(data);
    });
  }

  ngOnDestroy() {
    //  this.xmlToJsonParser();
    try {
      if (this.editor) {
        mxEvent.removeAllListeners(this.editor.graph);
        this.editor.destroy();
        this.editor = null;
      }
    } catch (e) {
      console.log(e)
    }
  }

  init() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.view = JSON.parse(localStorage.views).joe || 'grid';

    this.workFlows = [
      {id: 1, job: 'Job 1', path: '/test/test101/job1'},
      {id: 1, job: 'Job 2', path: '/test/test101/job1'},
      {id: 1, job: 'Job 3', path: '/test/test101/job3'}
    ];
    this.initTree();
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res);
      const self = this;
      let interval = setInterval(function () {
        if (self.treeCtrl && self.treeCtrl.treeModel) {
          const node = self.treeCtrl.treeModel.getNodeById(1);
          node.expand();
          clearInterval(interval);
        }
      }, 5);
      this.isLoading = false;
      this.createEditor('./assets/mxgraph/config/diagrameditor.xml');
    }, () => this.isLoading = false);
  }

  // Function to generating dynamic unique Id
  private appendIdInJson(json) {
    for (let x = 0; x < json.instructions.length; x++) {
      json.instructions[x].id = ++this.count;
      if (json.instructions[x].instructions) {
        this.appendIdInJson(json.instructions[x])
      }
      if (json.instructions[x].then) {
        this.appendIdInJson(json.instructions[x].then)
      }
      if (json.instructions[x].else) {
        this.appendIdInJson(json.instructions[x].else)
      }
      if (json.instructions[x].branches) {
        for (let i = 0; i < json.instructions[x].branches.length; i++) {
          this.appendIdInJson(json.instructions[x].branches[i]);
        }
      }
    }
  }

  private jsonParseForAwait(eventObj, mxJson) {
    if (eventObj.TYPE) {
      if (eventObj.TYPE === 'OfferedOrder') {
        if (mxJson.OfferedOrder) {
          if (!_.isArray(mxJson.OfferedOrder)) {
            let _tempOfferedOrder = _.clone(mxJson.OfferedOrder);
            mxJson.OfferedOrder = [];
            mxJson.OfferedOrder.push(_tempOfferedOrder);
          }
        } else {
          mxJson.OfferedOrder = [];
        }
        let obj: any = {
          _id: eventObj.id,
          _label: 'Offered Order',
          mxCell: {
            _parent: '1',
            _vertex: '1',
            _style: 'ellipse',
            mxGeometry: {
              _as: 'geometry',
              _width: '80',
              _height: '60'
            }
          }
        };
        mxJson.OfferedOrder.push(obj);
      }
    } else if (eventObj.TYPE === 'TimePeriod') {
      //TODO
    } else if (eventObj.TYPE === 'FileOrder') {
      //TODO
    }
  }

  //Function to genarate flow diagram with the help of JSON
  private jsonParser(json, mxJson) {
    const self = this;
    if (json.instructions) {
      for (let x = 0; x < json.instructions.length; x++) {
        let obj: any = {
          mxCell: {
            _parent: '1',
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
          obj._path = json.instructions[x].jobPath;
          obj._title = json.instructions[x].title ? json.instructions[x].title : '';
          obj._agent = json.instructions[x].agentPath ? json.instructions[x].agentPath : '';
          obj.mxCell._style = 'rounded';
          obj.mxCell.mxGeometry._width = '200';
          obj.mxCell.mxGeometry._height = '50';
          mxJson.Job.push(obj);
        }
        else if (json.instructions[x].TYPE === 'If') {
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
          obj._predicate = json.instructions[x].predicate;
          obj.mxCell._style = 'rhombus';
          obj.mxCell.mxGeometry._width = '150';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            self.jsonParser(json.instructions[x].then, mxJson);
            self.connectInstruction(json.instructions[x], json.instructions[x].then.instructions[0], mxJson, 'then');
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            self.jsonParser(json.instructions[x].else, mxJson);
            self.connectInstruction(json.instructions[x], json.instructions[x].else.instructions[0], mxJson, 'else');
          }
          self.endIf( mxJson, json.instructions, x);
          mxJson.If.push(obj);

        }
        else if (json.instructions[x].TYPE === 'ForkJoin') {
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
          obj._label = 'Fork';
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/fork.png';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].branches && json.instructions[x].branches.length > 0) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              self.jsonParser(json.instructions[x].branches[i], mxJson);
              self.connectInstruction(json.instructions[x], json.instructions[x].branches[i], mxJson, 'branch');
            }
            self.joinFork(json.instructions[x].branches, mxJson, json.instructions, x);
          }
          mxJson.Fork.push(obj);
        }
        else if (json.instructions[x].TYPE === 'Await') {
          if (mxJson.Await) {
            if (!_.isArray(mxJson.Await)) {
              let _tempAwait = _.clone(mxJson.Await);
              mxJson.Await = [];
              mxJson.Await.push(_tempAwait);
            }
          } else {
            mxJson.Await = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = 'Await';
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/timer.png';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].events && json.instructions[x].events.length > 0) {
            for (let i = 0; i < json.instructions[x].events.length; i++) {
              //TODO
              self.jsonParseForAwait(json.instructions[x].events[i], mxJson);
              self.connectInstruction(json.instructions[x], json.instructions[x].events[i], mxJson, '');
            }
          }

          mxJson.Await.push(obj);
        }
        else if (json.instructions[x].TYPE === 'Retry') {
          if (mxJson.Retry) {
            if (!_.isArray(mxJson.Retry)) {
              let _tempRetry = _.clone(mxJson.Retry);
              mxJson.Retry = [];
              mxJson.Retry.push(_tempRetry);
            }
          } else {
            mxJson.Retry = [];
          }
          obj._id = json.instructions[x].id;
          obj._repeat = json.instructions[x].repeat;
          obj._delay = json.instructions[x].delay;
          obj.mxCell._style = 'rhombus';
          obj.mxCell.mxGeometry._width = '180';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
            self.jsonParser(json.instructions[x], mxJson);
            self.connectInstruction(json.instructions[x], json.instructions[x].instructions[0], mxJson, 'retry');
          }
          mxJson.Retry.push(obj);
        }
        else if (json.instructions[x].TYPE === 'Exit') {
          if (mxJson.Exit) {
            if (!_.isArray(mxJson.Exit)) {
              let _tempExit = _.clone(mxJson.Exit);
              mxJson.Exit = [];
              mxJson.Exit.push(_tempExit);
            }
          } else {
            mxJson.Exit = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = json.instructions[x].TYPE;
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/cancel_end.png';
          obj.mxCell.mxGeometry._width = '60';
          obj.mxCell.mxGeometry._height = '60';
          mxJson.Exit.push(obj);
        } else {
          console.log('Workflow yet to parse : ' + json.instructions[x].TYPE);
        }
        if (json.instructions[x].TYPE !== 'ForkJoin')
          self.connectEdges(json.instructions, x, mxJson);
      }
    } else {
      console.log('No instruction..');
    }
  }

  private connectEdges(list, index, mxJson) {
    if (mxJson.Connection) {
      if (!_.isArray(mxJson.Connection)) {
        let _tempJob = _.clone(mxJson.Connection);
        mxJson.Connection = [];
        mxJson.Connection.push(_tempJob);
      }

    } else {
      mxJson.Connection = [];
    }

    if (list.length > (index + 1)) {
      let obj: any = {
        _label: '',
        mxCell: {
          _parent: '1',
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

  private connectInstruction(source, target, mxJson, label) {
    if (mxJson.Connection) {
      if (!_.isArray(mxJson.Connection)) {
        let _tempJob = _.clone(mxJson.Connection);
        mxJson.Connection = [];
        mxJson.Connection.push(_tempJob);
      }
    } else {
      mxJson.Connection = [];
    }
    let obj: any = {
      _label: label === 'branch' ? '' : label === 'join' ? '' : label === 'then' ? 'true' : label === 'else' ? 'false' : label,
      _type: label,
      mxCell: {
        _parent: '1',
        _source: source.id,
        _target: source.TYPE === 'ForkJoin' ? target.instructions[0].id : target.id,
        _edge: '1',
        mxGeometry: {
          _relative: 1,
          _as: 'geometry'
        }
      }
    };
    mxJson.Connection.push(obj);
  }

  private joinFork(branchs, mxJson, list, index) {
    if (mxJson.Join) {
      if (!_.isArray(mxJson.Join)) {
        let _tempJoin = _.clone(mxJson.Join);
        mxJson.Join = [];
        mxJson.Join.push(_tempJoin);
      }

    } else {
      mxJson.Join = [];
    }
    let id = parseInt(list[list.length - 1].id) + 1000;
    let joinObj: any = {
      _id: id,
      _label: 'Join',
      mxCell: {
        _parent: '1',
        _vertex: '1',
        _style: 'symbol;image=./assets/mxgraph/images/symbols/fork.png',
        mxGeometry: {
          _as: 'geometry',
          _width: '70',
          _height: '70'
        }
      }
    };
    mxJson.Join.push(joinObj);
    for (let i = 0; i < branchs.length; i++) {
      this.connectInstruction(branchs[i].instructions[branchs[i].instructions.length - 1], {id: id}, mxJson, 'join')
    }

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '')
    }
  }

  private endIf(mxJson, list, index) {
    if (mxJson.EndIf) {
      if (!_.isArray(mxJson.EndIf)) {
        let _tempJoin = _.clone(mxJson.EndIf);
        mxJson.EndIf = [];
        mxJson.EndIf.push(_tempJoin);
      }

    } else {
      mxJson.EndIf = [];
    }
    let id = parseInt(list[list.length - 1].id) + 1000;
    let endIfObj: any = {
      _id: id,
      _label: 'EndIf',
      mxCell: {
        _parent: '1',
        _vertex: '1',
        _style: 'rhombus',
        mxGeometry: {
          _as: 'geometry',
          _width: '150',
          _height: '70'
        }
      }
    };
    mxJson.EndIf.push(endIfObj);

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '')
    }
  }

  private createObject(type, node): any {
    let obj: any = {
      id: node._id,
      TYPE: type,
    };
    if (type == 'Job') {
      obj.jobPath = node._path;
      obj.title = node._title;
      obj.agentPath = node._agent;
      let successArr, failureArr;
      if (node._success) {
        successArr = node._success.split(',');
      }
      if (node._failure) {
        failureArr = node._failure.split(',');
      }
      obj.returnCodeMeaning = {failure: failureArr, success: successArr};
    } else if (type == 'If') {
      obj.predicate = node._predicate;
    } else if (type == 'Retry') {
      obj.repeat = node._repeat;
      obj.delay = node._delay;
    }
    return obj;
  }

  private xmlToJsonParser() {
    if (this.editor) {
      let _graph = _.clone(this.editor.graph);
      let enc = new mxCodec();

      let node = enc.encode(_graph.getModel());
      let xml = mxUtils.getXml(node);
      let x2js = new X2JS();
      let _json: any;
      try {
        _json = x2js.xml_str2json(xml);
      } catch (e) {
        console.log(e);
      }

      if (!_json.mxGraphModel) {
        return;
      }
      let objects = _json.mxGraphModel.root;

      let jsonObj = {
        id: '',
        instructions: []
      };
      let startNode: any = {};
      this.joinId = [];
      this.endIfId = [];

      if (objects.Connection) {
        if (!_.isArray(objects.Connection)) {
          let _tempCon = _.clone(objects.Connection);
          objects.Connection = [];
          objects.Connection.push(_tempCon);
        }
        let connection = objects.Connection;
        let _jobs = _.clone(objects.Job);
        let _ifInstructions = _.clone(objects.If);
        let _forkInstructions = _.clone(objects.Fork);
        let _retryInstructions = _.clone(objects.Retry);
        let _awaitInstructions = _.clone(objects.Await);
        let _exitInstructions = _.clone(objects.Exit);

        for (let i = 0; i < connection.length; i++) {
          if (_jobs) {
            if (_.isArray(_jobs)) {
              for (let j = 0; j < _jobs.length; j++) {
                if (connection[i].mxCell._target == _jobs[j]._id) {
                  _jobs.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target == _jobs._id) {
                _jobs = [];
              }
            }
          }
          if (_forkInstructions) {
            if (_.isArray(_forkInstructions)) {
              for (let j = 0; j < _forkInstructions.length; j++) {
                if (connection[i].mxCell._target == _forkInstructions[j]._id) {
                  _forkInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target == _forkInstructions._id) {
                _forkInstructions = [];
              }
            }
          }

          if (_retryInstructions) {
            if (_.isArray(_retryInstructions)) {
              for (let j = 0; j < _retryInstructions.length; j++) {
                if (connection[i].mxCell._target == _retryInstructions[j]._id) {
                  _retryInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target == _retryInstructions._id) {
                _retryInstructions = [];
              }
            }
          }
          if (_awaitInstructions) {
            if (_.isArray(_awaitInstructions)) {
              for (let j = 0; j < _awaitInstructions.length; j++) {
                if (connection[i].mxCell._target == _awaitInstructions[j]._id) {
                  _awaitInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target == _awaitInstructions._id) {
                _awaitInstructions = [];
              }
            }
          }

          if (_ifInstructions) {
            if (_.isArray(_ifInstructions)) {
              for (let j = 0; j < _ifInstructions.length; j++) {
                if (connection[i].mxCell._target == _ifInstructions[j]._id) {
                  _ifInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target == _ifInstructions._id) {
                _ifInstructions = [];
              }
            }
          }
          if (_exitInstructions) {
            if (_.isArray(_exitInstructions)) {
              for (let j = 0; j < _exitInstructions.length; j++) {
                if (connection[i].mxCell._target == _exitInstructions[j]._id) {
                  _exitInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target == _exitInstructions._id) {
                _exitInstructions = [];
              }
            }
          }
        }

        if (_jobs) {
          if (_.isArray(_jobs) && _jobs.length > 0) {
            startNode = _jobs[0];
          } else {
            startNode = _jobs;
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Job', startNode));
          this.findNextNode(connection, startNode._id, objects, jsonObj.instructions);
          startNode = null;
        }
        else {
          if (_forkInstructions) {
            if (_.isArray(_forkInstructions) && _forkInstructions.length > 0) {
              startNode = _forkInstructions[0];
            } else {
              startNode = _forkInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('ForkJoin', startNode));
          this.findNextNode(connection, startNode._id, objects, jsonObj.instructions);
          startNode = null;
        }
        else {
          if (_retryInstructions) {
            if (_.isArray(_retryInstructions) && _retryInstructions.length > 0) {
              startNode = _retryInstructions[0];
            } else {
              startNode = _retryInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Retry', startNode));
          this.findNextNode(connection, startNode._id, objects, jsonObj.instructions);
          startNode = null;
        }
        else {
          if (_awaitInstructions) {
            if (_.isArray(_awaitInstructions) && _awaitInstructions.length > 0) {
              startNode = _awaitInstructions[0];
            } else {
              startNode = _awaitInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Await', startNode));
          this.findNextNode(connection, startNode._id, objects, jsonObj.instructions);
          startNode = null;
        }
        else {
          if (_ifInstructions) {
            if (_.isArray(_ifInstructions) && _ifInstructions.length > 0) {
              startNode = _ifInstructions[0];
            } else {
              startNode = _ifInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('If', startNode));
          this.findNextNode(connection, startNode._id, objects, jsonObj.instructions);
          startNode = null;
        }
        else {
          if (_exitInstructions) {
            if (_.isArray(_exitInstructions) && _exitInstructions.length > 0) {
              startNode = _exitInstructions[0];
            } else {
              startNode = _exitInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Exit', startNode));
          this.findNextNode(connection, startNode._id, objects, jsonObj.instructions);
          startNode = null;
        } else {
          // console.log('start node not found');
        }

        if (this.joinId && this.joinId.length > 0 && connection.length > 0) {
          for (let i = 0; i < this.joinId.length; i++) {
            this.findNextNode(connection, this.joinId[i], objects, jsonObj.instructions);
          }
        } else if (this.endIfId && this.endIfId.length > 0 && connection.length > 0) {
          for (let i = 0; i < this.endIfId.length; i++) {
            this.findNextNode(connection, this.endIfId[i], objects, jsonObj.instructions);
          }
        } else {
          if (this.lastId && connection.length > 0) {
            this.findNextNode(connection, this.lastId, objects, jsonObj.instructions);
          }
        }
      } else {
        let job = objects.Job;
        let ifIns = objects.If;
        let fork = objects.Fork;
        let retry = objects.Retry;
        let awaitIns = objects.Await;
        let exit = objects.Exit;
        if (job) {
          if (_.isArray(job)) {
            for (let i = 0; i < job.length; i++) {
              jsonObj.instructions.push(this.createObject('Job', job[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Job', job));
          }
        }
        if (ifIns) {
          if (_.isArray(ifIns)) {
            for (let i = 0; i < ifIns.length; i++) {
              jsonObj.instructions.push(this.createObject('If', ifIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('If', ifIns));
          }
        }
        if (fork) {
          if (_.isArray(fork)) {
            for (let i = 0; i < fork.length; i++) {
              jsonObj.instructions.push(this.createObject('ForkJoin', fork[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('ForkJoin', fork));
          }
        }
        if (retry) {
          if (_.isArray(retry)) {
            for (let i = 0; i < retry.length; i++) {
              jsonObj.instructions.push(this.createObject('Retry', retry[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Retry', retry));
          }
        }
        if (awaitIns) {
          if (_.isArray(awaitIns)) {
            for (let i = 0; i < awaitIns.length; i++) {
              jsonObj.instructions.push(this.createObject('Await', awaitIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Await', awaitIns));
          }
        }
        if (exit) {
          if (_.isArray(exit)) {
            for (let i = 0; i < exit.length; i++) {
              jsonObj.instructions.push(this.createObject('Exit', exit[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Exit', exit));
          }
        }
      }
      this.json = jsonObj;
    }
  }

  private findNextNode(connection, id, objects, instructions: Array<any>) {
    if (_.isArray(connection)) {
      for (let i = 0; i < connection.length; i++) {
        if (!connection[i].skip && connection[i].mxCell._source && connection[i].mxCell._source === id) {
          let _id = _.clone(connection[i].mxCell._target);
          let instructionArr = instructions;
          if (connection[i]._type == 'then' || connection[i]._type == 'else') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE == 'If' && instructions[j].id === id) {
                if (connection[i]._type == 'then') {
                  instructions[j].then = {
                    instructions: []
                  };
                  instructionArr = instructions[j].then.instructions;
                } else {
                  instructions[j].else = {
                    instructions: []
                  };
                  instructionArr = instructions[j].else.instructions;
                }
                break;
              }
            }
          }
          if (connection[i]._type == 'branch') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE == 'ForkJoin' && instructions[j].id === id) {
                if (!instructions[j].branches) {
                  instructions[j].branches = [];
                }
                instructions[j].branches.push({instructions: []});
                for (let x = 0; x < instructions[j].branches.length; x++) {
                  if (!instructions[j].branches[x].id) {
                    instructions[j].branches[x].id = 'branch ' + (x + 1);
                    instructionArr = instructions[j].branches[x].instructions;
                    break;
                  }
                }
                break;
              }
            }
          }
          if (connection[i]._type == 'retry') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE == 'Retry' && instructions[j].id === id) {
                if (!instructions[j].instructions) {
                  instructions[j].instructions = [];
                  instructionArr = instructions[j].instructions;
                }
                break;
              }
            }
          }
          connection[i].skip = true;
          if (connection[i]._type == 'join') {
            if (!this.joinId.includes(_id)) {
              this.joinId.push(_id);
            }
          } else if (connection[i]._type == 'endIf') {
            if (!this.endIfId.includes(_id)) {
              this.endIfId.push(_id);
            }
          } else {
            this.getNextNode(_id, objects, instructionArr);
          }
        }
      }
    } else {
      if (connection.mxCell._source && connection.mxCell._source === id) {
        let _id = _.clone(connection.mxCell._target);
        connection = null;
        this.getNextNode(_id, objects, instructions);
      }
    }
    this.lastId = id;
  }

  private getNextNode(id, objects, instructionsArr: Array<any>) {
    let jobs = objects.Job;
    let ifInstructions = objects.If;
    let endIfInstructions = objects.EndIf;
    let forkInstructions = objects.Fork;
    let joinInstructions = objects.Join;
    let retryInstructions = objects.Retry;
    let awaitInstructions = objects.Await;
    let connection = objects.Connection;
    let exitInstructions = objects.Exit;
    let nextNode: any = {};

    let _tempConnections = Object.assign([], connection);
    for(let i=0; i < _tempConnections.length;i++) {
      for(let j=0; j < connection.length;j++) {
          if(connection[j].skip){
            connection.splice(j,1);
            break;
          }
      }
    }
    _tempConnections = [];

    if (jobs) {
      if (_.isArray(jobs)) {
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i]._id === id) {
            nextNode = jobs[i];
            break;
          }
        }
      } else {
        if (jobs._id === id) {
          nextNode = jobs;
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Job', nextNode));
      this.findNextNode(connection, nextNode._id, objects, instructionsArr);
      nextNode = null;
    }
    else {
      if (forkInstructions) {
        if (_.isArray(forkInstructions)) {
          for (let i = 0; i < forkInstructions.length; i++) {
            if (forkInstructions[i]._id === id) {
              nextNode = forkInstructions[i];
              break;
            }
          }
        } else {
          if (forkInstructions._id === id) {
            nextNode = forkInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('ForkJoin', nextNode));
      this.findNextNode(connection, nextNode._id, objects, instructionsArr);
      nextNode = null;
    }
    else {
      if (joinInstructions) {
        if (_.isArray(joinInstructions)) {
          for (let i = 0; i < joinInstructions.length; i++) {
            if (joinInstructions[i]._id === id) {
              nextNode = joinInstructions[i];
              break;
            }
          }
        } else {
          if (joinInstructions._id === id) {
            nextNode = joinInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode._id, objects, instructionsArr);
      nextNode = null;
    }
    else {
      if (retryInstructions) {
        if (_.isArray(retryInstructions)) {
          for (let i = 0; i < retryInstructions.length; i++) {
            if (retryInstructions[i]._id === id) {
              nextNode = retryInstructions[i];
              break;
            }
          }
        } else {
          if (retryInstructions._id === id) {
            nextNode = retryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Retry', nextNode));
      this.findNextNode(connection, nextNode._id, objects, instructionsArr);
      nextNode = null;
    }
    else {
      if (awaitInstructions) {
        if (_.isArray(awaitInstructions)) {
          for (let i = 0; i < awaitInstructions.length; i++) {
            if (awaitInstructions[i]._id === id) {
              nextNode = awaitInstructions[i];
              break;
            }
          }
        } else {
          if (awaitInstructions._id === id) {
            nextNode = awaitInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Await', nextNode));
      this.findNextNode(connection, nextNode._id, objects, instructionsArr);
      nextNode = null;
    }
    else {
      if (ifInstructions) {
        if (_.isArray(ifInstructions)) {
          for (let i = 0; i < ifInstructions.length; i++) {
            if (ifInstructions[i]._id === id) {
              nextNode = ifInstructions[i];
              break;
            }
          }
        } else {
          if (ifInstructions._id === id) {
            nextNode = ifInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('If', nextNode));
      this.findNextNode(connection, nextNode._id, objects, instructionsArr);
      nextNode = null;
    }
    else {
      if (endIfInstructions) {
        if (_.isArray(endIfInstructions)) {
          for (let i = 0; i < endIfInstructions.length; i++) {
            if (endIfInstructions[i]._id === id) {
              nextNode = endIfInstructions[i];
              break;
            }
          }
        } else {
          if (endIfInstructions._id === id) {
            nextNode = endIfInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode._id, objects, instructionsArr);
      nextNode = null;
    }
    else {
      if (exitInstructions) {
        if (_.isArray(exitInstructions)) {
          for (let i = 0; i < exitInstructions.length; i++) {
            if (exitInstructions[i]._id === id) {
              nextNode = exitInstructions[i];
              break;
            }
          }
        } else {
          if (exitInstructions._id === id) {
            nextNode = exitInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Exit', nextNode));
      this.findNextNode(connection, nextNode._id, objects, instructionsArr);
      nextNode = null;
    } else {
      this.findNextNode(connection, id, objects, instructionsArr);
    }
  }

  private initEditorConf(editor) {
    const self = this;
    let graph = editor.graph;
    // Alt disables guides
    mxGraphHandler.prototype.guidesEnabled = true;
    /**
     * Variable: autoSaveDelay
     *
     * Minimum amount of seconds between two consecutive autosaves. Eg. a
     * value of 1 (s) means the graph is not stored more than once per second.
     * Default is 10.
     */
    mxAutoSaveManager.prototype.autoSaveDelay = 2;
    /**
     * Variable: autoSaveThreshold
     *
     * Minimum amount of ignored changes before an autosave. Eg. a value of 2
     * means after 2 change of the graph model the autosave will trigger if the
     * condition below is true. Default is 5.
     */
    mxAutoSaveManager.prototype.autoSaveThreshold = 1;
    mxGraph.prototype.cellsResizable = false;
    mxGraph.prototype.multigraph = false;
    mxGraph.prototype.allowDanglingEdges = false;
    mxGraph.prototype.cellsLocked = true;
    mxGraph.prototype.foldingEnabled = true;
    mxHierarchicalLayout.prototype.intraCellSpacing = 30;
    mxHierarchicalLayout.prototype.interRankCellSpacing = 60;
    mxConstants.DROP_TARGET_COLOR = 'green';

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    graph.setConnectable(false);
    graph.setEnabled(false);

    // Changes the zoom on mouseWheel events
    mxEvent.addMouseWheelListener(function (evt, up) {
      if (self.editor) {
        if (!mxEvent.isConsumed(evt)) {
          if (up) {
            editor.execute('zoomIn');
          } else {
            editor.execute('zoomOut');
          }
          mxEvent.consume(evt);
        }
      }
    });

    // Create select actions in page
    let node = document.getElementById('mainActions');
    let buttons = ['undo', 'redo', 'delete'];

    //editor.urlImage = 'http://localhost:4200/export';
    // Only adds image and SVG export if backend is available
    // NOTE: The old image export in mxEditor is not used, the urlImage is used for the new export.
    if (editor.urlImage != null) {
      // Client-side code for image export
      let exportImage = function (editor) {
        const scale = graph.view.scale;
        let bounds = graph.getGraphBounds();

        // New image export
        let xmlDoc = mxUtils.createXmlDocument();
        let root = xmlDoc.createElement('output');
        xmlDoc.appendChild(root);

        // Renders graph. Offset will be multiplied with state's scale when painting state.
        const xmlCanvas = new mxXmlCanvas2D(root);
        const imgExport = new mxImageExport();
        xmlCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
        xmlCanvas.scale(scale);

        imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);

        // Puts request data together
        let w = Math.ceil(bounds.width * scale + 2);
        let h = Math.ceil(bounds.height * scale + 2);
        const xml = mxUtils.getXml(root);

        // Requests image if request is valid
        if (w > 0 && h > 0) {
          const name = 'export.xml';
          const format = 'png';
          const bg = '&bg=#FFFFFF';
          const blob = new Blob([xml], {type: 'text/xml'});
          saveAs(blob, name);
          /* new mxXmlRequest(editor.urlImage, 'filename=' + name + '&format=' + format +
             bg + '&w=' + w + '&h=' + h + '&xml=' + encodeURIComponent(xml)).simulate(document, '_blank');*/
        }
      };

      editor.addAction('exportImage', exportImage);
      buttons.push('exportImage');
    }

    for (let i = 0; i < buttons.length; i++) {
      let button = document.createElement('button');
      let dom = document.createElement('img');
      let icon: any;
      if (buttons[i] == 'undo') {
        icon = './assets/mxgraph/images/undo.gif';
        button.setAttribute('class', 'btn btn-sm btn-grey');
        button.setAttribute('title', 'Undo');
      } else if (buttons[i] == 'redo') {
        icon = './assets/mxgraph/images/redo.gif';
        button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
        button.setAttribute('title', 'Redo');
      } else if (buttons[i] == 'delete') {
        icon = './assets/mxgraph/images/delete.gif';
        button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
        button.setAttribute('title', 'Delete');
      }

      dom.setAttribute('src', icon);
      button.appendChild(dom);
      mxUtils.write(button, '');
      let factory = function (name) {
        return function () {
          editor.execute(name);
        };
      };

      mxEvent.addListener(button, 'click', factory(buttons[i]));
      node.appendChild(button);
    }

    // Create zoom actions in page
    let zoomNode = document.getElementById('zoomActions');
    let zoomButtons = ['zoomIn', 'zoomOut', 'actualSize', 'fit'];

    for (let i = 0; i < zoomButtons.length; i++) {
      let button = document.createElement('button');
      let dom = document.createElement('img');
      let icon: any;
      if (zoomButtons[i] == 'zoomIn') {
        icon = './assets/mxgraph/images/zoomin.gif';
        button.setAttribute('class', 'btn btn-sm btn-grey');
        button.setAttribute('title', 'Zoom In');
      } else if (zoomButtons[i] == 'zoomOut') {
        icon = './assets/mxgraph/images/zoomout.gif';
        button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
        button.setAttribute('title', 'Zoom Out');
      } else if (zoomButtons[i] == 'actualSize') {
        icon = './assets/mxgraph/images/zoomactual.gif';
        button.setAttribute('class', 'btn btn-sm btn-grey');
        button.setAttribute('id', 'actual');
        button.setAttribute('title', 'Actual');
      } else if (zoomButtons[i] == 'fit') {
        icon = './assets/mxgraph/images/zoom.gif';
        button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
        button.setAttribute('title', 'Fit');
      }
      dom.setAttribute('src', icon);
      button.appendChild(dom);
      mxUtils.write(button, '');
      let factory = function (name) {
        return function () {
          editor.execute(name);
        };
      };

      mxEvent.addListener(button, 'click', factory(zoomButtons[i]));
      zoomNode.appendChild(button);
    }

    graph.isCellEditable = function (cell) {
      return !this.getModel().isEdge(cell);
    };

    let dropTarget;
    let forkMap = new Map(); //Declare Map object to store fork and join Ids
    let isProgrammaticallyDelete = false;
    let isVertexDrop = false;
    let isUndoable = false;

    /**
     * Create new connection object
     * @param label
     * @param type
     */
    function getConnectionNode(label: string, type: string): Object {
      // Create new Connection object
      let connNode = doc.createElement('Connection');
      connNode.setAttribute('label', label);
      connNode.setAttribute('type', type);
      return connNode;
    }

    /**
     * Create new Node object
     * @param name
     * @param label
     */
    function getCellNode(name: string, label: string): Object {
      // Create new node object
      let node = doc.createElement(name);
      node.setAttribute('label', label);
      return node;
    }

    /**
     * Reformat the layout
     */
    function executeLayout() {
      let layout = new mxHierarchicalLayout(graph);
      layout.execute(graph.getDefaultParent());
      isUndoable = true;
    }

    /**
     * Function to centered the flow diagram
     */
    function makeCenter() {
      setTimeout(() => {
        graph.zoomActual();
        let gh = $('#graph');
        let bounds = graph.getGraphBounds();
        graph.view.setTranslate(-bounds.x - (bounds.width - gh.width()) / 2,
          -bounds.y - (bounds.height - (gh.height() / 2)) / 2);
      }, 5);
    }

    /**
     * Overrides method to provide a cell label in the display
     * @param cell
     */
    graph.convertValueToString = function (cell) {
      if (mxUtils.isNode(cell.value)) {
        if (cell.value.nodeName.toLowerCase() == 'process') {
          let title = cell.getAttribute('title', '');
          if (title != null && title.length > 0) {
            return title;
          }
          return '';
        } else if (cell.value.nodeName.toLowerCase() == 'job') {
          let path = cell.getAttribute('path', '');
          let title = cell.getAttribute('title', '');
          if (title != null && title.length > 0) {
            return path + ' - ' + title;
          }
          return path;
        }
        else if (cell.value.nodeName.toLowerCase() == 'retry') {
          let str = 'Repeat ' + cell.getAttribute('repeat', '') + ' times';
          if(cell.getAttribute('delay', '') && cell.getAttribute('delay', '') !=0 ){
            str = str + '\nwith delay ' + cell.getAttribute('delay', '');
          }
          return str;
        } else if (cell.value.nodeName.toLowerCase() == 'if') {
          return cell.getAttribute('predicate', '');
        } else {
          return cell.getAttribute('label', '');
        }
      }
      return '';
    };

    /**
     * Function: dragOver
     *
     * Implements autoscroll, updates the <currentPoint>, highlights any drop
     * targets and updates the preview.
     */
    mxDragSource.prototype.dragOver = function (graph, evt) {
      let offset = mxUtils.getOffset(graph.container);
      let origin = mxUtils.getScrollOrigin(graph.container);
      let x = mxEvent.getClientX(evt) - offset.x + origin.x - graph.panDx;
      let y = mxEvent.getClientY(evt) - offset.y + origin.y - graph.panDy;

      if (graph.autoScroll && (this.autoscroll == null || this.autoscroll)) {
        graph.scrollPointToVisible(x, y, graph.autoExtend);
      }

      // Highlights the drop target under the mouse
      if (this.currentHighlight != null && graph.isDropEnabled()) {
        this.currentDropTarget = this.getDropTarget(graph, x, y, evt);
        let state = graph.getView().getState(this.currentDropTarget);
        this.currentHighlight.highlightColor = 'green';
        if (state && state.cell) {

          if (state.cell.value.tagName == 'Connector') {
            return;
          } else if (state.cell.value.tagName === 'Job') {
            if (state.cell.edges) {
              for (let i = 0; i < state.cell.edges.length; i++) {
                if (state.cell.edges[i].target.id !== state.cell.id) {
                  this.currentHighlight.highlightColor = '#ff0000';
                }
              }
            }
          } else if (state.cell.value.tagName == 'If') {
            if (state.cell.edges && state.cell.edges.length > 2) {
              this.currentHighlight.highlightColor = '#ff0000';
            }
          } else if (state.cell.value.tagName == 'Join' || state.cell.value.tagName == 'EndIf') {
            if (state.cell.edges && state.cell.edges.length > 1) {
              for (let i = 0; i < state.cell.edges.length; i++) {
                if (state.cell.edges[i].target.id !== state.cell.id) {
                  this.currentHighlight.highlightColor = '#ff0000';
                }
              }
            }
          } else if (state.cell.value.tagName == 'Connection') {
            if ((state.cell.source.value.tagName === 'Fork' && state.cell.target.value.tagName === 'Join') || (state.cell.source.value.tagName === 'If' && state.cell.target.value.tagName === 'EndIf')) {
              return;
            }
          }
        }
        this.currentHighlight.highlight(state);
      }

      // Updates the location of the preview
      if (this.previewElement != null) {
        if (this.previewElement.parentNode == null) {
          graph.container.appendChild(this.previewElement);

          this.previewElement.style.zIndex = '3';
          this.previewElement.style.position = 'absolute';
        }

        let gridEnabled = this.isGridEnabled() && graph.isGridEnabledEvent(evt);
        let hideGuide = true;

        // Grid and guides
        if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt)) {
          // LATER: HTML preview appears smaller than SVG preview
          let w = parseInt(this.previewElement.style.width);
          let h = parseInt(this.previewElement.style.height);
          let bounds = new mxRectangle(0, 0, w, h);
          let delta = new mxPoint(x, y);
          delta = this.currentGuide.move(bounds, delta, gridEnabled);
          hideGuide = false;
          x = delta.x;
          y = delta.y;
        }
        else if (gridEnabled) {
          let scale = graph.view.scale;
          let tr = graph.view.translate;
          let off = graph.gridSize / 2;
          x = (graph.snap(x / scale - tr.x - off) + tr.x) * scale;
          y = (graph.snap(y / scale - tr.y - off) + tr.y) * scale;
        }

        if (this.currentGuide != null && hideGuide) {
          this.currentGuide.hide();
        }

        if (this.previewOffset != null) {
          x += this.previewOffset.x;
          y += this.previewOffset.y;
        }

        this.previewElement.style.left = Math.round(x) + 'px';
        this.previewElement.style.top = Math.round(y) + 'px';
        this.previewElement.style.visibility = 'visible';
      }

      this.currentPoint = new mxPoint(x, y);
    };

    /**
     * Check the drop target on drop event
     * @param graph
     * @param evt
     * @param drpTargt
     * @param x
     * @param y
     */
    mxDragSource.prototype.drop = function (graph, evt, drpTargt, x, y) {
      dropTarget = null;
      let flag = false;
      if (drpTargt) {
        if (drpTargt.value.tagName !== 'Connection') {
          if (drpTargt.value.tagName === 'Job') {
            for (let i = 0; i < drpTargt.edges.length; i++) {
              if (drpTargt.edges[i].target.id !== drpTargt.id) {
                self.toasterService.pop('error', 'Invalid target!!', 'Job instruction can have only one out going and one incoming Edges');
                return;
              }
            }
          } else if (drpTargt.value.tagName === 'If') {
            if (drpTargt.edges.length > 2) {
              self.toasterService.pop('error', 'Invalid target!!', 'Cannot have more than one condition');
              return;
            }
          } else if (drpTargt.value.tagName === 'Join' || drpTargt.value.tagName === 'EndIf') {
            if (drpTargt.edges.length > 1) {
              for (let i = 0; i < drpTargt.edges.length; i++) {
                if (drpTargt.edges[i].target.id !== drpTargt.id) {
                  self.toasterService.pop('error', 'Invalid target!!', 'Cannot have more than one out going Edge');
                  return;
                }
              }
            }
          }
          dropTarget = drpTargt;
        } else {
          flag = true;
        }
      } else {
        return;
      }
      this.dropHandler(graph, evt, drpTargt, x, y);
      if (graph.container.style.visibility != 'hidden') {
        graph.container.focus();
      }
      if (flag) {
        executeLayout();
      }
    };


    /**
     * Recursively remove all the target vertex if edges is removed
     */
    graph.addListener(mxEvent.REMOVE_CELLS, function (sender, evt) {
      let cells = evt.getProperty('cells');
      let cell = graph.getSelectionCell();
      let id = 0;
      if (cell) {
        id = cell.id;
        if (!isProgrammaticallyDelete) {
            for (let i = 0; i < cells.length; i++) {
              let cell = cells[i];
              if (cell.edge && cell.source) {
                if (cell.source.value.tagName === 'Fork' || cell.source.value.tagName === 'If') {
                  if (cell.source.id != id && graph.getOutgoingEdges(cell.source).length < 1) {
                    graph.removeCells([cell.source]);
                  }
                }
                if (cell.target) {
                  if (cell.target.id != id && graph.getIncomingEdges(cell.target).length < 1) {
                    graph.removeCells([cell.target]);
                  }
                }
              }
            }

        } else {
          isProgrammaticallyDelete = false;
        }
      }
    });

    /**
     * Removes the vertex which are added on click event
     */
    editor.addListener(mxEvent.ADD_VERTEX, function (sender, evt) {
      if (isVertexDrop) {
        isVertexDrop = false;
      } else {
        graph.getModel().remove(evt.getProperty('vertex'));
      }
    });

    /**
     * Function: undoableEditHappened
     *
     * Method to be called to add new undoable edits to the <history>.
     */
    mxUndoManager.prototype.undoableEditHappened = function(undoableEdit) {
      this.trim();
      if (this.size > 0 &&
        this.size == this.history.length) {
        this.history.shift();
      }
      if(isUndoable)
      this.history.push(undoableEdit);
      isUndoable = false;
      this.indexOfNextAdd = this.history.length;
      this.fireEvent(new mxEventObject(mxEvent.ADD, 'edit', undoableEdit));
    };

    /**
     * Event to check if connector is valid or not on drop of new instruction
     * @param cell
     * @param cells
     * @param evt
     */
    graph.isValidDropTarget = function (cell, cells, evt) {

      isVertexDrop = true;
      if (cell) {
        if (cell.value && cell.value.tagName === 'Connection') {
          graph.clearSelection();
          if (cells && cells.length > 0) {
            if (cells[0].value.tagName === 'Fork' || cells[0].value.tagName === 'If') {
              let parent = graph.getDefaultParent();
              let v1, label = '', type = '';
              if (cells[0].value.tagName === 'Fork') {
                label = 'branch';
                type = 'branch';
                v1 = graph.insertVertex(parent, null, getCellNode('Join', 'Join'), 0, 0, 70, 70, "symbol;image=./assets/mxgraph/images/symbols/fork.png");
              } else if (cells[0].value.tagName === 'If') {
                label = 'If';
                type = 'If';
                v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'EndIf'), 0, 0, 150, 70, "rhombus");
              }
              graph.insertEdge(parent, null, getConnectionNode(label, type), cell.source, cells[0]);
              graph.insertEdge(parent, null, getConnectionNode('', ''), cells[0], v1);
              graph.insertEdge(parent, null, getConnectionNode('', ''), v1, cell.target);
              isUndoable = true;
              isProgrammaticallyDelete = true;
              graph.getModel().remove(cell);
              setTimeout(() => {
                checkConnectionLabel(cells[0], cell, false );
              }, 0);
              return false;
            }
          }
          if ((cell.source.value.tagName === 'Fork' && cell.target.value.tagName === 'Join') || (cell.source.value.tagName === 'If' && cell.target.value.tagName === 'EndIf')) {
            graph.removeCells(cells);
            evt.preventDefault();
            evt.stopPropagation();
            return false;
          }

          graph.setSelectionCells(cells);
          setTimeout(() => {
            checkConnectionLabel(cells[0], cell ,true);
          }, 0);

        } else {
          if (cell.value && cell.value.tagName === 'Connector') {
            graph.removeCells(cells);
            evt.preventDefault();
            evt.stopPropagation();
            return false;
          }
        }
      }
      if (this.isCellCollapsed(cell)) {
        return true;
      }

      return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
    };

     /**
     * Implements a properties panel that uses
     * mxCellAttributeChange to change properties
     */
    graph.getSelectionModel().addListener(mxEvent.CHANGE, function () {
      let cell = graph.getSelectionCell();
      if (cell && (cell.value.tagName === 'EndIf' || cell.value.tagName === 'Join' || cell.value.tagName === 'Connection' || cell.value.tagName === 'Process')) {
        graph.clearSelection();
        return;
      }
      let label = '', type = '';
      if (cell && dropTarget) {
        if (cell.value.tagName === 'If') {
          label = 'if';
        } else if (dropTarget.value.tagName === 'If') {
          let flag = false;
          label = 'true';
          type = 'then';
          for (let i = 0; i < dropTarget.edges.length; i++) {
            if (dropTarget.edges[i].target.id !== dropTarget.id && dropTarget.edges[i].target.value.tagName !== 'EndIf') {
              label = 'false';
              type = 'else';
            } else {
              if (dropTarget.edges[i].target && dropTarget.edges[i].target.edges) {
                for (let j = 0; j < dropTarget.edges[i].target.edges.length; j++) {
                  if (dropTarget.edges[i].target.edges[j].edge && dropTarget.edges[i].target.edges[j].value.attributes
                    && dropTarget.edges[i].target.edges[j].value.attributes.length > 0 && (dropTarget.edges[i].target.edges[j].value.attributes[0] && dropTarget.edges[i].target.edges[j].value.attributes[0].value == 'false')) {
                    flag = true;
                  }
                }
              }
            }
          }
          if (flag) {
            label = 'true';
            type = 'then';
          }
        }

        let parent = dropTarget.parent || graph.getDefaultParent();
        if (cell.value.tagName === 'Fork') {
          let v1 = graph.insertVertex(parent, null, getCellNode('Join','Join'), 0, 0, 70, 70, "symbol;image=./assets/mxgraph/images/symbols/fork.png");
          graph.insertEdge(parent, null, getConnectionNode('', ''), cell, v1);
        } else if (cell.value.tagName === 'If') {
          let v1 = graph.insertVertex(parent, null, getCellNode('EndIf','EndIf'), 0, 0, 150, 70, "rhombus");
          graph.insertEdge(parent, null, getConnectionNode('', ''), cell, v1);
        }

        if (dropTarget.value.tagName === 'Process') {
          let flag = false;
          for (let i = 0; i < dropTarget.edges.length; i++) {
            if (dropTarget.edges[i].source.id !== dropTarget.id) {
              if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If') {
                for (let j = 0; j < cell.edges.length; j++) {
                  if (cell.edges[j].target.id !== cell.id) {
                    if (cell.edges[j].target.value.tagName === 'Join' || cell.edges[j].target.value.tagName === 'EndIf') {
                      if (flag) {
                        graph.insertEdge(parent, null, getConnectionNode(label, type), cell.edges[j].target, dropTarget.edges[i].target);
                      } else {
                        graph.insertEdge(parent, null, getConnectionNode(label, type), dropTarget.edges[i].source, cell.edges[j].source);
                      }
                      flag = true;
                      break;
                    }
                  }
                }
              } else {
                graph.insertEdge(parent, null, getConnectionNode(label, type), dropTarget.edges[i].source, cell);
              }
            } else {
              if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If') {
                for (let j = 0; j < cell.edges.length; j++) {
                  if (cell.edges[j].target.id !== cell.id) {
                    if (cell.edges[j].target.value.tagName === 'Join' || cell.edges[j].target.value.tagName === 'EndIf') {
                      graph.insertEdge(parent, null, getConnectionNode(label, type), cell.edges[j].target, dropTarget.edges[i].target);
                      break;
                    }
                  }
                }
              } else {
                graph.insertEdge(parent, null, getConnectionNode(label, type), cell, dropTarget.edges[i].target);
              }
            }
          }
          isProgrammaticallyDelete = true;
          graph.removeCells([dropTarget]);
        } else {
          if (dropTarget.value.tagName === 'Fork') {
            label = 'branch';
            type = 'branch';
            if (cell.value.tagName === 'If' || cell.value.tagName === 'Fork') {
              let target1, target2;
              if (!forkMap.has(dropTarget.id)) {
                for (let i = 0; i < dropTarget.edges.length; i++) {
                  if (dropTarget.edges[i].target.id !== dropTarget.id) {
                    if (dropTarget.edges[i].target.value.tagName === 'Join') {
                      forkMap.set(dropTarget.id, dropTarget.edges[i].target.id);
                      target1 = dropTarget.edges[i];
                    }
                    break;
                  }
                }
              }
              if (!forkMap.has(cell.id)) {
                for (let i = 0; i < cell.edges.length; i++) {
                  if (cell.edges[i].target.id !== cell.id) {
                    if (cell.edges[i].target.value.tagName === 'Join' || cell.edges[i].target.value.tagName === 'EndIf') {
                      forkMap.set(cell.id, cell.edges[i].target.id);
                      target2 = cell.edges[i].target;
                    }
                    break;
                  }
                }
              }
              if (target1 && target2) {
                graph.insertEdge(parent, null, getConnectionNode(label, type), target2, target1.target);
                isProgrammaticallyDelete = true;
                graph.getModel().remove(target1);
              } else if (forkMap.has(dropTarget.id)) {
                let target = graph.getModel().getCell(forkMap.get(dropTarget.id));
                graph.insertEdge(parent, null, getConnectionNode(label, type), target2, target);
              }
            } else {
              let flag = false;
              for (let i = 0; i < dropTarget.edges.length; i++) {
                if (dropTarget.edges[i].target.id !== dropTarget.id) {
                  if (dropTarget.edges[i].target.value.tagName === 'Join') {
                    flag = true;
                    if (!forkMap.has(dropTarget.id)) {
                      forkMap.set(dropTarget.id, dropTarget.edges[i].target.id);
                    }
                    graph.insertEdge(parent, null, getConnectionNode('', ''), cell, dropTarget.edges[i].target);
                    isProgrammaticallyDelete = true;
                    graph.getModel().remove(dropTarget.edges[i]);
                    isProgrammaticallyDelete = false;
                  }
                  break;
                }
              }
              if (!flag && forkMap.has(dropTarget.id)) {
                let target = graph.getModel().getCell(forkMap.get(dropTarget.id));
                graph.insertEdge(parent, null, getConnectionNode(label, type), cell, target);
              }
            }


            if (cell.edges) {
              for (let i = 0; i < cell.edges.length; i++) {
                if (cell.edges[i].target.value.tagName === "Join") {
                  cell.edges[i].value.attributes[0].nodeValue = 'join';
                  cell.edges[i].value.attributes[1].nodeValue = 'join';
                }
              }
            }
          } else if (dropTarget.value.tagName === 'If') {

            if (cell.value.tagName === 'If' || cell.value.tagName === 'Fork') {
              let target1, target2;
              if (!forkMap.has(dropTarget.id)) {
                for (let i = 0; i < dropTarget.edges.length; i++) {
                  if (dropTarget.edges[i].target.id !== dropTarget.id) {
                    if (dropTarget.edges[i].target.value.tagName === 'EndIf') {
                      forkMap.set(dropTarget.id, dropTarget.edges[i].target.id);
                      target1 = dropTarget.edges[i];
                    }
                    break;
                  }
                }
              }
              if (!forkMap.has(cell.id)) {
                for (let i = 0; i < cell.edges.length; i++) {
                  if (cell.edges[i].target.id !== cell.id) {
                    if (cell.edges[i].target.value.tagName === 'Join' || cell.edges[i].target.value.tagName === 'EndIf') {
                      forkMap.set(cell.id, cell.edges[i].target.id);
                      target2 = cell.edges[i].target;
                    }
                    break;
                  }
                }
              }
              if (target1 && target2) {
                graph.insertEdge(parent, null, getConnectionNode('', ''), target2, target1.target);
                isProgrammaticallyDelete = true;
                graph.getModel().remove(target1);
              } else if (forkMap.has(dropTarget.id)) {
                let target = graph.getModel().getCell(forkMap.get(dropTarget.id));
                graph.insertEdge(parent, null, getConnectionNode('', ''), target2, target);
              }
            } else {
              let flag = false;
              for (let i = 0; i < dropTarget.edges.length; i++) {
                if (dropTarget.edges[i].target.id !== dropTarget.id) {
                  if (dropTarget.edges[i].target.value.tagName === 'EndIf') {
                    flag = true;
                    if (!forkMap.has(dropTarget.id)) {
                      forkMap.set(dropTarget.id, dropTarget.edges[i].target.id);
                    }
                    graph.insertEdge(parent, null, getConnectionNode('', ''), cell, dropTarget.edges[i].target);
                    isProgrammaticallyDelete = true;
                    graph.getModel().remove(dropTarget.edges[i]);
                    isProgrammaticallyDelete = false;
                  }
                  break;
                }
              }
              if (!flag && forkMap.has(dropTarget.id)) {
                let target = graph.getModel().getCell(forkMap.get(dropTarget.id));
                graph.insertEdge(parent, null, getConnectionNode('', ''), cell, target);
              }
            }

            if (cell.edges) {
              for (let i = 0; i < cell.edges.length; i++) {
                 if (cell.edges[i].target.value.tagName === "EndIf") {
                  cell.edges[i].value.attributes[0].nodeValue = 'endIf';
                  cell.edges[i].value.attributes[1].nodeValue = 'endIf';
                }
              }
            }
          }

          graph.insertEdge(parent, null, getConnectionNode(label, type), dropTarget, cell);
        }

        dropTarget = null;
        executeLayout();
      }
      selectionChanged(graph);
    });

    /**
     * change label of EndIf and Join
     */
    function changeLabelOfConnection(cell, data) {
      graph.getModel().beginUpdate();
      try {
        let label = new mxCellAttributeChange(
          cell, 'label',
          data);
        let type = new mxCellAttributeChange(
          cell, 'type',
          data);
        graph.getModel().execute(label);
        graph.getModel().execute(type);
      }
      finally {
        graph.getModel().endUpdate();
      }
    }

    function checkConnectionLabel(cell, dropTarget, isChange) {
      if (!isChange) {
        if(dropTarget.value.attributes[0].nodeValue === 'join') {
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target !== cell.id) {
              if ((cell.edges[i].target.value.tagName === 'Join' || cell.edges[i].target.value.tagName === 'EndIf')) {
                if(cell.edges[i].target.edges) {
                  for (let j = 0; j < cell.edges[i].target.edges.length; j++) {
                    if(cell.edges[i].target.edges[j] && cell.edges[i].target.edges[j].target.id != cell.edges[i].target.id ){
                      changeLabelOfConnection(cell.edges[i].target.edges[j], 'join');
                      break;
                    }
                  }
                }
              }
              if (cell.edges[i].target.value.tagName === 'Fork' || cell.edges[i].target.value.tagName === 'If') {
                changeLabelOfConnection(cell.edges[i], 'branch');
              }
            }

          }
        }
      } else {
        if (cell.edges) {
          let _tempCell: any;
          for (let i = 0; i < cell.edges.length; i++) {
            if (_tempCell) {
              if (cell.edges[i].target !== cell.id) {
                if (cell.edges[i].target.value.tagName === 'Join') {
                  changeLabelOfConnection(_tempCell, 'branch');
                  changeLabelOfConnection(cell.edges[i], 'join');
                } else if (cell.edges[i].target.value.tagName === 'EndIf') {
                  //changeLabelOfConnection(cell.edges[i], 'endIf');
                  console.log('>>>>>>> endIf >>>>>>>>')
                }
              }
            }
            if (cell.edges[i].source !== cell.id) {
              if (cell.edges[i].source.value.tagName === 'Join' || cell.edges[i].source.value.tagName === 'EndIf') {
                _tempCell = cell.edges[i];
              }

            }

            if (((dropTarget.value.attributes[0].nodeValue === 'join' || dropTarget.value.attributes[1].nodeValue === 'join') && cell.edges[i].id !== dropTarget.id)) {
              changeLabelOfConnection(cell.edges[i], 'branch');
            } else if (((dropTarget.value.attributes[0].nodeValue === 'endIf' || dropTarget.value.attributes[1].nodeValue === 'endIf') && cell.edges[i].id !== dropTarget.id)) {
              changeLabelOfConnection(cell.edges[i], '');
            }
            if (cell.id !== cell.edges[i].target.id) {
              let attrs = cell.edges[i].value.attributes;
              if (attrs) {
                if (attrs[0].value && (attrs[0].value === 'true' || attrs[0].value === 'false')) {
                  graph.getModel().beginUpdate();
                  try {
                    let label = new mxCellAttributeChange(
                      cell.edges[i], 'label',
                      '');
                    let type = new mxCellAttributeChange(
                      cell.edges[i], 'type',
                      '');
                    graph.getModel().execute(label);
                    graph.getModel().execute(type);
                    isUndoable = true;
                  }
                  finally {
                    graph.getModel().endUpdate();
                  }
                }
              }
            } else if (cell.id !== cell.edges[i].source.id) {
              let attrs = cell.edges[i].value.attributes;
              if (attrs) {
                if (attrs[0].value === 'If') {
                  if (cell.edges[i].target.value.tagName !== 'If' && cell.edges[i].source.value.tagName !== 'If' && cell.value.tagName !== 'If') {
                    graph.getModel().beginUpdate();
                    try {
                      let label = new mxCellAttributeChange(
                        cell.edges[i], 'label',
                        '');
                      let type = new mxCellAttributeChange(
                        cell.edges[i], 'type',
                        '');
                      graph.getModel().execute(label);
                      graph.getModel().execute(type);
                      isUndoable = true;
                    }
                    finally {
                      graph.getModel().endUpdate();
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    /**
     * Updates the properties panel
     */
    function selectionChanged(graph) {
      let div = document.getElementById('properties');
      // Forces focusout in IE
      graph.container.focus();

      // Clears the DIV the non-DOM way
      div.innerHTML = '';

      // Gets the selection cell
      let cell = graph.getSelectionCell();

      if (cell == null) {
        mxUtils.writeln(div, 'Nothing selected.');
      }
      else {
        if (cell.source && cell.target) {
          if (cell.source.value.nodeName === 'Fork') {
            if (cell.source.getEdgeCount() > 0) {
              graph.getModel().beginUpdate();
              try {
                let edit = new mxCellAttributeChange(
                  cell, 'type',
                  'branch');
                graph.getModel().execute(edit);
                isUndoable = true;
              }
              finally {
                graph.getModel().endUpdate();
              }
            }
          } else if (cell.target.value.nodeName === 'Join') {
            if (cell.target.getEdgeCount() > 0) {
              graph.getModel().beginUpdate();
              try {
                let edit = new mxCellAttributeChange(
                  cell, 'type',
                  'join');
                graph.getModel().execute(edit);
                isUndoable = true;
              }
              finally {
                graph.getModel().endUpdate();
              }
            }
          } else if (cell.source.value.nodeName === 'Retry') {
            if (cell.source.getEdgeCount() > 0) {
              if (!cell.value.attributes[0].nodeValue) {
                let outGoingEdges = 0;
                for (let i = 0; i < cell.source.getEdgeCount(); i++) {
                  if (cell.source.id == cell.source.edges[i].source.id) {
                    outGoingEdges = outGoingEdges + 1;
                  }
                }
                if (outGoingEdges == 1) {
                  graph.getModel().beginUpdate();
                  try {
                    let edit = new mxCellAttributeChange(
                      cell, 'label',
                      'retry');
                    let edit1 = new mxCellAttributeChange(
                      cell, 'type',
                      'retry');
                    graph.getModel().execute(edit);
                    graph.getModel().execute(edit1);
                    isUndoable = true;
                  }
                  finally {
                    graph.getModel().endUpdate();
                  }
                }
              }
            }
          }
          return;
        }

        let form = new mxForm('property-table');
        let attrs = cell.value.attributes;
        let flg1 = false, flg2 = false;
        if (attrs) {
          for (let i = 0; i < attrs.length; i++) {
            createTextField(graph, form, cell, attrs[i]);
            if (attrs[i].nodeName == 'success') {
              flg1 = true;
            }
            if (attrs[i].nodeName == 'failure') {
              flg2 = true;
            }
          }
          if (cell.value.nodeName == 'Job') {
            if (!flg1)
              createTextField(graph, form, cell, {nodeName: 'success', nodeValue: ''});
            if (!flg2)
              createTextField(graph, form, cell, {nodeName: 'failure', nodeValue: ''});
            createTextAreaField(graph, form, cell, 'Script', '');
          }
        }
        div.appendChild(form.getTable());
        mxUtils.br(div);
      }
    }

    /**
     * Creates the textfield for the given property.
     */
    function createTextField(graph, form, cell, attribute) {
      let input = form.addText(attribute.nodeName + ':', attribute.nodeValue);

      let applyHandler = function () {
        let newValue = input.value || '';
        let oldValue = cell.getAttribute(attribute.nodeName, '');
        if (newValue != oldValue) {
          graph.getModel().beginUpdate();
          try {
            let edit = new mxCellAttributeChange(
              cell, attribute.nodeName,
              newValue);
            graph.getModel().execute(edit);
            isUndoable = true;
          }
          finally {
            graph.getModel().endUpdate();
          }
        }
      };

      mxEvent.addListener(input, 'keypress', function (evt) {
        // Needs to take shift into account for textareas
        if (evt.keyCode == /*enter*/13 &&
          !mxEvent.isShiftDown(evt)) {
          input.blur();
        }
      });

      if (mxClient.IS_IE) {
        mxEvent.addListener(input, 'focusout', applyHandler);
      } else {
        mxEvent.addListener(input, 'blur', applyHandler);
      }
    }

    /**
     * Creates the textAreafield for the given property.
     */
    function createTextAreaField(graph, form, cell, name, value) {
      let input = form.addTextarea(name + ':', value, 10);
      let applyHandler = function () {
        let newValue = input.value || '';

        let oldValue = cell.getAttribute(name, '');
        if (newValue != oldValue) {
          graph.getModel().beginUpdate();
          try {
            let edit = new mxCellAttributeChange(
              cell, name,
              newValue);
            graph.getModel().execute(edit);
            isUndoable = true;
          }
          finally {
            graph.getModel().endUpdate();
          }
        }
      };

      mxEvent.addListener(input, 'keypress', function (evt) {
        // Needs to take shift into account for textareas
        if (evt.keyCode == /*enter*/13 &&
          !mxEvent.isShiftDown(evt)) {
          input.blur();
        }
      });

      if (mxClient.IS_IE) {
        mxEvent.addListener(input, 'focusout', applyHandler);
      }
      else {
        mxEvent.addListener(input, 'blur', applyHandler);
      }
    }

    // if (sessionStorage.getItem('$JOE$XML')) {
    // let doc = mxUtils.parseXml(sessionStorage.getItem('$JOE$XML'));
    let doc = mxUtils.parseXml(this.xmlTest);
    let codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());

    selectionChanged(graph);
    executeLayout();
    makeCenter();

    /**
     * Reload dummy xml
     */
    function reloadDummyXml(dummyXml) {
      let enc = new mxCodec();
      let node = enc.encode(graph.getModel());
      let xml = mxUtils.getXml(node);

      let x2js = new X2JS();
      let json = x2js.xml_str2json(xml);
      if (!json.mxGraphModel.root.Connector) {
        forkMap.clear();
        mxUndoManager.prototype.clear();
        graph.getModel().beginUpdate();
        try {
          let doc = mxUtils.parseXml(dummyXml);
          let codec = new mxCodec(doc);
          let model = codec.decode(doc.documentElement);
          let parent = graph.getDefaultParent();
          // Merges the old model with the dummy model
          graph.getModel().mergeChildren(model.getRoot().getChildAt(0), parent);
        } finally {
          graph.getModel().endUpdate();
          executeLayout();
        }
      }
      makeCenter();
    }

    let mgr = new mxAutoSaveManager(graph);
    mgr.save = function () {
      self.xmlToJsonParser();
      if (self.json && self.json.instructions && self.json.instructions.length > 0) {
        graph.setEnabled(true);
      } else if (self.json && self.json.instructions && self.json.instructions.length == 0) {
        graph.setEnabled(false);
        reloadDummyXml(self.xmlTest);
      }
    };
  }


  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(config) {
    let editor = null;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      }
      else {
        mxObjectCodec.allowEval = true;
        let node = mxUtils.load(config).getDocumentElement();
        editor = new mxEditor(node);
        this.editor = editor;

        this.initEditorConf(editor);
        mxObjectCodec.allowEval = false;

        let outln = document.getElementById('outlineContainer');
        outln.style["border"] = "1px solid lightgray";
        outln.style["background"] = "#FFFFFF";
        new mxOutline(this.editor.graph, outln);

        editor.graph.allowAutoPanning = true;
        editor.graph.timerAutoScroll = true;

        editor.addListener(mxEvent.OPEN);
        // Prints the current root in the window title if the
        // current root of the graph changes (drilling).
        editor.addListener(mxEvent.ROOT);
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  toggleView() {
    this.view = this.view != 'list' ? 'list' : 'grid';
  }

  toggleRightSideBar() {
    this.isPropertyHide = !this.isPropertyHide;
  }


  checkAll() {
    console.log('Check all...')
  }

  checkMainCheckbox() {
    console.log('Check all...')
  }

  onNodeSelected(e): void {
    console.log(e);
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  onResize() {
    EditorComponent.setGraphHt();
  }

  static setGraphHt() {
    let ht = window.innerHeight - 168;
    if (ht > 400)
      $('#graph').height(ht + 'px');
  }
}
