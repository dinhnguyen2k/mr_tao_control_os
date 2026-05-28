export interface StaffMember {
  id: string;
  storeId: string;
  fullName: string;
  role: string;
  username: string;
  usernameNormalized?: string;
  authEmail?: string;
  firebaseUid?: string;
  phone: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  email?: string;
  password?: string;
  pin?: string;
  department?: string;
  position?: string;
  employeeCode?: string;
  avatar?: string;
}

export interface RolePermissionRow {
  id: string;
  storeId: string;
  roleCode: string;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canApprove: boolean;
}
