import {Component} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';

@Component({
  standalone: false,
  selector: 'app-links',
  templateUrl: './sub-link.component.html',
  styles: [`
    .tab-help-icon {
      display: inline-block;
      max-width: 0;
      overflow: hidden;
      opacity: 0;
      margin-right: 0 !important;
      transition: max-width 0.2s ease, opacity 0.2s ease, margin-right 0.2s ease;
    }
    li.nav-item:hover .tab-help-icon {
      max-width: 28px;
      opacity: 0.35;
      margin-right: 4px !important;
    }
    li.nav-item:hover .tab-help-icon:hover,
    li.nav-item.tab-active .tab-help-icon,
    li.nav-item.tab-active .tab-help-icon:hover {
      max-width: 28px;
      opacity: 0.7;
      margin-right: 4px !important;
    }
  `]
})
export class SubLinkComponent {
  permission: any = {};
  preferences: any = {};

  constructor(private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    if (this.authService.permission) {
      this.permission = JSON.parse(this.authService.permission);
    }
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']);
    }
  }

  helpPage(key: string): void {
    this.coreService.openHelpPage(key);
  }
}
