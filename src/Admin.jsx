import React from 'react'
import { supabase } from './supabase'

function Admin() {

  const [correo, setCorreo] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [cargando, setCargando] = React.useState(false)
  const [mensaje, setMensaje] = React.useState('')
  const [administrador, setAdministrador] = React.useState(null)
  const [modoRecuperacion, setModoRecuperacion] = React.useState(false)
 const [productos, setProductos] = React.useState([])
const [cargandoProductos, setCargandoProductos] = React.useState(false)
const [mostrarProductos, setMostrarProductos] = React.useState(false)
const [productoEditar, setProductoEditar] = React.useState(null)
const [guardandoProducto, setGuardandoProducto] = React.useState(false)

const [mostrarNuevoProducto, setMostrarNuevoProducto] = React.useState(false)
const [guardandoNuevo, setGuardandoNuevo] = React.useState(false)
const [fotoProducto, setFotoProducto] = React.useState(null)
const [nuevoProducto, setNuevoProducto] = React.useState({
  nombre: '',
  precio_mostrador: '',
  precio_domicilio: '',
  Descripcion: '',
  Activo: true
})
const [horarios, setHorarios] = React.useState([])
const [mostrarHorarios, setMostrarHorarios] = React.useState(false)
const [cargandoHorarios, setCargandoHorarios] = React.useState(false)
const [guardandoHorario, setGuardandoHorario] = React.useState(false)
const [promociones, setPromociones] = React.useState([])
const [mostrarPromociones, setMostrarPromociones] = React.useState(false)
const [cargandoPromociones, setCargandoPromociones] = React.useState(false)
const [guardandoPromocion, setGuardandoPromocion] = React.useState(false)

// CONFIGURACIÓN DEL NEGOCIO
const [mostrarConfiguracion, setMostrarConfiguracion] = React.useState(false)
const [cargandoConfiguracion, setCargandoConfiguracion] = React.useState(false)
const [guardandoConfiguracion, setGuardandoConfiguracion] = React.useState(false)
const [mostrarFormularioPromocion, setMostrarFormularioPromocion] = React.useState(false)

const [promocionForm, setPromocionForm] = React.useState({
  titulo: '',
  descripcion: '',
  precio: '',
  descuento: '',
  fotografia: '',
  fecha_inicio: '',
  fecha_fin: '',
  activo: true
})

const [fotoPromocion, setFotoPromocion] = React.useState(null)
const [configuracion, setConfiguracion] = React.useState({
  id: null,
  nombre: '',
  direccion: '',
  whatsapp: ''
})
const [promocionEditar, setPromocionEditar] = React.useState(null)
// CARGA PRODUCTOS A LA PAGINA
async function cargarProductos() {

  setCargandoProductos(true)

  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    setMensaje('Error al cargar productos: ' + error.message)
  } else {
    setProductos(data || [])
    setMostrarProductos(true)
    setMensaje('')
  }

  setCargandoProductos(false)
}


async function guardarCambios() {

  setGuardandoProducto(true)
  setMensaje('')

  try {

    const { error } = await supabase
      .from('productos')


      .update({
  nombre: productoEditar.nombre,
  precio_mostrador: productoEditar.precio_mostrador,
  precio_domicilio: productoEditar.precio_domicilio,
  Descripcion: productoEditar.Descripcion,
  Activo: productoEditar.Activo
})


      .eq('id', productoEditar.id)

    if (error) {

      setMensaje('Error al guardar: ' + error.message)

    } else {

      setProductoEditar(null)

      await cargarProductos()

      setMensaje('¡Producto actualizado correctamente!')

    }

  } catch (error) {

    setMensaje('Error al guardar: ' + error.message)

  } finally {

    setGuardandoProducto(false)

  }
}


