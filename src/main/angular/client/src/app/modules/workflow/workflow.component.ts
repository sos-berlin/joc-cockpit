import {Component, OnInit, ViewChild, OnDestroy, Input} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../services/data.service';
import {TreeComponent} from '../../components/tree-navigation/tree.component';
import * as _ from 'underscore';

declare const $;

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html',
  styleUrls: ['./workflow.component.css']
})
export class TypeComponent implements OnInit {
  @Input() workflowJson;

  constructor() {
  }

  ngOnInit() {
  }

  collapse(typeId, node) {
    if (node == 'undefined') {
      $('#' + typeId).toggle();
    } else {
      $('#' + node + '-' + typeId).toggle();
    }
  }

}


@Component({
  selector: 'app-order',
  templateUrl: './workflow.component.html'
})
export class WorkflowComponent implements OnInit, OnDestroy {

  WorkflowJson: any = {
    'id': '',
    'instructions': [
      {
        'id': '8',
        'TYPE': 'Job',
        'jobPath': '/Job',
        'title': '',
        'agentPath': '',
        'returnCodeMeaning': {}
      },
      {
        'id': '15',
        'TYPE': 'ForkJoin',
        'branches': [
          {
            'instructions': [
              {
                'id': '16',
                'TYPE': 'Job',
                'jobPath': '/Job',
                'title': '',
                'agentPath': '',
                'returnCodeMeaning': {}
              },
              {
                'id': '31',
                'TYPE': 'If',
                'predicate': 'returnCode > 0',
                'then': {
                  'instructions': [
                    {
                      'id': '37',
                      'TYPE': 'Job',
                      'jobPath': '/Job',
                      'title': '',
                      'agentPath': '',
                      'returnCodeMeaning': {}
                    }
                  ]
                },
                'else': {
                  'instructions': [
                    {
                      'id': '40',
                      'TYPE': 'Terminate',
                      'message': ''
                    }
                  ]
                }
              }
            ],
            'id': 'branch 1'
          },
          {
            'instructions': [
              {
                'id': '19',
                'TYPE': 'Job',
                'jobPath': '/Job',
                'title': '',
                'agentPath': '',
                'returnCodeMeaning': {}
              },
              {
                'id': '36',
                'TYPE': 'ForkJoin',
                'branches': [
                  {
                    'instructions': [
                      {
                        'id': '43',
                        'TYPE': 'Job',
                        'jobPath': '/Job',
                        'title': '',
                        'agentPath': '',
                        'returnCodeMeaning': {}
                      }
                    ],
                    'id': 'branch 1'
                  },
                  {
                    'instructions': [
                      {
                        'id': '46',
                        'TYPE': 'Job',
                        'jobPath': '/Job',
                        'title': '',
                        'agentPath': '',
                        'returnCodeMeaning': {}
                      }
                    ],
                    'id': 'branch 2'
                  },
                  {
                    'instructions': [
                      {
                        'id': '49',
                        'TYPE': 'Job',
                        'jobPath': '/Job',
                        'title': '',
                        'agentPath': '',
                        'returnCodeMeaning': {}
                      }
                    ],
                    'id': 'branch 3'
                  }
                ]
              }
            ],
            'id': 'branch 2'
          },
          {
            'instructions': [
              {
                'id': '22',
                'TYPE': 'Job',
                'jobPath': '/Job',
                'title': '',
                'agentPath': '',
                'returnCodeMeaning': {}
              },
              {
                'id': '60',
                'TYPE': 'Try',
                'instructions': [
                  {
                    'id': '61',
                    'TYPE': 'Job',
                    'jobPath': '/Job',
                    'title': '',
                    'agentPath': '',
                    'returnCodeMeaning': {}
                  }
                ],
                'catch': {
                  'instructions': [
                    {
                      'id': '64',
                      'TYPE': 'Terminate',
                      'message': ''
                    }
                  ],
                  'id': '53'
                }
              }
            ],
            'id': 'branch 3'
          }
        ]
      },
      {
        'id': '25',
        'TYPE': 'Job',
        'jobPath': '/Job',
        'title': '',
        'agentPath': '',
        'returnCodeMeaning': {}
      }
    ]
  };
  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  permission: any = {};
  pageView: any;
  agentClusters: any = [];
  agentsFilters: any = {};

  @ViewChild(TreeComponent) child;

  constructor(private authService: AuthService, public coreService: CoreService, public modalService: NgbModal, private dataService: DataService) {

  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {

  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

  receiveAction($event) {

  }


  private init() {
    this.agentsFilters = this.coreService.getResourceTab().agents;
    if (sessionStorage.preferences)
      this.preferences = JSON.parse(sessionStorage.preferences);
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (localStorage.views)
      this.pageView = JSON.parse(localStorage.views).agent;

    this.initTree(null);
  }

  private initTree(type) {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['WORKFLOW']
    }).subscribe(res => {
      this.filteredTreeData(this.coreService.prepareTree(res), type);
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  private filteredTreeData(output, type) {
    if (type) {
      this.tree = output;
      this.navigateToPath();
    } else {
      if (_.isEmpty(this.agentsFilters.expand_to)) {
        this.tree = output;
        this.agentsFilters.expand_to = this.tree;
        this.checkExpand();
      } else {
        this.agentsFilters.expand_to = this.coreService.recursiveTreeUpdate(output, this.agentsFilters.expand_to);
        this.tree = this.agentsFilters.expand_to;
        this.expandTree();
      }
    }
  }

  private navigateToPath() {
    this.agentClusters = [];
    setTimeout(() => {
      this.tree.forEach((value) => {
        this.navigatePath(value);
      });
    }, 10);
  }

  private navigatePath(data) {

  }

  private expandTree() {
    const self = this;
    setTimeout(() => {
      this.tree.forEach((data) => {
        recursive(data);
      });
    }, 10);

    function recursive(data) {
      if (data.isExpanded && self.child) {
        let node = self.child.getNodeById(data.id);
        node.expand();
        if (data.children && data.children.length > 0) {
          data.children.forEach((child) => {
            recursive(child);
          });
        }
      }
    }
  }

  private checkExpand() {
    setTimeout(() => {
      if (this.child && this.child.getNodeById(1)) {
        const node = this.child.getNodeById(1);
        node.expand();
        node.setActiveAndVisible(true);
      }
    }, 10);
  }

  private getExpandTreeForUpdates(data, obj) {
    if (data.isSelected) {
      obj.folders.push({folder: data.path, recursive: false});
    }
    data.children.forEach((value) => {
      if (value.isExpanded || value.isSelected) {
        this.getExpandTreeForUpdates(value, obj);
      }
    });
  }

  private startTraverseNode(data) {
    data.isSelected = true;
    data.children.forEach((a) => {
      this.startTraverseNode(a);
    });
  }
}
