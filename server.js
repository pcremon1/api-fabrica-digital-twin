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
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Control Fábrica Digital Twin</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #111827;
      color: white;
    }

    header {
      background: #1f2937;
      padding: 20px;
      text-align: center;
      border-bottom: 3px solid #38bdf8;
    }

    h1 {
      margin: 0;
      font-size: 28px;
    }

    .subtitulo {
      color: #9ca3af;
      margin-top: 8px;
    }

    .contenedor {
      max-width: 1100px;
      margin: 30px auto;
      padding: 20px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }

    .tarjeta {
      background: #1f2937;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 0 12px rgba(0,0,0,0.3);
      border-left: 5px solid #38bdf8;
    }

    .tarjeta h2 {
      margin-top: 0;
      font-size: 18px;
      color: #38bdf8;
    }

    .valor {
      font-size: 24px;
      font-weight: bold;
      margin-top: 10px;
    }

    .normal {
      color: #22c55e;
    }

    .medio {
      color: #f59e0b;
    }

    .critico {
      color: #ef4444;
    }

    .botones {
      background: #1f2937;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .botones h2 {
      margin-top: 0;
      color: #38bdf8;
    }

    button {
      border: none;
      padding: 12px 16px;
      margin: 6px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      color: white;
      background: #2563eb;
    }

    button:hover {
      opacity: 0.85;
    }

    .verde {
      background: #16a34a;
    }

    .naranja {
      background: #f59e0b;
    }

    .rojo {
      background: #dc2626;
    }

    .gris {
      background: #4b5563;
    }

    .panel-json {
      background: #020617;
      padding: 15px;
      border-radius: 10px;
      overflow-x: auto;
      color: #a7f3d0;
      font-size: 14px;
    }

    footer {
      text-align: center;
      color: #6b7280;
      margin-top: 30px;
      font-size: 13px;
    }
  </style>
</head>

<body>
  <header>
    <h1>Panel de Control - Fábrica Inteligente</h1>
    <div class="subtitulo">API propia Node.js + Express desplegada en Render</div>
  </header>

  <div class="contenedor">

    <div class="grid">
      <div class="tarjeta">
        <h2>Energía</h2>
        <div id="energia" class="valor">--%</div>
      </div>

      <div class="tarjeta">
        <h2>Generador</h2>
        <div id="generador" class="valor">--</div>
      </div>

      <div class="tarjeta">
        <h2>Puerta</h2>
        <div id="puerta" class="valor">--</div>
      </div>

      <div class="tarjeta">
        <h2>Prensa</h2>
        <div id="prensa" class="valor">--</div>
      </div>

      <div class="tarjeta">
        <h2>Alarma</h2>
        <div id="alarma" class="valor">--</div>
      </div>

      <div class="tarjeta">
        <h2>Ciclos prensa</h2>
        <div id="ciclos" class="valor">--</div>
      </div>
    </div>

    <div class="botones">
      <h2>Control de energía</h2>
      <button class="verde" onclick="llamar('/energia/80')">Energía normal 80%</button>
      <button class="naranja" onclick="llamar('/energia/40')">Baja energía 40%</button>
      <button class="rojo" onclick="llamar('/energia/20')">Energía crítica 20%</button>
    </div>

    <div class="botones">
      <h2>Control de puerta</h2>
      <button class="verde" onclick="llamar('/abrir-puerta')">Abrir puerta</button>
      <button class="gris" onclick="llamar('/cerrar-puerta')">Cerrar puerta</button>
    </div>

    <div class="botones">
      <h2>Control de prensa</h2>
      <button class="verde" onclick="llamar('/prensa/TRABAJANDO')">Prensa trabajando</button>
      <button class="rojo" onclick="llamar('/prensa/ERROR')">Error prensa</button>
      <button class="gris" onclick="llamar('/prensa/APAGADA')">Apagar prensa</button>
    </div>

    <div class="botones">
      <h2>Control general</h2>
      <button class="rojo" onclick="llamar('/toggle-alarma')">Activar / desactivar alarma</button>
      <button class="verde" onclick="llamar('/reset')">Reset fábrica</button>
    </div>

    <div class="botones">
      <h2>Datos JSON actuales</h2>
      <pre id="json" class="panel-json">{ }</pre>
    </div>

    <footer>
      Digital Twin - Fábrica inteligente | Unity + API REST + Render
    </footer>
  </div>

  <script>
    async function cargarEstado() {
      try {
        const respuesta = await fetch('/factory');
        const datos = await respuesta.json();

        document.getElementById('energia').textContent = datos.nivelEnergia + '%';
        document.getElementById('generador').textContent = datos.generador.estado;
        document.getElementById('puerta').textContent = datos.puerta.estado;
        document.getElementById('prensa').textContent = datos.prensa.estado;
        document.getElementById('alarma').textContent = datos.alarma ? 'ACTIVA' : 'NO';
        document.getElementById('ciclos').textContent = datos.prensa.ciclos;

        pintarEstado('energia', datos.nivelEnergia);
        pintarTexto('generador', datos.generador.estado);
        pintarTexto('puerta', datos.puerta.estado);
        pintarTexto('prensa', datos.prensa.estado);
        pintarTexto('alarma', datos.alarma ? 'CRITICO' : 'NORMAL');

        document.getElementById('json').textContent = JSON.stringify(datos, null, 2);
      } catch (error) {
        document.getElementById('json').textContent = 'Error conectando con la API';
      }
    }

    async function llamar(ruta) {
      await fetch(ruta);
      await cargarEstado();
    }

    function pintarEstado(id, energia) {
      const elemento = document.getElementById(id);
      elemento.className = 'valor';

      if (energia > 50) {
        elemento.classList.add('normal');
      } else if (energia >= 25) {
        elemento.classList.add('medio');
      } else {
        elemento.classList.add('critico');
      }
    }

    function pintarTexto(id, texto) {
      const elemento = document.getElementById(id);
      elemento.className = 'valor';

      if (
        texto === 'NORMAL' ||
        texto === 'TRABAJANDO' ||
        texto === 'CERRADA' ||
        texto === 'ABIERTA'
      ) {
        elemento.classList.add('normal');
      } else if (
        texto === 'BAJO_CONSUMO' ||
        texto === 'MANTENIMIENTO'
      ) {
        elemento.classList.add('medio');
      } else {
        elemento.classList.add('critico');
      }
    }

    cargarEstado();
    setInterval(cargarEstado, 3000);
  </script>
</body>
</html>
  `);
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
    estadoFabrica.puerta.ultimoAcceso = "API_WEB";
  } else {
    estadoFabrica.puerta.estado = "ABIERTA";
    estadoFabrica.puerta.ultimoAcceso = "API_WEB";
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

    if (
      estadoFabrica.puerta.estado === "BLOQUEADA" ||
      estadoFabrica.puerta.estado === "ACCESO_DENEGADO"
    ) {
      estadoFabrica.puerta.estado = "CERRADA";
    }
  }

  actualizarEstadoGenerador();
  actualizarEstadoPrensa();

  res.json(estadoFabrica);
});

app.get("/prensa/:estado", (req, res) => {
  const estado = req.params.estado.toUpperCase();

  const estadosValidos = [
    "APAGADA",
    "ENCENDIDA",
    "TRABAJANDO",
    "ERROR",
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
