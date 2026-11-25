
import React from 'react'
import './App.css'
import { supabase } from './supabase'
import Admin from './Admin'
function PaginaPublica() {

const [conexion, setConexion] = React.useState('Conectando...')
const [productos, setProductos] = React.useState([])
const [cargando, setCargando] = React.useState(true)
const [estadoEntrega, setEstadoEntrega] = React.useState('')
const [horarios, setHorarios] = React.useState([])
const [promociones, setPromociones] = React.useState([])
const [cargandoPromociones, setCargandoPromociones] = React.useState(true)

const [cargandoHorarios, setCargandoHorarios] = React.useState(true)
const [configuracion, setConfiguracion] = React.useState({
  id: null,
  nombre: '',
  direccion: '',
  whatsapp: '',
  latitud: 19.34593332120715,
  longitud: -99.00800385605852
})

const [cargandoConfiguracion, setCargandoConfiguracion] = React.useState(true)

React.useEffect(() => {

async function cargarProductos() {

try {

const { data, error } = await supabase
.from('productos')
.select('*')
.eq('Activo', true)
.order('id', { ascending: true })

if (error) {
console.error(error)
setConexion('Error al cargar productos')
return
}

setProductos(data || [])
setConexion('Conectado correctamente')

} catch (error) {

console.error(error)
setConexion('Error de conexión')

} finally {

setCargando(false)

}

}

cargarProductos()

}, [])

React.useEffect(() => {
async function cargarHorarios() {
try {
const { data, error } = await supabase
.from('horarios')
.select('*')
.order('id', { ascending: true })

if (error) {
console.error('Error al cargar horarios:', error)
return
}

setHorarios(data || [])

} catch (error) {
console.error('Error de conexión con horarios:', error)
} finally {
setCargandoHorarios(false)
}
}
cargarHorarios()
}, [])

React.useEffect(() => {

  async function cargarConfiguracion() {

    try {

      const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setConfiguracion({
  nombre: data.nombre || 'Purificadora Ángel',
  direccion: data.direccion || '',
  whatsapp: data.whatsapp || '',
  latitud: data.latitud ?? 19.34593332120715,
  longitud: data.longitud ?? -99.00800385605852
})
      }

    } catch (error) {

      console.error('Error al cargar configuración:', error)

    } finally {

      setCargandoConfiguracion(false)

    }

  }

  cargarConfiguracion()

}, [])

React.useEffect(() => {
async function cargarPromociones() {
try {
const { data, error } = await supabase
.from('promociones')
.select('*')
.eq('activo', true)
.order('id', { ascending: true })

if (error) {
console.error('Error al cargar promociones:', error)
return
}

console.log('Promociones cargadas:', data)
setPromociones(data || [])

} catch (error) {
console.error('Error de conexión con promociones:', error)
} finally {
setCargandoPromociones(false)
}
}

cargarPromociones()
}, [])


React.useEffect(() => {

function revisarEntrega() {

if (horarios.length === 0) return

const ahora = new Date()

const diaActual = new Intl.DateTimeFormat('es-MX', {
weekday: 'long',
timeZone: 'America/Mexico_City'
}).format(ahora).toLowerCase()
.normalize('NFD')
.replace(/[\u0300-\u036f]/g, '')

const horaActual = new Intl.DateTimeFormat('en-GB', {
hour: '2-digit',
minute: '2-digit',
hourCycle: 'h23',
timeZone: 'America/Mexico_City'
}).format(ahora)

const horarioDia = horarios.find(h => h.dia === diaActual)

if (!horarioDia) return

if (!horarioDia.entrega) {
setEstadoEntrega('Hoy no contamos con servicio a domicilio.')
return
}

if (horaActual < horarioDia.entrega_inicio) {
setEstadoEntrega(
`Las entregas comienzan a las ${formatoHora(horarioDia.entrega_inicio)}.`
)
return
}

if (horaActual >= horarioDia.entrega_fin) {
setEstadoEntrega('El horario de entregas terminó por hoy.')
return
}

setEstadoEntrega('¡Tenemos servicio a domicilio!')
}

revisarEntrega()

const intervalo = setInterval(revisarEntrega, 60000)

return () => clearInterval(intervalo)

}, [horarios])




