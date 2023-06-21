import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html'
})
export class MultiSelectComponent implements OnInit {
  @Input() type: string;
  @Input() attribute: string;
  @Input() pathAttribute: string;
  @Input() nodes: any = [];
  @Input() list: any = {};
  @Input() addFolderPossible: boolean;
  @Input() folders: any = {};
  object: any = {
    isTreeShow: false
  };

  @Output() funcCall: EventEmitter<any> = new EventEmitter();
  @Output() onSelectCall: EventEmitter<any> = new EventEmitter();

  constructor(public coreService: CoreService) {
  }

  ngOnInit(): void {
    if (!this.list[this.attribute]) {
      this.list[this.attribute] = [];
    }
  }


  openSearch(): void {
    this.object.isTreeShow = true;
  }

  onSelect(selectedValue): void {
    if (this.list[this.attribute].includes(selectedValue)) {
      const index = this.list[this.attribute].indexOf(selectedValue);
      if (index > -1) {
        this.list[this.attribute].splice(index, 1);
        this.onSelectCall.emit({remove: selectedValue});
      }
    } else {
      this.list[this.attribute].push(selectedValue);
      this.onSelectCall.emit({add: selectedValue});
    }
  }

  onBlur(evt): void {
    this.object.isTreeShow = false;
    this.funcCall.emit(evt);
  }

  removeItemFromList(evn, item): void {
    evn.stopPropagation();
    evn.preventDefault();
    this.list[this.attribute] = this.list[this.attribute].filter((val) => val != item);
    this.onSelectCall.emit({remove: item});
  }

}
