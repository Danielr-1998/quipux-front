'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  auth: {
    username: 'admin',
    password: 'password'
  },
  headers: {
    'Content-Type': 'application/json'
  }
})

export default function Home() {
  const [playlists, setPlaylists] = useState([])
  const [form, setForm] = useState({ nombre: '', descripcion: '', canciones: [] })
  const [selectedName, setSelectedName] = useState('')
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await api.get('/lists')
      setPlaylists(res.data)
    } catch (e) {
      alert('Error al cargar las listas.')
    } finally {
      setLoading(false)
    }
  }

  const fetchOne = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/lists/${selectedName}`)
      setDetail(res.data)
      setError('')
    } catch {
      setDetail(null)
      setError('Lista no encontrada')
    } finally {
      setLoading(false)
    }
  }

  const create = async () => {
    if (!form.nombre.trim()) return alert('Debes ingresar un nombre.')
    try {
      await api.post('/lists', form)
      await fetchAll()
      setForm({ nombre: '', descripcion: '', canciones: [] })
      alert('Lista creada exitosamente.')
    } catch {
      alert('Error al crear la lista.')
    }
  }

  const remove = async (name) => {
    if (!confirm(`¿Eliminar la lista "${name}"?`)) return
    try {
      await api.delete(`/lists/${name}`)
      await fetchAll()
      alert('Lista eliminada correctamente.')
    } catch {
      alert('Error al eliminar la lista.')
    }
  }

  const updateSong = (index, field, value) => {
    const updated = [...form.canciones]
    updated[index][field] = value
    setForm({ ...form, canciones: updated })
  }

  useEffect(() => {
    fetchAll()
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10 bg-gradient-to-b from-blue-100 to-white">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-indigo-700 tracking-tight">🎧 Playlist Manager</h1>
        <p className="text-gray-600">Crea, busca y gestiona tus listas de reproducción</p>
      </header>

      {loading && <p className="text-center text-blue-600 font-medium">Cargando...</p>}

      {/* Crear nueva lista */}
      <section className="border-2 rounded-lg shadow-lg p-6 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Crear nueva lista</h2>

        <input
          className="w-full border-2 border-gray-300 p-2 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Nombre de la lista"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        <input
          className="w-full border-2 border-gray-300 p-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        <h3 className="font-medium mb-2 text-indigo-500">Canciones</h3>
        {form.canciones.map((cancion, index) => (
          <div key={index} className="grid grid-cols-5 gap-2 mb-2">
            {['titulo', 'artista', 'album', 'anno', 'genero'].map((field) => (
              <input
                key={field}
                className="border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={field}
                value={cancion[field]}
                onChange={(e) => updateSong(index, field, e.target.value)}
              />
            ))}
          </div>
        ))}

        <div className="flex gap-2 mt-4">
          <button
            className="px-4 py-2 bg-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-300 transition duration-200"
            onClick={() =>
              setForm({
                ...form,
                canciones: [...form.canciones, { titulo: '', artista: '', album: '', anno: '', genero: '' }]
              })
            }
          >
            + Añadir canción
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
            onClick={create}
          >
            Crear lista
          </button>
        </div>
      </section>

      {/* Buscar lista */}
      <section className="border-2 rounded-lg shadow-lg p-6 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Buscar lista por nombre</h2>
        <div className="flex gap-2 mb-2">
          <input
            className="border-2 border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nombre exacto"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
          />
          <button
            onClick={fetchOne}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Buscar
          </button>
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {detail && (
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto text-indigo-600">
            {JSON.stringify(detail, null, 2)}
          </pre>
        )}
      </section>

      {/* Listas registradas */}
      <section className="border-2 rounded-lg shadow-lg p-6 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Listas registradas</h2>
        {playlists.length === 0 ? (
          <p className="text-gray-500">No hay listas aún.</p>
        ) : (
          <ul className="space-y-2">
            {playlists.map((p) => (
              <li key={p.id} className="flex justify-between items-center p-4 border-2 border-gray-300 rounded-lg hover:bg-indigo-50 transition duration-200">
                <span className="text-indigo-700 font-medium">
                  <strong>{p.nombre}</strong> — <span className="text-gray-600">{p.descripcion}</span>
                </span>
                <button
                  onClick={() => remove(p.nombre)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
