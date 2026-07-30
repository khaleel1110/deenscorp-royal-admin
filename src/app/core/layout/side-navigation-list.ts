import {NavigationType, SubNavigationType} from "../shared/models/navigation-type.model";

export const GmsNavigationList: NavigationType[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    matches: 'dashboard',
  },

  {
    label: 'Courses',
    icon: 'activities-monitoring',
    badge: {
      tone: 'badge-tone-secondary',
      text: '0',
    },
    subNavigationItems: [
      {
        label: 'Dashboard',
        disabled: true,

        onClick: () => {},
        matches: 'dashboard',
      },
      {
        label: 'View courses list',
        disabled: true,
        matchExact: false,
        onClick: () => {},
        matches: 'dashboard',
      },
      {
        label: 'Add new Course',
        disabled: true,
        onClick: () => {},
        matches: 'course/new/edit',
      },
    ],
    matches: 'course',
  },

  {
    label: 'Training Location',
    icon: 'geo-tagging',

    onClick: () => {},
    subNavigationItems: [
      {
        label: 'Dashboard',
        disabled: true,

        onClick: () => {},
        matches: 'farm-geo-tagging',
      },
      {
        label: 'View Location list',
        disabled: true,
        matchExact: false,
        onClick: () => {},
        matches: 'farm-geo-tagging/list',
      },
      /*   {
           label: 'Add farm plot',
           disabled: true,
           onClick: () => {
           },
           matches: 'farm-geo-tagging/new/edit',},*/
    ],
    matches: 'farm-geo-tagging',
  },

  {
    label: ' Distribution',
    disabled: true,
    icon: 'input-distribution',
    onClick: () => {},
    subNavigationItems: [
      {
        label: 'Dashboard',
        disabled: true,

        onClick: () => {},
        matches: 'input-distribution',
      },
      {
        label: 'View distribution records',
        disabled: true,
        matchExact: false,
        onClick: () => {},
        matches: 'input-distribution/list',
      },
      /*   {
           label: 'Record a distributed input',
           disabled: true,
           onClick: () => {
           },
           matches: 'input-distribution/new/edit',},*/
    ],
    matches: 'input-distribution',
  },
  {
    label: ' Blogs ',
    disabled: true,
    icon: 'SoftPackMajor',
    onClick: () => {},
    subNavigationItems: [
      {
        label: 'Dashboard',
        disabled: true,

        onClick: () => {},
        matches: 'activities-monitoring',
      },
      {
        label: 'View activities list',
        disabled: true,
        matchExact: false,
        onClick: () => {},
        matches: 'activities-monitoring/list',
      },
      /*    {
            label: 'Report new activity Manually',
            disabled: true,
            onClick: () => {
            },
            matches: 'activities-monitoring/new/edit',},*/
    ],
    matches: 'activities-monitoring',
  },
  {
    label: 'Reported ',
    disabled: true,
    icon: 'reported-incidents',
    badge: {
      tone: 'badge-tone-danger',
      text: '0',
    },

    onClick: () => {},
    subNavigationItems: [
      {
        label: 'Dashboard',
        disabled: true,
        icon: 'reported-incidents',
        onClick: () => {},
        matches: 'reported-incidents',
      },
      {
        label: 'Incidents list',
        disabled: true,
        matchExact: false,
        icon: 'reported-incidents',
        onClick: () => {},
        matches: 'reported-incidents/list',
      },
      /* {
         label: 'Add new incident',
         disabled: true,
         icon: 'reported-incidents',
         onClick: () => {
         },
         matches: 'reported-incidents/new/edit',},*/
    ],
    matches: 'reported-incidents',
  },
  /*  {
    label: 'Harvest Recovery',
    disabled: true,
    icon: 'inventory-management',
    subNavigationItems: [
      {
        label: 'Dashboard',
        disabled: true,

        onClick: () => {},
        matches: 'recovery-collections',
      },
      {
        label: 'Recovery Transactions',
        disabled: true,
        matchExact: false,
        onClick: () => {},
        matches: 'recovery-collections/list',
      },
      {
        label: 'Recovery Report',
        disabled: true,
        matchExact: false,
        onClick: () => {},
        matches: 'recovery-collections/grouped-report',
      },
    ],
    onClick: () => {},
    matches: 'recovery-collections',
  },
  {
    label: 'Field agents',
    disabled: true,
    icon: 'Field-agents',
    onClick: () => {},
    subNavigationItems: [
      {
        label: 'View agents list',
        disabled: true,
        matchExact: false,
        onClick: () => {},
        matches: 'field-agents/list',
      },
      /!*{
        label: 'Add new agent',
        disabled: true,
        onClick: () => {
        },
        matches: 'field-agents/new/edit',
      },*!/
    ],
    matches: 'field-agents/list',
  },*/
  {
    label: 'Settings',
    icon: 'settings',
    matches: 'settings',
  },
];
export const GmsSubNavigationList: SubNavigationType [] = [
  {
    label: 'Deenscorp Mail',
    href: 'https://mail.live.com',
    iconUrl: 'outlook.svg',
  },
  {
    label: 'Google drive',
    href: 'https://mail.live.com',
    iconUrl: '/google-drive.svg',
  },

]

/*export const subNavigationList: NavigationType[] = [
  {
    label: 'Zoho mail',
    disabled: true,
    icon: 'AnalyticsMajor',
    onClick: () => {
    },
    matches: 'reports',},
  {
    label: 'Google drive',
    disabled: true,
    icon: 'SettingsMajor',
    onClick: () => {
    },
    matches: 'settings',},
  {
    label: 'Debug Customers',
    disabled: true,
    icon: 'AnalyticsMajor',
    onClick: () => {
    },
    matches: 'customers/list',},
  {
    label: 'Debug Invoice',
    disabled: true,
    icon: 'AnalyticsMajor',
    onClick: () => {
    },
    matches: 'invoice/list',},

  {
    label: 'Debug Sales Receipts',
    disabled: true,
    icon: 'AnalyticsMajor',
    onClick: () => {
    },
    matches: 'sales-receipt/list',},

  {
    label: 'Debug Quotation',
    disabled: true,
    icon: 'AnalyticsMajor',
    onClick: () => {
    },
    matches: 'quotation/list',},

  {
    label: 'Debug Dashboard',
    disabled: true,
    icon: 'AnalyticsMajor',
    onClick: () => {
    },
    matches: 'debug-dashboard',},
  ]*/
