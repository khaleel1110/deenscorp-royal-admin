export interface NavigationType {
  label: string;
  icon?: string;
  matches: string;
  matchExact?: boolean;
  disabled?: boolean;
  badge?: {
    tone: string;
    text: string;
  };
  secondaryAction?: {
    accessibilityLabel?: string;
    icon: string;
    tooltip: {
      content: string;
    };
  };
  subNavigationItems?: NavigationType[];
  collapsedSubNavigationItems?: boolean;
  onClick?: () => void;

  href?: string;
  iconUrl?: string;
}

export interface SubNavigationType {
  label: string;
  href?: string;
  onClick?: (onCallBack?: () => void) => void;
  routerLink?: string;
  iconUrl?: string;
}




export interface NavigationType {
  label: string;
  icon?: string;
  matches: string;
  matchExact?: boolean;
  disabled?: boolean;
  badge?: {
    tone: string;
    text: string;
  };
  secondaryAction?: {
    accessibilityLabel?: string;
    icon: string;
    tooltip: {
      content: string;
    };
  };
  subNavigationItems?: NavigationType[];
  collapsedSubNavigationItems?: boolean;
  onClick?: () => void;

  href?: string;
  iconUrl?: string;
}

export interface SubNavigationType {
  label: string;
  href?: string;
  onClick?: (onCallBack?: () => void) => void;
  routerLink?: string;
  iconUrl?: string;
}
