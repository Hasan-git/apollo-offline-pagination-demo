import { Apollo } from 'apollo-angular';
import { AppUtils } from './blocks/utils/index';
import { IGreeting } from './blocks/interfaces/IGreeting';
import { PatientsService } from './blocks/services/patients.service';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { PATIENTS_QUERY } from './blocks/queries/queries';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  constructor(
    private _patientsService: PatientsService,
    private _apollo: Apollo
  ) { }

  ngOnInit(): void {
  }


  getAllPatients() {
    this._patientsService
      .getPatientsNetowrkOnly(1, 300, '')
      .valueChanges
      .subscribe(({ data, loading }) => {
        if (data && data['patients'] && data['patients'].length) {
          console.log("All patients loaded from server")
        }
      })
  }

}
