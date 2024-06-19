"use strict";

const SudokuSolver = require("../controllers/sudoku-solver.js");

module.exports = function (app) {
  let solver = new SudokuSolver();

  app.route("/api/check").post((req, res) => {
    const { puzzle, coordinate, value } = req.body;
  
    // Verificar que todos los campos requeridos estén presentes
    if (!puzzle || !coordinate || !value) {
      res.json({ error: "Required field(s) missing" });
      return;
    }
  
    const row = coordinate.split("")[0].toUpperCase(); // Convertir a mayúsculas para uniformidad
    const column = coordinate.split("")[1];
  
    // Validar longitud de la coordenada y caracteres válidos
    if (
      coordinate.length !== 2 ||
      !/[A-I]/.test(row) ||
      !/[1-9]/.test(column)
    ) {
      res.json({ error: "Invalid coordinate" });
      return;
    }
  
    // Validar que el valor esté entre 1 y 9
    if (!/^[1-9]$/.test(value)) {
      res.json({ error: "Invalid value" });
      return;
    }
  
    // Validar longitud del puzzle y caracteres válidos en el puzzle
    if (puzzle.length != 81) {
      res.json({ error: "Expected puzzle to be 81 characters long" });
      return;
    }
  
    if (/[^0-9.]/g.test(puzzle)) {
      res.json({ error: "Invalid characters in puzzle" });
      return;
    }
  
    // Convertir coordenada a índice del rompecabezas
    const rowIndex = row.charCodeAt(0) - 65; // A -> 0, B -> 1, ..., I -> 8
    const colIndex = parseInt(column) - 1; // 1 -> 0, 2 -> 1, ..., 9 -> 8
    const puzzleIndex = rowIndex * 9 + colIndex;
  
    // Verificar si el valor ya está en el rompecabezas en la coordenada dada
    if (puzzle[puzzleIndex] === value) {
      res.json({ valid: true });
      return;
    }
  
    // Realizar las verificaciones de fila, columna y región
    let validCol = solver.checkColPlacement(puzzle, row, column, value);
    let validReg = solver.checkRegionPlacement(puzzle, row, column, value);
    let validRow = solver.checkRowPlacement(puzzle, row, column, value);
  
    let conflicts = [];
    if (validCol && validReg && validRow) {
      res.json({ valid: true });
    } else {
      if (!validRow) {
        conflicts.push("row");
      }
      if (!validCol) {
        conflicts.push("column");
      }
      if (!validReg) {
        conflicts.push("region");
      }
      res.json({ valid: false, conflict: conflicts });
    }
  });
  

  app.route("/api/solve").post((req, res) => {
    const { puzzle } = req.body;
    if (!puzzle) {
      res.json({ error: "Required field missing" });
      return;
    }
    if (puzzle.length != 81) {
      res.json({ error: "Expected puzzle to be 81 characters long" });
      return;
    }
    if (/[^0-9.]/g.test(puzzle)) {
      res.json({ error: "Invalid characters in puzzle" });
      return;
    }
    let solvedString = solver.solve(puzzle);
    if (!solvedString) {
      res.json({ error: "Puzzle cannot be solved" });
    } else {
      res.json({ solution: solvedString });
    }
  });
};