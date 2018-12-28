import {Component, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {Router} from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  error: string;

  constructor(private authService: AuthService, public coreService: CoreService, private router: Router) {

  }

  ngOnInit() {
    this.error = sessionStorage.errorMsg;
  }

  logout() {
    this.coreService.post('security/logout', {}).subscribe(() => {
      this.authService.clearUser();
      this.authService.clearStorage();
      this.coreService.setDefaultTab();
      localStorage.removeItem('$SOS$URL');
      sessionStorage.clear();
      this.router.navigate(['/login']);
    });
  }
}
