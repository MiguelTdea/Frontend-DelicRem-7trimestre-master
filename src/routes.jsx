import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  BellIcon,
  ClockIcon,
  KeyIcon,
  ShoppingBagIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications, Usuarios, Roles, Compras, Proveedores, Insumos, CategoriaInsumos, FichasTecnicas, ProductoTerminado, Ventas, Clientes, Pedidos } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    title: "autoriza",
    layout: "auth",
    visible: false, // Propiedad para indicar que esta ruta no debe ser visible
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
  {
    title: "Configuración",
    layout: "dashboard",
    visible: true,
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <KeyIcon {...icon} />,
        name: "Roles y permisos",
        path: "/roles",
        element: <Roles />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Usuarios",
        path: "/usuarios",
        element: <Usuarios />,
      },
    ],
  },
  
  {
    title: "Compras",
    layout: "dashboard",
    visible: true,
    pages: [
      {
        icon: <UserPlusIcon {...icon} />,
        name: "Gestión de compras",
        path: "/compras",
        element: <Compras />,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Proveedores",
        path: "/proveedores",
        element: <Proveedores />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Insumos",
        path: "/insumos",
        element: <Insumos />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Categoria insumos",
        path: "/categoriainsumos",
        element: <CategoriaInsumos />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Fichas Tecnicas",
        path: "/fichatecnica",
        element: <FichasTecnicas />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Producto terminado",
        path: "/productoterminado",
        element: <ProductoTerminado />,
      },
    ],
  },
  {
    title: "Ventas",
    layout: "dashboard",
    visible: true,
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Gestión de ventas",
        path: "/ventas",
        element: <Ventas />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Clientes",
        path: "/clientes",
        element: <Clientes />,
      },
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Pedidos",
        path: "/pedidos",
        element: <Pedidos />,
      },
    ],
  },
];

export default routes;