//GUARDA NUEVO PRODUCTO
async function guardarNuevoProducto() {

  if (!nuevoProducto.nombre.trim()) {
    setMensaje('Escribe el nombre del producto.')
    return
  }

  if (!fotoProducto) {
    setMensaje('Selecciona una fotografía.')
    return
  }

  setGuardandoNuevo(true)
  setMensaje('')

  try {

    // 1. Preparar nombre de fotografía

    const extension = fotoProducto.name.split('.').pop()
    const nombreArchivo = `productos/${Date.now()}.${extension}`

    // 2. Subir fotografía a Supabase Storage

    const { error: errorFoto } = await supabase
      .storage
      .from('fotos-purificadora')
      .upload(nombreArchivo, fotoProducto, {
        cacheControl: '3600',
        upsert: false
      })

    if (errorFoto) {
      throw errorFoto
    }

    // 3. Obtener URL pública

    const { data: urlFoto } = supabase
      .storage
      .from('fotos-purificadora')
      .getPublicUrl(nombreArchivo)

    // 4. Registrar producto en la tabla

    const { error } = await supabase
      .from('productos')
      .insert({
        nombre: nuevoProducto.nombre,
        precio_mostrador: Number(nuevoProducto.precio_mostrador),
        precio_domicilio: Number(nuevoProducto.precio_domicilio),
        Descripcion: nuevoProducto.Descripcion,
        Fotografia: urlFoto.publicUrl,
        Activo: true
      })

    if (error) {
      throw error
    }

    setMostrarNuevoProducto(false)

    setNuevoProducto({
      nombre: '',
      precio_mostrador: '',
      precio_domicilio: '',
      Descripcion: '',
      Activo: true
    })

    setFotoProducto(null)

    await cargarProductos()

    setMensaje('¡Producto registrado correctamente!')

  } catch (error) {

    setMensaje('Error al registrar producto: ' + error.message)

  } finally {

    setGuardandoNuevo(false)

  }
}
  // VERIFICAR ADMINISTRADOR
  async function verificarAdministrador(usuario) {

    const { data, error } = await supabase
      .from('administradores')
      .select('id')
      .eq('id', usuario.id)
      .maybeSingle()

    if (error || !data) {
      await supabase.auth.signOut()
      setAdministrador(null)
      setMensaje('No tienes autorización para entrar.')
      return false
    }

    setAdministrador(usuario)
    setMensaje('')

    return true
  }

  // INICIAR SESIÓN
  async function iniciarSesion(e) {

    e.preventDefault()

    setCargando(true)
    setMensaje('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: password
    })

    if (error) {
      setMensaje('Correo o contraseña incorrectos.')
      setCargando(false)
      return
    }

    await verificarAdministrador(data.user)

    setCargando(false)
  }

  // CERRAR SESIÓN
  async function cerrarSesion() {

    await supabase.auth.signOut()

    setAdministrador(null)
    setCorreo('')
    setPassword('')
    setMensaje('')
    setModoRecuperacion(false)
  }

  // SOLICITAR RECUPERACIÓN
  async function solicitarRecuperacion() {

    if (!correo) {
      setMensaje('Escribe primero tu correo electrónico.')
      return
    }

    setCargando(true)
    setMensaje('')

    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/admin`
    })

    if (error) {
      setMensaje(error.message)
    } else {
      setMensaje('Solicitud enviada. Revisa tu correo electrónico.')
    }

    setCargando(false)
  }

  // CAMBIAR CONTRASEÑA
  async function cambiarPassword() {

    if (!password || password.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setCargando(true)
    setMensaje('')

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {

      setMensaje(error.message)

    } else {

      setMensaje('¡Contraseña actualizada correctamente!')
      setPassword('')

      await supabase.auth.signOut()

      setAdministrador(null)
      setModoRecuperacion(false)
    }

    setCargando(false)
  }

  // DETECTAR RECUPERACIÓN DE CONTRASEÑA
  React.useEffect(() => {

    const { data: listener } = supabase.auth.onAuthStateChange(
      (evento) => {

        console.log('EVENTO SUPABASE:', evento)

        if (evento === 'PASSWORD_RECOVERY') {

          setModoRecuperacion(true)
          setAdministrador(null)
          setPassword('')
          setMensaje('')
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }

  }, [])

  // REVISAR SESIÓN
  React.useEffect(() => {

    async function revisarSesion() {

      const esRecuperacion =
        window.location.hash.includes('type=recovery') ||
        new URLSearchParams(window.location.search).get('type') === 'recovery'

      if (esRecuperacion) {

        setModoRecuperacion(true)
        setAdministrador(null)

        return
      }

      const { data } = await supabase.auth.getSession()

      if (data.session) {
        await verificarAdministrador(data.session.user)
      }
    }

    revisarSesion()

  }, [])

// CARGAR HORARIOS
async function cargarHorarios() {

  setCargandoHorarios(true)
  setMensaje('')

  try {

    const { data, error } = await supabase
      .from('horarios')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error

    setHorarios(data || [])

    setMostrarHorarios(true)
    setMostrarConfiguracion(false)
    setMostrarProductos(false)
    setMostrarNuevoProducto(false)
    setProductoEditar(null)

  } catch (error) {

    setMensaje('Error al cargar horarios: ' + error.message)

  } finally {

    setCargandoHorarios(false)

  }

}

//GUARDA HORARIOS EN SUPABASE
async function guardarHorario(horario) {

  setGuardandoHorario(true)
  setMensaje('')

  try {

    const { error } = await supabase
      .from('horarios')
      .update({
        atencion_inicio: horario.atencion_inicio,
        atencion_fin: horario.atencion_fin,
        entrega_inicio: horario.entrega_inicio || null,
        entrega_fin: horario.entrega_fin || null,
        entrega: horario.entrega
      })
      .eq('id', horario.id)

    if (error) throw error

    setMensaje(`¡Horario de ${horario.dia} actualizado correctamente!`)

  } catch (error) {

    setMensaje('Error al guardar horario: ' + error.message)

  } finally {

    setGuardandoHorario(false)

  }

}

//CARGA LAS PROMOCIONES DE SUPABASE
async function cargarPromociones() {

  setCargandoPromociones(true)
  setMensaje('')

  try {

    const { data, error } = await supabase
      .from('promociones')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error
    setPromociones(data || [])
    setMostrarPromociones(true)
    setMostrarHorarios(false)
    setMostrarConfiguracion(false)
    setMostrarProductos(false)
    setMostrarNuevoProducto(false)
    setProductoEditar(null)

  } catch (error) {

    setMensaje('Error al cargar promociones: ' + error.message)

  } finally {

    setCargandoPromociones(false)

  }
}

// GUARDAR NUEVA PROMOCIÓN
async function guardarPromocion() {

  if (!promocionForm.titulo.trim()) {
    setMensaje('Escribe el título de la promoción.')
    return
  }

  setGuardandoPromocion(true)
  setMensaje('')

  try {

    let fotografia = ''

    // SUBIR FOTOGRAFÍA
    if (fotoPromocion) {

      const extension = fotoPromocion.name.split('.').pop()
      const nombreArchivo = `${crypto.randomUUID()}.${extension}`

      const { error: errorFoto } = await supabase
        .storage
        .from('fotos-promociones')
        .upload(nombreArchivo, fotoPromocion)

      if (errorFoto) throw errorFoto

      const { data: urlFoto } = supabase
        .storage
        .from('fotos-promociones')
        .getPublicUrl(nombreArchivo)

      fotografia = urlFoto.publicUrl
    }
    const datosPromocion = {
  titulo: promocionForm.titulo.trim(),
  descripcion: promocionForm.descripcion || null,
  precio: promocionForm.precio === '' ? null : Number(promocionForm.precio),
  descuento: promocionForm.descuento === '' ? null : Number(promocionForm.descuento),
  fotografia: fotografia || promocionForm.fotografia || null,
  fecha_inicio: promocionForm.fecha_inicio || null,
  fecha_fin: promocionForm.fecha_fin || null,
  activo: promocionForm.activo
}
let data, error

if (promocionEditar) {
  const resultado = await supabase
    .from('promociones')
    .update(datosPromocion)
    .eq('id', promocionEditar.id)
    .select()
    .single()

  data = resultado.data
  error = resultado.error

} else {

  const resultado = await supabase
    .from('promociones')
    .insert(datosPromocion)
    .select()
    .single()

  data = resultado.data
  error = resultado.error

}

    if (error) throw error

    setPromociones(prev =>
  promocionEditar
    ? prev.map(p => p.id === data.id ? data : p)
    : [data, ...prev]
)

setPromocionEditar(null)
setMostrarFormularioPromocion(false)
    setPromocionForm({
      titulo: '',
      descripcion: '',
      precio: '',
      descuento: '',
      fotografia: '',
      fecha_inicio: '',
      fecha_fin: '',
      activo: true
    })

    setFotoPromocion(null)

    setMensaje('¡Promoción guardada correctamente!')

  } catch (error) {

    setMensaje('Error al guardar promoción: ' + error.message)

  } finally {

    setGuardandoPromocion(false)

  }
}

//GUARDAR HORARIOS JUNTOS
async function guardarGrupoHorario(dias, horario) {

  setGuardandoHorario(true)
  setMensaje('')

  try {
    const { error } = await supabase
      .from('horarios')
      .update({
        atencion_inicio: horario.atencion_inicio,
        atencion_fin: horario.atencion_fin,
        entrega_inicio: horario.entrega_inicio || null,
        entrega_fin: horario.entrega_fin || null,
        entrega: horario.entrega
      })
      .in('dia', dias)

    if (error) throw error

    setHorarios(prev =>
  prev.map(h =>
    dias.includes(h.dia)
      ? {
          ...h,
          atencion_inicio: horario.atencion_inicio,
          atencion_fin: horario.atencion_fin,
          entrega_inicio: horario.entrega_inicio || null,
          entrega_fin: horario.entrega_fin || null,
          entrega: horario.entrega
        }
      : h
  )
)
    setMensaje('¡Horarios del grupo actualizados correctamente!')

  } catch (error) {
    setMensaje('Error al guardar horarios: ' + error.message)
  } finally {
    setGuardandoHorario(false)
  }
}

// CONFIGURACION DIRECCION
async function cargarConfiguracion() {
  setCargandoConfiguracion(true)
  setMensaje('')

  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (data) {
      setConfiguracion({
  id: data.id,
  nombre: data.nombre || '',
  direccion: data.direccion || '',
  whatsapp: data.whatsapp || '',
  latitud: 19.34593332120715,
longitud: -99.00800385605852
})
    }
    setMostrarConfiguracion(true)
    setMostrarProductos(false)
    setMostrarNuevoProducto(false)
    setProductoEditar(null)

  } catch (error) {
    setMensaje('Error al cargar configuración: ' + error.message)
  } finally {
    setCargandoConfiguracion(false)
  }
}

// GUARDAR DIRECCION
async function guardarConfiguracion() {
  setGuardandoConfiguracion(true)
  setMensaje('')

  try {
    const { error } = await supabase
      .from('configuracion')
      .update({
        nombre: configuracion.nombre,
direccion: configuracion.direccion,
whatsapp: configuracion.whatsapp,
latitud: Number(configuracion.latitud),
longitud: Number(configuracion.longitud)
      })
      .eq('id', configuracion.id)

    if (error) throw error

    setMensaje('¡Datos del negocio actualizados correctamente!')

  } catch (error) {
    setMensaje('Error al guardar: ' + error.message)
  } finally {
    setGuardandoConfiguracion(false)
  }
}

  // INTERFAZ
  return (

    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#eaf5fc',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>


 {/* ENCABEZADO ADMINISTRATIVO */}
      <img
  src="https://xhxornnrmtjrgdhdznzv.supabase.co/storage/v1/object/public/fotos-purificadora/logo_puri.png"
  alt="Sistema de Control Administrativo"
 style={{
  width: '100%',
  maxWidth: '1100px',
  height: 'auto',
  display: 'block',
  marginBottom: '25px',
  borderRadius: '12px',
  boxShadow: '0 5px 18px rgba(0,0,0,0.15)'
}}
/>
{/* TARJETA ADMINISTRATIVA */}
      <div style={{
        width: '100%',
        maxWidth: '1080px',
        background: 'white',
        padding: '35px',
        borderRadius: '15px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.12)',
        textAlign: 'center'
      }}>

        {/* RECUPERACIÓN DE CONTRASEÑA */}

        {modoRecuperacion ? (

          <>

            <h3 style={{ color: '#0877b9' }}>
              Crear nueva contraseña
            </h3>

            <p style={{ marginBottom: '20px' }}>
              Escribe tu nueva contraseña.
            </p>

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={estiloInput}
            />

            <button
              type="button"
              onClick={cambiarPassword}
              disabled={cargando}
              style={estiloBoton}
            >
              {cargando ? 'Guardando...' : 'Guardar contraseña'}
            </button>

            {mensaje && (
              <p style={{ color: '#d32f2f', marginTop: '15px' }}>
                {mensaje}
              </p>
            )}

          </>

        ) : administrador ? (

  <>
    

   {/* ADMINISTRADOR AUTORIZADO */}

<h2 style={{ color: '#17c907b0', marginBottom: '10px' }}>
  Bienvenido al sistema de Purificadora Ángel.
</h2>
 
<p style={{ color: '#607d8b', marginBottom: '25px' }}>
  Elige una categoría
</p>

<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px'
}}>

  <button
    style={estiloMenu}
    onClick={cargarProductos}
    disabled={cargandoProductos}
  >
    {cargandoProductos ? 'Cargando...' : '📦 Productos'}
  </button>

  <button
    style={estiloMenu}
    onClick={cargarPromociones}
    disabled={cargandoPromociones}
  >
    {cargandoPromociones ? 'Cargando...' : '🎁 Promociones'}
  </button>

  <button
    style={estiloMenu}
    onClick={cargarHorarios}
    disabled={cargandoHorarios}
  >
    {cargandoHorarios ? 'Cargando...' : '🕒 Horarios'}
  </button>

  <button style={estiloMenu}>
    🖼️ Fotografías
  </button>

  <button
    style={estiloMenu}
    onClick={cargarConfiguracion}
    disabled={cargandoConfiguracion}
  >
    {cargandoConfiguracion
      ? 'Cargando...'
      : '⚙️ Datos del negocio'}
  </button>

</div> 

{mostrarHorarios && (

  <div style={{
    marginTop: '25px',
    padding: '18px',
    background: '#f5faff',
    borderRadius: '10px',
    textAlign: 'left'
  }}>

    <h3 style={{
      color: '#0877b9',
      textAlign: 'center',
      marginBottom: '20px'
    }}>
      🕒 Administración de horarios
    </h3>


{/* LUNES A VIERNES */}
<div style={{
  background: 'white',
  padding: '15px',
  borderRadius: '10px',
  marginBottom: '15px',
  border: '1px solid #cbdce8'
}}>

  <h3 style={{ color: '#0877b9', marginBottom: '12px' }}>
    Lunes a viernes
  </h3>

  <label>Inicio de atención</label>
  <input
    type="time"
    style={estiloInput}
    value={horarios.find(h => h.dia === 'lunes')?.atencion_inicio || ''}
    onChange={e => setHorarios(prev => prev.map(h =>
      ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].includes(h.dia)
        ? { ...h, atencion_inicio: e.target.value }
        : h
    ))}
  />

  <label>Fin de atención</label>
  <input
    type="time"
    style={estiloInput}
    value={horarios.find(h => h.dia === 'lunes')?.atencion_fin || ''}
    onChange={e => setHorarios(prev => prev.map(h =>
      ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].includes(h.dia)
        ? { ...h, atencion_fin: e.target.value }
        : h
    ))}
  />

  <label style={{ display: 'block', marginTop: '12px' }}>
    <input
      type="checkbox"
      checked={!!horarios.find(h => h.dia === 'lunes')?.entrega}
      onChange={e => setHorarios(prev => prev.map(h =>
        ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].includes(h.dia)
          ? { ...h, entrega: e.target.checked }
          : h
      ))}
    />
    {' '}Activar entregas a domicilio
  </label>

  <label>Inicio de entregas</label>
  <input
    type="time"
    style={estiloInput}
    disabled={!horarios.find(h => h.dia === 'lunes')?.entrega}
    value={horarios.find(h => h.dia === 'lunes')?.entrega_inicio || ''}
    onChange={e => setHorarios(prev => prev.map(h =>
      ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].includes(h.dia)
        ? { ...h, entrega_inicio: e.target.value }
        : h
    ))}
  />

  <label>Fin de entregas</label>
  <input
    type="time"
    style={estiloInput}
    disabled={!horarios.find(h => h.dia === 'lunes')?.entrega}
    value={horarios.find(h => h.dia === 'lunes')?.entrega_fin || ''}
    onChange={e => setHorarios(prev => prev.map(h =>
      ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].includes(h.dia)
        ? { ...h, entrega_fin: e.target.value }
        : h
    ))}
  />
  <button
    onClick={() => guardarGrupoHorario(
      ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
      horarios.find(h => h.dia === 'lunes')
    )}


    disabled={guardandoHorario}
    style={{
      ...estiloBoton,
      width: '100%',
      background: '#16834a',
      marginTop: '12px'
    }}
  >
    {guardandoHorario ? 'Guardando...' : '💾 Guardar lunes a viernes'}
  </button>

</div>

{/* SÁBADOS Y DOMINGOS */}
<div style={{
  background: 'white',
  padding: '15px',
  borderRadius: '10px',
  marginBottom: '15px',
  border: '1px solid #cbdce8'
}}>

  <h3 style={{ color: '#0877b9', marginBottom: '12px' }}>
    Sábados y domingos
  </h3>

  <label>Inicio de atención</label>
  <input
    type="time"
    style={estiloInput}
    value={horarios.find(h => h.dia === 'sabado')?.atencion_inicio || ''}
    onChange={e => setHorarios(prev => prev.map(h =>
      ['sabado', 'domingo'].includes(h.dia)
        ? { ...h, atencion_inicio: e.target.value }
        : h
    ))}
  />

  <label>Fin de atención</label>
  <input
    type="time"
    style={estiloInput}
    value={horarios.find(h => h.dia === 'sabado')?.atencion_fin || ''}

    onChange={e => setHorarios(prev => prev.map(h =>
      ['sabado', 'domingo'].includes(h.dia)
        ? { ...h, atencion_fin: e.target.value }
        : h
    ))}
  />

  <label style={{ display: 'block', marginTop: '12px' }}>
    <input
      type="checkbox"
      checked={!!horarios.find(h => h.dia === 'sabado')?.entrega}
      onChange={e => setHorarios(prev => prev.map(h =>
        ['sabado', 'domingo'].includes(h.dia)
          ? { ...h, entrega: e.target.checked }
          : h
      ))}
    />
    {' '}Activar entregas a domicilio
  </label>

  <label>Inicio de entregas</label>
  <input
    type="time"
    style={estiloInput}
    disabled={!horarios.find(h => h.dia === 'sabado')?.entrega}
    value={horarios.find(h => h.dia === 'sabado')?.entrega_inicio || ''}
    onChange={e => setHorarios(prev => prev.map(h =>
      ['sabado', 'domingo'].includes(h.dia)
        ? { ...h, entrega_inicio: e.target.value }
        : h
    ))}
  />

  <label>Fin de entregas</label>
  <input
    type="time"
    style={estiloInput}
    disabled={!horarios.find(h => h.dia === 'sabado')?.entrega}
    value={horarios.find(h => h.dia === 'sabado')?.entrega_fin || ''}
    onChange={e => setHorarios(prev => prev.map(h =>
      ['sabado', 'domingo'].includes(h.dia)
        ? { ...h, entrega_fin: e.target.value }
        : h
    ))}
  />
  <button
    onClick={() => guardarGrupoHorario(
      ['sabado', 'domingo'],
      horarios.find(h => h.dia === 'sabado')
    )}
    disabled={guardandoHorario}
    style={{
      ...estiloBoton,
      width: '100%',
      background: '#16834a',
      marginTop: '12px'
    }}
  >
    {guardandoHorario ? 'Guardando...' : '💾 Guardar sábados y domingos'}
  </button>

</div>
    {mensaje && (
      <p style={{
        color: mensaje.startsWith('¡') ? '#16834a' : '#d9534f',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '15px'
      }}>
        {mensaje}
      </p>
    )}

    <button
      onClick={() => setMostrarHorarios(false)}
      style={{
        ...estiloBoton,
        width: '100%',
        background: '#d9534f'
      }}
    >
      Cancelar y regresar
    </button>

  </div>

)}


{mostrarPromociones && (

  <div style={{
    marginTop: '25px',
    padding: '18px',
    background: '#f5faff',
    borderRadius: '10px',
    textAlign: 'left'
  }}>

    <h3 style={{
      color: '#0877b9',
      textAlign: 'center',
      marginBottom: '20px'
    }}>
      🎁 Administración de promociones
<button
  onClick={() => {
    setPromocionForm({
      titulo: '',
      descripcion: '',
      precio: '',
      descuento: '',
      fotografia: '',
      fecha_inicio: '',
      fecha_fin: '',
      activo: true
    })
    setFotoPromocion(null)
    setMostrarFormularioPromocion(true)
  }}
  style={{
    ...estiloBoton,
    width: '100%',
    marginBottom: '20px'
  }}
>
  ➕ Nueva promoción
</button>

    </h3>
{mostrarFormularioPromocion && (

  <div style={{
    background: 'white',
    padding: '18px',
    borderRadius: '10px',
    border: '1px solid #cbdce8',
    marginBottom: '20px'
  }}>

    <h3 style={{ color: '#0877b9' }}>
  {promocionEditar ? '✏️ Editar promoción' : '➕ Nueva promoción'}
</h3>

    <label>Título de la promoción</label>
    <input
      type="text"
      style={estiloInput}
      value={promocionForm.titulo}
      onChange={e => setPromocionForm({
        ...promocionForm,
        titulo: e.target.value
      })}
    />

    <label>Descripción</label>
    <textarea
      style={estiloInput}
      value={promocionForm.descripcion}
      onChange={e => setPromocionForm({
        ...promocionForm,
        descripcion: e.target.value
      })}
    />

    <label>Precio</label>
    <input
      type="number"
      step="0.01"
      style={estiloInput}
      value={promocionForm.precio}
      onChange={e => setPromocionForm({
        ...promocionForm,
        precio: e.target.value
      })}
    />

    <label>Descuento (%)</label>
    <input
      type="number"
      step="0.01"
      style={estiloInput}
      value={promocionForm.descuento}
      onChange={e => setPromocionForm({
        ...promocionForm,
        descuento: e.target.value
      })}
    />

    <label>Fotografía</label>
    <input
      type="file"
      accept="image/*"
      style={estiloInput}
      onChange={e => setFotoPromocion(e.target.files[0] || null)}
    />

    <label>Fecha de inicio</label>
    <input
      type="date"
      style={estiloInput}
      value={promocionForm.fecha_inicio}
      onChange={e => setPromocionForm({
        ...promocionForm,
        fecha_inicio: e.target.value
      })}
    />

    <label>Fecha de fin</label>
    <input
      type="date"
      style={estiloInput}
      value={promocionForm.fecha_fin}
      onChange={e => setPromocionForm({
        ...promocionForm,
        fecha_fin: e.target.value
      })}
    />

    <label style={{ display: 'block', marginTop: '12px' }}>
      <input
        type="checkbox"
        checked={promocionForm.activo}
        onChange={e => setPromocionForm({
          ...promocionForm,
          activo: e.target.checked
        })}
      />
      {' '}Promoción activa
    </label>
<div style={{
  display: 'flex',
  gap: '10px',
  marginTop: '18px'
}}>

  <button
    onClick={guardarPromocion}
    disabled={guardandoPromocion}
    style={{
      ...estiloBoton,
      flex: 1,
      background: '#16834a'
    }}
  >
    {guardandoPromocion ? 'Guardando...' : '💾 Guardar promoción'}
  </button>

  <button
    onClick={() => {
      setMostrarFormularioPromocion(false)
      setFotoPromocion(null)
    }}
    disabled={guardandoPromocion}
    style={{
      ...estiloBoton,
      flex: 1,
      background: '#d9534f'
    }}
  >
    Cancelar
  </button>

</div>
  </div>

)}
    {promociones.length === 0 ? (

      <p style={{ textAlign: 'center' }}>
        No hay promociones registradas.
      </p>

    ) : (

      promociones.map(promocion => (

        <div
          key={promocion.id}
          style={{
            background: 'white',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '15px',
            border: '1px solid #cbdce8'
          }}
        >

          <h3 style={{ color: '#0877b9' }}>
            {promocion.titulo}
          </h3>

          <p>{promocion.descripcion}</p>

          <p>Precio: ${promocion.precio ?? 'No definido'}</p>

          <p>Descuento: {promocion.descuento ?? 0}%</p>

          <p>
            Estado: {promocion.activo ? '🟢 Activa' : '🔴 Inactiva'}
          </p>
<button
  onClick={() => {
    setPromocionEditar(promocion)

    setPromocionForm({
      titulo: promocion.titulo || '',
      descripcion: promocion.descripcion || '',
      precio: promocion.precio ?? '',
      descuento: promocion.descuento ?? '',
      fotografia: promocion.fotografia || '',
      fecha_inicio: promocion.fecha_inicio || '',
      fecha_fin: promocion.fecha_fin || '',
      activo: promocion.activo
    })

    setFotoPromocion(null)
    setMostrarFormularioPromocion(true)
  }}
  style={{
    ...estiloBoton,
    width: '100%',
    background: '#0877b9',
    marginTop: '10px'
  }}
>
  ✏️ Editar promoción
</button>
        </div>

      ))

    )}

    <button
      onClick={() => setMostrarPromociones(false)}
      style={{
        ...estiloBoton,
        width: '100%',
        background: '#d9534f'
      }}
    >
      Cancelar y regresar
    </button>

  </div>

)}



{mostrarConfiguracion && (

  <div style={{
    marginTop: '25px',
    padding: '18px',
    background: '#f5faff',
    borderRadius: '10px',
    textAlign: 'left'
  }}>

    <h3 style={{
      color: '#0877b9',
      marginBottom: '18px',
      textAlign: 'center'
    }}>
      ⚙️ Datos del negocio
    </h3>

    <label>Nombre del negocio</label>

    <input
      style={estiloInput}
      value={configuracion.nombre}
      onChange={e => setConfiguracion({
        ...configuracion,
        nombre: e.target.value
      })}
      placeholder="Purificadora Ángel"
    />

    <label>Dirección</label>

    <textarea
      style={{
        ...estiloInput,
        minHeight: '85px',
        resize: 'vertical'
      }}
      value={configuracion.direccion}
      onChange={e => setConfiguracion({
        ...configuracion,
        direccion: e.target.value
      })}
      placeholder="Escribe la dirección del negocio"
    />

    <label>WhatsApp</label>

    <input
      type="text"
      style={estiloInput}
      value={configuracion.whatsapp}
      onChange={e => setConfiguracion({
        ...configuracion,
        whatsapp: e.target.value
      })}
      placeholder="Número de WhatsApp"
    />
<label>Latitud</label>

<input
  type="number"
  step="any"
  style={estiloInput}
  value={configuracion.latitud}
  onChange={e => setConfiguracion({
    ...configuracion,
    latitud: e.target.value
  })}
  placeholder="Ej. 19.345928"
/>

<label>Longitud</label>

<input
  type="number"
  step="any"
  style={estiloInput}
  value={configuracion.longitud}
  onChange={e => setConfiguracion({
    ...configuracion,
    longitud: e.target.value
  })}
  placeholder="Ej. -99.008029"
/>
    <button
      onClick={guardarConfiguracion}
      disabled={guardandoConfiguracion}
      style={{
        ...estiloBoton,
        display: 'block',
        width: '100%',
        background: '#16834a',
        marginTop: '15px',
        marginBottom: '12px'
      }}
    >
      {guardandoConfiguracion
  ? 'Guardando...'
  : '💾 Guardar datos'}
</button>

{mensaje && (
  <p style={{
    color: mensaje.startsWith('¡') ? '#16834a' : '#d9534f',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '15px'
  }}>
    {mensaje}
  </p>
)}

<button
  onClick={() => setMostrarConfiguracion(false)}
  style={{
    ...estiloBoton,
    display: 'block',
    width: '100%',
    background: '#d9534f'
  }}
>
  Cancelar y Regresar
</button>

  </div>
)}






{mostrarProductos && (

  <div style={{
    marginTop: '25px',
    padding: '15px',
    background: '#f5faff',
    borderRadius: '10px',
    textAlign: 'left'
  }}>

    <h3 style={{
      color: '#0877b9',
      marginBottom: '15px',
      textAlign: 'center'
    }}>
      Productos registrados
    </h3>
<button
  onClick={() => {
    setNuevoProducto({
      nombre: '',
      precio_mostrador: '',
      precio_domicilio: '',
      Descripcion: '',
      Activo: true
    })
    setFotoProducto(null)
    setMostrarNuevoProducto(true)
    setMostrarProductos(false)
    setProductoEditar(null)
  }}
  style={{
    ...estiloBoton,
    background: '#16834a',
    marginBottom: '20px'
  }}
>
  ➕ Agregar producto
</button>

    {productos.length === 0 ? (

      <p>No hay productos registrados.</p>

    ) : (
      productos.map((producto, indice) => (

  <div key={producto.id ?? indice} style={{
    background: 'white',
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '10px',
    border: '1px solid #cbdce8'
  }}>

<div style={{
  display: 'flex',
  alignItems: 'flex-start',
  gap: '20px'
}}>

  {/* INFORMACIÓN A LA IZQUIERDA */}
  <div style={{
    flex: '1',
    textAlign: 'left'
  }}>

    <strong style={{ color: '#0877b9' }}>
      Producto {indice + 1}
    </strong>

    <h3 style={{
      color: '#5c23f8',
      margin: '5px 0'
    }}>
      {producto.nombre}
    </h3>

    <p style={{ margin: '3px 0' }}>
      <strong>Mostrador:</strong> ${producto.precio_mostrador}
    </p>

    <p style={{ margin: '3px 0' }}>
      <strong>Domicilio:</strong> ${producto.precio_domicilio}
    </p>

    <p style={{ margin: '3px 0' }}>
      <strong>Descripción:</strong> {producto.Descripcion}
    </p>

    <p style={{
      color: producto.Activo ? '#16834a' : '#d9534f',
      fontWeight: 'bold',
      marginTop: '8px'
    }}>
      {producto.Activo ? '● Activo' : '● Inactivo'}
    </p>

  </div>

  {/* FOTOGRAFÍA A LA DERECHA */}
  <img
    src={producto.Fotografia}
    alt={producto.nombre}
    style={{
      width: '45%',
      height: '220px',
      objectFit: 'contain',
      background: '#ffffff',
      borderRadius: '8px',
      flexShrink: 0
    }}
  />
<button
  onClick={() => setMostrarProductos(false)}
  style={{
    ...estiloBoton,
    background: '#d9534f',
    width: '20%',
    marginTop: '85px'
  }}
>
  ↩️ Cancelar y regresar
</button>










</div>




    <button
  onClick={() => {
    setProductoEditar(producto)
    setMostrarProductos(false)
    setMostrarNuevoProducto(false)
  }}
  style={{
    width: '100%',
    padding: '11px',
    marginTop: '12px',
    background: '#0877b9',
    color: 'white',
    border: 'none',
    borderRadius: '7px',
    fontSize: '15px',
    cursor: 'pointer'
  }}
>
  ✏️ Editar producto
</button>

  </div>

))

    )}

  </div>

)}
  

{mostrarNuevoProducto && (

  <div style={{
    marginTop: '25px',
    padding: '18px',
    background: '#f5faff',
    borderRadius: '10px',
    textAlign: 'left'
  }}>

    <h3 style={{
      color: '#16834a',
      marginBottom: '18px'
    }}>
      ➕ Registrar nuevo producto
    </h3>

    <label>Nombre del producto</label>

    <input
      style={estiloInput}
      value={nuevoProducto.nombre}
      onChange={e => setNuevoProducto({
        ...nuevoProducto,
        nombre: e.target.value
      })}
      placeholder="Ej. Garrafón grande"
    />

    <label>Precio mostrador</label>

    <input
      type="number"
      style={estiloInput}
      value={nuevoProducto.precio_mostrador}
      onChange={e => setNuevoProducto({
        ...nuevoProducto,
        precio_mostrador: e.target.value
      })}
      placeholder="Precio"
    />

    <label>Precio domicilio</label>

    <input
      type="number"
      style={estiloInput}
      value={nuevoProducto.precio_domicilio}
      onChange={e => setNuevoProducto({
        ...nuevoProducto,
        precio_domicilio: e.target.value
      })}
      placeholder="Precio"
    />

    <label>Descripción</label>

    <textarea
      style={{
        ...estiloInput,
        minHeight: '75px',
        resize: 'vertical'
      }}
      value={nuevoProducto.Descripcion}
      onChange={e => setNuevoProducto({
        ...nuevoProducto,
        Descripcion: e.target.value
      })}
      placeholder="Descripción del producto"
    />

    <label>Fotografía del producto</label>

    <input
      type="file"
      accept="image/*"
      style={{
        ...estiloInput,
        background: 'white'
      }}
      onChange={e => setFotoProducto(
        e.target.files[0] || null
      )}
    />

    

{/* BOTÓN GUARDAR PRODUCTO */}

<button
  onClick={guardarNuevoProducto}
  disabled={guardandoNuevo}
  style={{
    ...estiloBoton,
    display: 'block',
    width: '100%',
    background: '#16834a',
    marginBottom: '12px'
  }}
>
  {guardandoNuevo
    ? 'Registrando producto...'
    : '💾 Guardar producto'}
</button>

{/* BOTÓN CANCELAR */}

<button
  onClick={() => {
    setMostrarNuevoProducto(false)
    setMostrarProductos(true)
  }}
  style={{
    ...estiloBoton,
    display: 'block',
    width: '100%',
    background: '#d9534f',
    marginTop: '5px'
  }}
>
  Cancelar y Regresar
</button>

</div>

)}


{productoEditar && (

  <div style={{
    marginTop: '25px',
    padding: '18px',
    background: '#f5faff',
    borderRadius: '10px',
    textAlign: 'left'
  }}>

    <h3 style={{
      color: '#0877b9',
      marginBottom: '15px'
    }}>
      Editar producto
    </h3>

    <label>Nombre</label>

    <input
      style={estiloInput}
      value={productoEditar.nombre || ''}
      onChange={e => setProductoEditar({
        ...productoEditar,
        nombre: e.target.value
      })}
    />

    <label>Precio mostrador</label>

    <input
      type="number"
      style={estiloInput}
      value={productoEditar.precio_mostrador ?? ''}
      onChange={e => setProductoEditar({
        ...productoEditar,
        precio_mostrador: Number(e.target.value)
      })}
    />

    <label>Precio domicilio</label>

    <input
      type="number"
      style={estiloInput}
      value={productoEditar.precio_domicilio ?? ''}
      onChange={e => setProductoEditar({
        ...productoEditar,
        precio_domicilio: Number(e.target.value)
      })}
    />

    <label>Descripción</label>

    <textarea
      style={{
        ...estiloInput,
        minHeight: '75px',
        resize: 'vertical'
      }}
      value={productoEditar.Descripcion || ''}
      onChange={e => setProductoEditar({
        ...productoEditar,
        Descripcion: e.target.value
      })}
    />

    <label>Estado del producto</label>

    <select
      style={estiloInput}
      value={productoEditar.Activo ? 'true' : 'false'}
      onChange={e => setProductoEditar({
        ...productoEditar,
        Activo: e.target.value === 'true'
      })}
    >
      <option value="true">Activo</option>
      <option value="false">Inactivo</option>
    </select>



    {/* BOTÓN GUARDAR */}

    <button
      onClick={guardarCambios}
      disabled={guardandoProducto}
      style={{
        ...estiloBoton,
        display: 'block',
        width: '100%',
        background: '#16834a',
        marginBottom: '12px'
      }}
    >
      {guardandoProducto
        ? 'Guardando...'
        : '💾 Guardar cambios'}
    </button>

    {/* BOTÓN CANCELAR */}

    <button
  onClick={() => {
    setProductoEditar(null)
    setMostrarProductos(true)
  }}
  style={{
    ...estiloBoton,
    display: 'block',
    width: '100%',
    background: '#d9534f',
    marginTop: '5px'
  }}
>
  Cancelar
</button>

  </div>

)}



{/* CERRAR SESIÓN */}

<button
  onClick={cerrarSesion}
  style={{
    ...estiloBoton,
    marginTop: '25px',
    background: '#d9534f'
  }}
>
  Cerrar sesión
</button>
  </>

) : (
          /* INICIO DE SESIÓN */

          <form onSubmit={iniciarSesion}>

            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              required
              style={estiloInput}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={estiloInput}
            />

            <button
              type="submit"
              disabled={cargando}
              style={estiloBoton}
            >
              {cargando ? 'Verificando...' : 'Iniciar sesión'}
            </button>

            <button
              type="button"
              onClick={solicitarRecuperacion}
              disabled={cargando}
              style={{
                ...estiloBoton,
                background: '#eaf5fc',
                color: '#0877b9',
                marginTop: '12px'
              }}
            >
              Recuperar contraseña
            </button>

            {mensaje && (
              <p style={{ color: '#d32f2f', marginTop: '15px' }}>
                {mensaje}
              </p>
            )}

          </form>

        )}

      </div>

    </div>

  )
}

// ESTILOS

const estiloInput = {
  width: '100%',
  padding: '13px',
  marginBottom: '15px',
  border: '1px solid #cbdce8',
  borderRadius: '7px',
  fontSize: '15px',
  boxSizing: 'border-box'
}

const estiloBoton = {
  width: '100%',
  padding: '13px',
  background: '#0877b9',
  color: 'white',
  border: 'none',
  borderRadius: '7px',
  fontSize: '16px',
  cursor: 'pointer'
}

const estiloMenu = {
  padding: '20px 8px',
  background: '#eaf5fc',
  color: '#0877b9',
  border: '1px solid #cbdce8',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: 'bold',
  cursor: 'pointer'
}



export default Admin