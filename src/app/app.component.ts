import { AppUtils } from './blocks/utils/index';
import { IGreeting } from './blocks/interfaces/IGreeting';
import { PatientsService } from './blocks/services/patients.service';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  constructor() { }

  ngOnInit(): void {
  }

}
