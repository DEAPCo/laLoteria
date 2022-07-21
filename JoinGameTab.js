import wixLocation from 'wix-location';
import wixRealtime from 'wix-realtime';
import * as BackFunc from "backend/functions";
import wixAnimations from 'wix-animations';

var juegoIniciado = false;

$w.onReady(function () {

    //PRIMER PASO, INGRESO
    if (Object.keys(wixLocation.query).includes("gameId")) { //El usuario ingreso por QR entonces lee el query
        $w('#input1').value = wixLocation.query.gameId; //Asigna el query al input
    }

    $w('#button1').onClick(() => {
        $w('#image2').show(); //Loading icon aparece
        $w('#text2,#text3').hide("slide", { "duration": 750, "direction": "top" });
        if ($w('#input1').value.length === 6 && $w('#input2').value.length > 0) { //Codigo de sesión es de 6 digitos y hay un idetificador
            const idSESION = $w('#input1').value.toUpperCase(); //Guarda el idSesion en la variable
            wixLocation.queryParams.add({ "userName": ($w('#input2').value[0].toUpperCase() + $w('#input2').value.slice(1).toLowerCase()) });
            BackFunc.bucarSesion(idSESION).then((result) => { //Buscar si existe la sesion
                if (result.encontrado) { //existe la sesion
                    $w('#button1').enable();
                    wixRealtime.subscribe({ "name": idSESION, "resourceId": idSESION }, (message, channel) => { //Suscribe al canal

                        //Empieza a recibir mensajes
                        if (Object(message.payload).event === "userJoined") { //Mensaje recibido cuando el usuario se agregó a la pantalla
                            //SEGUNDO PASO, MOSTRAR TABLERO DE JUEGO
                            BackFunc.getCartas().then((cartas) => { //Trae las cartas del backend
                                $w('#repeater1').data = cartas; //Asigna las cartas al repetidor
                                wixLocation.queryParams.add({ "gameId": idSESION, "mainWindow": message.payload.mainWindow, "tablero": encodeURI(JSON.stringify($w('#repeater1').data)) }); //Agrega los query parameters
                                $w('#repeater1').onItemReady(($item, itemData, index) => {
                                    $item('#image3').src = itemData.fileURL;
                                    $item('#container1').onClick(() => { //Cuando le da clic al contenedor
                                        if (juegoIniciado) { //Si ya inició el juego o no está en pausa
                                            $item('#vectorImage2').show("puff", { "duration": 300 }); //Aparece el frijolito
                                            wixAnimations.timeline().add($item('#image3'), { "duration": 100, "opacity": 0.7 }).replay(); //Hace tenue la imagen de la carta
                                            itemData.frijolito = true;
                                            wixLocation.queryParams.add({ "tablero": encodeURI(JSON.stringify($w('#repeater1').data)) }); //Refreshea el tablero con el frijolito
                                        }
                                    });
                                    $item('#container1').onDblClick(() => {
                                        if (juegoIniciado) { //Si ya inició el juego o no está en pausa
                                            $item('#vectorImage2').hide("fade", { "duration": 100 }); //Desaparece el frijolito
                                            wixAnimations.timeline().add($item('#image3'), { "duration": 100, "opacity": 1 }).replay(); //Quita la opacidad de la carta
                                            itemData.frijolito = false;
                                            wixLocation.queryParams.add({ "tablero": encodeURI(JSON.stringify($w('#repeater1').data)) }); //Refreshea el tablero con el frijolito quitado
                                        }

                                    });
                                });
                                $w('#image2').hide("fade", { "duration": 750 }); //Hide loading icon
                                $w('#columnStrip1').hide("slide", { "duration": 500, "direction": "top" }).then(() => { //Quita columna de registro
                                    $w('#columnStrip1').collapse().then(() => {
                                        $w('#columnStrip2').expand().then(() => { //Aparece columna del tablero
                                            $w('#columnStrip2').show("slide", { "duration": 500, "direction": "top" }).then(() => {
                                                $w('#text4').text = "Este es el tablero con el que jugarás.\nEspera a que inicie el juego.";
                                                $w('#text4').scrollTo();
                                            });
                                        });
                                    });
                                });
                            });

                        } else if (Object(message.payload).event === "juegoIniciado") { //Mensaje recibido cuando el juego inicia
                            $w('#text4').hide("fade", { "duration": 350 }).then(() => {
                                $w('#text4').text = "¡JUGUEMOS!"; //Aparece mensaje que ya inició el juego
                                $w('#text4').show("bounce", { "direction": "center", "duration": 1000 }); //Muestra el mensaje
                            });
                            $w('#button2').show("bounce", { "direction": "center", "duration": 1000 });
                            juegoIniciado = true;
                        } else if (Object(message.payload).event === "outOfGame") { //Mensaje recibido cuando quedas fuera del juego
                            if (message.payload.user === wixLocation.query.userId) { //El que está fuera del juego es el usuario actual
                                wixLocation.queryParams.remove(Object.keys(wixLocation.query)); //Quita todos los query params
                                $w('#columnStrip5').hide("slide", { "direction": "top", "duration": 1000 }).then(() => { //Quita columna del tablero
                                    $w('#columnStrip5').collapse().then(() => {
                                        $w('#columnStrip4').expand().then(() => { //Aparece columna de ESTAS FUERA
                                            $w('#columnStrip4').show("slide", { "direction": "top", "duration": 1000 }).then(() => {
                                                $w('#text5').show("bounce", { "direction": "center", "duration": 1000, "delay": 1000 });
                                            });
                                        });
                                    });
                                });
                            } else { //El que está fuera del juego no es el usuario actual
                                juegoIniciado = true; //Reanuda el juego
                                $w('#text6').hide("fade", { "duration": 350 }).then(() => {
                                    $w('#text6').text = "¡No era LOTERIA!\nSigamos jugando..."; //Mensaje de que se reanuda el juego
                                    $w('#text6').show("bounce", { "direction": "center", "duration": 1000 }); //Aparece el mensaje
                                });
                                $w('#columnStrip5').hide("slide", { "direction": "top", "duration": 1000, "delay": 3000 }).then(() => { //Quita columna de VEAMOS SU TABLERO
                                    $w('#columnStrip5').collapse().then(() => {
                                        $w('#columnStrip2').expand().then(() => { //Muestra el tablero
                                            $w('#columnStrip2').show("slide", { "direction": "top", "duration": 1000 }).then(() => {
                                                $w('#button2').show("slide", { "duration": 750, "direction": "top" });
                                                $w('#text6').text = "Alguien ha dicho LOTERIA...\nVeamos su tablero";
                                            });
                                        });
                                    });
                                });
                            }
                        } else if (Object(message.payload).event === "checkLoteria") { //Mensaje recibido cuando alguien apretó el boton de LOTERIA
                            juegoIniciado = false; //Pausa el juego
                            $w('#button2').hide("slide", { "duration": 750, "direction": "top" });
                            $w('#columnStrip2').hide("slide", { "direction": "top", "duration": 1000 }).then(() => { //Quita columna del tablero
                                $w('#columnStrip2').collapse().then(() => {
                                    $w('#columnStrip5').expand().then(() => { //Muestra columna de VEAMOS TABLERO
                                        $w('#columnStrip5').show("slide", { "direction": "top", "duration": 1000 }).then(() => {
                                            if (message.publisher.id === wixLocation.query._id) { //Si fue el usuario quien mandó el mensaje le muestra esto
                                                $w('#text6').text = "Veamos si eres el ganador de esta ronda...";
                                            }
                                            $w('#text6').show("bounce", { "direction": "center", "duration": 1000, "delay": 1000 });
                                        });
                                    });
                                });
                            });
                        } else if (Object(message.payload).event === "juegoFinalizado") { //Mensaje recibido cuando alguien ganó y se acabó el juego
                            $w('#text7').text = "¡" + message.payload.userName + " hizo LOTERIA!"; //Mensaje de quien mandó el mensaje
                            $w('#text7').show("bounce", { "direction": "center", "duration": 1000 }); //Aparece el mensaje
                            $w('#text8').show("bounce", { "direction": "center", "duration": 1000, "delay": 1000 });
                            $w('#columnStrip5').hide("slide", { "direction": "top", "duration": 1000 }).then(() => { //Oculta columna de VEAMOS TABLERO
                                $w('#columnStrip5').collapse().then(() => {
                                    $w('#columnStrip6').expand().then(() => { //Muestra columna de QUIEN GANÓ
                                        $w('#columnStrip6').show("slide", { "direction": "top", "duration": 1000 }).then(() => {
                                            setTimeout(() => {
                                                $w('#columnStrip6').hide("slide", { "direction": "top", "duration": 1000 }).then(() => { //Oculta columna de VEAMOS TABLERO
                                                    $w('#columnStrip6').collapse().then(() => {
                                                        $w('#input1').value = "";
                                                        $w('#button1').enable();
                                                        $w('#columnStrip1').expand().then(() => { //Muestra columna de QUIEN GANÓ
                                                            $w('#columnStrip1').show("slide", { "direction": "top", "duration": 1000 });
                                                        });
                                                    });
                                                });
                                            }, 3000);
                                        });
                                    });
                                });
                            });
                        }
                    }).then((subsId) => {
                        BackFunc.sendMessage(idSESION, { "event": "newUser", "userName": wixLocation.query.userName, "_id": subsId }); //Envia el usuario a la mainWindow
                        wixLocation.queryParams.add({ "userId": subsId });
                    });
                } else { //No existe la sesion
                    $w('#image2').hide("fade", { "duration": 750 });
                    $w('#text2').show("slide", { "duration": 750, "direction": "top" });
                }
            });
        } else if ($w('#input1').value.length < 6) { //El código de sesion esta incompleto
            $w('#image2').hide("fade", { "duration": 750 });
            $w('#text2').show("slide", { "duration": 750, "direction": "top" });
        } else if ($w('#input2').value.length === 0) { //No hay ningun nombre
            $w('#image2').hide("fade", { "duration": 750 });
            $w('#text3').show("slide", { "duration": 750, "direction": "top" });
        }
    });

    $w('#input1').onInput((rest) => {
        rest.target.value = String(rest.target.value).toUpperCase(); //Convertir a mayusculas lo que se introduce
    });

    $w('#button2').onClick(() => {
        BackFunc.sendMessage(wixLocation.query.gameId, { "event": "checkLoteria", "info": { "tablero": $w('#repeater1').data, "userName": wixLocation.query.userName, "_id": wixLocation.query.userId } });
    });
});
