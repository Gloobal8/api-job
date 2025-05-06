const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Helper to read/write to JSON file
const DB_PATH = path.join(__dirname, "../data/db.json");

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return {
      jobs: [],
      companies: [],
      users: [],
      categories: [],
      applications: [],
      addresses: [],
    };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing to database:", error);
    return false;
  }
};

// Obtener todas las direcciones del usuario
exports.getUserAddresses = async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Leer la base de datos
    const data = readDB();

    // Obtener las direcciones del usuario
    const addresses = data.addresses || [];
    const userAddresses = addresses.filter(
      (address) => address.userId === req.userId
    );

    // Asegurarse de que las coordenadas sean números
    const processedAddresses = userAddresses.map((address) => ({
      ...address,
      latitude: address.latitude ? parseFloat(address.latitude) : null,
      longitude: address.longitude ? parseFloat(address.longitude) : null,
    }));

    res.status(200).json({ addresses: processedAddresses });
  } catch (error) {
    console.error("Error in getUserAddresses:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
};

// Crear una nueva dirección
exports.createAddress = async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Validar datos requeridos
    const { name, country, address, postalCode } = req.body;
    if (!name || !country || !address || !postalCode) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    // Leer la base de datos
    const data = readDB();

    // Inicializar el array de direcciones si no existe
    if (!data.addresses) {
      data.addresses = [];
    }

    // Obtener las direcciones actuales del usuario
    const userAddresses = data.addresses.filter(
      (addr) => addr.userId === req.userId
    );

    // Crear nueva dirección
    const newAddress = {
      id: uuidv4(),
      userId: req.userId,
      name,
      country,
      province: req.body.province || null,
      city: req.body.city || null,
      postalCode,
      address,
      comment: req.body.comment || "",
      isPrimary: req.body.isPrimary || false,
      createdAt: new Date().toISOString(),
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
    };

    // Si la nueva dirección es principal, actualizar las demás
    if (newAddress.isPrimary) {
      data.addresses.forEach((addr) => {
        if (addr.userId === req.userId) {
          addr.isPrimary = false;
        }
      });
    }

    // Añadir la dirección al array
    data.addresses.push(newAddress);

    // Guardar los cambios
    writeDB(data);

    res
      .status(201)
      .json({ message: "Dirección creada con éxito", address: newAddress });
  } catch (error) {
    console.error("Error in createAddress:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
};

// Actualizar una dirección existente
exports.updateAddress = async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const addressId = req.params.id;
    if (!addressId) {
      return res
        .status(400)
        .json({ message: "ID de dirección no proporcionado" });
    }

    // Validar datos requeridos
    const { name, country, address, postalCode } = req.body;
    if (!name || !country || !address || !postalCode) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    // Leer la base de datos
    const data = readDB();

    // Verificar si existen direcciones
    if (!data.addresses || !Array.isArray(data.addresses)) {
      return res.status(404).json({ message: "No se encontraron direcciones" });
    }

    // Buscar la dirección a actualizar
    const addressIndex = data.addresses.findIndex(
      (addr) => addr.id === addressId && addr.userId === req.userId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Dirección no encontrada" });
    }

    // Convertir coordenadas a números si existen
    let latitude = null;
    let longitude = null;

    if (req.body.latitude) {
      latitude = parseFloat(req.body.latitude);
      if (isNaN(latitude)) {
        latitude = null;
      }
    }

    if (req.body.longitude) {
      longitude = parseFloat(req.body.longitude);
      if (isNaN(longitude)) {
        longitude = null;
      }
    }

    // Actualizar la dirección
    const updatedAddress = {
      ...data.addresses[addressIndex],
      name,
      country,
      province: req.body.province || null,
      city: req.body.city || null,
      postalCode,
      address,
      comment: req.body.comment || "",
      isPrimary: req.body.isPrimary || false,
      latitude: latitude,
      longitude: longitude,
      updatedAt: new Date().toISOString(),
    };

    // Si la dirección actualizada es principal, actualizar las demás
    if (updatedAddress.isPrimary) {
      data.addresses.forEach((addr, idx) => {
        if (addr.userId === req.userId && idx !== addressIndex) {
          addr.isPrimary = false;
        }
      });
    }

    // Guardar la dirección actualizada
    data.addresses[addressIndex] = updatedAddress;

    // Guardar los cambios
    writeDB(data);

    res.status(200).json({
      message: "Dirección actualizada con éxito",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Error in updateAddress:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
};

// Eliminar una dirección
exports.deleteAddress = async (req, res) => {
  try {
    // Verificar autenticación
    if (!req.userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const addressId = req.params.id;
    if (!addressId) {
      return res
        .status(400)
        .json({ message: "ID de dirección no proporcionado" });
    }

    // Leer la base de datos
    const data = readDB();

    // Verificar si existen direcciones
    if (!data.addresses || !Array.isArray(data.addresses)) {
      return res.status(404).json({ message: "No se encontraron direcciones" });
    }

    // Buscar la dirección a eliminar
    const addressIndex = data.addresses.findIndex(
      (addr) => addr.id === addressId && addr.userId === req.userId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Dirección no encontrada" });
    }

    // Verificar si es la dirección principal
    const isPrimary = data.addresses[addressIndex].isPrimary;

    // Eliminar la dirección
    const deletedAddress = data.addresses.splice(addressIndex, 1)[0];

    // Si era la dirección principal y hay más direcciones, hacer la primera principal
    if (isPrimary) {
      const userAddresses = data.addresses.filter(
        (addr) => addr.userId === req.userId
      );
      if (userAddresses.length > 0) {
        userAddresses[0].isPrimary = true;
      }
    }

    // Guardar los cambios
    writeDB(data);

    res.status(200).json({ message: "Dirección eliminada con éxito" });
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
};
