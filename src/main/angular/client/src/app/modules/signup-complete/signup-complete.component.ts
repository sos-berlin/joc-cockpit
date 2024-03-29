import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CoreService} from "../../services/core.service";

@Component({
  selector: 'app-signup-complete',
  templateUrl: './signup-complete.component.html',
  styleUrls: ['./signup-complete.component.scss']
})
export class SignupCompleteComponent {
  isVerified = false;

  constructor(private coreService: CoreService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    this.confirmToken(token);
  }

  private confirmToken(token): void {
    this.coreService.post('iam/fidoregistration/confirm', {
      token
    }).subscribe({
      next: (res) => {
        this.isVerified = true;
      }
    })
  }

  navToLogin(): void {
    this.router.navigate(['login']).then();
  }

}
