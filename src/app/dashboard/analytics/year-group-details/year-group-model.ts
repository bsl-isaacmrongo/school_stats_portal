export interface FormTutor {
  id: string;
  initials: string;
  fullName: string;
  email: string;
  room: string;
  roomIcon: string;
  isActive: boolean;
}

export interface FormGroup {
  id: string;
  code: string;
  formName: string;
  name: string;
  track: string;
  trackVariant: 'primary' | 'neutral';
  enrolled: number;
  boys: number;
  girls: number;
  attendance: number;
  tutor: FormTutor;
}

export interface YearGroupDetail {
  id: string;
  year: string;
  sortOrder: number;
  ageGroup: number;
  ageRange: string;
  curriculum: string;
  headOfYear: string;
  location: string;
  assembly: string;
  capacity: number;
  totalForms: number;
  totalEnrolled: number;
  boys: number;
  girls: number;
  formsWithTutor: number;
  totalFormTutors: number;
  curriculumTier: string;
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
