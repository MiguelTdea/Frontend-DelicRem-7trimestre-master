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
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from "sweetalert2";

export function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedVenta, setSelectedVenta] = useState({
    id_cliente: "",
    fecha_venta: "",
    estado: "pendiente",
    pagado: false,
    detalleVentas: [],
    cliente: { nombre: "", contacto: "" },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ventasPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchVentas();
    fetchClientes();
    fetchProductos();
  }, []);

  const fetchVentas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/ventas");
      setVentas(response.data);
      setFilteredVentas(response.data);
    } catch (error) {
      console.error("Error fetching ventas:", error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/clientes");
      setClientes(response.data);
    } catch (error) {
      console.error("Error fetching clientes:", error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/productos");
      setProductos(response.data);
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  useEffect(() => {
    filterVentas();
  }, [search, startDate, endDate, ventas]);

  const filterVentas = () => {
    let filtered = ventas.filter((venta) =>
      venta.cliente.nombre.toLowerCase().includes(search.toLowerCase())
    );

    if (startDate && endDate) {
      filtered = filtered.filter(
        (venta) =>
          new Date(venta.fecha_venta) >= new Date(startDate) &&
          new Date(venta.fecha_venta) <= new Date(endDate)
      );
    }

    setFilteredVentas(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleCreate = () => {
    setSelectedVenta({
      id_cliente: "",
      fecha_venta: "",
      estado: "pendiente",
      pagado: false,
      detalleVentas: [],
      cliente: { nombre: "", contacto: "" },
    });
    handleOpen();
  };

  const handleSave = async () => {
    if (!selectedVenta.id_cliente || !selectedVenta.fecha_venta || selectedVenta.detalleVentas.length === 0) {
      Swal.fire("Error", "Por favor, complete todos los campos requeridos.", "error");
      return;
    }

    const ventaToSave = {
      id_cliente: parseInt(selectedVenta.id_cliente),
      fecha_venta: selectedVenta.fecha_venta,
      estado: selectedVenta.estado,
      pagado: selectedVenta.pagado,
      detalleVentas: selectedVenta.detalleVentas.map((detalle) => ({
        id_producto: parseInt(detalle.id_producto),
        cantidad: parseInt(detalle.cantidad),
        precio_unitario: parseFloat(detalle.precio_unitario),
      })),
    };

    try {
      await axios.post("http://localhost:3000/api/ventas", ventaToSave);
      Swal.fire("¡Creación exitosa!", "La venta ha sido creada correctamente.", "success");
      fetchVentas();
      handleOpen();
    } catch (error) {
      console.error("Error saving venta:", error);
      Swal.fire("Error", "Hubo un problema al guardar la venta.", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedVenta({ ...selectedVenta, [name]: value });
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...selectedVenta.detalleVentas];
    detalles[index][name] = value;
    setSelectedVenta({ ...selectedVenta, detalleVentas: detalles });
  };

  const handleAddDetalle = () => {
    setSelectedVenta({
      ...selectedVenta,
      detalleVentas: [...selectedVenta.detalleVentas, { id_producto: "", cantidad: "", precio_unitario: "" }],
    });
  };

  const handleRemoveDetalle = (index) => {
    const detalles = [...selectedVenta.detalleVentas];
    detalles.splice(index, 1);
    setSelectedVenta({ ...selectedVenta, detalleVentas: detalles });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (venta) => {
    setSelectedVenta({
      ...venta,
      detalleVentas: venta.detalles || [],
      cliente: venta.cliente || { nombre: "", contacto: "" },
      fecha_venta: venta.fecha_venta.split('T')[0] // Ajuste aquí
    });
    handleDetailsOpen();
  };

  const handleUpdateState = async (id_venta) => {
    const { value: estado } = await Swal.fire({
      title: "Actualizar Estado",
      input: "select",
      inputOptions: {
        pendiente: "Pendiente",
        "en preparación": "En preparación",
        completado: "Completado",
      },
      inputPlaceholder: "Selecciona el estado",
      showCancelButton: true,
    });

    if (estado) {
      try {
        await axios.put(`http://localhost:3000/api/ventas/${id_venta}/estado`, { estado });
        Swal.fire("¡Actualización exitosa!", "El estado de la venta ha sido actualizado.", "success");
        fetchVentas();
      } catch (error) {
        console.error("Error updating estado:", error);
        Swal.fire("Error", "Hubo un problema al actualizar el estado de la venta.", "error");
      }
    }
  };

  const indexOfLastVenta = currentPage * ventasPerPage;
  const indexOfFirstVenta = indexOfLastVenta - ventasPerPage;
  const currentVentas = filteredVentas.slice(indexOfFirstVenta, indexOfLastVenta);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="mb-6" color="green" startIcon={<PlusIcon />}>
            Crear Venta
          </Button>
          <div className="mb-6">
            <Input type="text" placeholder="Buscar por cliente" value={search} onChange={handleSearchChange} />
            <div className="mt-4">
              <Input type="date" label="Fecha Inicio" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="date" label="Fecha Fin" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Ventas
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentVentas.map((venta) => (
                <Card key={venta.id_venta} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    Cliente: {venta.cliente.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Fecha de Venta: {venta.fecha_venta.split('T')[0]}
                  </Typography>
                  <Typography color="blue-gray">Estado: {venta.estado}</Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton color="blue-gray" onClick={() => handleViewDetails(venta)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton color="blue" onClick={() => handleUpdateState(venta.id_venta)}>
                      <PencilIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination ventasPerPage={ventasPerPage} totalVentas={filteredVentas.length} paginate={paginate} />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen} className="overflow-auto max-h-[90vh]">
        <DialogHeader>Crear Venta</DialogHeader>
        <DialogBody divider className="overflow-auto max-h-[60vh]">
          <Select label="Cliente" name="id_cliente" value={selectedVenta.id_cliente} onChange={(e) => setSelectedVenta({ ...selectedVenta, id_cliente: e })}>
            {clientes.map((cliente) => (
              <Option key={cliente.id_cliente} value={cliente.id_cliente}>
                {cliente.nombre}
              </Option>
            ))}
          </Select>
          <Input label="Fecha de Venta" name="fecha_venta" type="date" value={selectedVenta.fecha_venta} onChange={handleChange} />
          <Select label="Estado" name="estado" value={selectedVenta.estado} onChange={(e) => setSelectedVenta({ ...selectedVenta, estado: e })}>
            <Option value="pendiente">Pendiente</Option>
            <Option value="en preparación">En preparación</Option>
            <Option value="completado">Completado</Option>
          </Select>
          <div className="flex items-center">
            <Typography className="mr-2">Pagado:</Typography>
            <input type="checkbox" name="pagado" checked={selectedVenta.pagado} onChange={(e) => setSelectedVenta({ ...selectedVenta, pagado: e.target.checked })} />
          </div>
          <Typography variant="h6" color="blue-gray" className="mt-4">
            Detalles de la Venta
          </Typography>
          {selectedVenta.detalleVentas.map((detalle, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center">
              <Select label="Producto" name="id_producto" value={detalle.id_producto} onChange={(e) => handleDetalleChange(index, { target: { name: 'id_producto', value: e } })}>
                {productos.map((producto) => (
                  <Option key={producto.id_producto} value={producto.id_producto}>
                    {producto.nombre}
                  </Option>
                ))}
              </Select>
              <Input label="Cantidad" name="cantidad" type="number" value={detalle.cantidad} onChange={(e) => handleDetalleChange(index, e)} />
              <Input label="Precio Unitario" name="precio_unitario" type="number" step="0.01" value={detalle.precio_unitario} onChange={(e) => handleDetalleChange(index, e)} />
              <IconButton color="red" onClick={() => handleRemoveDetalle(index)} className="mt-6">
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
            Crear Venta
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles de la Venta</DialogHeader>
        <DialogBody divider className="overflow-auto max-h-[60vh]">
          {selectedVenta.cliente && (
            <div>
              <Typography variant="h6" color="blue-gray">
                Información del Cliente
              </Typography>
              <table className="min-w-full mt-2">
                <tbody>
                  <tr>
                    <td className="font-semibold">ID Cliente:</td>
                    <td>{selectedVenta.cliente.id_cliente}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Nombre:</td>
                    <td>{selectedVenta.cliente.nombre}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Contacto:</td>
                    <td>{selectedVenta.cliente.contacto}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Creado:</td>
                    <td>{selectedVenta.cliente.createdAt}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Actualizado:</td>
                    <td>{selectedVenta.cliente.updatedAt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Typography variant="h6" color="blue-gray">
              Detalles de la Venta
            </Typography>
            <table className="min-w-full mt-2">
              <tbody>
                <tr>
                  <td className="font-semibold">ID Venta:</td>
                  <td>{selectedVenta.id_venta}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Fecha de Venta:</td>
                  <td>{selectedVenta.fecha_venta.split('T')[0]}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Estado:</td>
                  <td>{selectedVenta.estado}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Pagado:</td>
                  <td>{selectedVenta.pagado ? "Sí" : "No"}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Creado:</td>
                  <td>{new Date(selectedVenta.createdAt).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="font-semibold">Actualizado:</td>
                  <td>{new Date(selectedVenta.updatedAt).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Typography variant="h6" color="blue-gray">
              Detalles de Productos
            </Typography>
            <table className="min-w-full mt-2">
              <thead>
                <tr>
                  <th className="font-semibold">ID Detalle</th>
                  <th className="font-semibold">Producto</th>
                  <th className="font-semibold">Cantidad</th>
                  <th className="font-semibold">Precio Unitario</th>
                </tr>
              </thead>
              <tbody>
                {selectedVenta.detalleVentas.map((detalle) => (
                  <tr key={detalle.id_detalle_venta}>
                    <td>{detalle.id_detalle_venta}</td>
                    <td>{productos.find(p => p.id_producto === detalle.id_producto)?.nombre || 'Producto no encontrado'}</td>
                    <td>{detalle.cantidad}</td>
                    <td>{detalle.precio_unitario}</td>
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

const Pagination = ({ ventasPerPage, totalVentas, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalVentas / ventasPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination flex space-x-2">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item">
            <Button onClick={() => paginate(number)} className="page-link">
              {number}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Ventas;
