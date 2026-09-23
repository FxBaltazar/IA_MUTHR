/* ================================================================
   MUTHR / COVENANT INTERFACE
   VOICE CONTROL SYSTEM
================================================================ */


/* ================================================================
   CONFIGURACIÓN
================================================================ */

const MUTHR = {

    nombre: "",

    inicializada: false,

    escuchando: false,

    esperandoNombre: false,

    esperandoOrden: false,

    hablando: false

};


/* ================================================================
   ELEMENTOS
================================================================ */

const startBtn =
    document.getElementById("start-btn");

const consoleBox =
    document.getElementById("console");

const core =
    document.getElementById("muthr-core");

const micStatus =
    document.getElementById("mic-status");

const micLevel =
    document.getElementById("mic-level");

const bars =
    document.querySelectorAll(".frequency-bars i");

const musicPlayer =
    document.getElementById("music-player");

const musicPanel =
    document.getElementById("music-panel");

const musicList =
    document.getElementById("music-list");

const closeList =
    document.getElementById("close-list");

const pauseBtn =
    document.getElementById("pause-btn");

const previousBtn =
    document.getElementById("previous-btn");

const playBtn =
    document.getElementById("play-btn");

const nextBtn =
    document.getElementById("next-btn");

const listBtn =
    document.getElementById("list-btn");



/* ================================================================
   MÚSICA

   IMPORTANTE:
   Cambia solamente los nombres de archivo de esta lista
   para que coincidan con los archivos dentro de /music/
================================================================ */

const musicas = [

    {
        nombre: "Richard Wagner - Entrada de los Dioses al Valhalla",
        archivo: "music/wagner.mp3"
    },

    {
        nombre: "Gustavo Santaolalla",
        archivo: "music/Gustavo Santaolalla.mp3"
    },

    {
        nombre: "Boy Toxic",
        archivo: "music/BoyToxic.mp3"
    },

    {
        nombre: "Mild Club",
        archivo: "music/MildClub.mp3"
    },

    {
        nombre: "My Way",
        archivo: "music/My Way.mp3"
    },

    {
        nombre: "Major Tom",
        archivo: "music/Major Tom.mp3"
    },

    {
        nombre: "Thats Life",
        archivo: "music/Thats Life.mp3."
    },

    {
        nombre: "Gato Payaso",
        archivo: "music/Gato Payaso.mp3"
    },

    {
        nombre: "Nueva alma",
        archivo: "music/New Soul Yael Naim.mp3"
    },

    {
        nombre: "twenty one pilots",
        archivo: "music/twenty one pilots.mp3"
    },

    {
        nombre: "Tonight You Belong to Me",
        archivo: "music/Tonight You Belong to Me.mp3"
    }

];



let indiceMusica = 0;



/* ================================================================
   CONSOLA
================================================================ */

function logTerminal(texto, clase = "system-text") {

    const linea =
        document.createElement("div");

    linea.className = clase;

    linea.textContent = texto;

    consoleBox.appendChild(linea);

    consoleBox.scrollTop =
        consoleBox.scrollHeight;

}



/* ================================================================
   VOZ DE MUTHR
================================================================ */

function obtenerVozMuthr() {

    const voces =
        window.speechSynthesis.getVoices();

    let voz =
        voces.find(v =>
            v.lang === "es-US"
        );

    if (!voz) {

        voz =
            voces.find(v =>
                v.lang.startsWith("es")
            );

    }

    return voz || null;

}



function madreHabla(texto, despues = null) {

    MUTHR.hablando = true;

    core.classList.add("talking");

    logTerminal(
        `MUTHR: ${texto}`,
        "madre-text"
    );


    window.speechSynthesis.cancel();


    const mensaje =
        new SpeechSynthesisUtterance(texto);


    mensaje.lang = "es-US";

    mensaje.rate = 0.94;

    mensaje.pitch = 1.08;

    mensaje.volume = 1.0;


    const voz =
        obtenerVozMuthr();

    if (voz) {

        mensaje.voice = voz;

    }


    mensaje.onend = () => {

        MUTHR.hablando = false;

        core.classList.remove("talking");

        if (despues) {

            despues();

        }

    };


    mensaje.onerror = () => {

        MUTHR.hablando = false;

        core.classList.remove("talking");

        if (despues) {

            despues();

        }

    };


    window.speechSynthesis.speak(mensaje);

}



