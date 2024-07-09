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

export function ProductoTerminado() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [productosPerPage] = useState(5);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/productos");
      setProductos(response.data);
      setFilteredProductos(response.data);
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  useEffect(() => {
    filterProductos();
  }, [search, productos]);

  const filterProductos = () => {
    const filtered = productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredProductos(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleEdit = (producto) => {
    setSelectedProducto(producto);
    setEditMode(true);
    handleOpen();
  };

  const handleCreate = () => {
    setSelectedProducto({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: 0,
    });
    setEditMode(false);
    handleOpen();
  };

  const handleDelete = async (producto) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el producto ${producto.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/productos/${producto.id_producto}`);
        fetchProductos(); // Refrescar la lista de productos
        Swal.fire('¡Eliminado!', 'El producto ha sido eliminado.', 'success');
      } catch (error) {
        console.error("Error deleting producto:", error);
        Swal.fire('Error', 'Hubo un problema al eliminar el producto.', 'error');
      }
    }
  };

  const handleSave = async () => {
    const productoToSave = {
      ...selectedProducto,
    };

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/productos/${selectedProducto.id_producto}`, productoToSave);
        Swal.fire('¡Actualización exitosa!', 'El producto ha sido actualizado correctamente.', 'success');
      } else {
        await axios.post("http://localhost:3000/api/productos", productoToSave);
        Swal.fire('¡Creación exitosa!', 'El producto ha sido creado correctamente.', 'success');
      }
      fetchProductos(); // Refrescar la lista de productos
      handleOpen();
    } catch (error) {
      console.error("Error saving producto:", error);
      Swal.fire('Error', 'Hubo un problema al guardar el producto.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedProducto({ ...selectedProducto, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (producto) => {
    setSelectedProducto(producto);
    handleDetailsOpen();
  };

  // Obtener productos actuales
  const indexOfLastProducto = currentPage * productosPerPage;
  const indexOfFirstProducto = indexOfLastProducto - productosPerPage;
  const currentProductos = filteredProductos.slice(indexOfFirstProducto, indexOfLastProducto);

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
            Crear Producto
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
              Lista de Productos
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentProductos.map((producto) => (
                <Card key={producto.id_producto} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    {producto.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Descripción: {producto.descripcion}
                  </Typography>
                  <Typography color="blue-gray">
                    Precio: {producto.precio}
                  </Typography>
                  <Typography color="blue-gray">
                    Stock: {producto.stock}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton color="blue" onClick={() => handleEdit(producto)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="red" onClick={() => handleDelete(producto)}>
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="blue-gray" onClick={() => handleViewDetails(producto)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination
                productosPerPage={productosPerPage}
                totalProductos={filteredProductos.length}
                paginate={paginate}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen} className="overflow-auto max-h-[90vh]">
        <DialogHeader>{editMode ? "Editar Producto" : "Crear Producto"}</DialogHeader>
        <DialogBody divider className="overflow-auto max-h-[60vh]">
          <Input
            label="Nombre"
            name="nombre"
            value={selectedProducto.nombre}
            onChange={handleChange}
          />
          <Input
            label="Descripción"
            name="descripcion"
            value={selectedProducto.descripcion}
            onChange={handleChange}
          />
          <Input
            label="Precio"
            name="precio"
            type="number"
            value={selectedProducto.precio}
            onChange={handleChange}
          />
          <Input
            label="Stock"
            name="stock"
            type="number"
            value={selectedProducto.stock}
            onChange={handleChange}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpen}>
            Cancelar
          </Button>
          <Button variant="gradient" color="green" onClick={handleSave}>
            {editMode ? "Guardar Cambios" : "Crear Producto"}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles del Producto</DialogHeader>
        <DialogBody divider>
          <table className="min-w-full">
            <tbody>
              <tr>
                <td className="font-semibold">Nombre:</td>
                <td>{selectedProducto.nombre}</td>
              </tr>
              <tr>
                <td className="font-semibold">Descripción:</td>
                <td>{selectedProducto.descripcion}</td>
              </tr>
              <tr>
                <td className="font-semibold">Precio:</td>
                <td>{selectedProducto.precio}</td>
              </tr>
              <tr>
                <td className="font-semibold">Stock:</td>
                <td>{selectedProducto.stock}</td>
              </tr>
              <tr>
                <td className="font-semibold">Creado:</td>
                <td>{selectedProducto.createdAt ? new Date(selectedProducto.createdAt).toLocaleString() : "N/A"}</td>
              </tr>
              <tr>
                <td className="font-semibold">Actualizado:</td>
                <td>{new Date(selectedProducto.updatedAt).toLocaleString()}</td>
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
const Pagination = ({ productosPerPage, totalProductos, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProductos / productosPerPage); i++) {
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

export default ProductoTerminado;
