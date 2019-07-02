const queries =
  `

  query Patients {
    patients(limit:10, page:10){
      id
      name
      contact
      email
    }
  }


`

module.exports = queries
