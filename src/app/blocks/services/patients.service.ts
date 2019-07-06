import { Apollo } from 'apollo-angular';
import { DELETE_GREETING, PATIENTS_QUERY, CREATE_PATIENT, PATIENT_FRAGMENT } from '../queries/queries';
import { Injectable } from '@angular/core';
import { createPatientGqlCallback } from '../graphql/callback/createPatientGqlCallback';
import { PatientStoreService } from '../local-db/patient-store.service';

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
      // fetchPolicy: "cache-and-network"
      fetchPolicy: "cache-only"

    })
  }

  createPtient(patient) {
    return this._apollo.mutate({
      mutation: CREATE_PATIENT,
      variables: { patient: patient },
      optimisticResponse: createPatientGqlCallback.optimisticResponse(patient),
      update: (proxy, ev) => createPatientGqlCallback.update(proxy, ev)

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
  store(data, args) {

    if (!data || !args.limit || !args.page)
      return

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


    this._apollo.getClient().cache.writeQuery({
      query: PATIENTS_QUERY,
      variables: { filter: args.filter || "", page: args.page || 0, limit: args.limit || 0 },
      data: { patients: patients }
    })

    this._apollo.getClient().reFetchObservableQueries()
  }

  clear(args, getCacheKey) {

    // @ Get filtered patients from local db
    return this._patientStoreService
      .getPatients(args.limit, args.page, args.filter)
      .then(data => {

        if (data.length) {

          // @ clear cache watches

          this._apollo.getClient().cache['watches'].clear()


          let manager: any = this._apollo.getClient().queryManager
          // manager.queries.clear()
          console.log(manager.queries)
          manager.queries.forEach(element => {
            // console.log(element)
            console.log(element.observableQuery.options.query.definitions[0].name.value, this.deepEqual(element.observableQuery.variables, args))
            if (element.observableQuery.options.query.definitions[0].name.value && this.deepEqual(element.observableQuery.variables, args)) {
              console.log(element.observableQuery.options.query.definitions[0].name.value, element.observableQuery.variables, args)
            } else {

              console.log("delete", element.observableQuery.options.query.definitions[0].name.value, element.observableQuery.variables, args)

            }
          });

          setTimeout(() => {
            this.store(data, args)
          }, 1);

          // @ Help needed: doesn't work when called in async
          // return data.map(obj => getCacheKey({ __typename: "Patient", id: obj.id }))
        }

      },
        (error) => console.error(error)
      )
  }

  deepEqual(x, y) {
    const ok = Object.keys, tx = typeof x, ty = typeof y;
    return x && y && tx === 'object' && tx === ty ? (
      ok(x).length === ok(y).length &&
      ok(x).every(key => this.deepEqual(x[key], y[key]))
    ) : (x === y);
  }

}
