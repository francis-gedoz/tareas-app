const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());

const path = require("path");
const RUTA_ARCHIVO = path.join(__dirname, "tareas.json");

function leerTareas() {
    try {
        const data = fs.readFileSync(RUTA_ARCHIVO, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error al leer tareas:", error);
        return [];
    }
}

function guardarTareas(tareas) {
    try {
        fs.writeFileSync(RUTA_ARCHIVO, JSON.stringify(tareas, null, 2));
        console.log("✅ Tareas guardadas correctamente:", tareas);
    } catch (error) {
        console.error("❌ Error al guardar tareas:", error);
    }
}

app.get("/tareas", (req, res) => {
    const tareas = leerTareas();
    res.json(tareas);
});

app.post("/tareas", (req, res) => {
    const { titulo, descripcion } = req.body;

    if (!titulo) {
        return res.status(400).json({ mensaje: "El campo 'titulo' es obligatorio." });
    }

    const tareas = leerTareas();
    const nuevaTarea = {
        id: tareas.length > 0 ? tareas[tareas.length - 1].id + 1 : 1,
        titulo,
        descripcion: descripcion || "",
        completada: false,
    };

    tareas.push(nuevaTarea);
    guardarTareas(tareas);

    res.status(201).json({ mensaje: "Tarea agregada correctamente.", tarea: nuevaTarea });
});

app.put("/tareas/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const tareas = leerTareas();
    const tarea = tareas.find((t) => t.id === id);

    if (!tarea) {
        return res.status(404).json({ mensaje: "Tarea no encontrada." });
    }

    tarea.completada = true;
    guardarTareas(tareas);

    res.json({ mensaje: "Tarea marcada como completada.", tarea });
});

app.delete("/tareas/:id", (req, res) => {
    const id = parseInt(req.params.id);
    let tareas = leerTareas();
    const index = tareas.findIndex((t) => t.id === id);

    if (index === -1) {
        return res.status(404).json({ mensaje: "Tarea no encontrada." });
    }

    const tareaEliminada = tareas.splice(index, 1);
    guardarTareas(tareas);

    res.json({ mensaje: "Tarea eliminada correctamente.", tarea: tareaEliminada[0] });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
