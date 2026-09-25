export interface YearGroup {
  yearGroupId?: string;
  year: string;
  boys: number;
  girls: number;
  total: number;
  name?: string;
  stage?: string;
}

export interface StudentData {
  totalStudents: number;
  genderBreakdown: { boys: number; girls: number };
  yearGroups: YearGroup[];
  lastUpdated: string;
}

export interface AcademicYearStats {
  joiners: number;
  leavers: number;
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

/** Attendance response returned for one pupil and one school day. */
export interface PupilAttendance {
  absenceType: string;
  attendanceDate: string;
  attendanceSession: string | null;
  attendanceSymbol: string;
  batchID: string;
  comments: string;
  divisionID: string;
  isAuthorised: boolean;
  isInAttendance: boolean;
  periodNumber: number | null;
  pupilId: string;
  schoolId: string;
  subjectID: string;
  yearGroupID: string;
  [key: string]: unknown;
}

export interface YearGroupSubject {
  schoolId: string;
  yearGroup: string;
  yearGroupName: string;
  subject: {
    subjectId: string;
    name: string;
    notes: string;
  };
  isActive: boolean;
  marksheetWeightingPercentage: number;
  subjectHead: string;
  isExaminable: boolean;
  divisions: unknown[] | null;
  [key: string]: unknown;
}
