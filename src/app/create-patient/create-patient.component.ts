import { MatSnackBar } from '@angular/material';
import { IPatient } from './../blocks/interfaces/IPatient';
import { Component, OnInit } from '@angular/core';
import { AppUtils } from '../blocks/utils';
import { Patient } from '../blocks/classes/Patient';
import { PatientsService } from '../blocks/services/patients.service';
import { filter, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-create-patient',
  templateUrl: './create-patient.component.html',
  styleUrls: ['./create-patient.component.css']
})
export class CreatePatientComponent implements OnInit {

  patient: IPatient = new Patient()

  constructor(
    private _patientsService: PatientsService,
    private _matSnackBar: MatSnackBar,

  ) { }

  ngOnInit() {
  }

  createPatient() {

    // @ Create patient ID
    this.patient.id = AppUtils.GenerateObjectId()

    this._patientsService
      .createPtient(this.patient)
      .pipe(

        filter((response) => {

          // @ Patient saved localy while user is offline
          if (response['dataPresent']) {
            this._matSnackBar.open('Patient saved localy.', 'CLOSE', { duration: 4000 });
            return false
          }

          return true
        })
      )
      .subscribe((response) => {

        if (response.data && response.data.createPatient)
          this._matSnackBar.open('Patient created.', 'CLOSE', { duration: 4000 });

      })
  }

}