/* ================================================================
   RECONOCIMIENTO DE VOZ
================================================================ */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.lang = "es-ES";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

}



function escuchar() {

    if (!recognition) {

        logTerminal(
            "ERROR: Este navegador no soporta reconocimiento de voz.",
            "system-green"
        );

        return;

    }


    if (MUTHR.hablando) {

        return;

    }


    MUTHR.escuchando = true;


    micStatus.textContent =
        "LISTENING...";


    micStatus.classList.add("active");


    logTerminal(
        "SYSTEM: MICROPHONE ACTIVE..."
    );


    try {

        recognition.start();

    } catch (error) {

        MUTHR.escuchando = false;

    }

}



/* ================================================================
   RESULTADO DEL RECONOCIMIENTO
================================================================ */

if (recognition) {

    recognition.onresult =
        function(event) {

            MUTHR.escuchando = false;

            micStatus.textContent =
                "PROCESSING VOICE...";


            micStatus.classList.remove("active");


            const texto =
                event.results[0][0].transcript
                .trim()
                .toLowerCase();


            logTerminal(
                `USER: ${texto}`,
                "user-text"
            );


            procesarComando(texto);

        };


    recognition.onerror =
        function(event) {

            MUTHR.escuchando = false;

            micStatus.textContent =
                "MICROPHONE STANDBY";

            micStatus.classList.remove("active");


            logTerminal(
                `SYSTEM: VOICE ERROR: ${event.error}`
            );

        };


    recognition.onend =
        function() {

            MUTHR.escuchando = false;

            if (!MUTHR.hablando) {

                micStatus.textContent =
                    "MICROPHONE STANDBY";

            }

        };

}



/* ================================================================
   PROCESAR COMANDOS
================================================================ */

