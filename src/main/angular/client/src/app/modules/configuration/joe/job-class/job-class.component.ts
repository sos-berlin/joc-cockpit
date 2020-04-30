import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-job-class',
  templateUrl: './job-class.component.html',
  styleUrls: ['./job-class.component.css']
})
export class JobClassComponent implements OnInit {
  @Input() schedulerId: any;
  jobClass: any = {};

  constructor() {
  }

  ngOnInit(): void {

  }

  onSubmit(): void {

  }
}
