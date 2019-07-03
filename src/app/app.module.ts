import { SharedMaterialModule } from './blocks/common/shared-material.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GraphQLModule } from './graphql.module';
import { CreatePatientComponent } from './create-patient/create-patient.component';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { PatientStoreService } from './blocks/local-db/patient-store.service';

@NgModule({
  declarations: [
    AppComponent,
    CreatePatientComponent,
    PatientsListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    GraphQLModule,
    SharedMaterialModule
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
