import { Apollo } from 'apollo-angular';
import { PatientsService } from './blocks/services/patients.service';
import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  root_query
  constructor(
    private _patientsService: PatientsService,
    private _apollo: Apollo
  ) { }

  ngOnInit(): void {
    setInterval(() => {
      this.root_query = this._apollo.getClient().cache['data']['data']['ROOT_QUERY']
    }, 500)
  }


  getAllPatients() {
    this._patientsService
      .getPatientsNetowrkOnly(1, 300, '')
      .valueChanges
      .subscribe(({ data, loading }) => {
        if (data && data['patients'] && data['patients'].length) {
          console.log("All patients loaded from server")
        }
      })
  }

}
