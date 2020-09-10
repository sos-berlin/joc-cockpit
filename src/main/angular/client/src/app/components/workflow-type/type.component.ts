import {Component, OnInit, Input} from '@angular/core';

declare const $;

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html'
})
export class TypeComponent implements OnInit {
  @Input() configuration;

  constructor() {
  }

  ngOnInit() {
    console.log(this.configuration);
  }

  collapse(typeId, node) {
    if (node == 'undefined') {
      $('#' + typeId).toggle();
    } else {
      $('#' + node + '-' + typeId).toggle();
    }
  }
}
