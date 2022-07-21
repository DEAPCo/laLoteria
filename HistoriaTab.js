import wixWindow from 'wix-window';

$w.onReady(function () {
    if (wixWindow.multilingual.currentLanguage === "en") {
        $w('#image1').src = "https://static.wixstatic.com/media/4c0a11_bcfdf5fb8793429d97eca4bdfe94a7ec~mv2.png";
		const dataIconosPrincipales = [{
            "_id": "gallo",
            "icono": "Rooster",
            "descripcion": "It means bad news for Mexicans. Instead, in France; represents good ones",
            "background": "https://static.wixstatic.com/media/4c0a11_029893073ed44bf2835ef868905f6175~mv2.png"
        },
        {
            "_id": "sirena",
            "icono": "Mermaid",
            "descripcion": "It is said to be the card of sexual deception. In Mexico there is a belief that sirens deceived men and then killed them",
            "background": "https://static.wixstatic.com/media/4c0a11_b5686b2682a64f5fb5149a5b3ded52ae~mv2.png"
        },
		{
            "_id": "valiente",
            "icono": "Brave Guy",
            "descripcion": "It is usually the representation of problematic people",
            "background": "https://static.wixstatic.com/media/4c0a11_65cb5e1f92494945b7ba78e157410cfb~mv2.png"
        },
		{
            "_id": "pajaro",
            "icono": "Bird",
            "descripcion": "This wonderful animal is often associated with good news.",
            "background": "https://static.wixstatic.com/media/4c0a11_008d15f40ca748ff820565ed83ab6f8e~mv2.png"
        },
		{
            "_id": "borracho",
            "icono": "Drunk Man",
            "descripcion": "This card is associated with vices and problems with the family",
            "background": "https://static.wixstatic.com/media/4c0a11_5fb33ad7681c4d9a92c5ac5db60dc838~mv2.png"
        },
		{
            "_id": "calavera",
            "icono": "Skull",
            "descripcion": "Generally this card is associated with danger, illness or death",
            "background": "https://static.wixstatic.com/media/4c0a11_3fd584c4bd814077b0f77f88a30666bf~mv2.png"
        },
		{
            "_id": "corazon",
            "icono": "Heart",
            "descripcion": "Depends on the shape. If it has a stake, it represents loving pain. If it's strong, it gives off good vibes",
            "background": "https://static.wixstatic.com/media/4c0a11_3835bedeba9e45a3b814177919dfdb20~mv2.png"
        },
		{
            "_id": "arbol",
            "icono": "Tree",
            "descripcion": "The representation is nothing more than the family, the union and the affective ties",
            "background": "https://static.wixstatic.com/media/4c0a11_d8d3db2b1d9149c5965c2628ab90291b~mv2.png"
        }
    ];
    $w('#repeater1').data = dataIconosPrincipales;
    } else {
		const dataIconosPrincipales = [{
            "_id": "gallo",
            "icono": "El Gallo",
            "descripcion": "Significa malas noticias para los mexicanos. En cambio, en Francia; representa buenas",
            "background": "https://static.wixstatic.com/media/4c0a11_029893073ed44bf2835ef868905f6175~mv2.png"
        },
        {
            "_id": "sirena",
            "icono": "La Sirena",
            "descripcion": "Se dice que es la carta del engaño sexual. En el país se tiene la creencia de que las sirenas engañaban a los hombres y luego los asesinaban",
            "background": "https://static.wixstatic.com/media/4c0a11_b5686b2682a64f5fb5149a5b3ded52ae~mv2.png"
        },
		{
            "_id": "valiente",
            "icono": "El Valiente",
            "descripcion": "Suele ser la representación de las personas problemáticas",
            "background": "https://static.wixstatic.com/media/4c0a11_65cb5e1f92494945b7ba78e157410cfb~mv2.png"
        },
		{
            "_id": "pajaro",
            "icono": "El Pájaro",
            "descripcion": "Se suele asociar mucho este maravilloso animal con las buenas noticias",
            "background": "https://static.wixstatic.com/media/4c0a11_008d15f40ca748ff820565ed83ab6f8e~mv2.png"
        },
		{
            "_id": "borracho",
            "icono": "El Borracho",
            "descripcion": "Se asocia esta carta a los vicios y a los problemas con la familia",
            "background": "https://static.wixstatic.com/media/4c0a11_5fb33ad7681c4d9a92c5ac5db60dc838~mv2.png"
        },
		{
            "_id": "calavera",
            "icono": "La Calavera",
            "descripcion": "Generalmente esta carta se asocia con el peligro, la enfermedad o la muerte",
            "background": "https://static.wixstatic.com/media/4c0a11_3fd584c4bd814077b0f77f88a30666bf~mv2.png"
        },
		{
            "_id": "corazon",
            "icono": "El Corazón",
            "descripcion": "Dependerá mucho de la forma. Si tiene alguna estaca, representa el dolor amoroso. Si está fuerte, da buena vibra",
            "background": "https://static.wixstatic.com/media/4c0a11_3835bedeba9e45a3b814177919dfdb20~mv2.png"
        },
		{
            "_id": "arbol",
            "icono": "El Árbol",
            "descripcion": "La representación no es más que la de la familia, la unión y los lazos afectivos",
            "background": "https://static.wixstatic.com/media/4c0a11_d8d3db2b1d9149c5965c2628ab90291b~mv2.png"
        }
    ];
    $w('#repeater1').data = dataIconosPrincipales;
	}
    $w('#repeater1').onItemReady(($item, itemData, index) => {
        $item('#container1').background.src = itemData.background;
        $item('#text8').text = itemData.icono;
        $item('#text9').text = itemData.descripcion;
    });
    
});
