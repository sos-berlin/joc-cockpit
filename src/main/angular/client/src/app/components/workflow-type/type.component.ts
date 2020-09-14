import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

declare const $;

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html'
})
export class TypeComponent implements OnInit {
  @Input() configuration;
  @Output() update: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
    if (this.configuration.TYPE) {
      for (let i = 0; i < this.configuration.instructions.length; i++) {
        this.configuration.instructions[i].show = true;
      }
    }
  }

  collapse(node) {
    node.show = !node.show;
    this.update.emit();
  }
}
