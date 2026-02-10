// Role-based permission system for team collaboration
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  MEMBER: 'member'
};

export const ROLE_DESCRIPTIONS = {
  admin: 'Full control - manage team, members, and projects',
  manager: 'Manage team members, projects, and settings',
  editor: 'Create and edit projects and tasks',
  viewer: 'View projects and tasks only',
  member: 'Standard team member (legacy)'
};

export const PERMISSIONS = {
  // Team Management
  MANAGE_TEAM: 'manage_team',
  MANAGE_MEMBERS: 'manage_members',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Project Management
  CREATE_PROJECT: 'create_project',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  MANAGE_PROJECT_MEMBERS: 'manage_project_members',
  
  // Task Management
  CREATE_TASK: 'create_task',
  EDIT_TASK: 'edit_task',
  DELETE_TASK: 'delete_task',
  
  // View
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_PROJECTS: 'view_projects'
};

// Define what each role can do
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.DELETE_PROJECT,
    PERMISSIONS.MANAGE_PROJECT_MEMBERS,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PROJECTS
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.DELETE_PROJECT,
    PERMISSIONS.MANAGE_PROJECT_MEMBERS,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PROJECTS
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PROJECTS
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PROJECTS
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK
  ]
};

// Helper function to check if role has permission
export function hasPermission(role, permission) {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
}

// Helper function to check if user can perform action
export function canPerformAction(userRole, action) {
  return hasPermission(userRole, action);
}

// Get role hierarchy level (for UI ordering)
export function getRoleHierarchy(role) {
  const hierarchy = {
    [ROLES.ADMIN]: 5,
    [ROLES.MANAGER]: 4,
    [ROLES.EDITOR]: 3,
    [ROLES.VIEWER]: 2,
    [ROLES.MEMBER]: 1
  };
  return hierarchy[role] || 0;
}