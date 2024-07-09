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
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

export function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState({
    nombre: "",
    contacto: "",
    asesor: "",  // Añadimos el campo asesor aquí
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [proveedoresPerPage] = useState(5);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/proveedores");
      setProveedores(response.data);
      setFilteredProveedores(response.data);
    } catch (error) {
      console.error("Error fetching proveedores:", error);
    }
  };

  useEffect(() => {
    filterProveedores();
  }, [search, proveedores]);

  const filterProveedores = () => {
    const filtered = proveedores.filter((proveedor) =>
      proveedor.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProveedores(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setEditMode(true);
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedProveedor({
      nombre: "",
      contacto: "",
      asesor: "",  // Añadimos el campo asesor aquí
    });
    setEditMode(false);
    handleOpen();
  };

  const handleDelete = async (proveedor) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar al proveedor ${proveedor.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/proveedores/${proveedor.id_proveedor}`);
        fetchProveedores(); // Refrescar la lista de proveedores
        Swal.fire('¡Eliminado!', 'El proveedor ha sido eliminado.', 'success');
      } catch (error) {
        console.error("Error deleting proveedor:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar el proveedor.', 'error');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/proveedores/${selectedProveedor.id_proveedor}`, selectedProveedor);
      } else {
        await axios.post("http://localhost:3000/api/proveedores", selectedProveedor);
      }
      fetchProveedores(); // Refrescar la lista de proveedores
      handleOpen();
    } catch (error) {
      console.error("Error saving proveedor:", error);
      Swal.fire('Error', 'Hubo un problema al guardar el proveedor.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProveedor({ ...selectedProveedor, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (proveedor) => {
    setSelectedProveedor(proveedor);
    handleDetailsOpen();
  };

  // Obtener proveedores actuales
  const indexOfLastProveedor = currentPage * proveedoresPerPage;
  const indexOfFirstProveedor = indexOfLastProveedor - proveedoresPerPage;
  const currentProveedores = filteredProveedores.slice(indexOfFirstProveedor, indexOfLastProveedor);

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
            Crear Proveedor
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
              Lista de Proveedores
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentProveedores.map((proveedor) => (
                <Card key={proveedor.id_proveedor} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    {proveedor.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Contacto: {proveedor.contacto}
                  </Typography>
                  <Typography color="blue-gray">
                    Asesor: {proveedor.asesor || "No asignado"}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton color="blue" onClick={() => handleEdit(proveedor)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="red" onClick={() => handleDelete(proveedor)}>
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="blue-gray" onClick={() => handleViewDetails(proveedor)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination
                proveedoresPerPage={proveedoresPerPage}
                totalProveedores={filteredProveedores.length}
                paginate={paginate}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>{editMode ? "Editar Proveedor" : "Crear Proveedor"}</DialogHeader>
        <DialogBody divider>
          <Input
            label="Nombre"
            name="nombre"
            value={selectedProveedor.nombre}
            onChange={handleChange}
          />
          <Input
            label="Contacto"
            name="contacto"
            value={selectedProveedor.contacto}
            onChange={handleChange}
          />
          <Input
            label="Asesor"
            name="asesor"
            value={selectedProveedor.asesor || ""}
            onChange={handleChange}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient" color="green" onClick={handleSave}>
            {editMode ? "Guardar Cambios" : "Crear Proveedor"}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles del Proveedor</DialogHeader>
        <DialogBody divider>
          <table className="min-w-full">
            <tbody>
              <tr>
                <td className="font-semibold">Nombre:</td>
                <td>{selectedProveedor.nombre}</td>
              </tr>
              <tr>
                <td className="font-semibold">Contacto:</td>
                <td>{selectedProveedor.contacto}</td>
              </tr>
              <tr>
                <td className="font-semibold">Asesor:</td>
                <td>{selectedProveedor.asesor || "No asignado"}</td>
              </tr>
              <tr>
                <td className="font-semibold">Creado:</td>
                <td>{new Date(selectedProveedor.createdAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="font-semibold">Actualizado:</td>
                <td>{new Date(selectedProveedor.updatedAt).toLocaleString()}</td>
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
const Pagination = ({ proveedoresPerPage, totalProveedores, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProveedores / proveedoresPerPage); i++) {
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

export default Proveedores;
