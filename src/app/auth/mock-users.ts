import { User } from "./models/user.model";

export const MOCK_USERS: User[] = [
  // ===== SUPER ADMIN =====
  {
    id: 1,
    username: 'superadmin',
    password: 'super123',
    email: 'super.admin@school.edu',
    fullName: 'Dr. Sarah Johnson',
    role: 'super-admin',
    avatar: '👩‍💼',
    createdAt: new Date('2023-01-15'),
    isActive: true,
    permissions: ['*'],
    school: 'Springfield High School',
    department: 'Executive Office'
  },

  // ===== ADMIN =====
  {
    id: 2,
    username: 'admin',
    password: 'BSL@Braeban@2026',
    email: 'admin@braeburn.ac.ke',
    fullName: 'John Smith',
    role: 'admin',
    avatar: '👨‍💼',
    createdAt: new Date('2023-03-20'),
    isActive: true,
    permissions: ['read:all', 'write:all', 'delete:students', 'manage:users'],
    school: 'Springfield High School',
    department: 'Administration'
  },

  // ===== EDITOR =====
  {
    id: 3,
    username: 'editor',
    password: 'editor123',
    email: 'editor@braeburn.ac.ke',
    fullName: 'Emily Davis',
    role: 'editor',
    avatar: '👩‍🏫',
    createdAt: new Date('2023-06-10'),
    isActive: true,
    permissions: ['read:all', 'write:students', 'edit:reports'],
    school: 'Springfield High School',
    department: 'Academic Affairs'
  },

  // ===== VIEWER 1 =====
  {
    id: 4,
    username: 'viewer',
    password: 'viewer123',
    email: 'viewer@school.edu',
    fullName: 'Mike Wilson',
    role: 'viewer',
    avatar: '👨‍🎓',
    createdAt: new Date('2023-09-01'),
    isActive: true,
    permissions: ['read:all'],
    school: 'Springfield High School',
    department: 'Student Services'
  },

  // ===== VIEWER 2 (Parent) =====
  {
    id: 5,
    username: 'parent',
    password: 'parent123',
    email: 'parent@email.com',
    fullName: 'Lisa Martinez',
    role: 'viewer',
    avatar: '👩',
    createdAt: new Date('2024-01-15'),
    isActive: true,
    permissions: ['read:students'],
    school: 'Springfield High School',
    department: 'Parent Association'
  },

  // ===== INACTIVE USER =====
  {
    id: 6,
    username: 'inactive',
    password: 'inactive123',
    email: 'inactive@school.edu',
    fullName: 'Tom Harris',
    role: 'viewer',
    avatar: '👨',
    createdAt: new Date('2023-11-01'),
    isActive: false,
    permissions: ['read:all'],
    school: 'Springfield High School',
    department: 'Maintenance'
  },

  // ===== TEACHER =====
  {
    id: 7,
    username: 'teacher',
    password: 'teacher123',
    email: 'teacher@school.edu',
    fullName: 'Mrs. Rachel Green',
    role: 'editor',
    avatar: '👩‍🏫',
    createdAt: new Date('2023-08-15'),
    isActive: true,
    permissions: ['read:all', 'write:students', 'view:reports'],
    school: 'Springfield High School',
    department: 'Mathematics'
  },

  // ===== DEPARTMENT HEAD =====
  {
    id: 8,
    username: 'hod',
    password: 'hod123',
    email: 'hod@school.edu',
    fullName: 'Dr. James Wilson',
    role: 'admin',
    avatar: '👨‍🔬',
    createdAt: new Date('2022-07-01'),
    isActive: true,
    permissions: ['read:all', 'write:all', 'manage:department'],
    school: 'Springfield High School',
    department: 'Science'
  },

  // ===== COUNSELOR =====
  {
    id: 9,
    username: 'counselor',
    password: 'counselor123',
    email: 'counselor@school.edu',
    fullName: 'Dr. Anna Lee',
    role: 'editor',
    avatar: '👩‍⚕️',
    createdAt: new Date('2023-04-10'),
    isActive: true,
    permissions: ['read:all', 'write:students', 'view:confidential'],
    school: 'Springfield High School',
    department: 'Student Counseling'
  },

  // ===== IT SUPPORT =====
  {
    id: 10,
    username: 'itsupport',
    password: 'it123',
    email: 'it@school.edu',
    fullName: 'Alex Chen',
    role: 'viewer',
    avatar: '👨‍💻',
    createdAt: new Date('2023-02-01'),
    isActive: true,
    permissions: ['read:all', 'manage:system'],
    school: 'Springfield High School',
    department: 'IT Department'
  }
];

// ===== ADDITIONAL MOCK DATA =====

// Pre-defined tokens for different roles
export const MOCK_TOKENS: Record<string, string> = {
  'superadmin': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdXBlcmFkbWluIiwicm9sZSI6InN1cGVyLWFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SUPER_SECRET_TOKEN',
  'admin': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMn0.ADMIN_SECRET_TOKEN',
  'editor': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGl0b3IiLCJyb2xlIjoiZWRpdG9yIiwiaWF0IjoxNTE2MjM5MDIyfQ.EDITOR_SECRET_TOKEN',
  'viewer': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ2aWV3ZXIiLCJyb2xlIjoidmlld2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.VIEWER_SECRET_TOKEN'
};

// Mock login history
export const MOCK_LOGIN_HISTORY: Record<number, Date[]> = {
  1: [new Date('2024-09-08T08:00:00'), new Date('2024-09-07T17:30:00'), new Date('2024-09-07T09:15:00')],
  2: [new Date('2024-09-08T07:45:00'), new Date('2024-09-07T16:45:00')],
  3: [new Date('2024-09-08T08:30:00')],
  4: [new Date('2024-09-08T09:00:00'), new Date('2024-09-07T10:00:00')],
  5: [new Date('2024-09-07T20:15:00')],
};

// User roles with descriptions
export const USER_ROLES: Record<string, { label: string; description: string; color: string }> = {
  'super-admin': {
    label: 'Super Admin',
    description: 'Full system access',
    color: 'bg-purple-500'
  },
  'admin': {
    label: 'Administrator',
    description: 'Manage users and settings',
    color: 'bg-blue-500'
  },
  'editor': {
    label: 'Editor',
    description: 'Create and edit content',
    color: 'bg-green-500'
  },
  'viewer': {
    label: 'Viewer',
    description: 'Read-only access',
    color: 'bg-gray-500'
  }
};

// Helper function to get user by username
export const findUserByUsername = (username: string): User | undefined => {
  return MOCK_USERS.find(user =>
    user.username.toLowerCase() === username.toLowerCase() &&
    user.isActive
  );
};

// Helper function to validate credentials
export const validateCredentials = (username: string, password: string): User | null => {
  const user = findUserByUsername(username);
  if (user && user.password === password) {
    // Update last login
    user.lastLogin = new Date();
    return user;
  }
  return null;
};

// Helper to get all active users
export const getActiveUsers = (): User[] => {
  return MOCK_USERS.filter(user => user.isActive);
};

// Helper to get users by role
export const getUsersByRole = (role: string): User[] => {
  return MOCK_USERS.filter(user => user.role === role && user.isActive);
};
