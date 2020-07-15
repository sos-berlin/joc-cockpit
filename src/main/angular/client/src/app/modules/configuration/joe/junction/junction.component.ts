import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-junction',
  templateUrl: './junction.component.html',
  styleUrls: ['./junction.component.css']
})
export class JunctionComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() data: any;
  junction: any = {};

  constructor() {
  }

  ngOnInit(): void {

  }

  onSubmit(): void {

  }
}
