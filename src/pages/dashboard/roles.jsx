import {
  Card,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  IconButton,
  Checkbox,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

export function Roles() {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState({
    nombre: "",
    permisosRol: [],
  });
  const [permisos, setPermisos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rolesPerPage] = useState(5);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRoles();
    fetchPermisos();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/roles");
      setRoles(response.data);
      setFilteredRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchPermisos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/permisos");
      setPermisos(response.data);
    } catch (error) {
      console.error("Error fetching permisos:", error);
    }
  };

  useEffect(() => {
    filterRoles();
  }, [search, roles]);

  const filterRoles = () => {
    const filtered = roles.filter((role) =>
      role.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredRoles(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (role) => {
    setSelectedRole({
      ...role,
      permisosRol: role.permisosRol ? role.permisosRol.map(p => p.id_permiso) : [],
    });
    setEditMode(true);
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedRole({
      nombre: "",
      permisosRol: [],
    });
    setEditMode(false);
    handleOpen();
  };

  const handleDelete = async (role) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el rol ${role.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/roles/${role.id_rol}`);
        fetchRoles(); // Refrescar la lista de roles
        Swal.fire('¡Eliminado!', 'El rol ha sido eliminado.', 'success');
      } catch (error) {
        console.error("Error deleting role:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar el rol.', 'error');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/roles/${selectedRole.id_rol}`, {
          nombre: selectedRole.nombre,
          permisos: selectedRole.permisosRol,
        });
      } else {
        await axios.post("http://localhost:3000/api/roles", {
          nombre: selectedRole.nombre,
          permisos: selectedRole.permisosRol,
        });
      }
      fetchRoles(); // Refrescar la lista de roles
      handleOpen();
    } catch (error) {
      console.error("Error saving role:", error);
      Swal.fire('Error', 'Hubo un problema al guardar el rol.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedRole({ ...selectedRole, [name]: value });
  };

  const handlePermissionChange = (id_permiso) => {
    const { permisosRol } = selectedRole;
    if (permisosRol.includes(id_permiso)) {
      setSelectedRole({ ...selectedRole, permisosRol: permisosRol.filter(p => p !== id_permiso) });
    } else {
      setSelectedRole({ ...selectedRole, permisosRol: [...permisosRol, id_permiso] });
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (role) => {
    setSelectedRole({
      ...role,
      permisosRol: role.permisosRol ? role.permisosRol : [],
    });
    handleDetailsOpen();
  };

  // Obtener roles actuales
  const indexOfLastRole = currentPage * rolesPerPage;
  const indexOfFirstRole = indexOfLastRole - rolesPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="mb-6" color="green" startIcon={<PlusIcon />}>
            Crear Rol
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por nombre"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Roles
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentRoles.map((role) => (
                <Card key={role.id_rol} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    {role.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Permisos: {(role.permisosRol ? role.permisosRol : []).map(p => p.nombre_permiso).join(', ')}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton color="blue" onClick={() => handleEdit(role)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="red" onClick={() => handleDelete(role)}>
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="blue-gray" onClick={() => handleViewDetails(role)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination
                rolesPerPage={rolesPerPage}
                totalRoles={filteredRoles.length}
                paginate={paginate}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>{editMode ? "Editar Rol" : "Crear Rol"}</DialogHeader>
        <DialogBody divider>
          <Input
            label="Nombre"
            name="nombre"
            value={selectedRole.nombre}
            onChange={handleChange}
          />
          <Typography variant="h6" color="blue-gray" className="mt-4">
            Permisos
          </Typography>
          <div className="grid grid-cols-2 gap-2">
            {permisos.map((permiso) => (
              <Checkbox
                key={permiso.id_permiso}
                label={permiso.nombre_permiso}
                checked={selectedRole.permisosRol.includes(permiso.id_permiso)}
                onChange={() => handlePermissionChange(permiso.id_permiso)}
              />
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient" color="green" onClick={handleSave}>
            {editMode ? "Guardar Cambios" : "Crear Rol"}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles del Rol</DialogHeader>
        <DialogBody divider>
          <table className="min-w-full">
            <tbody>
              <tr>
                <td className="font-semibold">Nombre:</td>
                <td>{selectedRole.nombre}</td>
              </tr>
              <tr>
                <td className="font-semibold">Permisos:</td>
                <td>{(selectedRole.permisosRol ? selectedRole.permisosRol : []).map(p => p.nombre_permiso).join(', ')}</td>
              </tr>
              <tr>
                <td className="font-semibold">Creado:</td>
                <td>{new Date(selectedRole.createdAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="font-semibold">Actualizado:</td>
                <td>{new Date(selectedRole.updatedAt).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" color="blue-gray" onClick={handleDetailsOpen}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

// Componente de paginación
const Pagination = ({ rolesPerPage, totalRoles, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalRoles / rolesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination flex space-x-2">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item">
            <Button
              onClick={() => paginate(number)}
              className="page-link"
            >
              {number}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Roles;
