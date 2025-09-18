import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output, ViewChild
} from '@angular/core';
import {CoreService} from "../../services/core.service";

@Component({
  selector: 'app-select-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-document.component.html',
  styleUrls: ['./select-document.component.scss']
})
export class SelectDocumentComponent {
  @ViewChild('docInput') docInputField;
  @Input() data: any;
  @Input() documentationTree: any = [];
  @Output() onSelectDocument = new EventEmitter<any>();
  @Output() funcCall: EventEmitter<any> = new EventEmitter();

  constructor(private coreService: CoreService, private ref: ChangeDetectorRef) {
  }

  showList(): void {
    this.docInputField.elementRef.nativeElement.click();
  }

  loadData(node, $event): void {
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        let request = {
          folders: [{folder: node.key, recursive: false}],
          onlyWithAssignReference: true
        };

        this.coreService.post('documentations', request).subscribe((res: any) => {
          let data = res.documentations;
          for (let i = 0; i < data.length; i++) {
            const path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = data[i].assignReference || data[i].name;
            data[i].path = path;
            data[i].key = data[i].assignReference || data[i].name;
            data[i].type = 'DOCUMENTATION';
            data[i].isLeaf = true;
          }
          if (node.origin.children && node.origin.children.length > 0) {
            data = data.concat(node.origin.children);
          }
          if (node.origin.isLeaf) {
            node.origin.expanded = true;
          }
          node.origin.isLeaf = false;
          node.origin.children = data;
          this.documentationTree = [...this.documentationTree];
          this.ref.detectChanges();
        });
      }
    } else {
      if (node.key && !node.key.match('/')) {
        if (this.data.documentationName !== node.key) {
          this.data.documentationName = node.key;
        }
      }
      setTimeout(() => {
        if (this.funcCall) {
          this.funcCall.emit($event);
        }
      }, 10);
    }
  }

  onExpand(e): void {
    this.loadData(e.node, null);
  }

  onDocumentationChange(selectedDoc: any): void {
    this.onSelectDocument.emit(selectedDoc);
  }
  clearDocumentation(): void {
    this.onSelectDocument.emit(null);
  }
}
