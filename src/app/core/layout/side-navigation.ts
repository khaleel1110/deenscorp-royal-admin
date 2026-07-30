export interface TrBadge {
  value: string,
  type: 'primary' | 'secondary' | 'tertiary'
}


export interface SideNavigation {
  icon: string,
  title: string,
  route: string,
  isDisabled: boolean,
  badge: TrBadge | null,
  children: SideNavigation[]

}


export const SideNavigationData: SideNavigation [] = [
  {
    icon: 'DataVisualizationMajor.svg',
    title: 'Dashboard',
    route: 'dashboard',
    isDisabled: false,
    badge: null,
    children: []

  },


  {
    icon: 'CustomerPlusMajor.svg',
    title: 'Bookings',
    route: 'booking',
    isDisabled: false,
    badge: null,
    children: []

  },
/*  {
    icon: 'SearchMajor.svg',
    title: 'Search',
    route: '/admin/search',
    isDisabled: false,
    badge: null,
    children: []

  },*/
/*  {
    icon: 'InventoryMajor.svg',
    title: 'Properties',
    route: '/admin/properties',
    isDisabled: false,
    badge: null,
    children: []

  },*/
/*  {
    icon: 'TeamMajor.svg',
    title: 'Leads',
    route: '/admin/leads',
    isDisabled: false,
    badge: null,
    children: []

  },
  {
    icon: 'UpdateInventoryMajor.svg',
    title: 'Realty Academy',
    route: '/admin/learning-academy',
    isDisabled: false,
    badge: null,
    children: []

  },
  {
    icon: 'EnvelopeMajor.svg',
    title: 'Job posts',
    route: '/admin/career-job-posts',
    isDisabled: false,
    badge: null,
    children: []

  },*/
 /* {
    icon: 'IconsMajor.svg',
    title: 'Report',
    route: '/admin/list-of-services',
    isDisabled: false,
    badge: null,
    children: []

  },*/
  {
    icon: 'LegalMajor.svg',
    title: 'Blogs',
    route: '/admin/news-and-press',
    isDisabled: false,
    badge: null,
    children: []

  }
];


export const SideNavigationFooter: SideNavigation [] = [
  {
    icon: 'DraftOrdersMajor.svg',
    title: 'Home Settings',
    route: '',
    isDisabled: true,
    badge: null,
    children: []

  },
  {
    icon: 'ChannelsMajor.svg',
    title: 'Site information',
    route: '/admin/site',
    isDisabled: false,
    badge: null,
    children: []

  },
  /*  {
      icon: 'bi-book',
      title: 'Documentation',
      route: '/admin/docs',
      isDisabled: false,
      badge: null,
      children: []

    }*/


];
