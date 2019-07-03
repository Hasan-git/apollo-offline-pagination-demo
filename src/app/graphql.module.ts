import { filter, map, flatMap } from 'rxjs/operators';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
// Apollo
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { persistCache, CachePersistor } from 'apollo-cache-persist';
import { onError } from 'apollo-link-error';
import OfflineLink from "apollo-link-offline";
import * as localforage from "localforage";
import { DefaultOptions } from 'apollo-client';
import { PatientStoreService } from './blocks/local-db/patient-store.service';
import { PATIENT_FRAGMENT, PATIENTS_QUERY } from './blocks/queries/queries';
import { promise } from 'protractor';
import { from } from 'rxjs';

const uri = 'http://localhost:4000/graphql';

@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {

  private offlineIsSet: boolean = false;
  private _defaultOptions: DefaultOptions = {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  };

  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink,
    private _patientStoreService: PatientStoreService
  ) {

    const __errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            // `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      }
      // if (networkError) { console.log(`[Network error]: ${networkError}`); }
    });

    const __httpLink = httpLink.create({
      uri: uri
    });

    const cache = new InMemoryCache({
      addTypename: true,
      dataIdFromObject: object => {

        switch (object.__typename) {
          case 'Patient': {

            // @ Add patient to local db
            _patientStoreService.addPatient(object)

            return `Patient:${object.id}`;
          }

          default:
            return defaultDataIdFromObject(object);
        }
      },

      // https://www.apollographql.com/docs/react/advanced/caching.html#cacheRedirect
      cacheRedirects: {
        Query: {

          // @ called when query is not found in cache
          patients: (_, args, { getCacheKey }) => {

            // @ Get filtered patients from local db
            _patientStoreService
              .getPatients(args.limit, args.page, args.filter)
              .then(data => {

                if (!data.length)
                  return

                //-------------------------------------
                //      @ Write Query
                //--------------------------------------

                let patients = []
                data.map(element => {
                  patients.push(this.apollo.getClient().cache.readFragment(
                    {
                      fragment: PATIENT_FRAGMENT,
                      id: `Patient:${element.id}`
                    })
                  )
                })

                this.apollo.getClient().cache.writeQuery({
                  query: PATIENTS_QUERY,
                  variables: args,
                  data: { patients: patients }
                })

                //--------------------------------------
                //      @ Return resolved data
                //--------------------------------------

                // @ Help needed: doesn't work when called in async
                return data.map(obj => getCacheKey({ __typename: "Patient", id: obj.id }))

              },
                (error) => console.error(error)
              )
          }
        }
      }
    });

    // -----------------------------------------------
    //      Persistor
    // -----------------------------------------------
    const persistor = new CachePersistor({
      cache,
      storage: window.localStorage,
      maxSize: false,
      debug: false
    });

    const SCHEMA_VERSION = "0.3";
    const SCHEMA_VERSION_KEY = 'apollo-schema-version';

    // Read the current schema version from AsyncStorage.
    const currentVersion = window.localStorage.getItem(SCHEMA_VERSION_KEY);

    if (currentVersion === SCHEMA_VERSION) {
      // If the current version matches the latest version,
      // we're good to go and can restore the cache.
      persistor.restore();
    } else {
      // Otherwise, we'll want to purge the outdated persisted cache
      // and mark ourselves as having updated to the latest version.
      persistor.purge();
      window.localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
    }

    // -----------------------------------------------
    //      OfflineLink
    // -----------------------------------------------
    const offlineLink = new OfflineLink({
      storage: localforage,
      retryInterval: 30000,
      sequential: true
    });

    const __link = ApolloLink.from([
      // + ---- Other Links
      offlineLink,
      __errorLink,

      // + ---- don't touch this Link
      __httpLink
    ]);

    // create Apollo
    apollo.create({
      link: __link,
      cache: cache,
      defaultOptions: this._defaultOptions,
    });

    setTimeout(async () => {
      if (!this.offlineIsSet) {
        await offlineLink.setup(apollo.getClient());
        this.offlineIsSet = true;
      }
    }, 10);


  }

}
