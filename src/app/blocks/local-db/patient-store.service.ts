import { IPatient } from './../interfaces/IPatient';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class PatientStoreService extends BaseService {
  constructor() {
    super();
  }

  addPatient(patient: IPatient) {

    let patient_: IPatient = {
      id: patient.id,
      name: patient.name
    }

    return this.connection.insert<IPatient>({
      into: 'Patients',
      values: [patient_]
    }).catch((reason) => {
      // console.log(reason)
    })
  }


  public getPatients(limit: number = 10, page: number = 1, filter: string = '') {

    let skip = page == 1 ? 0 : page * limit
    let response = this.connection.select<IPatient>({
      from: 'Patients',
      // where: {
      //   name: {
      //     like: '%a%'
      //   },
      // },
      // order: {
      //   by: 'country',
      //   type: "asc"
      // },
      limit: limit,
      skip: skip,
    });
    return response

  }

}
