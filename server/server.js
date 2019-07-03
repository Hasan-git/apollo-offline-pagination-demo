const express = require('express')
const queries = require('./queries')
const { VoyagerServer, gql } = require('@aerogear/voyager-server')
const metrics = require('@aerogear/voyager-metrics')
const auditLogger = require('@aerogear/voyager-audit')
const { guid, paginator } = require('./utils')
const { patients } = require('./data.js')


// Types
const typeDefs = gql`

  input PatientInput {
    id : String
    name : String
    contact : String
    email : String
  }

  type Patient {
    id : String
    name : String
    contact : String
    email : String
  }

  type Query {

    patients(limit: Int!, page:Int!, filter: String): [Patient]
  }

   type Mutation {

    createPatient(patient: PatientInput): Patient

    deletePatient(id: String!): Patient

   }
`
// Resolver functions. This is our business logic
const resolvers = {
  Mutation: {

    createPatient: async (obj, { patient }, context, info) => {

      let patient_ = {
        id: patient.id ? patient.id : guid(),
        name: patient.name,
        contact: patient.contact,
        email: patient.email,
      }

      patients.push(patient_)

      return patient_
    },
    deletePatient: async (obj, { id }, context, info) => {

      let index = patients.findIndex(obj => obj.id === id)

      if (index > -1) {
        let patient = patients[index]
        patients.splice(index, 1)
        return patient
      }
      else
        return null
    }
  },
  Query: {
    patients: (obj, args, context, info) => {

      let filteredPatients = patients

      // @ filter patients
      if (args.filter)
        filteredPatients = patients.filter(obj => obj.name.toLowerCase().startsWith(args.filter.toLowerCase()))

      // @ paginate
      let { data } = paginator(filteredPatients, args.page, args.limit)

      return data
    }
  }
}

const context = ({ req }) => {
  return {
    serverName: 'Voyager Server'
  }
}

// Initialize the voyager server with our schema and context
const apolloConfig = {
  typeDefs,
  resolvers,
  playground: {
    tabs: [{
      endpoint: '/graphql',
      variables: {},
      query: queries
    }]
  },
  context
}

const voyagerConfig = {
  metrics,
  auditLogger
}

const server = VoyagerServer(apolloConfig, voyagerConfig)

const app = express()

metrics.applyMetricsMiddlewares(app)

server.applyMiddleware({ app })

module.exports = { app, server, schema: server.schema }
