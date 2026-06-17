const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let estadoFabrica = {
  modoFabrica: "AUTOMATICO",
  alarma: false,
  nivelEnergia: 80,

  puerta: {
    estado: "CERRADA",
    ultimoAcceso: "NINGUNO"
  },

  prensa: {
    estado: "TRABAJANDO",
    ciclos: 0,
    error: false
  },

  generador: {
    estado: "NORMAL",
    consumo: 35
  }
};

function actualizarEstadoGenerador() {
  if (estadoFabrica.nivelEnergia > 50) {
    estadoFabrica.generador.estado = "NORMAL";
  } else if (estadoFabrica.nivelEnergia >= 25) {
    estadoFabrica.generador.estado = "BAJO_CONSUMO";
  } else {
    estadoFabrica.generador.estado = "CRITICO";
    estadoFabrica.alarma = true;
  }
}

function actualizarEstadoPrensa() {
  if (estadoFabrica.alarma) {
    estadoFabrica.prensa.estado = "ERROR";
    estadoFabrica.prensa.error = true;
    estadoFabrica.puerta.estado = "BLOQUEADA";
  }
}

app.get("/", (req, res) => {
  res.send("API de la Fabrica Digital Twin funcionando correctamente");
});

app.get("/factory", (req, res) => {
  actualizarEstadoGenerador();
  actualizarEstadoPrensa();

  if (estadoFabrica.prensa.estado === "TRABAJANDO") {
    estadoFabrica.prensa.ciclos += 1;
  }

  res.json(estadoFabrica);
});

app.post("/factory", (req, res) => {
  estadoFabrica = {
    ...estadoFabrica,
    ...req.body
  };

  actualizarEstadoGenerador();
  actualizarEstadoPrensa();

  res.json(estadoFabrica);
});

app.get("/abrir-puerta", (req, res) => {
  if (estadoFabrica.alarma || estadoFabrica.puerta.estado === "BLOQUEADA") {
    estadoFabrica.puerta.estado = "ACCESO_DENEGADO";
    estadoFabrica.puerta.ultimoAcceso = "API";
  } else {
    estadoFabrica.puerta.estado = "ABIERTA";
    estadoFabrica.puerta.ultimoAcceso = "API";
  }

  res.json(estadoFabrica);
});

app.get("/cerrar-puerta", (req, res) => {
  if (!estadoFabrica.alarma) {
    estadoFabrica.puerta.estado = "CERRADA";
  }

  res.json(estadoFabrica);
});

app.get("/toggle-alarma", (req, res) => {
  estadoFabrica.alarma = !estadoFabrica.alarma;

  if (estadoFabrica.alarma) {
    estadoFabrica.puerta.estado = "BLOQUEADA";
    estadoFabrica.prensa.estado = "ERROR";
    estadoFabrica.prensa.error = true;
  } else {
    estadoFabrica.puerta.estado = "CERRADA";
    estadoFabrica.prensa.estado = "TRABAJANDO";
    estadoFabrica.prensa.error = false;
  }

  res.json(estadoFabrica);
});

app.get("/energia/:valor", (req, res) => {
  let valor = parseInt(req.params.valor);

  if (isNaN(valor)) {
    return res.status(400).json({
      error: "El valor de energia no es valido"
    });
  }

  valor = Math.max(0, Math.min(100, valor));

  estadoFabrica.nivelEnergia = valor;

  if (valor >= 25) {
    estadoFabrica.alarma = false;

    if (estadoFabrica.prensa.estado === "ERROR") {
      estadoFabrica.prensa.estado = "TRABAJANDO";
      estadoFabrica.prensa.error = false;
    }

    if (estadoFabrica.puerta.estado === "BLOQUEADA") {
      estadoFabrica.puerta.estado = "CERRADA";
    }
  }

  actualizarEstadoGenerador();

  res.json(estadoFabrica);
});

app.get("/prensa/:estado", (req, res) => {
  const estado = req.params.estado.toUpperCase();

  const estadosValidos = [
    "APAGADA",
    "ENCENDIDA",
    "TRABAJANDO",
    "ERROR",
    "MANTENIMIENTO"
  ];

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({
      error: "Estado de prensa no valido"
    });
  }

  estadoFabrica.prensa.estado = estado;
  estadoFabrica.prensa.error = estado === "ERROR";

  res.json(estadoFabrica);
});

app.get("/reset", (req, res) => {
  estadoFabrica = {
    modoFabrica: "AUTOMATICO",
    alarma: false,
    nivelEnergia: 80,

    puerta: {
      estado: "CERRADA",
      ultimoAcceso: "NINGUNO"
    },

    prensa: {
      estado: "TRABAJANDO",
      ciclos: 0,
      error: false
    },

    generador: {
      estado: "NORMAL",
      consumo: 35
    }
  };

  res.json(estadoFabrica);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor iniciado en el puerto " + PORT);
});