import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {CoreService} from "../../services/core.service";
import {DataService} from "../../services/data.service";

declare const $;

@Component({
  selector: 'app-agent-selection',
  templateUrl: './agent-selection.component.html'
})
export class AgentSelectionComponent implements OnChanges {
  @Input() preferences: any = {};
  @Input() agents: any;
  @Input() obj: any = {};
  @Input() data: any = {};
  @Input() skipSubagents: boolean;
  @Input() skipStandaloneAgent: boolean;
  @Input() required = true;
  @Input() type = 'agentName';

  isReloading: boolean;
  favorite: any = {
    list: [],
    agents: []
  };
  agentList = [];
  nonExistAgents = [];

  @Output() selectSubagentCluster: EventEmitter<any> = new EventEmitter();
  @Output() onBlur: EventEmitter<any> = new EventEmitter();

  constructor(private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes): void {
    if (changes.agents) {
      this.agentList = this.coreService.clone(this.agents);
      this.coreService.post('inventory/favorites', {
        types: ['AGENT'],
        limit: this.preferences.maxFavoriteEntries || 10
      }).subscribe({
        next: (res: any) => {
          this.favorite.list = res.favorites;
          if (sessionStorage.isFavoriteAgent == true || sessionStorage.isFavoriteAgent == 'true') {
            this.favorite.show = true;
            this.generateFavList();
          }
        }
      });
      this.checkIsAgentExist();
    }
  }

  private checkIsAgentExist(): void {
    this.nonExistAgents = [];
    if (this.data[this.type]) {
      let isFound = false;
      for (const i in this.agents) {
        if (this.skipSubagents) {
          for (const j in this.agents[i].children) {
            if (this.agents[i].children[j] && (this.agents[i].children[j] === this.data[this.type])
              || (this.agents[i].children[j].title === this.data[this.type])) {
              isFound = true;
              break;
            }
          }
        } else {
          if (this.agents[i].title === 'agents') {
            for (const j in this.agents[i].children) {
              if (this.agents[i].children[j] === this.data[this.type]) {
                isFound = true;
                break;
              }
            }
          } else {
            if (!isFound) {
              for (const prop in this.agents[i].children) {
                if (this.agents[i].children[prop].children) {
                  for (const j in this.agents[i].children[prop].children) {
                    if (this.agents[i].children[prop].children[j] === this.data[this.type]) {
                      isFound = true;
                      break;
                    }
                  }
                }
                if (isFound) {
                  break;
                }
              }
            }
          }
        }
      }
      if (!isFound) {
        this.nonExistAgents.push(this.data[this.type]);
      }
    } else {
      if (this.skipStandaloneAgent && !this.skipSubagents) {
        for (const prop in this.agentList) {
          if (this.agentList[prop].title !== 'agents') {
            if(this.agentList[prop].children) {
              for (let i = 0; i < this.agentList[prop].children.length; i++) {
                this.agentList[prop].children[i].hide = false;
              }
            }
            break;
          }
        }
      }
    }
  }

  refreshAgents(): void {
    this.isReloading = true;
    this.dataService.reloadTree.next({reloadAgents: true});
    setTimeout(() => {
      this.isReloading = false;
    }, 2000)
  }

  expandCollapse($event, data, isCluster = false) {
    $event.stopPropagation();
    data.hide = !data.hide;
    if (isCluster) {
      if (this.agents[1]) {
        for (let i in this.agents[1].children) {
          if (this.agents[1].children[i].title === data.title) {
            this.agents[1].children[i].hide = data.hide;
            break;
          }
        }
      }
    } else {
      for (let i in this.agents) {
        if (this.agents[i].title === data.title) {
          this.agents[i].hide = data.hide;
          break;
        }
      }
    }
  }

  showFav(flag: boolean): void {
    this.favorite.show = flag;
    sessionStorage.isFavoriteAgent = flag;
  }

  generateFavList(): void {
    let arr = [];
    let flag = false;
    for (let i in this.favorite.list) {
      if (!this.favorite.list[i].content) {
        flag = true;
        if (arr.length == 0) {
          arr.push({
            title: 'agents',
            isStandalone: true,
            children: [this.favorite.list[i].name]
          })
        } else {
          arr[0].children.push(this.favorite.list[i].name);
        }
      } else {
        if (!this.skipSubagents) {
          if ((arr.length == 0 && !flag) || (arr.length == 1 && flag)) {
            arr.push({
              title: this.favorite.list[i].content,
              children: [this.favorite.list[i].name]
            })
          } else {
            let isExist = false;
            for (let j in arr) {
              if (this.favorite.list[i].content == arr[j].title) {
                isExist = true;
                arr[j].children.push(this.favorite.list[i].name);
                break;
              }
            }
            if (!isExist) {
              arr.push({
                title: this.favorite.list[i].content,
                children: [this.favorite.list[i].name]
              })
            }
          }
        } else {
          let skip = false;
          if (arr.length > 0) {
            for (let i in arr) {
              if (arr[i].title === 'agentGroups') {
                skip = true;
                let flag = false;
                for (let j in arr[i].children) {
                  if (arr[i].children[j] == this.favorite.list[i].content) {
                    flag = true;
                    break;
                  }
                }
                if (!flag) {
                  arr[i].children.push(this.favorite.list[i].content)
                }
                break;
              }
            }
          }
          if (!skip) {
            arr.push({
              title: 'agentGroups',
              isStandalone: true,
              children: [this.favorite.list[i].content]
            })
          }
        }
      }
    }
    this.favorite.agents = arr;
  }

  isFavCheck(agent, cluster): boolean {
    let flag = false;
    for (let i in this.favorite.list) {
      if (agent == this.favorite.list[i].name && cluster == this.favorite.list[i].content) {
        flag = true;
        break;
      }
    }
    return flag;
  }

  setFavorite($event, agent, cluster, isFav): void {
    $event.stopPropagation();
    $event.preventDefault();
    if (isFav) {
      this.favorite.list.push({
        name: agent,
        content: cluster,
        ordering: this.favorite.list.length > 0 ? (this.favorite.list[this.favorite.list.length - 1].ordering + 1) : 1
      });
      this.coreService.post('inventory/favorites/store', {
        favorites: [{type: 'AGENT', name: agent, content: cluster || ''}]
      }).subscribe();
    } else {
      for (let i = 0; i < this.favorite.list.length; i++) {
        if (this.favorite.list[i].name === agent) {
          this.favorite.list.splice(i, 1);
          this.coreService.post('inventory/favorites/delete', {
            favoriteIds: [{type: 'AGENT', name: agent}]
          }).subscribe();
          break;
        }
      }
    }
  }

  onAgentChange(value: string): void {
    let temp = this.coreService.clone(this.agents);
    this.agentList = this.coreService.getFilterAgentList(temp, value);
    this.agentList = [...this.agentList];
    if(!value){
      this.onBlur.emit();
    }
  }

  selectAgent(data): void {
    this.selectSubagentCluster.emit(data)
    $('#agentId').blur();
  }

}
