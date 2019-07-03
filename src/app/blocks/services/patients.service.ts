import { Apollo } from 'apollo-angular';
import { IGreeting } from '../interfaces/IGreeting';
import { GREETINGS_QUERY, ADD_GREETING, DELETE_GREETING, PATIENTS_QUERY, CREATE_PATIENT } from '../queries/queries';
import { Injectable } from '@angular/core';
import { ApolloOfflineClient, OfflineStore, CacheOperation } from '@aerogear/voyager-client';
import { IPatient } from '../interfaces/IPatient';
import { createPatientGqlCallback } from '../graphql/callback/createPatientGqlCallback';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {

  constructor(
    private _apollo: Apollo
  ) { }

  getPatients(
    page: Number = 1,
    limit: Number = 10,
    filter: string = ''

  ) {
    return this._apollo.watchQuery({
      query: PATIENTS_QUERY,
      variables: { page, limit, filter },
      fetchPolicy: "cache-and-network"
      // fetchPolicy: "cache-only" // @ Try to fetch from cache to test
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

}
