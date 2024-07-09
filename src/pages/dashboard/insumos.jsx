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
  Select,
  Option,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

export function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState({
    nombre: "",
    stock_actual: 0,
    id_categoria: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [insumosPerPage] = useState(6);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetchInsumos();
    fetchCategorias();
  }, []);

  const fetchInsumos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/insumos");
      setInsumos(response.data);
      setFilteredInsumos(response.data);
    } catch (error) {
      console.error("Error fetching insumos:", error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/categorias_insumo");
      setCategorias(response.data);
    } catch (error) {
      console.error("Error fetching categorias:", error);
    }
  };

  useEffect(() => {
    filterInsumos();
  }, [search, insumos]);

  const filterInsumos = () => {
    const filtered = insumos.filter((insumo) =>
      insumo.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredInsumos(filtered);
  };

  const handleOpen = () => {
    setOpen(!open);
    setErrors({});
  };

  const handleDetailsOpen = () => {
    setDetailsOpen(!detailsOpen);
  };

  const handleEdit = (insumo) => {
    setSelectedInsumo(insumo);
    setEditMode(true);
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedInsumo({
      nombre: "",
      stock_actual: 0,
      id_categoria: "",
    });
    setEditMode(false);
    setOpen(true);
  };

  const handleDelete = async (insumo) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el insumo ${insumo.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/insumos/${insumo.id_insumo}`);
        fetchInsumos();
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "success",
          title: "Insumo eliminado exitosamente"
        });
      } catch (error) {
        console.error("Error deleting insumo:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar el insumo.', 'error');
      }
    }
  };

  const handleSave = async () => {
    try {
      const regex = /^[a-zA-ZáéíóúüÁÉÍÓÚÜ\s]+$/;
      const errors = {};

      if (!selectedInsumo.nombre.trim()) {
        errors.nombre = "El nombre es requerido";
      } else if (!regex.test(selectedInsumo.nombre)) {
        errors.nombre = "El nombre solo puede contener letras y espacios";
      }

      if (!selectedInsumo.id_categoria) {
        errors.id_categoria = "La categoría es requerida";
      }

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }

      if (editMode) {
        await axios.put(`http://localhost:3000/api/insumos/${selectedInsumo.id_insumo}`, selectedInsumo);
        setOpen(false);
        fetchInsumos(); // Refrescar la lista de insumos
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "success",
          title: "Insumo editado exitosamente"
        });
      } else {
        await axios.post("http://localhost:3000/api/insumos", selectedInsumo);
        fetchInsumos();
        setOpen(false);
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "success",
          title: "Insumo creado exitosamente"
        });
      }
    } catch (error) {
      console.error("Error saving insumo:", error);
      Swal.fire('Error', 'Hubo un problema al guardar el insumo.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedInsumo({ ...selectedInsumo, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (insumo) => {
    setSelectedInsumo(insumo);
    setDetailsOpen(true);
  };

  const indexOfLastInsumo = currentPage * insumosPerPage;
  const indexOfFirstInsumo = indexOfLastInsumo - insumosPerPage;
  const currentInsumos = filteredInsumos.slice(indexOfFirstInsumo, indexOfLastInsumo);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" color="green" startIcon={<PlusIcon />}>
            Crear Insumo
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
              Lista de Insumos
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentInsumos.map((insumo) => (
                <Card key={insumo.id_insumo} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    {insumo.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Stock Actual: {insumo.stock_actual}
                  </Typography>
                  <Typography color="blue-gray">
                    Categoría: {insumo.categoriaInsumo?.nombre || 'N/A'}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton className="btnedit" size="sm" onClick={() => handleEdit(insumo)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton className="btncancelarinsumo" size="sm" color="red" onClick={() => handleDelete(insumo)}>
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton className="btnvisualizar" size="sm" onClick={() => handleViewDetails(insumo)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination
                insumosPerPage={insumosPerPage}
                totalInsumos={filteredInsumos.length}
                paginate={paginate}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>{editMode ? "Editar Insumo" : "Crear Insumo"}</DialogHeader>
        <DialogBody divider>
          <Input
            label="Nombre de insumo"
            name="nombre"
            value={selectedInsumo.nombre}
            onChange={handleChange}
            required
            error={errors.nombre}
          />
          {errors.nombre && <Typography color="red">{errors.nombre}</Typography>}
          <Select
            label="Categoría"
            name="id_categoria"
            value={selectedInsumo.id_categoria}
            onChange={(e) => setSelectedInsumo({ ...selectedInsumo, id_categoria: e })}
            required
            error={errors.id_categoria}
          >
            {categorias.map((categoria) => (
              <Option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre}
              </Option>
            ))}
          </Select>
          {errors.id_categoria && <Typography color="red">{errors.id_categoria}</Typography>}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" className="btncancelarinsumom" color="red" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient" className="btnagregar" color="green" onClick={handleSave}>
            {editMode ? "Guardar Cambios" : "Crear Insumo"}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen} className="details-modal">
        <DialogHeader>Detalles del Insumo</DialogHeader>
        <DialogBody>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black">
              <thead className="bg-gradient-to-r from-pink-200 to-pink-500 text-white">
                <tr>
                  <th className="p-2 border-b border-black">Campo</th>
                  <th className="p-2 border-b border-black">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b border-gray-200 font-semibold">Nombre</td>
                  <td className="p-2 border-b border-gray-200">{selectedInsumo.nombre}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-gray-200 font-semibold">Stock Actual</td>
                  <td className="p-2 border-b border-gray-200">{selectedInsumo.stock_actual}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-gray-200 font-semibold">Categoría</td>
                  <td className="p-2 border-b border-gray-200">{selectedInsumo.categoriaInsumo?.nombre || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-gray-200 font-semibold">Creado</td>
                  <td className="p-2 border-b border-gray-200">{selectedInsumo.createdAt ? new Date(selectedInsumo.createdAt).toLocaleString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-gray-200 font-semibold">Actualizado</td>
                  <td className="p-2 border-b border-gray-200">{selectedInsumo.updatedAt ? new Date(selectedInsumo.updatedAt).toLocaleString() : 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" className="btncancelarm" onClick={handleDetailsOpen}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

// Componente de paginación
const Pagination = ({ insumosPerPage, totalInsumos, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalInsumos / insumosPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="flex justify-center items-center space-x-2">
        {pageNumbers.map((number) => (
          <li key={number} className="pagination">
            <Button onClick={() => paginate(number)} className="pagination">
              {number}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Insumos;
