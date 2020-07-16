import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.css']
})
export class LockComponent implements OnInit {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;

  lock: any = {};
  searchKey: string;
  filter: any = {sortBy: 'name', reverse: false};
  isUnique = true;
  constructor() {
  }

  ngOnInit(): void {
    this.lock.nonExclusive = true;
    console.log(this.data)
  }
  /** -------------- List View Begin --------------*/
  sort(sort: { key: string; value: string }): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = sort.key;
  }

  add() {
    /* let _path;
     if (this.data.path === '/') {
       _path = this.data.path + obj.name;
     } else {
       _path = this.data.path + '/' + obj.name;
     }
     this.coreService.post('inventory/store', {
       jobschedulerId: this.schedulerId,
       objectType: 'WORKFLOW',
       path: _path,
       configuration: '{}'
     }).subscribe((res) => {
       this.data.children.push(res);
     });*/
  }

  copyObject(data){

  }

  editObject(data){
    this.data = data;
  }

  deleteObject(data){

  }

  undeleteObject(data){

  }

  deleteDraft(data){

  }

  deployObject(data){

  }

  /** -------------- List View End --------------*/

}
