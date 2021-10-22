import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';
import {ScriptModalComponent} from '../../modules/workflow/script-modal/script-modal.component';

@Component({
  selector: 'app-workflow-tree-structure',
  templateUrl: './workflow-tree-structure.component.html',
  styleUrls: ['./workflow-tree-structure.component.scss']
})
export class WorkflowTreeStructureComponent implements OnChanges {
  @Input() configuration;
  @Input() jobs;
  @Input() timezone;
  @Input() orders;
  @Input() expandAll;
  @Input() disabledDrag: boolean;
  @Output() onDrop: EventEmitter<any> = new EventEmitter();
  position: '';

  constructor(public coreService: CoreService, private modal: NzModalService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.expandAll) {
      if (this.expandAll) {
        this.recursiveUpdate(this.configuration, true);
      } else if (this.expandAll === false) {
        this.recursiveUpdate(this.configuration, false);
      }
    }
    if (changes.configuration) {
      if (this.configuration.TYPE === 'Workflow') {
        for (let i = 0; i < this.configuration.instructions.length; i++) {
          this.configuration.instructions[i].show = true;
        }
      }
    }
  }

  collapse(node): void {
    node.show = !node.show;
  }

  recursiveUpdate(node, flag): void {
    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          json.instructions[x].show = flag;
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                json.instructions[x].branches[i].show = flag;
                if (json.instructions[x].branches[i].instructions) {
                  recursive(json.instructions[x].branches[i]);
                }
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            json.instructions[x].else.show = flag;
            recursive(json.instructions[x].else);
          }
        }
      }
      if (json.branches) {
        for (let i = 0; i < json.branches.length; i++) {
          json.branches[i].show = flag;
          if (json.branches[i].instructions) {
            recursive(json.branches[i]);
          }
        }
      }
      if (json.catch) {
        json.catch.show = flag;
        if (json.catch.instructions && json.catch.instructions.length > 0) {
          recursive(json.catch);
        }
      }
      if (json.then && json.then.instructions) {
        json.then.show = flag;
        recursive(json.then);
      }
      if (json.else && json.else.instructions) {
        json.else.show = flag;
        recursive(json.else);
      }
    }

    recursive(node);
  }

  expandNode(node): void {
    node.show = true;
    this.recursiveUpdate(node, true);
  }

  collapseNode(node): void {
    node.show = false;
    this.expandAll = false;
    this.recursiveUpdate(node, false);
  }

  /* --------- Job action menu operations ----------------*/

  showConfiguration(instruction): void {
    let nzComponentParams;
    if (instruction.TYPE === 'Job') {
      const job = this.jobs[instruction.jobName];
      const data = job.executable.TYPE === 'ShellScriptExecutable' ? job.executable.script : job.executable.className;
      if (job && job.executable) {
        nzComponentParams = {
          data,
          jobName: instruction.jobName,
          admissionTime: job.admissionTimeScheme,
          timezone: this.timezone,
          isScript: job.executable.TYPE === 'ShellScriptExecutable',
          readonly: true
        };
      }
    } else if (instruction.TYPE === 'If') {
      nzComponentParams = {
        predicate: true,
        data: instruction.predicate,
        isScript: true,
        readonly: true
      };
    } else if (instruction.TYPE === 'Cycle') {
      nzComponentParams = {
        schedule: instruction.schedule,
        timezone: this.timezone
      };
    }
    if (nzComponentParams) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ScriptModalComponent,
        nzClassName: 'lg',
        nzComponentParams,
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  drag(event): void {
    this.position = null;
    const elements = document.getElementsByClassName('drop-hover');
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].classList && elements[i].classList.contains('drop-hover')) {
        elements[i].classList.remove('drop-hover');
      }
    }
    let data = event.target.getAttribute('class');
    if (data && data.match('drop-area')) {
      this.position = event.target.getAttribute('id');
      const classList = document.getElementById(this.position).classList;
      classList.add('drop-hover');
    }
  }


  dragend(event): void {
    event.preventDefault();
    const elements = document.getElementsByClassName('drop-hover');
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].classList && elements[i].classList.contains('drop-hover')) {
        elements[i].classList.remove('drop-hover');
      }
    }
    if (this.position) {
      this.onDrop.emit(this.position);
    }
  }
}