function procesarComando(texto) {


    /* ============================================================
       1. OBTENER NOMBRE
    ============================================================ */

    if (MUTHR.esperandoNombre) {

        obtenerNombre(texto);

        return;

    }


    /* ============================================================
       2. MÚSICA
    ============================================================ */

    if (
        contiene(texto, [
            "música",
            "musica",
            "pon música",
            "pon musica",
            "un poco de música",
            "un poco de musica"
        ])
    ) {

        madreHabla(
            `Sí, ${MUTHR.nombre}. Como desees.`,
            () => {

                reproducirMusica(indiceMusica);

            }
        );

        return;

    }


    /* ============================================================
       PAUSA
    ============================================================ */

    if (
        contiene(texto, [
            "pausa",
            "pause",
            "pausar",
            "pausa la música",
            "pausa la musica"
        ])
    ) {

        pausarMusica();

        madreHabla(
            `Música en pausa, ${MUTHR.nombre}.`
        );

        return;

    }


    /* ============================================================
       REANUDAR
    ============================================================ */

    if (
        contiene(texto, [
            "reanudar",
            "continúa",
            "continua",
            "continuar",
            "seguir música",
            "seguir musica"
        ])
    ) {

        reanudarMusica();

        madreHabla(
            `Reanudando reproducción, ${MUTHR.nombre}.`
        );

        return;

    }


    /* ============================================================
       SIGUIENTE
    ============================================================ */

    if (
        contiene(texto, [
            "siguiente",
            "siguiente canción",
            "siguiente cancion",
            "próxima",
            "proxima"
        ])
    ) {

        siguienteMusica();

        madreHabla(
            `Reproduciendo la siguiente selección, ${MUTHR.nombre}.`
        );

        return;

    }


    /* ============================================================
       ANTERIOR
    ============================================================ */

    if (
        contiene(texto, [
            "anterior",
            "canción anterior",
            "cancion anterior",
            "anterior canción",
            "anterior cancion"
        ])
    ) {

        anteriorMusica();

        madreHabla(
            `Reproduciendo la selección anterior, ${MUTHR.nombre}.`
        );

        return;

    }


    /* ============================================================
       LISTA
    ============================================================ */

    if (
        contiene(texto, [
            "lista",
            "lista de música",
            "lista de musica",
            "muestra la lista",
            "mostrar lista"
        ])
    ) {

        abrirLista();

        madreHabla(
            `Mostrando la lista de música, ${MUTHR.nombre}.`
        );

        return;

    }


    /* ============================================================
       DETENER
    ============================================================ */

    if (
        contiene(texto, [
            "detener música",
            "detener musica",
            "detén la música",
            "deten la musica",
            "stop",
            "detener"
        ])
    ) {

        detenerMusica();

        madreHabla(
            `Reproducción detenida, ${MUTHR.nombre}.`
        );

        return;

    }


    /* ============================================================
       VOLUMEN
    ============================================================ */

    if (
        contiene(texto, [
            "sube el volumen",
            "subir volumen",
            "más volumen",
            "mas volumen"
        ])
    ) {

        cambiarVolumen(0.1);

        madreHabla(
            `Volumen incrementado, ${MUTHR.nombre}.`
        );

        return;

    }


    if (
        contiene(texto, [
            "baja el volumen",
            "bajar volumen",
            "menos volumen"
        ])
    ) {

        cambiarVolumen(-0.1);

        madreHabla(
            `Volumen reducido, ${MUTHR.nombre}.`
        );

        return;

    }


    /* ============================================================
       CANCIÓN ESPECÍFICA
    ============================================================ */

    const encontrada =
        buscarCancion(texto);


    if (encontrada !== -1) {

        indiceMusica =
            encontrada;


        madreHabla(
            `Sí, ${MUTHR.nombre}. Como desees.`,
            () => {

                reproducirMusica(indiceMusica);

            }
        );

        return;

    }


    /* ============================================================
       COMANDO NO RECONOCIDO
    ============================================================ */

    madreHabla(
        `Orden no reconocida, ${MUTHR.nombre}.`
    );

}



/* ================================================================
   OBTENER NOMBRE
================================================================ */

function obtenerNombre(texto) {

    MUTHR.esperandoNombre = false;


    let limpio =
        texto
            .replace(/[.,!?¿¡]/g, "")
            .trim();


    /*
       Buscamos:

       "código de seguridad David 1234"

       "codigo de seguridad David"

       "David 1234"

       "David"
    */


    const palabras =
        limpio.split(/\s+/);


    let nombre = "";


    const palabrasIgnoradas = [

        "código",
        "codigo",
        "de",
        "seguridad",
        "clave",
        "acceso",
        "mi",
        "es",
        "soy",
        "señor",
        "señora",
        "usuario",
        "usuario"

    ];


    const palabrasNombre = [];


    for (let palabra of palabras) {

        const numero =
            /^[0-9]+$/.test(palabra);


        if (numero) {

            continue;

        }


        if (
            !palabrasIgnoradas.includes(palabra)
        ) {

            palabrasNombre.push(palabra);

        }

    }


    if (palabrasNombre.length > 0) {

        nombre =
            palabrasNombre[0];

    }


    if (!nombre) {

        nombre = "usuario";

    }


    MUTHR.nombre =
        capitalizar(nombre);


    logTerminal(
        `SYSTEM: USER ID REGISTERED -> ${MUTHR.nombre}`,
        "system-green"
    );


    madreHabla(
        `Bienvenido, ${MUTHR.nombre}. ¿En qué puedo ayudarte?`
    );


    MUTHR.esperandoOrden = true;

}



/* ================================================================
   CAPITALIZAR
================================================================ */

