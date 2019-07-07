import { Apollo } from 'apollo-angular';
import { DELETE_GREETING, PATIENTS_QUERY, CREATE_PATIENT, PATIENT_FRAGMENT } from '../queries/queries';
import { Injectable } from '@angular/core';
import { createPatientGqlCallback } from '../graphql/callback/createPatientGqlCallback';
import { PatientStoreService } from '../local-db/patient-store.service';
import { QueryManager } from 'apollo-client/core/QueryManager';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {

  constructor(
    private _apollo: Apollo,
    private _patientStoreService: PatientStoreService,

  ) { }


  getPatientsNetowrkOnly(
    page: Number = 1,
    limit: Number = 10,
    filter: string = ''

  ) {
    return this._apollo.watchQuery({
      query: PATIENTS_QUERY,
      variables: { page, limit, filter },
      fetchPolicy: "network-only"
    })
  }

  // @ Get cache only
  getPatients(
    page: Number = 1,
    limit: Number = 10,
    filter: string = ''

  ) {
    return this._apollo.watchQuery({
      query: PATIENTS_QUERY,
      variables: { page, limit, filter },
      fetchPolicy: "cache-and-network"
      // fetchPolicy: "cache-only"

    })
  }

  createPtient(patient) {
    return this._apollo.mutate({
      mutation: CREATE_PATIENT,
      variables: { patient: patient },
      optimisticResponse: createPatientGqlCallback.optimisticResponse(patient),
      update: (proxy, ev) => createPatientGqlCallback.update(proxy, ev, this._apollo.getClient())

    });
  }

  deletePatient(id) {
    return this._apollo.mutate({
      mutation: DELETE_GREETING,
      variables: { id }
    });
  }















  //----------------------------------------------
  // @ Testing
  //----------------------------------------------
  writeQuery(data, args) {

    if (!args.limit || !args.page)
      return

    let client = this._apollo.getClient()

    let patients = []

    data.map(element => {
      let patient_ = this._apollo.getClient().readFragment(
        {
          fragment: PATIENT_FRAGMENT,
          id: `Patient:${element.id}`
        })

      if (patient_)
        patients.push(patient_)
    })


    // @ CRITICAL INFO: writeQuery by apollo client will broadcast queries
    client.writeQuery({
      query: PATIENTS_QUERY,
      variables: { filter: args.filter || "", page: args.page || 0, limit: args.limit || 0 },
      data: { patients: patients }
    })
  }

  restore(args) {

    this._patientStoreService
      .getPatients(args.limit, args.page, args.filter)
      .then(data => {

        this.writeQuery(data, args)

      },
        (error) => console.error(error))
  }

  cleanCacheWatches(queryName) {

    let watches: Set<any> = this._apollo.getClient().cache['watches']
    if (watches.size > 0)
      watches.forEach(element => {

        //&& !this.deepEqual(element.query.variables, args)
        if (element.query.definitions[0].name.value == queryName)
          watches.delete(element)
      })
  }

  deepEqual(x, y) {
    const ok = Object.keys, tx = typeof x, ty = typeof y;
    return x && y && tx === 'object' && tx === ty ? (
      ok(x).length === ok(y).length &&
      ok(x).every(key => this.deepEqual(x[key], y[key]))
    ) : (x === y);
  }

}
