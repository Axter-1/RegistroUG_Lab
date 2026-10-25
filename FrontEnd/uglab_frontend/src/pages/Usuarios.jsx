// src/pages/Profesores.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Usuarios() {
  const { api } = useAuth();
  const [profesores, setProfesores] = useState([]);

  useEffect(() => {
    if (!api) return;
    api.get("/usuarios")
      .then((res) => setProfesores(res.data))
      .catch((err) => console.error("Error:", err));
  }, [api]);

  return (
    <div>
      <h2 color="black">Profesores</h2>
      <ul>
        <li color="black">${profesores}</li>
      </ul>
    </div>
  );
}