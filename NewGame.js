import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import * as BackFunctions from "backend/functions";
import wixRealtime from 'wix-realtime';
import wixAnimations from 'wix-animations';
/**
 * Alguien mandó el mensaje de "checkLoteria"
 * @type {boolean}
 */
var loteria = false;

$w.onReady(function () {
    if (wixWindow.formFactor === "Mobile") { //Si es un telefono lo redirige a join game
        wixLocation.to("/join-game");
    } else {
        BackFunctions.createNewGame().then((gameCreated) => { //Crea un nuevo juego
            wixLocation.queryParams.add({ "gameId": gameCreated.idSesion });
            var jugadores = [];

            //Crear QR con URL del join game con query directo del codigo de juego
            if (wixWindow.multilingual.currentLanguage === "en") { //Ir a juego en ingles
                const URLGame = encodeURI(`https://deapco.wixsite.com/la-loteria/en/join-game?gameId=${gameCreated.idSesion}`);
                $w('#html1').src = `https://api.qrserver.com/v1/create-qr-code/?data=${URLGame}&size=150x150&color=ffffff&bgcolor=00C6C5`;
            } else { //Ir a juego en español
                const URLGame = encodeURI(`https://deapco.wixsite.com/la-loteria/join-game?gameId=${gameCreated.idSesion}`);
                $w('#html1').src = `https://api.qrserver.com/v1/create-qr-code/?data=${URLGame}&size=150x150&color=ffffff&bgcolor=00C6C5`;
            }
            $w('#image1').hide(); //Hide loading icon
            $w('#html1').show("fade", { "duration": 350 });
            $w('#text5').text = gameCreated.idSesion;
            $w('#image2').hide(); //Hide loading icon
            $w('#text5').show("fade", { "duration": 350 });

            wixRealtime.subscribe({ "name": gameCreated.idSesion, "resourceId": gameCreated.idSesion }, (message, channel) => { //Subscribir al canal del codigo del juego
                if (Object(message.payload).event === "newUser") { //Mensaje recibido cuando se añade un nuevo jugador
                    jugadores.push(message.payload); //Agrega la info del mensaje al array de lo jugadores actuales
                    $w('#repeater1').data = jugadores; //Agrega el jugador al repeater
                    $w('#repeater1').onItemReady(($item, itemData, index) => {
                        $item('#text7').text = itemData.userName;
                    });
                    setTimeout(() => { //Aparece el jugador
                        $w('#repeater1').forItems([message.payload._id], ($item, itemData, index) => {
                            $item('#container1').show("bounce", { "direction": "center", "duration": 1000 });
                        });
                    }, 500);
                    if (jugadores.length > 0) { //Hay jugadores
                        $w('#button1').enable();
                    } else { //No hay jugadores
                        $w('#button1').disable();
                    }
                    BackFunctions.sendMessageToUser(gameCreated.idSesion, ({ "event": "userJoined", "mainWindow": wixLocation.query.mainWindow }), message.publisher.id); //Enviar mensaje al suscrito que ya fue añadido a la lista de jugadores
                } else if (Object(message.payload).event === "checkLoteria") { //Mensaje recibido cuando alguien mandó su tablero para loteria
                    loteria = true;
                    loteriaInfo = message.payload.info;
                }
            }).then((subscriptionId) => {
                wixLocation.queryParams.add({ "mainWindow": subscriptionId });
            });

            //INICIA EL JUEGO
            $w('#button1').onClick(() => { //Inicia el juego
                BackFunctions.juegoIniciado(gameCreated); //Guarda en DB que ya inició el juego
                $w('#columnStrip8').hide("slide", { "direction": "top", "duration": 1000 }).then(() => { //Quita franja de inicio
                    $w('#columnStrip8').collapse().then(() => {
                        $w('#columnStrip5').expand().then(() => { //Muestra franja de Modo de juego
                            $w('#columnStrip5').show("slide", { "direction": "left", "duration": 1000 });
                            $w('#audioPlayer3').play(); //Enciende audio
                        });
                    });
                });
            });

            //SONIDO
            $w('#button2').onClick(() => { //Activar el sonido
                $w('#audioPlayer3').play().then(() => {
                    $w('#button2').hide("fade", { "duration": 350 });
                });
            });

            //FRANJAS DE MODO DE JUEGO
            $w('#column9,#column10,#column11,#column12,#column13').onMouseIn((rest) => { //Animación cuando se pasa el ratón por los cuadros
                wixAnimations.timeline().add(rest.target, { "duration": 50, "scale": 1.1, "easing": "easeInExpo" }).play();
                if (wixWindow.multilingual.currentLanguage === "en") { //En idioma inglés
                    var texto = "";
                    switch (rest.target) {
                    case $w('#column9'):
                        texto = "Press LOTERIA if you have compleated at least one vertical line.";
                        break;
                    case $w('#column10'):
                        texto = "Press LOTERIA if you have compleated at least one horizontal line.";
                        break;
                    case $w('#column11'):
                        texto = "Press LOTERIA if you have compleated one diagonal.";
                        break;
                    case $w('#column12'):
                        texto = "Press LOTERIA if you have compleated the cross.";
                        break;
                    case $w('#column13'):
                        texto = "Press LOTERIA if you have made the full board.";
                        break;
                    default:
                        texto = "Selecciona una opción.";
                        break;
                    }
                    $w('#text23').text = texto;
                    $w('#text23').show("bounce", { "direction": "center", "duration": 500 });
                } else { //En idioma español
                    var texto = "";
                    switch (rest.target) {
                    case $w('#column9'):
                        texto = "Oprime LOTERIA si tienes completada al menos una línea vertical.";
                        break;
                    case $w('#column10'):
                        texto = "Oprime LOTERIA si tienes completada al menos una línea horizontal.";
                        break;
                    case $w('#column11'):
                        texto = "Oprime LOTERIA si tienes completada al menos una diagonal.";
                        break;
                    case $w('#column12'):
                        texto = "Oprime LOTERIA si tienes completada una cruz.";
                        break;
                    case $w('#column13'):
                        texto = "Oprime LOTERIA si tienes completado todo el tablero.";
                        break;
                    default:
                        texto = "Selecciona una opción.";
                        break;
                    }
                    $w('#text23').text = texto;
                    $w('#text23').show("bounce", { "direction": "center", "duration": 500 });
                }
            });
            $w('#column9,#column10,#column11,#column12,#column13').onMouseOut((rest) => { //Cuando se quita el mouse de uno de los cuadros
                wixAnimations.timeline().add(rest.target, { "duration": 50, "scale": 1, "easing": "easeInExpo" }).play();
            });
            $w('#column9,#column10,#column11,#column12,#column13').onClick((rest) => { //Cuando se da clic en uno de los cuadros
                wixLocation.queryParams.add({ "gameMode": rest.target.children[0].text }); //Añade el modo de juego a Query Params
                wixAnimations.timeline().add(rest.target, { "duration": 50, "scale": 1.1, "easing": "easeInExpo" }).play();
                $w('#text27,#text41').text = rest.target.children[0].text; //Cambia el nombre del modo de juego en las instrucciones y en el juego
                $w('#image11,#image16').src = rest.target.children[1].src; //Cambia la imagen del modo de juego en las instrucciones y en el juego
                $w('#columnStrip5').hide("slide", { "duration": 1000, "direction": "right" }).then(() => {
                    $w('#columnStrip5').collapse().then(() => {
                        $w('#columnStrip6').expand().then(() => {
                            $w('#columnStrip6').show("slide", { "duration": 1000, "direction": "top" });
                        });
                    });
                });
            });

            //Codigo de la diapositiva de instrucciones
            /**
             * Intervalo de 2s para aparecer y desaparecer la imagen del gallo en la diapositiva de instrucciones
             */
            let intervaloCuandoAparece = setInterval(() => {
                if ($w('#image10').isVisible) {
                    $w('#image10').hide("fade", { "duration": 350 });
                } else {
                    $w('#image10').show("fade", { "duration": 350 });
                }
            }, 2000);
            $w('#fullWidthSlides1').onChange(() => {

                /**
                 * Intervalo de 2s para aparecer y desaparecer la imagen del gallo en la diapositiva de instrucciones
                 */
                var intervalo;
                if ($w('#fullWidthSlides1').currentIndex === 0) {
                    intervalo = setInterval(() => {
                        if ($w('#image10').isVisible) {
                            $w('#image10').hide("fade", { "duration": 350 });
                        } else {
                            $w('#image10').show("fade", { "duration": 350 });
                        }
                    }, 2000);
                } else {
                    clearInterval(intervalo);
                    clearInterval(intervaloCuandoAparece);
                }

                if ($w('#fullWidthSlides1').currentIndex === 1) { //Animación de como aparece el frijolito y como desaparece
                    wixAnimations.timeline().add($w('#image12'), { "duration": 1, "opacity": 1 }).play(); //Opaca la imagen de la carta
                    wixAnimations.timeline().add($w('#image13'), { "duration": 1, "opacity": 0.7 }).play(); //Desopaca la imagen de la carta
                    $w('#vectorImage2').hide(); //El frijolito que va a aparecer se oculta como conf inicial cuando se mueve a la diapositiva 1
                    $w('#vectorImage4').show(); //El frijolito que va a desaparecer se muestra como conf inicial cuando se mueve a la diapositiva 1

                    $w('#vectorImage1').show("spin", { "duration": 1000, "delay": 2000 }).then(() => { //Aparece el dedo
                        $w('#vectorImage1').hide("fade", { "duration": 350 }); //Quita el dedo
                        $w('#vectorImage2').show("puff", { "duration": 500, "delay": 350 }); //Aparece el frijolito
                        wixAnimations.timeline().add($w('#image12'), { "duration": 500, "opacity": 0.7 }).play();
                    });
                    $w('#vectorImage3').show("spin", { "duration": 500, "delay": 4000 }).then(() => { //Aparece el dedo
                        $w('#vectorImage3').hide("fade", { "duration": 350 }).then(() => { //Quita el dedo
                            $w('#vectorImage3').show("spin", { "duration": 500 }).then(() => { //Aparece el dedo
                                $w('#vectorImage3').hide("fade", { "duration": 350 }); //Quita el dedo
                                $w('#vectorImage4').hide("fade", { "duration": 350 }); //Quita el frijolito
                                wixAnimations.timeline().add($w('#image13'), { "duration": 500, "opacity": 1 }).play();
                            });
                        });
                    });
                }
            });

            //CODIGO DE JUEGO YA INICIADO
            $w('#button3').onClick(() => {
                $w('#columnStrip6').hide("slide", { "duration": 1000, "direction": "bottom" }).then(() => { //Quita franja de instrucciones
                    $w('#columnStrip6').collapse().then(() => {
                        $w('#columnStrip7').expand().then(() => { //Muestra franja de juego
                            $w('#columnStrip7').show("slide", { "duration": 1000, "direction": "bottom" }).then(() => {
                                $w('#text36').scrollTo();
                                BackFunctions.getAllCartas().then((cartas = []) => { //Trae todas las cartas para mostrarlas cartas={ "imagen": { "name": nombre de la carta: String, "fileURL": direccion de la carta: String }, "audio": { "name": nombre del audio: String, "fileURL": direccion del audio: String }, "_id": String(cartasParaTableroIndex[i]) }
                                    $w('#image14').collapse(); //Quita el loading icon
                                    /**
                                     * Baja el volumen de la musica
                                     */
                                    const INEter = setInterval(() => {
                                        $w('#audioPlayer3').volume -= 10;
                                        if ($w('#audioPlayer3').volume === 0) { //El volumen está en 0
                                            $w('#audioPlayer3').pause();
                                            $w('#audioPlayer3').volume = 100;
                                            $w('#audioPlayer3').seek(0);
                                            clearInterval(INEter);
                                        }
                                    }, 100);
                                    /**
                                     * Conteo en pantalla de 5, 4, 3, 2, 1, 0
                                     */
                                    const conteo = setInterval(() => {
                                        $w('#text36').text = String(Number($w('#text36').text) - 1);
                                        if (Number($w('#text36').text) === 0) { //El conteo está en 0
                                            clearInterval(conteo);
                                            $w('#text36').hide("slide", { "duration": 1000, "direction": "bottom" }).then(() => {
                                                $w('#text36').collapse().then(() => { //Quita el texto
                                                    $w('#backCarta').show("slide", { "duration": 1000, "direction": "bottom" }).then(() => {
                                                        BackFunctions.sendMessage(gameCreated.idSesion, { "event": "juegoIniciado" }); //Manda mensaje de que el juego inició
                                                        iterator = cartas.values();
                                                        mostrarSiguienteCarta(iterator.next().value);
                                                    });
                                                });
                                            });
                                        }
                                    }, 1000);
                                }, 1000);
                            })
                        });
                    });
                });
            });
        });
        $w('#audioPlayer3').onEnded(() => { //Cada vez que el audio acaba, lo reinicia en 0
            $w('#audioPlayer3').seek(0).then(() => {});
        });
    }
});

