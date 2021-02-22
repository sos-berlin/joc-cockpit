import {Component, OnInit} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';

@Component({
  selector: 'app-links',
  templateUrl: './sub-link.component.html'
})
export class SubLinkComponent implements OnInit {
  permission: any = {};

  constructor(private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    if (this.authService.permission) {
       this.permission = JSON.parse(this.authService.permission);
    }
  }
}
