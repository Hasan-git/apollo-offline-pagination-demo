import { Component, OnInit, ViewChild } from '@angular/core';
import { IPatient } from '../blocks/interfaces/IPatient';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { FormControl } from '@angular/forms';
import { PatientsService } from '../blocks/services/patients.service';
import { merge, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, tap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-patients-list',
  templateUrl: './patients-list.component.html',
  styleUrls: ['./patients-list.component.css']
})
export class PatientsListComponent implements OnInit {


  public displayedColumns = ["name", "contact", "email"];
  public pageSizeOptions = [10, 20, 40];
  public noData: any;
  public dataSource = new MatTableDataSource<IPatient>([]);
  public filter = new FormControl("");
  public lengthHack = 0;
  private _unsubscribeAll: Subject<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private _patientsService: PatientsService
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit() {

    this._patientsService
      .getPatients(1, this.pageSizeOptions[0], '')
      .valueChanges
      .subscribe(({ data, loading }) => {

        if (data && data['patients'] && data['patients'].length) {
          this.dataSource = data['patients']
          this.setLength(data['patients'])
        }

      })

    this.filter
      .valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;

          this.loadPatients();
        })
      )
      .subscribe();

    merge(this.paginator.page)
      .pipe(
        tap(() => this.loadPatients())
      )
      .subscribe();
  }

  //----------------------------------------------
  // @ Public Method
  //----------------------------------------------

  loadPatients() {
    this._patientsService.getPatients(
      // @  pageIndex starts from 0 , and server expects to start with 1
      this.paginator.pageIndex + 1,
      this.paginator.pageSize,
      this.filter.value,
      // this.sort.active,
      // this.sort.direction
    )
      .valueChanges
      .subscribe(({ data, loading }) => {

        if (data && data['patients'] && data['patients'].length) {
          console.log("Data['Patients']", data['patients'])
          this.dataSource = data['patients']
          this.setLength(data['patients'])
        }
      })
  }


  setLength(patients: IPatient[]) {
    this.lengthHack = patients.length < this.paginator.pageSize ?
      (this.paginator.pageSize * (this.paginator.pageIndex)) + patients.length :
      (this.paginator.pageSize * (this.paginator.pageIndex + 1)) + 1
  }


  deletePatient(id) {

    // @ TODO....

    // this._patientsService
    //   .deletePatient(id)
    //   .then(({ data }) => {

    //     if (data && data.deletePatient)
    //       this._matSnackBar.open('Patient deleted.', 'CLOSE', { duration: 4000 });
    //     else
    //       this._matSnackBar.open('An error occurred', 'CLOSE', { duration: 4000, });
    //   })
  }

  unsubscribe() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
