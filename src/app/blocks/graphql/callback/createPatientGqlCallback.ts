import { InMemoryCache } from 'apollo-cache-inmemory';
import { QueryManager } from 'apollo-client/core/QueryManager';
import { PatientStoreService } from '../../local-db/patient-store.service';
import ApolloClient from 'apollo-client';
import { PATIENT_FRAGMENT } from '../../queries/queries';


export class createPatientGqlCallback {

  public static optimisticResponse(variables) {

    const response = {
      __typename: "Mutation",
      createPatient: variables
    };

    return response;
  }


  public static update(proxy, ev, client: ApolloClient<any>) {

    if (ev.data && ev.data.createPatient) {

      //--------------------------------------
      //     @ Add patient to local db
      //--------------------------------------

      let store = new PatientStoreService()
      store.addPatient(ev.data.createPatient).then(data => console.log("Patient added to store after mutation", data))


      //--------------------------------------
      //     @ Add patient patient fragment
      //--------------------------------------

      let patient = ev.data.createPatient
      patient.__typename = "Patient"

      proxy.writeFragment(
        {
          fragment: PATIENT_FRAGMENT,
          id: `Patient:${ev.data.createPatient.id}`,
          data: ev.data.createPatient
        })


      //--------------------------------------
      //     @ Invalidate all patient queries
      //--------------------------------------

      if (proxy.data.data.ROOT_QUERY)
        Object.keys(proxy.data.data.ROOT_QUERY).forEach((key) => {
          key.startsWith(`patients(`) && delete proxy.data.data.ROOT_QUERY[key];
        });

      // @ clear cache watches
      this.cleanCacheWatches(proxy, "Patients")

      // @ clean queryManager watches
      this.cleanQueryManagerWatches(client, "Patients")

      // @ update persisted cache
      proxy.writeData({ data: { patientStoreUpdateTime: new Date().toISOString() } });

    };
  }

  public static cleanCacheWatches(proxy, queryName) {
    let watches = proxy['watches']
    if (watches.size > 0)
      watches.forEach(element => {

        //&& !this.deepEqual(element.query.variables, args)
        if (element.query.definitions[0].name.value == queryName)
          watches.delete(element)
      })
  }

  public static cleanQueryManagerWatches(client, queryName) {
    let managerQueries: any = client.queryManager.queries

    if (managerQueries.size > 0)
      managerQueries.forEach((element) => {
        if (element.observableQuery) {

          if (element.observableQuery.options.query.definitions[0].name.value == queryName) {
            managerQueries.delete(element)
          }
        }
      });
  }
}