function capitalizar(texto) {

    if (!texto) {

        return "";

    }


    return texto.charAt(0).toUpperCase()
        + texto.slice(1);

}



/* ================================================================
   BUSCAR TEXTO
================================================================ */

function contiene(texto, palabras) {

    return palabras.some(
        palabra =>
            texto.includes(palabra)
    );

}



/* ================================================================
   INICIALIZAR MUTHR
================================================================ */

function iniciarMuthr() {

    if (MUTHR.inicializada) {

        return;

    }


    MUTHR.inicializada = true;

    startBtn.classList.add("hidden");


    logTerminal(
        "SYSTEM: MUTHR VOICE PROTOCOL INITIALIZED.",
        "system-green"
    );


    logTerminal(
        "SYSTEM: VOICE AUTHENTICATION READY."
    );


    madreHabla(
        "Por favor, introduzca su código de seguridad.",
        () => {

            MUTHR.esperandoNombre = true;

            escuchar();

        }
    );

}



/* ================================================================
   BOTÓN INICIAL
================================================================ */

startBtn.addEventListener(
    "click",
    iniciarMuthr
);



/* ================================================================
   BOTONES DE MÚSICA
================================================================ */

pauseBtn.addEventListener(
    "click",
    () => {

        pausarMusica();

    }
);


playBtn.addEventListener(
    "click",
    () => {

        if (
            musicPlayer.paused
        ) {

            reanudarMusica();

        } else {

            reproducirMusica(indiceMusica);

        }

    }
);


nextBtn.addEventListener(
    "click",
    siguienteMusica
);


previousBtn.addEventListener(
    "click",
    anteriorMusica
);


listBtn.addEventListener(
    "click",
    abrirLista
);


closeList.addEventListener(
    "click",
    cerrarLista
);



/* ================================================================
   REPRODUCIR MÚSICA
================================================================ */

function reproducirMusica(indice) {

    if (!MUSIC.length) {

        logTerminal(
            "ERROR: MUSIC DATABASE EMPTY."
        );

        return;

    }


    indiceMusica =
        ((indice % MUSIC.length)
        + MUSIC.length)
        % MUSIC.length;


    const cancion =
        MUSIC[indiceMusica];


    musicPlayer.src =
        cancion.archivo;


    musicPlayer.volume = 0.7;


    musicPlayer.play()
        .then(() => {

            logTerminal(
                `SYSTEM: PLAYING -> ${cancion.nombre}`,
                "system-green"
            );

        })
        .catch(error => {

            logTerminal(
                "ERROR: NO SE PUDO REPRODUCIR LA MÚSICA."
            );

            console.error(error);

        });

}



/* ================================================================
   PAUSA
================================================================ */

function pausarMusica() {

    if (
        !musicPlayer.paused
    ) {

        musicPlayer.pause();

        logTerminal(
            "SYSTEM: AUDIO PAUSED."
        );

    }

}



/* ================================================================
   REANUDAR
================================================================ */

function reanudarMusica() {

    if (!musicPlayer.src) {

        reproducirMusica(indiceMusica);

        return;

    }


    musicPlayer.play()
        .then(() => {

            logTerminal(
                "SYSTEM: AUDIO RESUMED.",
                "system-green"
            );

        })
        .catch(() => {

            logTerminal(
                "SYSTEM: UNABLE TO RESUME AUDIO."
            );

        });

}



/* ================================================================
   DETENER
================================================================ */

function detenerMusica() {

    musicPlayer.pause();

    musicPlayer.currentTime = 0;


    logTerminal(
        "SYSTEM: AUDIO STOPPED."
    );

}



/* ================================================================
   SIGUIENTE
================================================================ */

function siguienteMusica() {

    indiceMusica++;


    if (
        indiceMusica >= MUSIC.length
    ) {

        indiceMusica = 0;

    }


    reproducirMusica(
        indiceMusica
    );

}



/* ================================================================
   ANTERIOR
================================================================ */

