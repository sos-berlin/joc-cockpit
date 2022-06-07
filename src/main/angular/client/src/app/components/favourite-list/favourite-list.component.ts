import {Component, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-favourite-list',
  templateUrl: './favourite-list.component.html'
})
export class FavouriteListComponent implements OnInit {
  @ViewChild('myinput') myInputField;
  @Input() list = [];
  @Input() data: any;
  @Input() type: string;
  isFavourite = false;
  isVisible = false;
  unique = true;
  obj = {
    name: '',
    selected: '',
    oldName: ''
  };

  constructor() {
  }

  ngOnInit(): void {
    for (let i in this.list) {
      if (this.list[i].value == this.data[this.type]) {
        this.isFavourite = true;
        this.obj.name = this.list[i].name;
        this.obj.oldName = this.list[i].name;
        break;
      }
    }
  }

  showList(): void {
    this.isVisible = false;
    this.myInputField.originElement.nativeElement.click();
  }

  checkName(): void {
    this.unique = true;
    for (let i in this.list) {
      if (this.list[i].name == this.obj.name) {
        this.unique = false;
        break;
      }
    }
  }

  addFavourite(): void {
    this.isFavourite = true;
    this.isVisible = false;
    if (this.obj.oldName) {
      for (let i in this.list) {
        if (this.list[i].name == this.obj.oldName) {
          this.list.splice(parseInt(i), 1);
          break;
        }
      }
    }
    this.obj.oldName = this.obj.name;
    this.list.push({name: this.obj.name, value: this.data[this.type]})
  }

  removeFavourite(): void {
    this.isFavourite = false;
    this.isVisible = false;
    for (let i in this.list) {
      if (this.list[i].name == this.obj.name) {
        this.list.splice(parseInt(i), 1);
        break;
      }
    }
  }

  onChangeValue($event): void {
    this.obj.name = $event;
    this.obj.oldName = $event;
    for (let i in this.list) {
      if (this.list[i].name == this.obj.name) {
        this.data[this.type] = this.list[i].value;
        break;
      }
    }
    this.isFavourite = true;
  }
}
