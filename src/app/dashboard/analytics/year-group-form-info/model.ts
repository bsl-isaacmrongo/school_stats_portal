export type AttendanceTab = 'attendance' | 'members' | 'reports' | 'config';

export interface AttendanceCode {
  code: string;
  symbol: string;
  label: string;
  /** Tailwind classes for the legend pill (bg + border + text). */
  colorClasses?: string;
  /** Tailwind classes for the custom-code card symbol. */
  symbolClass?: string;
  description?: string;
  auth?: boolean;
  inSchool?: boolean;
}

export interface AttendanceSummaryStat {
  label: string;
  count: number;
  percent: string;
  dotClass: string;
  wrapper: string;
  labelClass: string;
  valueClass: string;
}

export interface StudentAttendanceRow {
  id: string;
  admNo: string;
  name: string;
  guardian: string;
  initials: string;
  gender: 'Male' | 'Female';
  avatarClasses: string;
  attendanceSymbol: string;
  attendanceType: string;
  attendanceLabel: string;
  attendanceCode: string;
  attendanceBadgeClasses: string;
  inAttendance: 'Yes' | 'No' | 'Yes (Off-site)';
  authorised: string;
  comment: string;
}
