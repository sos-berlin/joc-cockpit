import {Component, Input, OnInit} from '@angular/core';
import {CoreService} from '../../../../services/core.service';

@Component({
  selector: 'app-process-class',
  templateUrl: './process-class.component.html',
})
export class ProcessClassComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() data: any;
  processClass: any = {};
  object: any = {hosts: []};

  constructor(private coreService: CoreService) {

  }

  ngOnInit(): void {
    this.addCriteria();
  }

  onSubmit(): void {

    console.log(this.processClass);
  }

  addCriteria(): void {
    let param = {
      url: ''
    };
    if (this.object.hosts) {
      if (!this.coreService.isLastEntryEmpty(this.object.hosts, 'url', '')) {
        this.object.hosts.push(param);
      }
    }
  }

  removeCriteria(index): void {
    this.object.hosts.splice(index, 1);
  }
}

