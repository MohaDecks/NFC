export const PERMISSIONS = [
  "profiles.view",
  "profiles.create",
  "profiles.edit",
  "profiles.delete",
  "profiles.publish",
  "profiles.verify",
  "content.view",
  "content.create",
  "content.edit",
  "content.delete",
  "design.view",
  "design.edit",
  "media.view",
  "media.upload",
  "media.delete",
  "nfc.view",
  "nfc.manage",
  "analytics.view",
  "users.view",
  "users.create",
  "users.edit",
  "users.delete",
  "roles.view",
  "roles.create",
  "roles.edit",
  "roles.delete",
  "settings.view",
  "settings.edit",
  "audit.view",
  "locations.view",
  "locations.create",
  "locations.edit",
  "locations.delete",
  "types.view",
  "types.create",
  "types.edit",
  "types.delete",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_GROUPS: { id: string; label: string; items: Permission[] }[] = [
  {
    id: "profiles",
    label: "Profiles",
    items: ["profiles.view", "profiles.create", "profiles.edit", "profiles.delete", "profiles.publish", "profiles.verify"],
  },
  {
    id: "content",
    label: "Content",
    items: ["content.view", "content.create", "content.edit", "content.delete"],
  },
  {
    id: "design",
    label: "Design",
    items: ["design.view", "design.edit"],
  },
  {
    id: "media",
    label: "Media",
    items: ["media.view", "media.upload", "media.delete"],
  },
  {
    id: "nfc",
    label: "NFC / QR",
    items: ["nfc.view", "nfc.manage"],
  },
  {
    id: "analytics",
    label: "Analytics",
    items: ["analytics.view"],
  },
  {
    id: "users",
    label: "Users",
    items: ["users.view", "users.create", "users.edit", "users.delete"],
  },
  {
    id: "roles",
    label: "Roles",
    items: ["roles.view", "roles.create", "roles.edit", "roles.delete"],
  },
  {
    id: "settings",
    label: "Settings",
    items: ["settings.view", "settings.edit"],
  },
  {
    id: "audit",
    label: "Audit Logs",
    items: ["audit.view"],
  },
  {
    id: "locations",
    label: "Countries & Cities",
    items: ["locations.view", "locations.create", "locations.edit", "locations.delete"],
  },
  {
    id: "types",
    label: "Profile Types",
    items: ["types.view", "types.create", "types.edit", "types.delete"],
  },
];

export type MenuAction = "view" | "add" | "update" | "delete";

export const MENU_MATRIX: {
  id: string;
  label: string;
  parent: string;
  actions: Partial<Record<MenuAction, Permission | Permission[]>>;
}[] = [
  {
    id: "profiles",
    label: "Profiles",
    parent: "Parent",
    actions: {
      view: "profiles.view",
      add: "profiles.create",
      update: ["profiles.edit", "profiles.publish", "profiles.verify"],
      delete: "profiles.delete",
    },
  },
  {
    id: "content",
    label: "Content",
    parent: "Parent",
    actions: {
      view: "content.view",
      add: "content.create",
      update: "content.edit",
      delete: "content.delete",
    },
  },
  {
    id: "design",
    label: "Design",
    parent: "Parent",
    actions: { view: "design.view", update: "design.edit" },
  },
  {
    id: "media",
    label: "Media",
    parent: "Content",
    actions: { view: "media.view", add: "media.upload", delete: "media.delete" },
  },
  {
    id: "nfc",
    label: "NFC / QR",
    parent: "Parent",
    actions: { view: "nfc.view", update: "nfc.manage" },
  },
  {
    id: "analytics",
    label: "Analytics",
    parent: "Parent",
    actions: { view: "analytics.view" },
  },
  {
    id: "users",
    label: "Users",
    parent: "System",
    actions: {
      view: "users.view",
      add: "users.create",
      update: "users.edit",
      delete: "users.delete",
    },
  },
  {
    id: "roles",
    label: "Roles",
    parent: "System",
    actions: {
      view: "roles.view",
      add: "roles.create",
      update: "roles.edit",
      delete: "roles.delete",
    },
  },
  {
    id: "permissions",
    label: "Permissions",
    parent: "System",
    actions: { view: "roles.view", update: "roles.edit" },
  },
  {
    id: "counties",
    label: "Countries",
    parent: "Locations",
    actions: {
      view: "locations.view",
      add: "locations.create",
      update: "locations.edit",
      delete: "locations.delete",
    },
  },
  {
    id: "cities",
    label: "Cities",
    parent: "Locations",
    actions: {
      view: "locations.view",
      add: "locations.create",
      update: "locations.edit",
      delete: "locations.delete",
    },
  },
  {
    id: "types",
    label: "Profile Types",
    parent: "System",
    actions: {
      view: "types.view",
      add: "types.create",
      update: "types.edit",
      delete: "types.delete",
    },
  },
  {
    id: "settings",
    label: "Settings",
    parent: "System",
    actions: { view: "settings.view", update: "settings.edit" },
  },
  {
    id: "audit",
    label: "Audit Logs",
    parent: "System",
    actions: { view: "audit.view" },
  },
];

function asList(value?: Permission | Permission[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function permissionsFromMatrix(selected: Record<string, MenuAction[]>) {
  const next = new Set<Permission>();
  for (const row of MENU_MATRIX) {
    for (const action of selected[row.id] ?? []) {
      asList(row.actions[action]).forEach((item) => next.add(item));
    }
  }
  return [...next];
}

export function matrixFromPermissions(permissions: readonly string[]) {
  const selected: Record<string, MenuAction[]> = {};
  for (const row of MENU_MATRIX) {
    const actions = (Object.keys(row.actions) as MenuAction[]).filter((action) => {
      const mapped = asList(row.actions[action]);
      return mapped.length > 0 && mapped.every((item) => permissions.includes(item));
    });
    selected[row.id] = actions;
  }
  return selected;
}

export const ALL_PERMISSIONS = [...PERMISSIONS];

export const ROLE_PRESETS: { slug: string; name: string; description: string; permissions: Permission[] }[] = [
  {
    slug: "super_admin",
    name: "Super Admin",
    description: "Full access to every part of the platform.",
    permissions: ALL_PERMISSIONS,
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Manage profiles, content, design, and media.",
    permissions: ALL_PERMISSIONS.filter((item) => !item.startsWith("roles.") && item !== "users.delete"),
  },
  {
    slug: "editor",
    name: "Editor",
    description: "Create and edit profiles and content.",
    permissions: [
      "profiles.view",
      "profiles.create",
      "profiles.edit",
      "profiles.publish",
      "content.view",
      "content.create",
      "content.edit",
      "design.view",
      "design.edit",
      "media.view",
      "media.upload",
      "nfc.view",
      "analytics.view",
      "types.view",
      "locations.view",
    ],
  },
  {
    slug: "content_manager",
    name: "Content Manager",
    description: "Manage menus, services, media, and profile content.",
    permissions: [
      "profiles.view",
      "profiles.edit",
      "content.view",
      "content.create",
      "content.edit",
      "content.delete",
      "media.view",
      "media.upload",
      "media.delete",
    ],
  },
  {
    slug: "viewer",
    name: "Viewer",
    description: "Read-only access.",
    permissions: ["profiles.view", "content.view", "design.view", "media.view", "nfc.view", "analytics.view"],
  },
];

export function permissionLabel(permission: string) {
  const action = permission.split(".")[1] ?? permission;
  return action.charAt(0).toUpperCase() + action.slice(1);
}
