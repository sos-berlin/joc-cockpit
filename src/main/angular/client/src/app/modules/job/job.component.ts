import {Component, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.css']
})
export class JobComponent implements OnInit {
  pageView: string;

  constructor(public coreService: CoreService) {
  }

  ngOnInit() {
  }

  receiveMessage($event) {
    this.pageView = $event;
  }
}
