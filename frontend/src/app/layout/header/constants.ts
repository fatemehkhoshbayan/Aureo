export interface NavLink {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export const NAV_LINKS: NavLink[] = [
  {
    id: 'services',
    label: 'Services',
    href: '/',
    icon: 'icon-[lucide--camera]',
  },
  {
    id: 'my-bookings',
    label: 'My Bookings',
    href: '/my-bookings',
    icon: 'icon-[lucide--calendar]',
  },
  {
    id: 'my-profile',
    label: 'My Profile',
    href: '/my-profile',
    icon: 'icon-[lucide--user]',
  },
];
