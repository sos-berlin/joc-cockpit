import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {saveAs} from 'file-saver/FileSaver';
import * as _ from 'underscore';

declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxObjectCodec;
declare const mxPanningManager;
declare const mxGuide;
declare const mxEdgeHandler;
declare const mxImage;
declare const mxConnectionHandler;
declare const mxCodec;
declare const mxAutoSaveManager;
declare const mxGraphHandler;
declare const mxCellAttributeChange;
declare const mxGraph;
declare const mxForm;
declare const mxMultiplicity;
declare const mxHierarchicalLayout;
declare const mxImageExport;
declare const mxXmlCanvas2D;

declare const X2JS;
declare const $;

@Component({
  selector: 'app-job-chain',
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
  mergeId: any;
  isPropertyHide: boolean = false;
  json: any = {};
  options: any = {
    allowDrag: true,
    allowDrop: true
  };

  @ViewChild('treeCtrl') treeCtrl;

  constructor(private authService: AuthService, public coreService: CoreService) {

  }

  ngOnInit() {
    this.init();

    let json = {
      'id': '',
      'instructions': [
        {
          'TYPE': 'Job',
          'id': '3',
          'agentPath': '/AGENT',
          'jobPath': '/JOB 1',
          'title': 'Start',
          'failure': []
        }, {
          "TYPE": "If",
          "id": "4",
          "predicate": "returnCode > 0",
          "then": {
            "instructions": [
              {
                "TYPE": "Exit",
                "id": "5"
              }
            ]
          },
          "else": {
            "instructions": [
              {
                "TYPE": "Job",
                "id": "6",
                "agentPath": "/test-agent-2",
                "jobPath": "/JOB 2",
                "title": "",
                "failure": []
              },        {
          'TYPE': 'ForkJoin',
          'id': '45',
          'branches': [{
            'id':'branch4',
            'instructions': [{
              'TYPE': 'Job',
              'id': '46',
              'jobPath': '/branch4-job4',
              'agentPath': '/test-agent-1'
            }]
          },
            {
              'id':'branch5',
              'instructions': [{
                'TYPE': 'Job',
                'id': '47',
                'jobPath': '/branch5-job1',
                'agentPath': '/test-agent-1'
              },
                {
                  'TYPE': 'Job',
                  'id': '48',
                  'jobPath': '/branch5-job2',
                  'agentPath': '/test-agent-1'
                }]
            }]
        },
            ]
          }
        },
        {
          "TYPE": "Job",
          "id": "8",
          "agentPath": "/AGENT",
          "jobPath": "/JOB 3",
          "title": "",
          "failure": []
        },
        {
          'TYPE': 'ForkJoin',
          'id': '9',
          'branches': [{
            'id':'branch1',
            'instructions': [{
              'TYPE': 'Job',
              'id': '10',
              'jobPath': '/branch1-job1',
              'agentPath': '/test-agent-1'
            },
              {
                'TYPE': 'Job',
                'id': '11',
                'jobPath': '/branch1-job2',
                'agentPath': '/test-agent-1'
              }]
          },
            {
              'id':'branch2',
              'instructions': [{
                'TYPE': 'Job',
                'id': '12',
                'jobPath': '/branch2-job1',
                'agentPath': '/test-agent-1'
              },
                {
                  'TYPE': 'Job',
                  'id': '13',
                  'jobPath': '/branch2-job2',
                  'agentPath': '/test-agent-1'
                },
                {
                  'TYPE': 'Job',
                  'id': '14',
                  'jobPath': '/branch2-job3',
                  'agentPath': '/test-agent-1'
                }]
            },
            {
              'id':'branch3',
              'instructions': [{
                'TYPE': 'Job',
                'id': '15',
                'jobPath': '/branch3-job1',
                'agentPath': '/test-agent-1'
              },
                {
                  'TYPE': 'Job',
                  'id': '16',
                  'jobPath': '/branch3-job2',
                  'agentPath': '/test-agent-1'
                }]
            }]
        },
        {
          'TYPE': 'Job',
          'id': '17',
          'agentPath': '/AGENT',
          'jobPath': '/JOB 5',
          'title': 'End',
          'failure': []
        }
      ]
    };
    let mxJson = {
      mxGraphModel: {
        root: {
          mxCell: [
            {'_id': '0'},
            {
              '_id': '1',
              '_parent': '0'
            }
          ]
        }
      }
    };
    this.jsonParser(json, mxJson.mxGraphModel.root);

    let x2js = new X2JS();
    this.xmlTest = x2js.json2xml_str(mxJson);
    //console.log(this.xmlTest)
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
    EditorComponent.calculateHeight();

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
    }, err => {
      this.isLoading = false;
    });

  }

  private jsonParser(json, mxJson) {
    const self = this;
    if (json.instructions) {
      json.instructions.forEach(function (instruction, index) {
        let obj: any = {
          mxCell: {
            _parent: '1',
            _vertex: '1',
            mxGeometry: {
              _as: 'geometry'
            }
          }
        };

        if (instruction.TYPE === 'Job') {
          if (mxJson.Job) {
            if (!_.isArray(mxJson.Job)) {
              let _tempJob = _.clone(mxJson.Job);
              mxJson.Job = [];
              mxJson.Job.push(_tempJob);
            }

          } else {
            mxJson.Job = [];
          }

          obj._id = instruction.id;
          obj._label = instruction.jobPath;
          obj._agent = instruction.agentPath ? instruction.agentPath : '';
          obj._title = instruction.title ? instruction.title : '';
          obj.mxCell._style = 'rounded';
          obj.mxCell.mxGeometry._width = '140';
          obj.mxCell.mxGeometry._height = '40';
          mxJson.Job.push(obj);

        }
        else if (instruction.TYPE === 'If') {
          if (mxJson.If) {
            if (!_.isArray(mxJson.If)) {
              let _tempIf = _.clone(mxJson.If);
              mxJson.If = [];
              mxJson.If.push(_tempIf);
            }
          } else {
            mxJson.If = [];
          }
          obj._id = instruction.id;
          obj._label = instruction.predicate;
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/inclusive.png';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';

          if (instruction.then && instruction.then.instructions) {
            self.jsonParser(instruction.then, mxJson);
            self.connectInstruction(instruction, instruction.then.instructions[0], mxJson, 'then');
          }
          if (instruction.else && instruction.else.instructions) {
            self.jsonParser(instruction.else, mxJson);
            self.connectInstruction(instruction, instruction.else.instructions[0], mxJson, 'else');
          }
          mxJson.If.push(obj);

        }
        else if (instruction.TYPE === 'ForkJoin') {
          if (mxJson.Fork) {
            if (!_.isArray(mxJson.Fork)) {
              let _tempFork = _.clone(mxJson.Fork);
              mxJson.Fork = [];
              mxJson.Fork.push(_tempFork);
            }
          } else {
            mxJson.Fork = [];
          }
          obj._id = instruction.id;
          obj._label = instruction.TYPE;
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/fork.png';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';

          if (instruction.branches && instruction.branches.length > 0) {
            for (let i = 0; i < instruction.branches.length; i++) {
              self.jsonParser(instruction.branches[i], mxJson);
              self.connectInstruction(instruction, instruction.branches[i], mxJson, 'branch');
            }
            self.mergeFork(instruction.branches, mxJson, json.instructions, index);
          }
          mxJson.Fork.push(obj);
        }
        else if (instruction.TYPE === 'Await') {
          if (mxJson.Await) {
            if (!_.isArray(mxJson.Await)) {
              let _tempAwait = _.clone(mxJson.Await);
              mxJson.Await = [];
              mxJson.Await.push(_tempAwait);
            }
          } else {
            mxJson.Await = [];
          }
          obj._id = instruction.id;
          obj._label = instruction.TYPE;
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/Timer.png';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';
          mxJson.Await.push(obj);
        }
        else if (instruction.TYPE === 'SetBack') {
          if (mxJson.SetBack) {
            if (!_.isArray(mxJson.SetBack)) {
              let _tempSetBack = _.clone(mxJson.SetBack);
              mxJson.SetBack = [];
              mxJson.SetBack.push(_tempSetBack);
            }
          } else {
            mxJson.SetBack = [];
          }
          obj._id = instruction.id;
          obj._label = instruction.predicate;
          obj._maxSteps = instruction.maxSteps;
          obj._delay = instruction.delay;
          obj.mxCell._style = 'rhombus';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';

          mxJson.SetBack.push(obj);
        }
        else if (instruction.TYPE === 'Exit') {
          if (mxJson.Exit) {
            if (!_.isArray(mxJson.Exit)) {
              let _tempExit = _.clone(mxJson.Exit);
              mxJson.Exit = [];
              mxJson.Exit.push(_tempExit);
            }
          } else {
            mxJson.Exit = [];
          }
          obj._id = instruction.id;
          obj._label = instruction.TYPE;
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/cancel_end.png';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';
          mxJson.Exit.push(obj);
        }
        else {
          //TODO
          console.log('TYPE : ' + instruction.TYPE);
        }
        if (instruction.TYPE !== 'ForkJoin')
          self.connectEdges(json.instructions, index, mxJson);
      });
    } else {
      console.log('No instruction..');
    }
  }

  private connectEdges(list, index, mxJson) {
    if (mxJson.Connector) {
      if (!_.isArray(mxJson.Connector)) {
        let _tempJob = _.clone(mxJson.Connector);
        mxJson.Connector = [];
        mxJson.Connector.push(_tempJob);
      }

    } else {
      mxJson.Connector = [];
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

      mxJson.Connector.push(obj);
    }
  }

  private connectInstruction(source, target, mxJson, label) {
    if (mxJson.Connector) {
      if (!_.isArray(mxJson.Connector)) {
        let _tempJob = _.clone(mxJson.Connector);
        mxJson.Connector = [];
        mxJson.Connector.push(_tempJob);
      }
    } else {
      mxJson.Connector = [];
    }
    let obj: any = {
      _label: label,
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
    mxJson.Connector.push(obj);
  }

  private mergeFork(branchs, mxJson, list, index) {
    if (mxJson.Merge) {
      if (!_.isArray(mxJson.Merge)) {
        let _tempMerge = _.clone(mxJson.Merge);
        mxJson.Merge = [];
        mxJson.Merge.push(_tempMerge);
      }

    } else {
      mxJson.Merge = [];
    }
    let id = parseInt(list[list.length - 1].id) + 1000;
    let mergeObj: any = {
      _id: id,
      _label: 'merge',
      mxCell: {
        _parent: '1',
        _vertex: '1',
        _style: 'symbol;image=./assets/mxgraph/images/symbols/merge.png',
        mxGeometry: {
          _as: 'geometry',
          _width: '70',
          _height: '70'
        }
      }
    };
    mxJson.Merge.push(mergeObj);
    for (let i = 0; i < branchs.length; i++) {
      this.connectInstruction(branchs[i].instructions[branchs[i].instructions.length - 1], {id: id}, mxJson, 'merge')
    }

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '')
    }
  }

  private xmlToJsonParser() {
    if (this.editor) {
      let _graph = _.clone(this.editor.graph);
      let enc = new mxCodec();

      let node = enc.encode(_graph.getModel());
      let xml = mxUtils.getXml(node);

      let x2js = new X2JS();
      let _json:any;
      try {
        _json = x2js.xml_str2json(xml);
      }catch (e) {
        console.log(e);
      }

      if(!_json.mxGraphModel){
        return;
      }
      let objects = _json.mxGraphModel.root;
      let connectors = objects.Connector;
      let jsonObj = {
        id: '',
        instructions: []
      };
      let startNode: any = {};

      if (connectors) {
        if (_.isArray(connectors)) {
          let _jobs = _.clone(objects.Job);
          let _ifInstructions = _.clone(objects.If);
          let _forkInstructions = _.clone(objects.Fork);
          let _setBackInstructions = _.clone(objects.SetBack);
          let _awaitInstructions = _.clone(objects.Await);
          let _exitInstructions = _.clone(objects.Exit);

          for (let i = 0; i < connectors.length; i++) {
            if (_jobs) {
              if (_.isArray(_jobs)) {
                for (let j = 0; j < _jobs.length; j++) {
                  if (connectors[i].mxCell._target == _jobs[j]._id) {
                    _jobs.splice(j, 1);
                    break;
                  }
                }
              } else {
                if (connectors[i].mxCell._target == _jobs._id) {
                  _jobs = [];
                }
              }
            }
            if (_forkInstructions) {
              if (_.isArray(_forkInstructions)) {
                for (let j = 0; j < _forkInstructions.length; j++) {
                  if (connectors[i].mxCell._target == _forkInstructions[j]._id) {
                    _forkInstructions.splice(j, 1);
                    break;
                  }
                }
              } else {
                if (connectors[i].mxCell._target == _forkInstructions._id) {
                  _forkInstructions = [];
                }
              }
            }

            if (_awaitInstructions) {
              if (_.isArray(_awaitInstructions)) {
                for (let j = 0; j < _awaitInstructions.length; j++) {
                  if (connectors[i].mxCell._target == _awaitInstructions[j]._id) {
                    _awaitInstructions.splice(j, 1);
                    break;
                  }
                }
              } else {
                if (connectors[i].mxCell._target == _awaitInstructions._id) {
                  _awaitInstructions = [];
                }
              }
            }

            if (_ifInstructions) {
              if (_.isArray(_ifInstructions)) {
                for (let j = 0; j < _ifInstructions.length; j++) {
                  if (connectors[i].mxCell._target == _ifInstructions[j]._id) {
                    _ifInstructions.splice(j, 1);
                    break;
                  }
                }
              } else {
                if (connectors[i].mxCell._target == _ifInstructions._id) {
                  _ifInstructions = [];
                }
              }
            }
            if (_exitInstructions) {
              if (_.isArray(_exitInstructions)) {
                for (let j = 0; j < _exitInstructions.length; j++) {
                  if (connectors[i].mxCell._target == _exitInstructions[j]._id) {
                    _exitInstructions.splice(j, 1);
                    break;
                  }
                }
              } else {
                if (connectors[i].mxCell._target == _exitInstructions._id) {
                  _exitInstructions = [];
                }
              }
            }
          }

          if (_jobs) {
            if (_.isArray(_jobs) && _jobs.length == 1) {
              startNode = _jobs[0];
            } else {
              startNode = _jobs;
            }
          }
          if (!_.isEmpty(startNode)) {
            jsonObj.instructions.push({
              'TYPE': 'Job',
              'id': startNode._id,
              'agentPath': startNode._agent,
              'jobPath': startNode._label,
              'title': startNode._title,
              'failure': []
            });
            if (connectors) {
              this.findNextNode(connectors, startNode._id, objects, jsonObj.instructions);
            }
            startNode = null;
          }
          else {
            if (_forkInstructions) {
              if (_.isArray(_forkInstructions) && _forkInstructions.length == 1) {
                startNode = _forkInstructions[0];
              } else {
                startNode = _forkInstructions;
              }
            }
          }

          if (!_.isEmpty(startNode)) {
            jsonObj.instructions.push({
              'TYPE': 'ForkJoin',
              'id': startNode._id
            });
            if (connectors) {
              this.findNextNode(connectors, startNode._id, objects, jsonObj.instructions);
            }
            startNode = null;
          }
          else {
            if (_setBackInstructions) {
              if (_.isArray(_setBackInstructions) && _setBackInstructions.length == 1) {
                startNode = _setBackInstructions[0];
              } else {
                startNode = _setBackInstructions;
              }
            }
          }

          if (!_.isEmpty(startNode)) {
            jsonObj.instructions.push({
              'TYPE': 'SetBack',
              'id': startNode._id,
              'predicate': startNode._label,
              'maxSteps': startNode._maxSteps,
              'delay': startNode._delay
            });
            if (connectors) {
              this.findNextNode(connectors, startNode._id, objects, jsonObj.instructions);
            }
            startNode = null;
          }
          else {
            if (_ifInstructions) {
              if (_.isArray(_ifInstructions) && _ifInstructions.length == 1) {
                startNode = _ifInstructions[0];
              } else {
                startNode = _ifInstructions;
              }
            }
          }

          if (!_.isEmpty(startNode)) {
            jsonObj.instructions.push({
              'TYPE': 'If',
              'id': startNode._id,
              'predicate': startNode._label
            });
            if (connectors) {
              this.findNextNode(connectors, startNode._id, objects, jsonObj.instructions);
            }
            startNode = null;
          }
          else {
            if (_exitInstructions) {
              if (_.isArray(_exitInstructions) && _exitInstructions.length == 1) {
                startNode = _exitInstructions[0];
              } else {
                startNode = _exitInstructions;
              }
            }
          }
        }

        if (_.isEmpty(startNode)) {
         // console.log('start node not found');
          //  console.log(objects)
        }

        if(this.mergeId && connectors.length > 0) {
          this.findNextNode(connectors, this.mergeId, objects, jsonObj.instructions);
        }else {
          if (this.lastId && connectors.length > 0) {
            this.findNextNode(connectors, this.lastId, objects, jsonObj.instructions);
          }
        }
      }
      console.log(connectors.length)
      this.json = jsonObj;
     // console.log(xml);
    }
  }

  private findNextNode(connectors, id, objects, instructions: Array<any>) {
    if (_.isArray(connectors)) {

      for (let i = 0; i < connectors.length; i++) {
        if (connectors[i].mxCell._source && connectors[i].mxCell._source === id) {
          let _id = _.clone(connectors[i].mxCell._target);
          let instructionArr = instructions;
          if (connectors[i]._label == 'then' || connectors[i]._label == 'else') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE == 'If' && instructions[j].id === id) {
                if (connectors[i]._label == 'then') {
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
          if (connectors[i]._label == 'branch') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE == 'ForkJoin' && instructions[j].id === id) {
                if (!instructions[j].branches) {
                  instructions[j].branches = [];
                }
                instructions[j].branches.push({instructions: []});
                for (let x = 0; x < instructions[j].branches.length; x++) {
                  if (!instructions[j].branches[x].id) {
                    instructions[j].branches[x].id = 'branch ' + x + 1;
                    instructionArr = instructions[j].branches[x].instructions;
                    break;
                  }
                }
                break;
              }
            }
          }
          if (connectors[i]._label == 'merge') {
            this.mergeId = _id;
            connectors.splice(i, 1);
          }else {
            connectors.splice(i, 1);
            this.getNextNode(_id, objects, instructionArr);
          }
        }
      }
    } else {
      if (connectors.mxCell._source && connectors.mxCell._source === id) {
        let _id = _.clone(connectors.mxCell._target);
        connectors = null;
        this.getNextNode(_id, objects, instructions);
      }
    }
    this.lastId = id;
  }

  private getNextNode(id, objects, instructionsArr: Array<any>) {
    let jobs = objects.Job;
    let ifInstructions = objects.If;
    let forkInstructions = objects.Fork;
    let setBackInstructions = objects.SetBack;
    let awaitInstructions = objects.Await;
    let connectors = objects.Connector;
    let exitInstructions = objects.Exit;
    let nextNode: any = {};
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
      instructionsArr.push({
        'TYPE': 'Job',
        'id': nextNode._id,
        'agentPath': nextNode._agent,
        'jobPath': nextNode._label,
        'title': nextNode._title,
        'failure': []
      });
      this.findNextNode(connectors, nextNode._id, objects, instructionsArr);
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
      instructionsArr.push({
        'TYPE': 'ForkJoin',
        'id': nextNode._id,
        'label': nextNode._label
      });
      this.findNextNode(connectors, nextNode._id, objects, instructionsArr);
      nextNode = null;
    }
    else {
      if (setBackInstructions) {
        if (_.isArray(setBackInstructions)) {
          for (let i = 0; i < setBackInstructions.length; i++) {
            if (setBackInstructions[i]._id === id) {
              nextNode = setBackInstructions[i];
              break;
            }
          }
        } else {
          if (setBackInstructions._id === id) {
            nextNode = setBackInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push({
        'TYPE': 'SetBack',
        'id': nextNode._id,
        'predicate': nextNode._label,
        'maxSteps': nextNode._maxSteps,
        'delay': nextNode._delay
      });
      this.findNextNode(connectors, nextNode._id, objects, instructionsArr);
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
      instructionsArr.push({
        'TYPE': 'Await',
        'id': nextNode._id,
        'label': nextNode._label
      });
      this.findNextNode(connectors, nextNode._id, objects, instructionsArr);
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
      let obj = {
        'TYPE': 'If',
        'id': nextNode._id,
        'predicate': nextNode._label
      };
      instructionsArr.push(obj);
      this.findNextNode(connectors, nextNode._id, objects, instructionsArr);

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
      instructionsArr.push({
        'TYPE': 'Exit',
        'id': nextNode._id,
      });
      this.findNextNode(connectors, nextNode._id, objects, instructionsArr);
      nextNode = null;
    } else {
      this.findNextNode(connectors, id, objects, instructionsArr);
    }

  }

  private initEditorConf(editor) {
    const self = this;
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
    /**
     * Variable: cellsResizable
     *
     * Specifies the return value for <isCellResizable>. Default is true.
     */
    mxGraph.prototype.cellsResizable = false;
    mxGraph.prototype.multigraph = false;
    mxGraph.prototype.allowDanglingEdges = false;
    mxGraph.prototype.disconnectOnMove = false;

    mxHierarchicalLayout.prototype.intraCellSpacing = 50;
    mxHierarchicalLayout.prototype.interRankCellSpacing = 80;

    editor.validation = true;

    mxGuide.prototype.isEnabledForEvent = function (evt) {
      return !mxEvent.isAltDown(evt);
    };

    let enc = new mxCodec();

    let mgr = new mxAutoSaveManager(editor.graph);
    mgr.save = function () {
      // console.log('save')
      self.xmlToJsonParser();
      // let node = enc.encode(editor.graph.getModel());
      // let xml = mxUtils.getXml(node);
      //sessionStorage.setItem('$JOE$XML', xml);
    };

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    // Defines an icon for creating new connections in the connection handler.
    // This will automatically disable the highlighting of the source vertex.
    mxConnectionHandler.prototype.connectImage = new mxImage('./assets/mxgraph/images/connector.gif', 16, 16);

    editor.graph.setConnectable(true);

    function checkValidation(node, edges) {
      if (!(node === 'If' && edges > 3)) {
        return node !== 'If' && edges > 1;
      } else {
        return true;
      }
    }

    //Set cell connectable true/false based on number of connection
    function updateStyle(state, hover) {
      if (hover) {
        let flag = checkValidation(state.cell.value.nodeName, state.cell.getEdgeCount());
        if (flag) {
          state.cell.setConnectable(false);
        }
      } else {
        state.cell.setConnectable(true);
      }
    }

    editor.graph.addMouseListener(
      {
        currentState: null,
        mouseDown: function (sender, me) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
            this.currentState = null;
          }
        },
        mouseMove: function (sender, me) {
          if (this.currentState != null && me.getState() == this.currentState) {
            return;
          }

          let tmp = editor.graph.view.getState(me.getCell());
          // Ignores everything but vertices
          if (editor.graph.isMouseDown || (tmp != null && !
            editor.graph.getModel().isVertex(tmp.cell))) {
            tmp = null;
          }

          if (tmp != this.currentState) {
            if (this.currentState != null) {
              this.dragLeave(me.getEvent(), this.currentState);
            }
            this.currentState = tmp;

            if (this.currentState != null) {
              this.dragEnter(me.getEvent(), this.currentState);
            }
          }
        },
        mouseUp: function (sender, me) {
        },
        dragEnter: function (evt, state) {
          if (state != null) {
            updateStyle(state, true);
          }
        },
        dragLeave: function (evt, state) {
          if (state != null) {
            updateStyle(state, false);
          }
        }
      });

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
    let buttons = ['group', 'ungroup', 'undo', 'redo', 'cut', 'copy', 'paste', 'delete', 'toggleOutline'];

    //editor.urlImage = 'http://localhost:4200/export';
    // Only adds image and SVG export if backend is available
    // NOTE: The old image export in mxEditor is not used, the urlImage is used for the new export.
    if (editor.urlImage != null) {
      // Client-side code for image export
      let exportImage = function (editor) {
        const graph = editor.graph;
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

          /*          new mxXmlRequest(editor.urlImage, 'filename=' + name + '&format=' + format +
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
      if (buttons[i] == 'group') {
        icon = './assets/mxgraph/images/group.gif';
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Group');
      } else if (buttons[i] == 'ungroup') {
        icon = './assets/mxgraph/images/ungroup.gif';
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Ungroup');
      } else if (buttons[i] == 'undo') {
        icon = './assets/mxgraph/images/undo.gif';
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Undo');
      } else if (buttons[i] == 'redo') {
        icon = './assets/mxgraph/images/redo.gif';
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Redo');
      } else if (buttons[i] == 'cut') {
        icon = './assets/mxgraph/images/cut.gif';
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Cut');
      } else if (buttons[i] == 'copy') {
        icon = './assets/mxgraph/images/copy.gif';
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Copy');
      } else if (buttons[i] == 'paste') {
        icon = './assets/mxgraph/images/paste.gif';
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Past');
      } else if (buttons[i] == 'delete') {
        icon = './assets/mxgraph/images/delete.gif';
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Delete');
      } else if (buttons[i] == 'toggleOutline') {
        icon = './assets/mxgraph/images/outline.gif';
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Outline');
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

    if (this.view === 'grid') {
      editor.execute('toggleOutline');
      EditorComponent.popupwindow();
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
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Zoom In');
      } else if (zoomButtons[i] == 'zoomOut') {
        icon = './assets/mxgraph/images/zoomout.gif';
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Zoom Out');
      } else if (zoomButtons[i] == 'actualSize') {
        icon = './assets/mxgraph/images/zoomactual.gif';
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Actual');
      } else if (zoomButtons[i] == 'fit') {
        icon = './assets/mxgraph/images/zoom.gif';
        button.setAttribute('class', 'btn btn-sm m-r-sm');
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

    editor.graph.isCellEditable = function (cell) {
      return !this.getModel().isEdge(cell);
    };

    // Implements a properties panel that uses
    // mxCellAttributeChange to change properties
    editor.graph.getSelectionModel().addListener(mxEvent.CHANGE, function (sender, evt) {
      selectionChanged(editor.graph);
    });

    selectionChanged(editor.graph);

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
          if (cell.source.value.nodeName === 'If') {
            if (cell.source.getEdgeCount() > 0) {
              if (!cell.value.attributes[0].nodeValue) {
                let outGoingEdges = 0;
                for (let i = 0; i < cell.source.getEdgeCount(); i++) {
                  if (cell.source.id == cell.source.edges[i].source.id) {
                    outGoingEdges = outGoingEdges + 1;
                  }
                }
                let label = '';
                if (outGoingEdges == 1) {
                  label = 'then';
                } else if (outGoingEdges == 2) {
                  label = 'else';
                }
                graph.getModel().beginUpdate();
                try {
                  let edit = new mxCellAttributeChange(
                    cell, cell.value.attributes[0].nodeName,
                    label);
                  graph.getModel().execute(edit);
                }
                finally {
                  graph.getModel().endUpdate();
                }
              } else {
                if (cell.value.attributes[0].nodeValue == 'then' || cell.value.attributes[0].nodeValue == 'else') {
                  return;
                }
              }
            }
          }
        }

        let form = new mxForm('property-table');
        let attrs = cell.value.attributes;
        for (let i = 0; i < attrs.length; i++) {
          createTextField(graph, form, cell, attrs[i]);
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
        if (newValue === 'then' || newValue === 'else') {
          newValue = oldValue;
        }
        if (newValue != oldValue) {
          graph.getModel().beginUpdate();

          try {
            let edit = new mxCellAttributeChange(
              cell, attribute.nodeName,
              newValue);
            graph.getModel().execute(edit);
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
    codec.decode(doc.documentElement, editor.graph.getModel());

    let layout = new mxHierarchicalLayout(editor.graph);

    let parent = editor.graph.getDefaultParent();
    layout.execute(parent);
    // }

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
        // Source nodes needs 1..2 connected Targets
        editor.graph.multiplicities.push(new mxMultiplicity(
          true, 'Job', null, null, 0, 1, ['Job', 'Process', 'If', 'Fork', 'Merge', 'Await', 'Exit'],
          'Job can have only one out going Edge',
          'Job can only Connect to Instructions', true));

        // Source node does not want any incoming connections
        editor.graph.multiplicities.push(new mxMultiplicity(
          false, 'Job', null, null, 0, 1, null,
          'Job can have only one incoming Edge',
          null)); // Type does not matter

        // Source node does not want any incoming connections
        editor.graph.multiplicities.push(new mxMultiplicity(
          true, 'If', null, null, 1, 3, ['Job', 'Process', 'If', 'Fork', 'Merge', 'Await', 'Exit'],
          'If instruction can have only 2 out going Edge',
          null));

        editor.graph.multiplicities.push(new mxMultiplicity(
          false, 'If', null, null, 0, 1, null,
          'If instruction can have only one incoming Edge',
          null)); // Type does not matter

        this.initEditorConf(editor);
        mxObjectCodec.allowEval = false;

        // Adds active border for panning inside the container
        editor.graph.createPanningManager = function () {
          let pm = new mxPanningManager(this);
          pm.border = 30;
          return pm;
        };

        editor.graph.allowAutoPanning = true;
        editor.graph.timerAutoScroll = true;
        editor.addListener(mxEvent.OPEN);
        // Prints the current root in the window title if the
        // current root of the graph changes (drilling).
        editor.addListener(mxEvent.ROOT);
      }

    }
    catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  toggleView() {
    if (this.view == 'list') {
      this.view = 'grid';
      //this.hidePopup();
    } else {
      this.view = 'list';
      //  this.showPopup();
    }
  }

  toggleRightSideBar() {
    this.isPropertyHide = !this.isPropertyHide;
  }

  private showPopup() {
    let dom = $('.mxWindow');
    if (dom && dom.position()) {
      dom.show();
    }
  }

  private hidePopup() {
    let dom = $('.mxWindow');
    if (dom && dom.position()) {
      dom.hide();
    }
  }

  onNodeSelected(e): void {
    console.log(e);
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }


  onResize() {
    EditorComponent.calculateHeight();
  }

  checkAll() {

  }

  checkMainCheckbox() {

  }

  static calculateHeight() {
    let dom = $('.mxWindow');
    if (dom && dom.position()) {
      if (dom.position().left > (window.innerWidth - dom.width())) {
        dom.css({
          top: window.innerHeight - dom.height() - 20 + 'px',
          left: window.innerWidth - dom.width() - 30 + 'px'
        });
      }

    }
  }

  static popupwindow() {
    let dom = $('.mxWindow');
    if (dom && dom.position()) {
      dom.css({
        top: window.innerHeight - dom.height() - 20 + 'px',
        left: window.innerWidth - 320 + 'px',
        width: '300px'
      });

    }
  }
}
