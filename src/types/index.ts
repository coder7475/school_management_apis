export enum Role {
  Admin = 'admin',
  Teacher = 'teacher',
  Student = 'student',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
