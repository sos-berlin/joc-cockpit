import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.css']
})
export class LockComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() data: any;
  lock: any = {};

  constructor() {
  }

  ngOnInit(): void {
    this.lock.nonExclusive = true;
  }

  onSubmit(): void {

  }

}
