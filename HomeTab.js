import wixWindow from 'wix-window';
import wixLocation from 'wix-location';

$w.onReady(function () {
    if (wixWindow.formFactor !== "Mobile"){
        $w('Button').label = ""; //Colapsar los titulos de los botones
    }
    $w('Button').onMouseIn((rest) => {	//Mostrar los titutlos de los botones en los idiomas
        if (wixWindow.multilingual.currentLanguage === "en") {
            switch (rest.target) {
            case $w('#button1'):
                rest.target.label = "Instructions";
                break;
            case $w('#button2'):
                rest.target.label = "Play";
                break;
            case $w('#button3'):
                rest.target.label = "History";
                break;
            default:
                break;
            }
        } else {
            switch (rest.target) {
            case $w('#button1'):
                rest.target.label = "Instrucciones";
                break;
            case $w('#button2'):
                rest.target.label = "Jugar";
                break;
            case $w('#button3'):
                rest.target.label = "Historia";
                break;
            default:
                break;
            }
        }
    });
    $w('Button').onMouseOut((rest) => {	//Vuelve a colapsar los titulos de los botones
        rest.target.label = "";
    });
	$w('#button2').onClick((rest)=>{
		if(wixWindow.formFactor === "Mobile"){
			wixLocation.to("/join-game");
		} else {
			wixWindow.openLightbox("Crear Unirse").then((resultBack)=>{
				if(resultBack === "joinGame"){
					wixLocation.to("/join-game");
				} else if (resultBack === "newGame"){
					wixLocation.to("/new-game");
				}
			});
		}
	});
});
