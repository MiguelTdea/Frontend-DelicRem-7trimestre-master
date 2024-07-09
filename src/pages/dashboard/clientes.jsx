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
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

export function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState({
    id_cliente: "",
    nombre: "",
    contacto: "",
    createdAt: "",
    updatedAt: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [clientesPerPage] = useState(5);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/clientes");
      setClientes(response.data);
      setFilteredClientes(response.data);
    } catch (error) {
      console.error("Error fetching clientes:", error);
    }
  };

  useEffect(() => {
    filterClientes();
  }, [search, clientes]);

  const filterClientes = () => {
    const filtered = clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredClientes(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleCreate = () => {
    setSelectedCliente({
      id_cliente: "",
      nombre: "",
      contacto: "",
      createdAt: "",
      updatedAt: ""
    });
    setEditMode(false);
    handleOpen();
  };

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setEditMode(true);
    handleOpen();
  };

  const handleSave = async () => {
    if (!selectedCliente.nombre || !selectedCliente.contacto) {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    const clienteToSave = {
      nombre: selectedCliente.nombre,
      contacto: selectedCliente.contacto
    };

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/clientes/${selectedCliente.id_cliente}`, clienteToSave);
        Swal.fire('¡Actualización exitosa!', 'El cliente ha sido actualizado correctamente.', 'success');
      } else {
        await axios.post("http://localhost:3000/api/clientes", clienteToSave);
        Swal.fire('¡Creación exitosa!', 'El cliente ha sido creado correctamente.', 'success');
      }
      fetchClientes();
      handleOpen();
    } catch (error) {
      console.error("Error saving cliente:", error);
      Swal.fire('Error', 'Hubo un problema al guardar el cliente.', 'error');
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: '¿Está seguro?',
      text: "¡No podrá revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/clientes/${id}`);
          Swal.fire('¡Eliminado!', 'El cliente ha sido eliminado.', 'success');
          fetchClientes();
        } catch (error) {
          console.error("Error deleting cliente:", error);
          Swal.fire('Error', 'Hubo un problema al eliminar el cliente.', 'error');
        }
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCliente({ ...selectedCliente, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (cliente) => {
    setSelectedCliente(cliente);
    handleDetailsOpen();
  };

  const indexOfLastCliente = currentPage * clientesPerPage;
  const indexOfFirstCliente = indexOfLastCliente - clientesPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstCliente, indexOfLastCliente);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="mb-6" color="green" startIcon={<PlusIcon />}>
            Crear Cliente
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
              Lista de Clientes
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentClientes.map((cliente) => (
                <Card key={cliente.id_cliente} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    {cliente.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Contacto: {cliente.contacto}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton color="blue" onClick={() => handleEdit(cliente)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="red" onClick={() => handleDelete(cliente.id_cliente)}>
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="blue-gray" onClick={() => handleViewDetails(cliente)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination
                clientesPerPage={clientesPerPage}
                totalClientes={filteredClientes.length}
                paginate={paginate}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen} className="overflow-auto max-h-[90vh]">
        <DialogHeader>{editMode ? "Editar Cliente" : "Crear Cliente"}</DialogHeader>
        <DialogBody divider className="overflow-auto max-h-[60vh]">
          <Input
            label="Nombre"
            name="nombre"
            value={selectedCliente.nombre}
            onChange={handleChange}
          />
          <Input
            label="Contacto"
            name="contacto"
            value={selectedCliente.contacto}
            onChange={handleChange}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient" color="green" onClick={handleSave}>
            {editMode ? "Guardar Cambios" : "Crear Cliente"}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles del Cliente</DialogHeader>
        <DialogBody divider>
          <table className="min-w-full mt-2">
            <tbody>
              <tr>
                <td className="font-semibold">ID Cliente:</td>
                <td>{selectedCliente.id_cliente}</td>
              </tr>
              <tr>
                <td className="font-semibold">Nombre:</td>
                <td>{selectedCliente.nombre}</td>
              </tr>
              <tr>
                <td className="font-semibold">Contacto:</td>
                <td>{selectedCliente.contacto}</td>
              </tr>
              <tr>
                <td className="font-semibold">Creado:</td>
                <td>{new Date(selectedCliente.createdAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="font-semibold">Actualizado:</td>
                <td>{new Date(selectedCliente.updatedAt).toLocaleString()}</td>
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
const Pagination = ({ clientesPerPage, totalClientes, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalClientes / clientesPerPage); i++) {
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

export default Clientes;