const formatoPrecio = (precio) => {

return new Intl.NumberFormat('es-MX', {
style: 'currency',
currency: 'MXN'
}).format(precio || 0)

}
const formatoHora = (hora) => {
if (!hora) return ''

const [horas, minutos] = hora.split(':')
const h = Number(horas)
const periodo = h >= 12 ? 'p. m.' : 'a. m.'
const hora12 = h % 12 || 12

return `${hora12}:${minutos} ${periodo}`
}
return (

<div className="pagina">

<div className="estado-conexion">
● {conexion}
</div>


<header className="encabezado">
<div className="marca">
<p>Agua purificada para tu familia</p>
<img
src="https://xhxornnrmtjrgdhdznzv.supabase.co/storage/v1/object/public/fotos-purificadora/principalPurificadoraAngel.png"
alt="Purificadora Ángel"
/>
</div>
</header>
<nav className="menu">
<a href="#inicio">Inicio</a>
<a href="#productos">Productos</a>
<a href="#contacto">Contacto</a>
</nav>
<section id="inicio" className="bienvenida">
<h2>Agua pura, confianza y calidad</h2>

<p>
En Purificadora Ángel trabajamos para llevar hasta tu hogar
agua purificada de excelente calidad.
</p>

<a href="#productos" className="boton">
Conoce nuestros productos
</a>
</section>


<section id="horarios" className="horarios">
<h2>Horarios de atención</h2>
<p className="subtitulo-horarios">
Estamos listos para atenderte.
</p>

{cargandoHorarios ? (
<p>Cargando horarios...</p>
) : (
<div className="lista-horarios">

{/* LUNES A VIERNES */}
<article className="tarjeta-horario">
<h3>Lunes a viernes</h3>

<p>
<strong>🕒 Atención:</strong>
<span>
{formatoHora(horarios.find(h => h.dia === 'lunes')?.atencion_inicio)} -
{' '}{formatoHora(horarios.find(h => h.dia === 'lunes')?.atencion_fin)}
</span>
</p>

<p>
<strong>🚚 Entregas a domicilio:</strong>
<span>
{horarios.find(h => h.dia === 'lunes')?.entrega
  ? `${formatoHora(horarios.find(h => h.dia === 'lunes')?.entrega_inicio)} - ${formatoHora(horarios.find(h => h.dia === 'lunes')?.entrega_fin)}`
  : 'No disponible'}
</span>
</p>
</article>

{/* SÁBADOS Y DOMINGOS */}
<article className="tarjeta-horario">
<h3>Sábados y domingos</h3>

<p>
<strong>🕒 Atención:</strong>
<span>
{formatoHora(horarios.find(h => h.dia === 'sabado')?.atencion_inicio)} -
{' '}{formatoHora(horarios.find(h => h.dia === 'sabado')?.atencion_fin)}
</span>
</p>

<p>

<strong>🚚 Entregas a domicilio:</strong>

<span>
{horarios.find(h => h.dia === 'sabado')?.entrega
  ? `${formatoHora(horarios.find(h => h.dia === 'sabado')?.entrega_inicio)} - ${formatoHora(horarios.find(h => h.dia === 'sabado')?.entrega_fin)}`
  : 'No disponibles'}
</span>

</p>
</article>

</div>
)}
{!cargandoHorarios && estadoEntrega && (
<div className={`aviso-entrega ${
estadoEntrega === '¡Tenemos servicio a domicilio!'
? 'disponible'
: 'no-disponible'
}`}>
<span>
{estadoEntrega === '¡Tenemos servicio a domicilio!' ? '🚚' : 'ℹ️'}
</span>

<p>{estadoEntrega}</p>
</div>
)}
</section>

<section id="productos" className="productos">

<h2>Nuestros productos</h2>

<p className="subtitulo">
Conoce nuestros productos y precios.
</p>

{cargando && <p>Cargando productos...</p>}

{!cargando && productos.length === 0 && (
<p>Actualmente no hay productos disponibles.</p>
)}

<div className="lista-productos">

{productos.map((producto) => (

<article className="producto" key={producto.id}>

{producto.Fotografia ? (

<img
src={producto.Fotografia}
alt={producto.nombre}
className="imagen-producto"
/>

) : (

<div className="imagen-sin-foto">
💧
</div>

)}

<div className="contenido-producto">

<h3>{producto.nombre}</h3>

<p className="descripcion">
{producto.Descripcion}
</p>

<div className="precios">
<p>
<span>Precio mostrador</span>
<strong>
{formatoPrecio(producto.precio_mostrador)}
</strong>
</p>

<p>
<span>Precio domicilio</span>
<strong>
{formatoPrecio(producto.precio_domicilio)}
</strong>
</p>

</div>

</div>

</article>

))}

</div>

</section>

{/* SECCIÓN DE PROMOCIONES */}
<section id="promociones" className="promociones">
<h2>Promociones especiales</h2>

<p className="mensaje-economia">
  💧 En apoyo a tu economía
</p>

{!cargandoPromociones && promociones.length > 0 && (
  <p className="subtitulo-promociones">
    Aprovecha nuestras promociones.
  </p>
)}

{cargandoPromociones ? (
<p>Cargando promociones...</p>
) : promociones.length === 0 ? (

<div className="sin-promociones-contenedor">

  <img
    src="https://xhxornnrmtjrgdhdznzv.supabase.co/storage/v1/object/public/fotos-promociones/sinPromocion.png"
    alt="Próximamente tendremos promociones para ti"
    className="imagen-sin-promociones"
  />

  <p className="sin-promociones">
    Actualmente No Contamos Con Promociones.
  </p>

</div>

) : (
<div className="lista-promociones">
{promociones.map((promo) => (
<article className="tarjeta-promocion" key={promo.id}>

<div className="sello-promocion">
<span>¡OFERTA!</span>
</div>


<img
src={promo.fotografia}
alt={promo.titulo}
className="imagen-promocion"
/>

<h3>{promo.titulo}</h3>

<p>{promo.descripcion}</p>

{promo.precio !== null && promo.precio !== '' && (
  <p className="precio-promocion">
    <strong>Precio especial:</strong> ${Number(promo.precio).toFixed(2)}
  </p>
)}

{promo.descuento > 0 && (
  <p className="descuento-promocion">
    <strong>Descuento:</strong> {promo.descuento}%
  </p>
)}

{promo.fecha_inicio && (
  <p className="fecha-inicio">
    📅 <strong>Fecha de inicio:</strong> {promo.fecha_inicio}
  </p>
  
)}

{promo.fecha_fin && (
  <p className="fecha-fin">
    🏁 <strong>Fecha de fin:</strong> {promo.fecha_fin}
  </p>
)}


</article>
))}
</div>
)}
</section>
<section id="contacto" className="contacto">

<h2>Estamos para atenderte</h2>

<p className="texto-contacto">
En Purificadora Ángel estamos listos para llevar
agua purificada hasta tu hogar.
</p>

<div className="tarjeta-contacto">

<h3>¡Haz tu pedido!</h3>

<p>Comunícate con nosotros por WhatsApp.</p>

<a
href={`https://wa.me/${configuracion.whatsapp.replace(/\D/g, '')}?text=Hola%2C%20quiero%20realizar%20un%20pedido.`}
className="boton-whatsapp"
target="_blank"
rel="noopener noreferrer"
>
WhatsApp
</a>

</div>

</section>
<div className="tarjeta-ubicacion">

<h3>¿Dónde estamos?</h3>

<p>Visítanos en Purificadora Ángel.</p>

<div className="mapa">

<iframe
  src={`https://www.google.com/maps?q=${configuracion.latitud},${configuracion.longitud}&output=embed`}
  width="100%"
  height="300"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Ubicación Purificadora Ángel"
/>

</div>

<div className="direccion-negocio">

<h4>📍 Nuestra dirección</h4>

<p>
  {configuracion.direccion}
</p>

</div>

</div>

<footer className="pie-pagina">

<img
src="https://xhxornnrmtjrgdhdznzv.supabase.co/storage/v1/object/public/fotos-purificadora/angel.jpg"
alt="Purificadora Ángel"
className="logo-footer"
/>

<h3>{configuracion.nombre}</h3>

<p>Agua purificada de calidad para tu familia</p>

<a

href={`https://wa.me/${configuracion.whatsapp.replace(/\D/g, '')}?text=Hola%2C%20quiero%20realizar%20un%20pedido.`}
>
Contáctanos por WhatsApp
</a>

<div className="derechos">
© {new Date().getFullYear()} Purificadora Ángel.
Todos los derechos reservados.
</div>

</footer>

</div>

)

}

function App() {
  const esAdmin =
    window.location.pathname === '/admin' ||
    window.location.hash.includes('type=recovery') ||
    new URLSearchParams(window.location.search).has('code') ||
    new URLSearchParams(window.location.search).get('type') === 'recovery'

  return esAdmin ? <Admin /> : <PaginaPublica />
}

export default App