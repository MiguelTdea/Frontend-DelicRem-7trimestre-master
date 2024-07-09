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
import { PlusIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig";
import Swal from 'sweetalert2';

export function Compras() {
  const [compras, setCompras] = useState([]);
  const [filteredCompras, setFilteredCompras] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [selectedCompra, setSelectedCompra] = useState({
    id_proveedor: "",
    fecha_compra: "",
    estado: "pendiente",
    detalleCompras: [],
    proveedorCompra: { nombre: "", contacto: "" },
    detalleComprasCompra: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [comprasPerPage] = useState(5);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCompras();
    fetchProveedores();
    fetchInsumos();
  }, []);

  const fetchCompras = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/compras");
      setCompras(response.data);
      setFilteredCompras(response.data);
    } catch (error) {
      console.error("Error fetching compras:", error);
    }
  };

  const fetchProveedores = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/proveedores");
      setProveedores(response.data);
    } catch (error) {
      console.error("Error fetching proveedores:", error);
    }
  };

  const fetchInsumos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/insumos");
      setInsumos(response.data);
    } catch (error) {
      console.error("Error fetching insumos:", error);
    }
  };

  useEffect(() => {
    filterCompras();
  }, [search, compras]);

  const filterCompras = () => {
    const filtered = compras.filter((compra) =>
      compra.proveedorCompra.nombre.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCompras(filtered);
  };

  const handleOpen = () => setOpen(!open);
  const handleDetailsOpen = () => setDetailsOpen(!detailsOpen);

  const handleCreate = () => {
    setSelectedCompra({
      id_proveedor: "",
      fecha_compra: "",
      estado: "pendiente",
      detalleCompras: [],
      proveedorCompra: { nombre: "", contacto: "" },
      detalleComprasCompra: []
    });
    handleOpen();
  };

  const handleSave = async () => {
    if (!selectedCompra.id_proveedor || !selectedCompra.fecha_compra || selectedCompra.detalleCompras.length === 0) {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos.', 'error');
      return;
    }

    const compraToSave = {
      id_proveedor: parseInt(selectedCompra.id_proveedor),
      fecha_compra: selectedCompra.fecha_compra,
      estado: selectedCompra.estado,
      detalleCompras: selectedCompra.detalleCompras.map(detalle => ({
        id_insumo: parseInt(detalle.id_insumo),
        cantidad: parseInt(detalle.cantidad),
        precio_unitario: parseFloat(detalle.precio_unitario)
      }))
    };

    try {
      await axios.post("http://localhost:3000/api/compras", compraToSave);
      Swal.fire('¡Creación exitosa!', 'La compra ha sido creada correctamente.', 'success');
      fetchCompras();
      handleOpen();
    } catch (error) {
      console.error("Error saving compra:", error);
      Swal.fire('Error', 'Hubo un problema al guardar la compra.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedCompra({ ...selectedCompra, [name]: value });
  };

  const handleDetalleChange = (index, e) => {
    const { name, value } = e.target;
    const detalles = [...selectedCompra.detalleCompras];
    if (name === 'cantidad' || name === 'id_insumo') {
      detalles[index][name] = value.replace(/\D/, ''); // Solo permite dígitos
    } else if (name === 'precio_unitario') {
      detalles[index][name] = value.replace(/[^\d.]/, ''); // Permite dígitos y un punto decimal
    } else {
      detalles[index][name] = value;
    }
    setSelectedCompra({ ...selectedCompra, detalleCompras: detalles });
  };

  const handleAddDetalle = () => {
    setSelectedCompra({
      ...selectedCompra,
      detalleCompras: [...selectedCompra.detalleCompras, { id_insumo: "", cantidad: "", precio_unitario: "" }]
    });
  };

  const handleRemoveDetalle = (index) => {
    const detalles = [...selectedCompra.detalleCompras];
    detalles.splice(index, 1);
    setSelectedCompra({ ...selectedCompra, detalleCompras: detalles });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetails = (compra) => {
    setSelectedCompra({
      ...compra,
      detalleCompras: compra.detalleComprasCompra || [],
      proveedorCompra: compra.proveedorCompra || { nombre: "", contacto: "" },
      fecha_compra: compra.fecha_compra.split('T')[0] // Ajuste aquí
    });
    handleDetailsOpen();
  };

  const getInsumoName = (id_insumo) => {
    const insumo = insumos.find((ins) => ins.id_insumo === id_insumo);
    return insumo ? insumo.nombre : "Desconocido";
  };

  const indexOfLastCompra = currentPage * comprasPerPage;
  const indexOfFirstCompra = indexOfLastCompra - comprasPerPage;
  const currentCompras = filteredCompras.slice(indexOfFirstCompra, indexOfLastCompra);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <Button onClick={handleCreate} className="mb-6" color="green" startIcon={<PlusIcon />}>
            Crear Compra
          </Button>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por proveedor"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4">
              Lista de Compras
            </Typography>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {currentCompras.map((compra) => (
                <Card key={compra.id_compra} className="p-4">
                  <Typography variant="h6" color="blue-gray">
                    Proveedor: {compra.proveedorCompra.nombre}
                  </Typography>
                  <Typography color="blue-gray">
                    Fecha de Compra: {compra.fecha_compra.split('T')[0]}
                  </Typography>
                  <Typography color="blue-gray">
                    Estado: {compra.estado}
                  </Typography>
                  <div className="mt-4 flex gap-2">
                    <IconButton color="blue-gray" onClick={() => handleViewDetails(compra)}>
                      <EyeIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination
                comprasPerPage={comprasPerPage}
                totalCompras={filteredCompras.length}
                paginate={paginate}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Dialog open={open} handler={handleOpen} className="overflow-auto max-h-[90vh]">
        <DialogHeader>Crear Compra</DialogHeader>
        <DialogBody divider className="overflow-auto max-h-[60vh]">
          <Select
            label="Proveedor"
            name="id_proveedor"
            value={selectedCompra.id_proveedor}
            onChange={(e) => setSelectedCompra({ ...selectedCompra, id_proveedor: e })}
          >
            {proveedores.map((proveedor) => (
              <Option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                {proveedor.nombre}
              </Option>
            ))}
          </Select>
          <Input
            label="Fecha de Compra"
            name="fecha_compra"
            type="date"
            value={selectedCompra.fecha_compra}
            onChange={handleChange}
          />
          <Input
            label="Estado"
            name="estado"
            value={selectedCompra.estado}
            onChange={handleChange}
          />
          <Typography variant="h6" color="blue-gray" className="mt-4">
            Detalles de la Compra
          </Typography>
          {selectedCompra.detalleCompras.map((detalle, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center">
              <Select
                label="Insumo"
                name="id_insumo"
                value={detalle.id_insumo}
                onChange={(e) => {
                  const detalles = [...selectedCompra.detalleCompras];
                  detalles[index].id_insumo = e;
                  setSelectedCompra({ ...selectedCompra, detalleCompras: detalles });
                }}
              >
                {insumos.map((insumo) => (
                  <Option key={insumo.id_insumo} value={insumo.id_insumo}>
                    {insumo.nombre}
                  </Option>
                ))}
              </Select>
              <Input
                label="Cantidad"
                name="cantidad"
                type="number"
                value={detalle.cantidad}
                onChange={(e) => handleDetalleChange(index, e)}
              />
              <Input
                label="Precio Unitario"
                name="precio_unitario"
                type="number"
                step="0.01"
                value={detalle.precio_unitario}
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
            Crear Compra
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={detailsOpen} handler={handleDetailsOpen}>
        <DialogHeader>Detalles de la Compra</DialogHeader>
        <DialogBody divider>
          {selectedCompra.proveedorCompra && (
            <div>
              <Typography variant="h6" color="blue-gray">
                Información del Proveedor
              </Typography>
              <table className="min-w-full mt-2">
                <tbody>
                  <tr>
                    <td className="font-semibold">ID Proveedor:</td>
                    <td>{selectedCompra.proveedorCompra.id_proveedor}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Nombre:</td>
                    <td>{selectedCompra.proveedorCompra.nombre}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Contacto:</td>
                    <td>{selectedCompra.proveedorCompra.contacto}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Creado:</td>
                    <td>{new Date(selectedCompra.proveedorCompra.createdAt).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Actualizado:</td>
                    <td>{new Date(selectedCompra.proveedorCompra.updatedAt).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Typography variant="h6" color="blue-gray">
              Detalles de la Compra
            </Typography>
            <table className="min-w-full mt-2">
              <thead>
                <tr>
                  <th className="font-semibold">ID Detalle</th>
                  <th className="font-semibold">Nombre Insumo</th>
                  <th className="font-semibold">Cantidad</th>
                  <th className="font-semibold">Precio Unitario</th>
                </tr>
              </thead>
              <tbody>
                {selectedCompra.detalleCompras.map((detalle) => (
                  <tr key={detalle.id_detalle_compra}>
                    <td>{detalle.id_detalle_compra}</td>
                    <td>{getInsumoName(detalle.id_insumo)}</td>
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

const Pagination = ({ comprasPerPage, totalCompras, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalCompras / comprasPerPage); i++) {
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

export default Compras;
