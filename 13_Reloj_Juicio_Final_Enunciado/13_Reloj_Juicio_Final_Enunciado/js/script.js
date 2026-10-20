'use strict';

// Activamos los plugins de Day.js y el idioma español.
dayjs.extend(dayjs_plugin_customParseFormat);
dayjs.extend(dayjs_plugin_duration);
dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);
dayjs.locale('es');

// ==================================================
// PUNTO 1: EDAD EN COSAS RARAS
// ==================================================

// Cuenta los viernes 13 desde el nacimiento hasta hoy, incluidos ambos días.
function contarViernes13(fechaNacimiento) {
    let contador = 0;
    //fechas a 00:00
    let fecha = fechaNacimiento.startOf('day');
    const hoy = dayjs().startOf('day');
    //compara las fechas en su valor numerico
    while (fecha.valueOf() <= hoy.valueOf()) {
        if (fecha.day() === 5 && fecha.date() === 13) {
            contador++;
        }

        fecha = fecha.add(1, 'day');
    }

    return contador;
}

// Devuelve los días, horas y segundos completos desde las 00:00 del nacimiento.
function calcularEdad(fechaNacimiento) {
    const ahora = dayjs();

    return {
        dias: ahora.diff(fechaNacimiento, 'day'),
        horas: ahora.diff(fechaNacimiento, 'hour'),
        segundos: ahora.diff(fechaNacimiento, 'second')
    };
}

// Escribe los resultados de edad en la página.
function mostrarEdad(fechaNacimiento) {
    const edad = calcularEdad(fechaNacimiento);

    document.getElementById('dias-edad').textContent = edad.dias.toLocaleString('es-ES');
    document.getElementById('horas-edad').textContent = edad.horas.toLocaleString('es-ES');
    document.getElementById('segundos-edad').textContent = edad.segundos.toLocaleString('es-ES');

    let diaSemana = fechaNacimiento.format('dddd');
    diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    document.getElementById('dia-semana').textContent = diaSemana;

    document.getElementById('viernes').textContent = contarViernes13(fechaNacimiento).toLocaleString('es-ES');
    document.getElementById('instante-calculo').textContent =
        `Calculado el ${dayjs().format('DD/MM/YYYY HH:mm:ss')}.`;

    document.getElementById('resultado-edad').hidden = false;
}

// Valida el formulario y muestra los resultados o un error.
function procesarFormularioEdad(event) {
    event.preventDefault();

    const campoNacimiento = document.getElementById('nacimiento');
    const errorEdad = document.getElementById('error-edad');
    const resultadoEdad = document.getElementById('resultado-edad');
    const valor = campoNacimiento.value;

    errorEdad.textContent = '';
    resultadoEdad.hidden = true;

    if (valor === '') {
        errorEdad.textContent = 'Introduce tu fecha de nacimiento.';
        return;
    }

    // El formato estricto evita aceptar fechas con formatos incorrectos.
    const fechaNacimiento = dayjs(valor, 'YYYY-MM-DD', true);

    if (!fechaNacimiento.isValid()) {
        errorEdad.textContent = 'La fecha introducida no es válida.';
        return;
    }

    if (fechaNacimiento.isAfter(dayjs(), 'day')) {
        errorEdad.textContent = 'La fecha de nacimiento no puede estar en el futuro.';
        return;
    }

    // Contamos desde las 00:00 del día de nacimiento en la zona local.
    mostrarEdad(fechaNacimiento.startOf('day'));
}

// Prepara el formulario de edad.
function iniciarEdad() {
    const formulario = document.getElementById('form-edad');
    formulario.addEventListener('submit', procesarFormularioEdad);
}

// ==================================================
// PUNTO 2: CUENTA ATRÁS
// ==================================================

// La fecha de destino se calcula una vez al cargar la página.
const anioDestino = dayjs().year() + 1;
const fechaEvento = dayjs(`${anioDestino}-01-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss', true);
let eventoLlegado = false;

// Convierte la duración restante en días totales, horas, minutos y segundos.
function descomponerDuracion(milisegundos) {
    const duracion = dayjs.duration(milisegundos);
  e
    return {
        dias: Math.floor(duracion.asDays()),
        horas: duracion.hours(),
        minutos: duracion.minutes(),
        segundos: duracion.seconds()
    };
}

// Actualiza el contador una vez por segundo.
function actualizarCuentaAtras() {
    const contador = document.getElementById('contador');
    const estadoEvento = document.getElementById('estado-evento');

    // Una vez llegado el evento, mantenemos ese estado hasta recargar.
    if (eventoLlegado) {
        return;
    }

    const ahora = dayjs();
    const diferencia = fechaEvento.diff(ahora);

    if (diferencia <= 0) {
        eventoLlegado = true;
        contador.textContent = '';
        estadoEvento.textContent = '¡El evento ha llegado!';
        return;
    }

    const tiempo = descomponerDuracion(diferencia);
    contador.textContent =
        `Faltan ${tiempo.dias} días, ${tiempo.horas} horas, ` +
        `${tiempo.minutos} minutos y ${tiempo.segundos} segundos para Año Nuevo.`;
    estadoEvento.textContent = '';
}

// Muestra la fecha del evento y prepara la cuenta atrás.
function iniciarCuentaAtras() {
    document.getElementById('fecha-evento').textContent =
        `Año Nuevo: ${fechaEvento.format('DD/MM/YYYY HH:mm:ss')} (hora local).`;
    actualizarCuentaAtras();
}

// ==================================================
// PUNTO 3: ZONAS HORARIAS
// ==================================================

// Muestra la hora local y la hora actual de cada ciudad.
function actualizarZonasHorarias() {
    const formato = 'DD/MM/YYYY HH:mm:ss';
    const ahora = dayjs();

    document.getElementById('hora-local').textContent = ahora.format(formato);
    document.getElementById('hora-tokio').textContent = ahora.tz('Asia/Tokyo').format(formato);
    document.getElementById('hora-nueva-york').textContent = ahora.tz('America/New_York').format(formato);
    document.getElementById('hora-sidney').textContent = ahora.tz('Australia/Sydney').format(formato);
}

// ==================================================
// INICIO Y ACTUALIZACIÓN COMÚN
// ==================================================

function actualizarRelojes() {
    actualizarCuentaAtras();
    actualizarZonasHorarias();
}

iniciarEdad();
iniciarCuentaAtras();

// Un único intervalo actualiza la cuenta atrás y las zonas horarias cada segundo.
actualizarRelojes();
setInterval(actualizarRelojes, 1000);
