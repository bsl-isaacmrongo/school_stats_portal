import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../env';
import { Pupil, StudentData } from '../models/student.model';
import { MOCK_DATA } from './mock-data';
import { YearGroupApiResponse } from '../components/year-group-details/year-group-model';

type ApiPupil = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class StudentDataService {
  private data = signal<StudentData>(MOCK_DATA);
  readonly pupils = signal<Pupil[]>([]);
  readonly leavers = signal<Pupil[]>([]);
  private loadedSchools = signal<Record<string, boolean>>({});
  private loadedLeaverSchools = signal<Record<string, boolean>>({});
  readonly pupilsLoading = signal(false);
  readonly leaversLoading = signal(false);

  constructor(private http: HttpClient) {}

  getData() { return this.data(); }

  refreshData() {
    this.data.set(MOCK_DATA);
  }

  getPupils(school = 'CL1-BGESS'): Observable<Pupil[]> {
    if (this.loadedSchools()[school]) return of(this.pupils());

    this.pupilsLoading.set(true);
    return this.http.get<ApiPupil[]>(
      `${environment.apiUrl}/v1/personaldetails/getcurrentpupilinfo/${encodeURIComponent(school)}`
    ).pipe(
      map(response => response.map(pupil => this.mapPupil(pupil))),
      tap(pupils => {
        this.pupils.set(pupils);
        this.loadedSchools.update(schools => ({ ...schools, [school]: true }));
      }),
      finalize(() => this.pupilsLoading.set(false)),
      catchError(error => throwError(() => error))
    );
  }

  getLeavers(school = 'CL1-BGESS'): Observable<Pupil[]> {
    if (this.loadedLeaverSchools()[school]) return of(this.leavers());

    this.leaversLoading.set(true);
    return this.http.get<ApiPupil[]>(
      `${environment.apiUrl}/v1/analytics/getleaverpupilinfo/${encodeURIComponent(school)}`
    ).pipe(
      map(response => response.map(pupil => this.mapPupil(pupil))),
      tap(leavers => {
        this.leavers.set(leavers);
        this.loadedLeaverSchools.update(schools => ({ ...schools, [school]: true }));
      }),
      finalize(() => this.leaversLoading.set(false)),
      catchError(error => throwError(() => error))
    );
  }

  getYearGroupDetails(school: string): Observable<YearGroupApiResponse[]> {
    return this.http.get<YearGroupApiResponse[]>(
      `${environment.apiUrl}/v1/lookups/getyeargroupformslookup/${encodeURIComponent(school)}`
    );
  }

  private mapPupil(apiPupil: ApiPupil): Pupil {
    const firstName = this.stringValue(apiPupil, 'firstName', 'forename');
    const lastName = this.stringValue(apiPupil, 'lastName', 'surname');
    const name = this.stringValue(apiPupil, 'name', 'fullName', 'pupilName', 'studentName')
      || [firstName, lastName].filter(Boolean).join(' ');

    const status = this.stringValue(apiPupil, 'status').toLowerCase();

    return {
      ...apiPupil,
      schoolId: this.stringValue(apiPupil, 'schoolId'),
      status: this.stringValue(apiPupil, 'status'),
      pupilId: this.stringValue(apiPupil, 'pupilId'),
      admissionNo: this.stringValue(apiPupil, 'admissionNo', 'admissionNumber', 'admission_number', 'pupilCode', 'code', 'id'),
      pupilCode: this.stringValue(apiPupil, 'pupilCode'),
      familyNumber: this.stringValue(apiPupil, 'familyNumber'),
      surname: this.stringValue(apiPupil, 'surname'),
      forename: this.stringValue(apiPupil, 'forename'),
      middlename: this.stringValue(apiPupil, 'middlename'),
      displayName: this.stringValue(apiPupil, 'displayName'),
      preferredForename: this.stringValue(apiPupil, 'preferredForename'),
      preferredSurname: this.stringValue(apiPupil, 'preferredSurname'),
      genderCode: this.stringValue(apiPupil, 'genderCode'),
      name,
      dob: this.stringValue(apiPupil, 'dob'),
      formName: this.stringValue(apiPupil, 'formName'),
      yearGroupCode: this.stringValue(apiPupil, 'yearGroupCode'),
      yearGroup: this.stringValue(apiPupil, 'yearGroup'),
      registrationGroupCode: this.stringValue(apiPupil, 'registrationGroupCode'),
      registrationGroup: this.stringValue(apiPupil, 'registrationGroup'),
      houseCode: this.stringValue(apiPupil, 'houseCode'),
      house: this.stringValue(apiPupil, 'house'),
      address: this.stringValue(apiPupil, 'address'),
      postCode: this.stringValue(apiPupil, 'postCode'),
      studentEmailAddress: this.stringValue(apiPupil, 'studentEmailAddress'),
      isInCare: this.booleanValue(apiPupil, 'isInCare') ?? false,
      isForcesFamily: this.booleanValue(apiPupil, 'isForcesFamily') ?? false,
      fsm: this.booleanValue(apiPupil, 'fsm') ?? false,
      dateOfEntry: this.stringValue(apiPupil, 'dateOfEntry'),
      dateOfLeaving: this.stringValue(apiPupil, 'dateOfLeaving'),
      countryAddress: this.stringValue(apiPupil, 'countryAddress'),
      entryYear: this.stringValue(apiPupil, 'entryYear'),
      entryYearGroup: this.stringValue(apiPupil, 'entryYearGroup'),
      isPhotoAllowed: this.booleanValue(apiPupil, 'isPhotoAllowed') ?? false,
      isExternal: this.booleanValue(apiPupil, 'isExternal') ?? false,
      gender: this.stringValue(apiPupil, 'gender', 'sex'),
      active: this.booleanValue(apiPupil, 'active', 'isActive') ?? status !== 'inactive',
    };
  }

  private stringValue(value: ApiPupil, ...keys: string[]): string {
    const match = keys.map(key => value[key]).find(item => item !== null && item !== undefined);
    return match === undefined ? '' : String(match);
  }

  private booleanValue(value: ApiPupil, ...keys: string[]): boolean | undefined {
    const match = keys.map(key => value[key]).find(item => item !== null && item !== undefined);
    if (match === undefined) return undefined;
    if (typeof match === 'boolean') return match;
    return String(match).toLowerCase() === 'true';
  }
}
