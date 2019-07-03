import gql from 'graphql-tag';

export const PATIENTS_QUERY = gql`
  query Patients($limit: Int! , $page: Int!, $filter: String) {
    patients(limit: $limit , page: $page, filter: $filter){
      id
      name
      contact
      email
    }
  }
`;

export const CREATE_PATIENT = gql`
  mutation CreatePatient($patient: PatientInput!) {
    createPatient(patient:$patient){
      id
      name
      contact
      email
    }
  }
`

export const DELETE_PATIENT = gql`
mutation DeletePatient($id: String!) {
  deletePatient(id: $id){
    id
    }
  }
`

export const PATIENT_FRAGMENT = gql`
  fragment Patient on Patient {
      id
      name
      contact
      email
  }
`;


// ---------------------------
//       @ GARBAGE
// ---------------------------



export const ADD_GREETING = gql`
mutation addGreeting($id: String! , $msg: String!) {
    addGreeting(id: $id, msg: $msg){
      id
      msg
      version
    }
  }
`




export const GREETINGS_QUERY = gql`
query greetings {
    greetings{
      id
      msg
      version
    }
  }
`

export const DELETE_GREETING = gql`
mutation deleteGreeting($id: String!) {
  deleteGreeting(id: $id){
    id
    }
  }
`


