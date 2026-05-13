import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-github-callback',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-5 text-center"><h1>Authenticating with GitHub...</h1></div>`
})
export class GithubCallbackComponent {}