function anteriorMusica() {

    indiceMusica--;


    if (
        indiceMusica < 0
    ) {

        indiceMusica =
            MUSIC.length - 1;

    }


    reproducirMusica(
        indiceMusica
    );

}



/* ================================================================
   CAMBIO AUTOMÁTICO AL TERMINAR
================================================================ */

musicPlayer.addEventListener(
    "ended",
    () => {

        siguienteMusica();

    }
);



/* ================================================================
   VOLUMEN
================================================================ */

function cambiarVolumen(cantidad) {

    let volumen =
        musicPlayer.volume + cantidad;


    volumen =
        Math.max(
            0,
            Math.min(1, volumen)
        );


    musicPlayer.volume =
        volumen;


    logTerminal(
        `SYSTEM: VOLUME -> ${Math.round(volumen * 100)}%`
    );

}



/* ================================================================
   BUSCAR CANCIÓN
================================================================ */

function buscarCancion(texto) {

    const buscado =
        texto.toLowerCase();


    for (
        let i = 0;
        i < MUSIC.length;
        i++
    ) {

        const nombre =
            MUSIC[i].nombre.toLowerCase();


        if (
            buscado.includes(nombre)
        ) {

            return i;

        }

    }


    return -1;

}



/* ================================================================
   GENERAR LISTA DE MÚSICA
================================================================ */

function generarListaMusica() {

    musicList.innerHTML = "";


    MUSIC.forEach(
        (cancion, indice) => {

            const boton =
                document.createElement("button");


            boton.className =
                "music-item";


            boton.type =
                "button";


            boton.innerHTML = `

                <span class="music-number">
                    ${String(indice + 1).padStart(2, "0")}
                </span>

                <span class="music-name">
                    ${cancion.nombre}
                </span>

                <span class="music-arrow">
                    ▶
                </span>

            `;


            boton.addEventListener(
                "click",
                () => {

                    indiceMusica =
                        indice;

                    reproducirMusica(
                        indice
                    );

                    cerrarLista();

                }
            );


            musicList.appendChild(
                boton
            );

        }
    );

}



/* ================================================================
   ABRIR LISTA
================================================================ */

function abrirLista() {

    generarListaMusica();

    musicPanel.classList.add(
        "visible"
    );

}



/* ================================================================
   CERRAR LISTA
================================================================ */

function cerrarLista() {

    musicPanel.classList.remove(
        "visible"
    );

}



/* ================================================================
   MEDIDOR DE VOZ
================================================================ */

function actualizarMedidor() {

    bars.forEach(
        barra => {

            let altura = 4;


            if (
                MUTHR.escuchando ||
                MUTHR.hablando
            ) {

                altura =
                    Math.floor(
                        Math.random() * 90
                    ) + 8;

            }


            barra.style.height =
                `${altura}%`;

        }
    );


    let nivel = 0;


    if (
        MUTHR.escuchando ||
        MUTHR.hablando
    ) {

        nivel =
            Math.floor(
                Math.random() * 70
            ) + 20;

    }


    micLevel.textContent =
        String(nivel).padStart(3, "0");


    requestAnimationFrame(
        actualizarMedidor
    );

}



/* ================================================================
   CARGA DE VOCES
================================================================ */

window.speechSynthesis.onvoiceschanged =
    () => {

        obtenerVozMuthr();

    };



/* ================================================================
   VIDEO HOLOGRÁFICO
================================================================ */

const video =
    document.getElementById(
        "muthr-video"
    );


if (video) {

    video.play()
        .catch(() => {

            /*
             * Algunos navegadores esperan
             * interacción del usuario.
             * El botón inicial resolverá esto.
             */

        });

}



/* ================================================================
   INICIO
================================================================ */

generarListaMusica();

actualizarMedidor();


logTerminal(
    "SYSTEM: HOLOGRAPHIC CORE READY.",
    "system-green"
);

logTerminal(
    "SYSTEM: PRESS INITIALIZE TO BEGIN."
);