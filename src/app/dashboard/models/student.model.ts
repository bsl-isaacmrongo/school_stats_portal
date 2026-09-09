export interface YearGroup {
  year: string;
  boys: number;
  girls: number;
  total?: number;
}

export interface StudentData {
  totalStudents: number;
  genderBreakdown: { boys: number; girls: number };
  yearGroups: YearGroup[];
  lastUpdated: string;
}

export interface Pupil {
  [key: string]: unknown;
  schoolId: string;
  status: string;
  pupilId: string;
  admissionNo: string;
  pupilCode: string;
  familyNumber: string;
  surname: string;
  forename: string;
  middlename: string;
  displayName: string;
  preferredForename: string;
  preferredSurname: string;
  genderCode: string;
  name: string;
  dob: string;
  formName: string;
  yearGroupCode: string;
  yearGroup: string;
  registrationGroupCode: string;
  registrationGroup: string;
  houseCode: string;
  house: string;
  address: string;
  postCode: string;
  studentEmailAddress: string;
  isInCare: boolean;
  isForcesFamily: boolean;
  fsm: boolean;
  dateOfEntry: string;
  dateOfLeaving: string;
  countryAddress: string;
  entryYear: string;
  entryYearGroup: string;
  isPhotoAllowed: boolean;
  isExternal: boolean;
  gender: string;
  active: boolean;
}
