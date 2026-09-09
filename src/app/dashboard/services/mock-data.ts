import { StudentData } from "../models/student.model";


export const MOCK_DATA: StudentData = {
  totalStudents: 620,
  genderBreakdown: { boys: 305, girls: 315 },
  yearGroups: [
    { year: 'Year 7', boys: 48, girls: 42, total: 90 },
    { year: 'Year 8', boys: 44, girls: 46, total: 90 },
    { year: 'Year 9', boys: 50, girls: 40, total: 90 },
    { year: 'Year 10', boys: 38, girls: 52, total: 90 },
    { year: 'Year 11', boys: 35, girls: 45, total: 80 },
    { year: 'Year 12', boys: 30, girls: 40, total: 70 },
    { year: 'Year 13', boys: 60, girls: 50, total: 110 }
  ],
  lastUpdated: new Date().toISOString()
};
