import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html'
})
export class ResourceComponent implements OnInit {

    constructor(private router:Router) {

    }

    ngOnInit() {
        if (this.router.url === '/resource') {
            this.router.navigate(['/resource/calendar']);
        }
    }
}
