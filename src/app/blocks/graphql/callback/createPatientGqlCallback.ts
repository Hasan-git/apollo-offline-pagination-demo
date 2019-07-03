import { PatientStoreService } from '../../local-db/patient-store.service';


export class createPatientGqlCallback {

  public static optimisticResponse(variables) {

    const response = {
      __typename: "Mutation",
      createPatient: variables
    };

    return response;
  }


  public static update(proxy, { data }) {

    if (data && data.createPatient) {

      //--------------------------------------
      //     @ Add patient to local db
      //--------------------------------------

      let store = new PatientStoreService()
      store.addPatient(data.createPatient).then(data => console.log("Patient added to store after mutation", data))


      //--------------------------------------
      //     @ Invalidate all patient query
      //--------------------------------------

      if (proxy.data.data.ROOT_QUERY)
        Object.keys(proxy.data.data.ROOT_QUERY).forEach((key) => {
          key.startsWith(`patients(`) && delete proxy.data.data.ROOT_QUERY[key];
        });

      // proxy.writeData("topic", 0);

    };
  }

}