/**
 * Variable que conserva todas las cartas y que trae a la siguiente carta cada vez que se llama la función `next().value`
 */
var iterator;
/**
 * Variable que conserva a todas las cartas que ya pasaron [{ "imagen": { "name": nombre de la carta: String, "fileURL": direccion de la carta: String }, "audio": { "name": nombre del audio: String, "fileURL": direccion del audio: String }, "_id": String(cartasParaTableroIndex[i])}]
 */
var cartasPasadas = [];
/**
 * Información del que hizo lotería
 * @type {Object}
 * {"event": "checkLoteria", "info": { "tablero": El tablero completo:[], "userName": Nombre del usuario que mandó el check:String, "_id": _id del usuario que mandó el mensaje:String } }
 */
var loteriaInfo = {};
/**
 * Función que se llama para mostrar la siguiente carta
 * @param obj Es la carta que va a mostrarse
 */
function mostrarSiguienteCarta(obj = { "imagen": { "name": "", "fileURL": "" }, "audio": { "name": "", "fileURL": "" }, "_id": "" }) {
    $w('#carta').src = obj.imagen.fileURL;
    $w('#audioPlayer3').src = obj.audio.fileURL;
    $w('#backCarta').hide("flip", { "direction": "right", "duration": 700 }).then(() => {
        $w('#carta').show("flip", { "direction": "left", "duration": 700 }).then(() => {
            $w('#audioPlayer3').play();
        });
    });
    cartasPasadas.push(obj); //Agrega la carta al Array de cartas pasadas
    /** 
     * En que momento se va a quitar la carta, son 3 segundos despues de que acabe el audio
     */
    var until = $w('#audioPlayer3').duration + 3000;
    setTimeout(() => {
        $w('#carta').hide("flip", { "direction": "right", "duration": 700 }).then(() => {
            $w('#backCarta').show("flip", { "direction": "left", "duration": 700 }).then(() => {
                if (loteria === false) { //Si nadie ha mandado notificacion de loteria, pasa a la siguiente
                    mostrarSiguienteCarta(iterator.next().value);
                } else { //Alguien mandó notificacion de loteria y hay que mostraar el tablero
                    MostrarTableroLoteria();
                }
            });
        });
    }, until);
}

