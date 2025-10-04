import {
  LayoutDashboardIcon,BorderAllIcon,
  AlertCircleIcon,
  CircleDotIcon,
  BoxMultiple1Icon,
  LoginIcon, MoodHappyIcon, ApertureIcon, UserPlusIcon
} from 'vue-tabler-icons';

export interface menu {
  header?: string;
  title?: string;
  icon?: any;
  to?: string;
  chip?: string;
  BgColor?: string;
  chipBgColor?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  { header: 'Inicio' },
  {
    title: 'Dashboard',
    icon: LayoutDashboardIcon,
    BgColor: 'primary',
    to: '/'
  },
  { header: 'Temática' },
  {
    title: "Convivencia pacífica y armónica",
    icon: CircleDotIcon,
    BgColor: 'primary',
    to: "/convivencia/pacifica",
  },
  {
    title: "Embarazo en la adolescencia",
    icon: AlertCircleIcon,
    BgColor: 'primary',
    to: "/embarazo/adolecente",    
  },
  {
    title: "Violencia jerárquica",
    icon: BoxMultiple1Icon,
    BgColor: 'primary',
    to: "/violencia/jerarquica",
  },
  // {
  //   title: "Violencia entre pares",
  //   icon: BoxMultiple1Icon,
  //   BgColor: 'primary',
  //   to: "/violencia/entre/pares",
  // },
  // {
  //   title: "Violencia en la familia",
  //   icon: BoxMultiple1Icon,
  //   BgColor: 'primary',
  //   to: "/violencia/familiar",
  // },
  // {
  //   title: "Vida libre de violencia",
  //   icon: BoxMultiple1Icon,
  //   BgColor: 'primary',
  //   to: "/libre/violencia",
  // },
  // {
  //   title: "Cumplimiento de derechos",
  //   icon: BorderAllIcon,
  //   BgColor: 'primary',
  //   to: "/cumplimiento",
  // },
  // {
  //     title: 'Despatriarcalizacion',
  //     icon: UserPlusIcon,
  //     BgColor: 'primary',
  //     to: '/despatriarcalizacion'
  // },

//   { header: 'Auth' },
//   {
//     title: 'Login',
//     icon: LoginIcon,
//     BgColor: 'primary',
//     to: '/auth/login'
// },
// {
//     title: 'Register',
//     icon: UserPlusIcon,
//     BgColor: 'primary',
//     to: '/auth/register'
// },
// { header: 'Extra' },
// {
//     title: 'Icons',
//     icon: MoodHappyIcon,
//     BgColor: 'primary',
//     to: '/icons'
// },
// {
//     title: 'Sample Page',
//     icon: ApertureIcon,
//     BgColor: 'primary',
//     to: '/sample-page'
// },

];

export default sidebarItem;
