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
import { PlusIcon, EyeIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

export function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState({
    id_cliente: "",
    fecha_entrega: "",
    estado: "pendiente",
    pagado: false,
    detallesPedido: [],
    clientesh: { nombre: "", contacto: "" }
  });
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pedidosPerPage] = useState(5);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/pedidos");
      setPedidos(response.data);
      setFilteredPedidos(response.data);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
    }
  };

  useEffect(() => {
    filterPedidos();
  }, [search, pedidos]);

  const filterPedidos = () => {
    const filtered = pedidos.filter((pedido) =>
      pedido.clientesh.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPedidos(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleCreate = () => {
    setSelectedPedido({
      id_cliente: "",
      fecha_entrega: "",
      estado: "pendiente",
      pagado: false,
      detallesPedido: [],
      clientesh: { nombre: "", contacto: "" }
    });
    setEditMode(false);
    handleOpen();
  };

  const handleEdit = (pedido) => {
    setSelectedPedido({
      ...pedido,
      detallesPedido: pedido.detallesPedido || [],
      clientesh: pedido.clientesh || { nombre: "", contacto: "" },
      fecha_entrega: pedido.fecha_entrega.split('T')[0] // Ajustar fecha para el campo de fecha
    });
    setEditMode(true);
    handleOpen();
  };

  const handleSave = async () => {
    if (!selectedPedido.id_cliente || !selectedPedido.fecha_entrega || selectedPedido.detallesPedido.length === 0) {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    const pedidoToSave = {
      id_cliente: parseInt(selectedPedido.id_cliente),
      fecha_entrega: selectedPedido.fecha_entrega,
      estado: selectedPedido.estado,
      pagado: selectedPedido.pagado,
      detallesPedido: selectedPedido.detallesPedido.map(detalle => ({
        id_detalle_pedido: detalle.id_detalle_pedido || undefined,
        id_producto: parseInt(detalle.id_producto),
        cantidad: parseInt(detalle.cantidad)
      }))
    };

    try {
      if (editMode) {
        await axios.put(`http://localhost:3000/api/pedidos/${selectedPedido.id_pedido}`, pedidoToSave);
        Swal.fire('¡Actualización exitosa!', 'El pedido ha sido actualizado correctamente.', 'success');
      } else {
        await axios.post("http://localhost:3000/api/pedidos", pedidoToSave);
        Swal.fire('¡Creación exitosa!', 'El pedido ha sido creado correctamente.', 'success');
      }
      fetchPedidos();
      handleOpen();
    } catch (error) {
      console.error("Error saving pedido:", error);
      Swal.fire('Error', 'Hubo un problema al guardar el pedido.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedPedido({ ...selectedPedido, [name]: value });
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...selectedPedido.detallesPedido];
    if (name === 'cantidad' || name === 'id_producto') {
      detalles[index][name] = value.replace(/\D/, ''); // Solo permite dígitos
    } else {
      detalles[index][name] = value;
    }
    setSelectedPedido({ ...selectedPedido, detallesPedido: detalles });
  };

  const handleAddDetalle = () => {
    setSelectedPedido({
      ...selectedPedido,
      detallesPedido: [...selectedPedido.detallesPedido, { id_producto: "", cantidad: "" }]
    });
  };

  const handleRemoveDetalle = (index) => {
    const detalles = [...selectedPedido.detallesPedido];
    detalles.splice(index, 1);
    setSelectedPedido({ ...selectedPedido, detallesPedido: detalles });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (pedido) => {
    setSelectedPedido({
      ...pedido,
      detallesPedido: pedido.detallesPedido || [],
      clientesh: pedido.clientesh || { nombre: "", contacto: "" },
      fecha_entrega: pedido.fecha_entrega.split('T')[0] // Ajuste aquí
    });
    handleDetailsOpen();
  };

  const handleDelete = async (id_pedido) => {
    try {
      await axios.delete(`http://localhost:3000/api/pedidos/${id_pedido}`);
      Swal.fire('¡Eliminación exitosa!', 'El pedido ha sido eliminado correctamente.', 'success');
      fetchPedidos();
    } catch (error) {
      console.error("Error deleting pedido:", error);
      Swal.fire('Error', 'Hubo un problema al eliminar el pedido.', 'error');
    }
  };

  const indexOfLastPedido = currentPage * pedidosPerPage;
  const indexOfFirstPedido = indexOfLastPedido - pedidosPerPage;
  const currentPedidos = filteredPedidos.slice(indexOfFirstPedido, indexOfLastPedido);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="mb-6" color="green" startIcon={<PlusIcon />}>
            Crear Pedido
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por cliente"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Pedidos
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentPedidos.map((pedido) => (
                <Card key={pedido.id_pedido} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    Cliente: {pedido.clientesh.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Fecha de Entrega: {pedido.fecha_entrega.split('T')[0]}
                  </Typography>
                  <Typography color="blue-gray">
                    Estado: {pedido.estado}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton color="blue-gray" onClick={() => handleViewDetails(pedido)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="blue" onClick={() => handleEdit(pedido)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="red" onClick={() => handleDelete(pedido.id_pedido)}>
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination
                pedidosPerPage={pedidosPerPage}
                totalPedidos={filteredPedidos.length}
                paginate={paginate}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen} className="overflow-auto max-h-[90vh]">
        <DialogHeader>{editMode ? "Editar Pedido" : "Crear Pedido"}</DialogHeader>
        <DialogBody divider className="overflow-auto max-h-[60vh]">
          <Input
            label="ID Cliente"
            name="id_cliente"
            type="number"
            value={selectedPedido.id_cliente}
            onChange={handleChange}
          />
          <Input
            label="Fecha de Entrega"
            name="fecha_entrega"
            type="date"
            value={selectedPedido.fecha_entrega}
            onChange={handleChange}
          />
          <Input
            label="Estado"
            name="estado"
            value={selectedPedido.estado}
            onChange={handleChange}
          />
          <Input
            label="Pagado"
            name="pagado"
            type="checkbox"
            checked={selectedPedido.pagado}
            onChange={(e) => setSelectedPedido({ ...selectedPedido, pagado: e.target.checked })}
          />
          <Typography variant="h6" color="blue-gray" className="mt-4">
            Detalles del Pedido
          </Typography>
          {selectedPedido.detallesPedido.map((detalle, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center">
              <Input
                label="ID Producto"
                name="id_producto"
                type="number"
                value={detalle.id_producto}
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
            {editMode ? "Guardar Cambios" : "Crear Pedido"}
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles del Pedido</DialogHeader>
        <DialogBody divider className="overflow-y-auto max-h-[60vh]">
          {selectedPedido.clientesh && (
            <div>
              <Typography variant="h6" color="blue-gray">
                Información del Cliente
              </Typography>
              <table className="min-w-full mt-2">
                <tbody>
                  <tr>
                    <td className="font-semibold">ID Cliente:</td>
                    <td>{selectedPedido.clientesh.id_cliente}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Nombre:</td>
                    <td>{selectedPedido.clientesh.nombre}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Contacto:</td>
                    <td>{selectedPedido.clientesh.contacto}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Creado:</td>
                    <td>{selectedPedido.clientesh.createdAt}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Actualizado:</td>
                    <td>{selectedPedido.clientesh.updatedAt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Typography variant="h6" color="blue-gray">
              Detalles del Pedido
            </Typography>
            <table className="min-w-full mt-2">
              <tbody>
                <tr>
                  <td className="font-semibold">ID Pedido:</td>
                  <td>{selectedPedido.id_pedido}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Fecha de Entrega:</td>
                  <td>{selectedPedido.fecha_entrega}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Estado:</td>
                  <td>{selectedPedido.estado}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Pagado:</td>
                  <td>{selectedPedido.pagado ? "Sí" : "No"}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Creado:</td>
                  <td>{selectedPedido.createdAt}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Actualizado:</td>
                  <td>{selectedPedido.updatedAt}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Typography variant="h6" color="blue-gray">
              Detalles de Productos
            </Typography>
            <table className="min-w-full mt-2">
              <thead>
                <tr>
                  <th className="font-semibold">ID Detalle</th>
                  <th className="font-semibold">ID Producto</th>
                  <th className="font-semibold">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {selectedPedido.detallesPedido.map((detalle) => (
                  <tr key={detalle.id_detalle_pedido}>
                    <td>{detalle.id_detalle_pedido}</td>
                    <td>{detalle.id_producto}</td>
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

const Pagination = ({ pedidosPerPage, totalPedidos, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPedidos / pedidosPerPage); i++) {
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

export default Pedidos;
