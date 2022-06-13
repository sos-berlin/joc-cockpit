import {OnChanges, Component, Input, ViewChild, SimpleChanges} from '@angular/core';
import {CoreService} from "../../../../services/core.service";

@Component({
  selector: 'app-favorite-list',
  templateUrl: './favorite-list.component.html'
})
export class FavoriteListComponent implements OnChanges {
  @ViewChild('myinput') myInputField;
  @Input() list = [];
  @Input() data: any;
  @Input() type: string;
  @Input() value: string;
  isFavorite = false;
  isVisible = false;
  unique = true;
  obj = {
    name: '',
    selected: '',
    oldName: ''
  };

  constructor(private coreService: CoreService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.list || changes.value) {
      for (let i in this.list) {
        this.isFavorite = false;
        this.obj.name = '';
        this.obj.oldName = '';
        if (this.list[i].content == this.data[this.type]) {
          this.isFavorite = true;
          this.obj.name = this.list[i].name;
          this.obj.oldName = this.list[i].name;
          break;
        }
      }
    }
  }

  showList(): void {
    this.unique = true;
    this.isVisible = false;
    this.myInputField.originElement.nativeElement.click();
  }

  checkName(): void {
    console.log(this.data)
    this.unique = true;
    for (let i in this.list) {
      if (this.list[i].name == this.obj.name && (this.list[i].name !== this.obj.oldName)) {
        this.unique = false;
        break;
      }
    }
  }

  addFavorite(): void {
    this.isVisible = false;
    let isRename = false;
    let ordering = 1;
    if (this.obj.oldName) {
      for (let i in this.list) {
        if (this.list[i].name == this.obj.oldName) {
          isRename = true;
          ordering = this.list[i].ordering;
          this.coreService.post('inventory/favorites/rename', {
            favoriteIds: [{
              type: 'FACET',
              name: this.obj.name,
              oldName: this.obj.oldName
            }]
          }).subscribe(() => {
            this.isFavorite = true;
            this.list.splice(parseInt(i), 1);
            this.list.push({name: this.obj.name, content: this.data[this.type], ordering})
          });
          break;
        }
      }
    }
    this.obj.oldName = this.obj.name;
    if (!isRename) {
      this.coreService.post('inventory/favorites/store', {
        favorites: [{
          type: 'FACET',
          name: this.obj.name,
          content: this.data[this.type]
        }]
      }).subscribe(() => {
        this.isFavorite = true;
        this.list.push({
          name: this.obj.name,
          content: this.data[this.type],
          ordering: this.list.length > 0 ? (this.list[this.list.length - 1].ordering + 1) : 1
        })
      });
    }
  }

  removeFavorite(): void {
    this.coreService.post('inventory/favorites/delete', {
      favoriteIds: [
        {
          type: 'FACET',
          name: this.obj.name
        }
      ]
    }).subscribe({
      next: () => {
        this.isFavorite = false;
        this.isVisible = false;
        for (let i in this.list) {
          if (this.list[i].name == this.obj.name) {
            this.obj = {
              name: '',
              selected: '',
              oldName: ''
            };
            this.list.splice(parseInt(i), 1);
            break;
          }
        }
      }
    });
  }

  onChangeValue($event): void {
    this.obj.name = $event;
    this.obj.oldName = $event;
    for (let i in this.list) {
      if (this.list[i].name == this.obj.name) {
        this.data[this.type] = this.list[i].content;
        break;
      }
    }
    this.isFavorite = true;
  }
}
