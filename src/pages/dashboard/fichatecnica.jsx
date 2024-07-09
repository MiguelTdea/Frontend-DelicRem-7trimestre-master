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

export function FichasTecnicas() {
  const [fichas, setFichas] = useState([]);
  const [filteredFichas, setFilteredFichas] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState({
    id_producto: "",
    descripcion: "",
    insumos: "",
    detallesFichaTecnicat: [{ id_insumo: "", cantidad: "" }],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [fichasPerPage] = useState(5);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFichas();
  }, []);

  const fetchFichas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/fichastecnicas");
      setFichas(response.data);
      setFilteredFichas(response.data);
    } catch (error) {
      console.error("Error fetching fichas:", error);
    }
  };

  useEffect(() => {
    filterFichas();
  }, [search, fichas]);

  const filterFichas = () => {
    const filtered = fichas.filter((ficha) =>
      ficha.descripcion.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFichas(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (ficha) => {
    setSelectedFicha(ficha);
    setEditMode(true);
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedFicha({
      id_producto: "",
      descripcion: "",
      insumos: "",
      detallesFichaTecnicat: [{ id_insumo: "", cantidad: "" }],
    });
    setEditMode(false);
    handleOpen();
  };

  const handleDelete = async (ficha) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar la ficha técnica ${ficha.descripcion}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/fichastecnicas/${ficha.id_ficha}`);
        fetchFichas(); // Refrescar la lista de fichas técnicas
        Swal.fire('¡Eliminado!', 'La ficha técnica ha sido eliminada.', 'success');
      } catch (error) {
        console.error("Error deleting ficha:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar la ficha técnica.', 'error');
      }
    }
  };

  const handleSave = async () => {
    const fichaToSave = {
      ...selectedFicha,
      detallesFichaTecnica: selectedFicha.detallesFichaTecnicat,
    };

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/fichastecnicas/${selectedFicha.id_ficha}`, fichaToSave);
        Swal.fire('¡Actualización exitosa!', 'La ficha técnica ha sido actualizada correctamente.', 'success');
      } else {
        await axios.post("http://localhost:3000/api/fichastecnicas", fichaToSave);
        Swal.fire('¡Creación exitosa!', 'La ficha técnica ha sido creada correctamente.', 'success');
      }
      fetchFichas(); // Refrescar la lista de fichas técnicas
      handleOpen();
    } catch (error) {
      console.error("Error saving ficha:", error);
      Swal.fire('Error', 'Hubo un problema al guardar la ficha técnica.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedFicha({ ...selectedFicha, [name]: value });
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...selectedFicha.detallesFichaTecnicat];
    detalles[index][name] = value;
    setSelectedFicha({ ...selectedFicha, detallesFichaTecnicat: detalles });
  };

  const handleAddDetalle = () => {
    setSelectedFicha({
      ...selectedFicha,
      detallesFichaTecnicat: [...selectedFicha.detallesFichaTecnicat, { id_insumo: "", cantidad: "" }]
    });
  };

  const handleRemoveDetalle = (index) => {
    const detalles = [...selectedFicha.detallesFichaTecnicat];
    detalles.splice(index, 1);
    setSelectedFicha({ ...selectedFicha, detallesFichaTecnicat: detalles });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (ficha) => {
    setSelectedFicha(ficha);
    handleDetailsOpen();
  };

  // Obtener fichas actuales
  const indexOfLastFicha = currentPage * fichasPerPage;
  const indexOfFirstFicha = indexOfLastFicha - fichasPerPage;
  const currentFichas = filteredFichas.slice(indexOfFirstFicha, indexOfLastFicha);

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
            Crear Ficha Técnica
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por descripción"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Fichas Técnicas
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentFichas.map((ficha) => (
                <Card key={ficha.id_ficha} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    {ficha.descripcion}
                  </Typography>
                  <Typography color="blue-gray">
                    Insumos: {ficha.insumos}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton color="blue" onClick={() => handleEdit(ficha)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="red" onClick={() => handleDelete(ficha)}>
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="blue-gray" onClick={() => handleViewDetails(ficha)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination
                fichasPerPage={fichasPerPage}
                totalFichas={filteredFichas.length}
                paginate={paginate}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen} className="overflow-auto max-h-[90vh]">
        <DialogHeader>{editMode ? "Editar Ficha Técnica" : "Crear Ficha Técnica"}</DialogHeader>
        <DialogBody divider className="overflow-auto max-h-[60vh]">
          <Input
            label="ID Producto"
            name="id_producto"
            type="number"
            value={selectedFicha.id_producto}
            onChange={handleChange}
          />
          <Input
            label="Descripción"
            name="descripcion"
            value={selectedFicha.descripcion}
            onChange={handleChange}
          />
          <Input
            label="Insumos"
            name="insumos"
            value={selectedFicha.insumos}
            onChange={handleChange}
          />
          <Typography variant="h6" color="blue-gray" className="mt-4">
            Detalles de Insumos
          </Typography>
          {selectedFicha.detallesFichaTecnicat.map((detalle, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center">
              <Input
                label="ID Insumo"
                name="id_insumo"
                type="number"
                value={detalle.id_insumo}
                onChange={(e) => handleDetalleChange(index, e)}
              />
              <Input
                label="Cantidad"
                name="cantidad"
                type="number"
                value={detalle.cantidad}
                onChange={(e) => handleDetalleChange(index, e)}
              />
              <IconButton
                color="red"
                onClick={() => handleRemoveDetalle(index)}
                className="mt-6"
              >
                <TrashIcon className="h-5 w-5" />
              </IconButton>
            </div>
          ))}
          <Button color="blue" onClick={handleAddDetalle}>
            Agregar Detalle
          </Button>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient" color="green" onClick={handleSave}>
            {editMode ? "Guardar Cambios" : "Crear Ficha Técnica"}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles de la Ficha Técnica</DialogHeader>
        <DialogBody divider>
          <table className="min-w-full">
            <tbody>
              <tr>
                <td className="font-semibold">ID Producto:</td>
                <td>{selectedFicha.id_producto}</td>
              </tr>
              <tr>
                <td className="font-semibold">Descripción:</td>
                <td>{selectedFicha.descripcion}</td>
              </tr>
              <tr>
                <td className="font-semibold">Insumos:</td>
                <td>{selectedFicha.insumos}</td>
              </tr>
              <tr>
                <td className="font-semibold">Creado:</td>
                <td>{new Date(selectedFicha.createdAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td className="font-semibold">Actualizado:</td>
                <td>{new Date(selectedFicha.updatedAt).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4">
            <Typography variant="h6" color="blue-gray">
              Detalles de Insumos
            </Typography>
            <table className="min-w-full mt-2">
              <thead>
                <tr>
                  <th className="font-semibold">ID Insumo</th>
                  <th className="font-semibold">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {selectedFicha.detallesFichaTecnicat && selectedFicha.detallesFichaTecnicat.map((detalle) => (
                  <tr key={detalle.id_detalle_ficha}>
                    <td>{detalle.id_insumo}</td>
                    <td>{detalle.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
const Pagination = ({ fichasPerPage, totalFichas, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalFichas / fichasPerPage); i++) {
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

export default FichasTecnicas;
