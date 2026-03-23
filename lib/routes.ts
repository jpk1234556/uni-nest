/**
 * Returns the dashboard path for a given user role.
 */
export function getDashboardPathForRole(role: string): string {
  switch (role) {
    case "student":
      return "/dashboard/student"
    case "hostel_owner":
      return "/dashboard/owner"
    case "admin":
      return "/dashboard/admin"
    default:
      return "/"
  }
}
