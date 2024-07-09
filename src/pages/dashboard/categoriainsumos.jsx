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

export function CategoriaInsumos() {
  const [categorias, setCategorias] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState({
    nombre: "",
    descripcion: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriasPerPage] = useState(6);
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/categorias_insumo");
      setCategorias(response.data);
      setFilteredCategorias(response.data);
    } catch (error) {
      console.error("Error fetching categorias:", error);
    }
  };

  useEffect(() => {
    filterCategorias();
  }, [search, categorias]);

  const filterCategorias = () => {
    const filtered = categorias.filter((categoria) =>
      categoria.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCategorias(filtered);
  };

  const handleOpen = () => {
    setOpen(!open);
    setErrors({});
  };

  const handleDetailsOpen = () => {
    setDetailsOpen(!detailsOpen);
  };

  const handleEdit = (categoria) => {
    setSelectedCategoria(categoria);
    setEditMode(true);
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategoria({
      nombre: "",
      descripcion: "",
    });
    setEditMode(false);
    setOpen(true);
  };

  const handleDelete = async (categoria) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar la categoría ${categoria.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/categorias_insumo/${categoria.id_categoria}`);
        fetchCategorias();
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
          title: "Categoría eliminada exitosamente"
        });
      } catch (error) {
        console.error("Error deleting categoria:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar la categoría.', 'error');
      }
    }
  };

  const handleSave = async () => {
    try {
      const regex = /^[a-zA-ZáéíóúüÁÉÍÓÚÜ\s]+$/;
      const errors = {};

      if (!selectedCategoria.nombre.trim()) {
        errors.nombre = "El nombre es requerido";
      } else if (!regex.test(selectedCategoria.nombre)) {
        errors.nombre = "El nombre solo puede contener letras y espacios";
      }

      if (!selectedCategoria.descripcion.trim()) {
        errors.descripcion = "La descripción es requerida";
      }

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }

      if (editMode) {
        await axios.put(`http://localhost:3000/api/categorias_insumo/${selectedCategoria.id_categoria}`, selectedCategoria);
        setOpen(false);
        fetchCategorias();
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
          title: "Categoría editada exitosamente"
        });
      } else {
        await axios.post("http://localhost:3000/api/categorias_insumo", selectedCategoria);
        fetchCategorias();
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
          title: "Categoría creada exitosamente"
        });
      }
    } catch (error) {
      console.error("Error saving categoria:", error);
      Swal.fire('Error', 'Hubo un problema al guardar la categoría.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCategoria({ ...selectedCategoria, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (categoria) => {
    setSelectedCategoria(categoria);
    setDetailsOpen(true);
  };

  const indexOfLastCategoria = currentPage * categoriasPerPage;
  const indexOfFirstCategoria = indexOfLastCategoria - categoriasPerPage;
  const currentCategorias = filteredCategorias.slice(indexOfFirstCategoria, indexOfLastCategoria);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-2 h-32 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="btnagregar" color="green" startIcon={<PlusIcon />}>
            Crear Categoría
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
              Lista de Categorías de Insumo
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentCategorias.map((categoria) => (
                <Card key={categoria.id_categoria} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    {categoria.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Descripción: {categoria.descripcion}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton className="btnedit" size="sm" onClick={() => handleEdit(categoria)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton className="btncancelarinsumo" size="sm" color="red" onClick={() => handleDelete(categoria)}>
                      <TrashIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton className="btnvisualizar" size="sm" onClick={() => handleViewDetails(categoria)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination
                categoriasPerPage={categoriasPerPage}
                totalCategorias={filteredCategorias.length}
                paginate={paginate}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>{editMode ? "Editar Categoría" : "Crear Categoría"}</DialogHeader>
        <DialogBody divider>
          <Input
            label="Nombre de la categoría"
            name="nombre"
            value={selectedCategoria.nombre}
            onChange={handleChange}
            required
            error={errors.nombre}
          />
          {errors.nombre && <Typography color="red">{errors.nombre}</Typography>}
          <Input
            label="Descripción"
            name="descripcion"
            value={selectedCategoria.descripcion}
            onChange={handleChange}
            required
            error={errors.descripcion}
          />
          {errors.descripcion && <Typography color="red">{errors.descripcion}</Typography>}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" className="btncancelarinsumom" color="red" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient" className="btnagregar" color="green" onClick={handleSave}>
            {editMode ? "Guardar Cambios" : "Crear Categoría"}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen} className="details-modal">
        <DialogHeader>Detalles de la Categoría</DialogHeader>
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
                  <td className="p-2 border-b border-gray-200">{selectedCategoria.nombre}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-gray-200 font-semibold">Descripción</td>
                  <td className="p-2 border-b border-gray-200">{selectedCategoria.descripcion}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-gray-200 font-semibold">Creado</td>
                  <td className="p-2 border-b border-gray-200">{selectedCategoria.createdAt ? new Date(selectedCategoria.createdAt).toLocaleString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td className="p-2 border-b border-gray-200 font-semibold">Actualizado</td>
                  <td className="p-2 border-b border-gray-200">{selectedCategoria.updatedAt ? new Date(selectedCategoria.updatedAt).toLocaleString() : 'N/A'}</td>
                </tr>
                {selectedCategoria.insumos && (
                  <tr>
                    <td className="p-2 border-b border-gray-200 font-semibold">Insumos</td>
                    <td className="p-2 border-b border-gray-200">
                      {selectedCategoria.insumos.map((insumo) => (
                        <div key={insumo.id_insumo}>
                          {insumo.nombre} (Stock: {insumo.stock_actual})
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
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
const Pagination = ({ categoriasPerPage, totalCategorias, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalCategorias / categoriasPerPage); i++) {
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

export default CategoriaInsumos;
