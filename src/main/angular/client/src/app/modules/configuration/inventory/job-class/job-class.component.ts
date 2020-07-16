import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-job-class',
  templateUrl: './job-class.component.html',
  styleUrls: ['./job-class.component.css']
})
export class JobClassComponent implements OnInit {
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() permission: any;

  searchKey: string;
  filter: any = {sortBy: 'name', reverse: false};
  jobClass: any = {};
  isUnique = true;

  constructor() {
  }

  ngOnInit(): void {

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

  copyObject(data) {

  }

  editObject(data) {
    this.data = data;
  }

  deleteObject(data) {

  }

  undeleteObject(data) {

  }

  deleteDraft(data) {

  }

  deployObject(data) {

  }

  /** -------------- List View End --------------*/
}
