import {Component, Input} from '@angular/core';
import {CoreService} from '../../../../services/core.service';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html'
})
export class MultiSelectComponent {
  @Input() type: string;
  @Input() nodes: any = [];
  @Input() list: any = [];
  object: any = {
    isTreeShow: false
  };

  constructor(public coreService: CoreService) {
  }

  openSearch(): void {
    this.object.isTreeShow = true;
  }

  onSelect(selectedValue): void {
    console.log(selectedValue);
    if (this.list.includes(selectedValue)) {
      const index = this.list.indexOf(selectedValue);
      if (index > -1) {
        this.list.splice(index, 1);
      }
    } else {
      this.list.push(selectedValue);
    }
  }

  onBlur(evt): void {
    this.object.isTreeShow = false;
  }

  removeItemFromList(evn, item): void {
    evn.stopPropagation();
    evn.preventDefault();
    this.list = this.list.filter((val) => val != item);
  }

}