/**
 * Muestra el tablero de la persona que mando el mensaje de checkLoteria
 */
function MostrarTableroLoteria() {
    $w('#text38').text = "¡LOTERIA!";
    /**
     * Array de items que tiene el frijolito `{ "_id": itemData._id, "index": index, "cartaName": itemData.name }`
     */
    var tableroConFrijolitosCompleto = [];
    /**
     * Array de index de los items que tiene el frijolito
     */
    var IndexFrijolitos = [];
    $w('#audioPlayer3').src = "wix:audio://v1/4c0a11_fd2f358fa192409a81d61a61e35f0151.mp3/M%C3%BAsica%20Mexicana%20sin%20Copyright%20-%20Muchas%20Gracias%20Music%20(%20M%C3%BAsica%20Sin%20Copyright%202020).mp3#duration=276";
    $w('#audioPlayer3').play();
    $w('#columnStrip7').hide("slide", { "duration": 1000, "direction": "bottom" }).then(() => { //Quita la franja de las cartas
        $w('#columnStrip7').collapse().then(() => {
            $w('#columnStrip9').expand().then(() => { //Muestra el tablero del usuario
                $w('#columnStrip9').show("slide", { "duration": 1000, "direction": "bottom" }).then(() => {
                    $w('#repeater2').data = loteriaInfo.tablero;
                    $w('#text39').text = "Veamos el tablero de " + loteriaInfo.userName; //Muestra el nombre del usuario que mandó la notificación
                    $w('#text38').show("bounce", { "direction": "center", "duration": 1000 });
                    $w('#text39').show("slide", { "duration": 1000, "direction": "top", "delay": 2000 });
                    $w('#repeater2').onItemReady(($item, itemData, index) => {
                        $item('#image15').src = itemData.fileURL;
                        if (itemData.frijolito) { //Si el item tenia frijolito agrega la información
                            tableroConFrijolitosCompleto.push({ "_id": itemData._id, "index": index, "cartaName": itemData.name });
                            IndexFrijolitos.push(index);
                        }
                        $w('#columnStrip3').show("slide", { "duration": 1000, "direction": "top", "delay": 3000 });
                    });
                    setTimeout(() => {
                        for (let i = 0; i < tableroConFrijolitosCompleto.length; i++) { //Muestra los frijolitos
                            $w('#repeater2').forItems([tableroConFrijolitosCompleto[i]._id], (($item, itemData, index) => {
                                $item('#vectorImage5').show("puff", { "duration": 300 });
                                wixAnimations.timeline().add($item('#image15'), { "duration": 100, "opacity": 0.7 }).replay();
                            }));
                        }
                        verificarSiLoteria(IndexFrijolitos, tableroConFrijolitosCompleto).then((verificado) => {
                            if (verificado) {   //Si cumple con el modo de juego y las cartas que ya pasaron, es ganador
                            BackFunctions.sendMessage(wixLocation.query.gameId,{"event":"juegoFinalizado","userName":loteriaInfo.userName});    //Manda mensaje de que acabó el juego
                                setTimeout(() => {
                                    wixWindow.openLightbox("Ganador", loteriaInfo.userName);
                                }, 2000);
                            } else {    //No cumple con alguno de los dos, entonces sale del juego
                                BackFunctions.sendMessage(wixLocation.query.gameId, { "event": "outOfGame", "user": loteriaInfo._id }); //Manda mensaje de que sale del juego el jugador
                                loteria = false;
                                $w('#text38').hide("fade", { "duration": 750 }).then(() => {
                                    $w('#text38').text = "¡No era lotería!";
                                    $w('#text38').show("bounce", { "direction": "center", "duration": 1000 }).then(() => {
                                        setTimeout(() => {
                                            /**
                                             * Valor del volumen que baja
                                             */
                                            let valor = 100;
                                            /**
                                             * Intervalo que baja el volumen
                                             */
                                            let IntervaloDeLoteria = setInterval(() => {
                                                $w('#audioPlayer3').volume = valor;
                                                if (valor === 0) {
                                                    clearInterval(IntervaloDeLoteria);
                                                    $w('#audioPlayer3').volume = 100;
                                                    $w('#audioPlayer3').pause();
                                                    $w('#audioPlayer3').seek(0).then(() => {
                                                        $w('#columnStrip9').hide("slide", { "duration": 1000, "direction": "bottom" }).then(() => {
                                                            $w('#columnStrip9').collapse().then(() => {
                                                                $w('#columnStrip7').expand().then(() => {
                                                                    $w('#columnStrip7').show("slide", { "duration": 1000, "direction": "bottom" }).then(() => {
                                                                        mostrarSiguienteCarta(iterator.next().value);
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                } else {
                                                    valor -= 10;
                                                }
                                            }, 200);
                                        }, 5000);
                                    });
                                });
                            }
                        });
                    }, 5000);

                });
            });
        });
    });
}

/**
 * Verificar si el tablero del usuario si es loteria
 * @param tableroConFrijolitosIndex Array con index de los items que tienen frijolito = IndexFrijolitos. Sirve para verificar si cumple con el modo de juego.
 * @param tableroConFrijolitosCompleto Array con Objeto de información de los items que tienen frijolito = tableroConFrijolitosCompleto. Sirve para verificar que si sean con cartas que ya pasaron.
 * @return boolean
 */
function verificarSiLoteria(tableroConFrijolitosIndex, tableroConFrijolitosCompleto) {
    /**
     * Cual va a ser el modelo que se tome para verificar el modo de juego.
     * @type {Array}
     */
    var validador = [];
    if (wixLocation.query.gameMode === "Línea Vertical" || wixLocation.query.gameMode === "Vertical line") {
        validador = [
            [0, 4, 8, 12],
            [1, 5, 9, 13],
            [2, 6, 10, 14],
            [3, 7, 11, 15]
        ];
    } else if (wixLocation.query.gameMode === "Línea Horizontal" || wixLocation.query.gameMode === "Horizontal line") {
        validador = [
            [0, 1, 2, 3],
            [4, 5, 6, 7],
            [8, 9, 10, 11],
            [12, 13, 14, 15]
        ];
    } else if (wixLocation.query.gameMode === "Diagonal") {
        validador = [
            [0, 5, 10, 15],
            [3, 6, 9, 12]
        ];
    } else if (wixLocation.query.gameMode === "Cruz" || wixLocation.query.gameMode === "Cross") {
        validador = [
            [0, 3, 5, 6, 9, 10, 12, 15]
        ]
    } else if (wixLocation.query.gameMode === "Llena" || wixLocation.query.gameMode === "Full") {
        validador = [
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        ];
    }

    return BackFunctions.validadorModeGame(tableroConFrijolitosIndex, validador).then((encontrado) => {
        if (encontrado) { //Cumple con el modo de juego establecido
            /**
             * Cuantas cartas que tienen frijolitos si ya pasaron
             */
            var suma = 0;
            for (let i = 0; i < tableroConFrijolitosCompleto.length; i++) {
                for (let a = 0; a < cartasPasadas.length; a++) {
                    if (tableroConFrijolitosCompleto[i].cartaName === cartasPasadas[a].imagen.name) {
                        suma++;
                    }
                }
            }
            if (suma === tableroConFrijolitosCompleto.length) { //Todos los que tienen frijolito ya pasaron
                return true;
            } else {    
                return false;
            }
        } else { //No cumple con el modo de juego establecido
            return false
        }
    });

}
