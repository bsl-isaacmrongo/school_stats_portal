export interface FormTutor {
  id: string;              // e.g. 'TUT-8492'
  initials: string;        // e.g. 'JR'
  fullName: string;        // e.g. 'Dr. Jonathan (Jon) Reynolds'
  email: string;           // e.g. 'j.reynolds@bge-ops.edu'
  room: string;            // e.g. 'Room 204B'
  roomIcon: string;        // material icon name, e.g. 'meeting_room'
  isActive: boolean;
}

export interface FormGroup {
  id: string;              // e.g. '10-ALPHA'
  code: string;            // e.g. 'FRM-Y10-A'
  name: string;            // e.g. '10 Alpha - Sciences & Advanced Mathematics Focus'
  track: string;           // e.g. 'STEM Track'
  trackVariant: 'primary' | 'neutral';
  enrolled: number;
  boys: number;
  girls: number;
  attendance: number;      // percentage, e.g. 97.4
  tutor: FormTutor;
}

export interface YearGroupDetail {
  id: string;              // e.g. 'yg-2025-y10'
  year: string;            // e.g. 'Year 10'
  sortOrder: number;       // e.g. 10
  ageGroup: number;        // e.g. 14
  ageRange: string;        // e.g. '14 - 15 Yrs'
  curriculum: string;      // e.g. 'IGCSE Lower Secondary - Key Stage 4 Curriculum Cohort'
  headOfYear: string;      // e.g. 'Dr. Marcus Vance'
  location: string;        // e.g. 'Secondary Wing Level 2'
  assembly: string;        // e.g. 'Cohort Form Assembly: Wednesdays 08:30 AM'
  capacity: number;        // e.g. 112
  totalForms: number;
  totalEnrolled: number;
  boys: number;
  girls: number;
  formsWithTutor: number;
  totalFormTutors: number;
  curriculumTier: string;  // e.g. 'KS4 IGCSE'
  averageAttendance: number;
  activeInterventions: number;
  forms: FormGroup[];
}

export interface YearGroupApiForm {
  formId: string;
  description: string;
  tutorId: string;
  tutorTitle: string;
  tutorForename: string;
  tutorPreferredForeName: string;
  tutorSurname: string;
}

export interface YearGroupApiResponse {
  yearGroupId: string;
  description: string;
  ageGroup: number;
  sortOrder: number;
  forms: YearGroupApiForm[];
}
