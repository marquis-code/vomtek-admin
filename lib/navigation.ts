export interface NavItem {
  label: string
  to: string
  icon: string
  exact?: boolean
  permission?: string[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/', icon: 'LayoutDashboard', exact: true },
      { label: 'Analytics', to: '/analytics', icon: 'ChartNoAxesCombined' },
    ],
  },
  {
    label: 'Revenue',
    items: [
      { label: 'Quotes', to: '/quotes', icon: 'FileText' },
      { label: 'Messages', to: '/messages', icon: 'Inbox' },
      { label: 'Applications', to: '/applications', icon: 'UserRoundSearch' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Standard systems', to: '/catalog', icon: 'PanelsTopLeft' },
      { label: 'Jobs', to: '/jobs', icon: 'Briefcase' },
      { label: 'Media', to: '/media', icon: 'Images' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Field notes', to: '/articles', icon: 'Newspaper' },
      { label: 'Subscribers', to: '/subscribers', icon: 'Mail' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Site settings', to: '/settings', icon: 'Settings2', permission: ['owner', 'admin'] },
      { label: 'Team', to: '/team', icon: 'Users', permission: ['owner', 'admin'] },
      { label: 'Audit log', to: '/audit', icon: 'ScrollText', permission: ['owner', 'admin'] },
    ],
  },
]

export const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/analytics': 'Analytics',
  '/quotes': 'Quotes',
  '/messages': 'Messages',
  '/applications': 'Applications',
  '/catalog': 'Standard systems',
  '/jobs': 'Jobs',
  '/media': 'Media library',
  '/articles': 'Field notes',
  '/subscribers': 'Subscribers',
  '/settings': 'Site settings',
  '/team': 'Team',
  '/audit': 'Audit log',
  '/account': 'Account',
}
