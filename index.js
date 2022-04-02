let map, infoWindow;

function initMap() {
    // Initialisation map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 9,
    });
    infoWindow = new google.maps.InfoWindow();


    // Géolocalisation pour pouvoir utiliser l'appli
    if (navigator.geolocation) {

        // Récupération de la position
        navigator.geolocation.getCurrentPosition(
        (position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            // Application d'un marqueur sur la position
            new google.maps.Marker({
                position: pos,
                map,
                title: "Votre emplacement",
              });
            infoWindow.open(map);
            map.setCenter(pos);

            // Récupération des restaurants avec fetch
            fetch("./restaurants.json")
                .then(res => res.json())
                .then((data) => {

                    // Marqueur des restaurants
                    const svgMarker = {
                        path: "M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z",
                        fillColor: "blue",
                        fillOpacity: 0.6,
                        strokeWeight: 0,
                        rotation: 0,
                        scale: 2,
                        anchor: new google.maps.Point(15, 30),
                    };

                    // Parcours de chaque restaurant
                    data.forEach(e => {

                        const star = '⭐';
                        
                        // Initialisation de l'affichage des notes et commentaire ainsi que la moyenne de note du restaurant
                        let rate = '';
                        let moyRate = 0;
                        e.ratings.forEach(r => {
                            rate += `
                                ${star.repeat(r?.stars)}
                                <br>${r?.comment}
                                <hr>
                            `;

                            moyRate += r?.stars;
                        })
                        moyRate = moyRate / e?.ratings.length;
                        moyRate = Math.round(moyRate);
                        
                        // Création de l'affichage du restaurant sur la colonne de gauche
                        let liste = document.querySelector('#liste');

                        let li = document.createElement("li");

                            let div = document.createElement("div");

                                let h2 = document.createElement("h2");
                                h2.textContent = e?.restaurantName;
                                div.appendChild(h2);

                                let p = document.createElement("p");
                                p.textContent = e?.address;
                                div.appendChild(p);

                                let rateMoy = document.createElement("span");
                                rateMoy.textContent = `Note : ${star.repeat(moyRate)}`;
                                div.appendChild(rateMoy);

                                div.classList.add('restaurant-title');

                                let comments = document.createElement("div");
                                    e.ratings.forEach(r => {
                                        let comment = document.createElement("div");
                                            
                                            let rate = document.createElement("span");
                                            rate.textContent = star.repeat(r?.stars);
                                            comment.appendChild(rate);

                                            let br1 = document.createElement("br");
                                            comment.appendChild(br1);

                                            let content = document.createElement("span");
                                            content.textContent = r?.comment;
                                            comment.appendChild(content);

                                            let br2 = document.createElement("br");
                                            comment.appendChild(br2);

                                        comments.appendChild(comment);

                                        comment.classList.add('comment');
                                    });
                                div.appendChild(comments);

                                comments.classList.add('comments');
                            li.appendChild(div);

                            console.log(e);

                            // Initialisation affichage de la fenêtre d'info lors du clique sur le marqueur
                            let restoMarket = `
                                <h2>${e?.restaurantName}</h2>
                                <p>${e?.address}</p>
                                <p>Note : ${star.repeat(moyRate)}</p>
                                <br>
                                <hr>
                                ${rate}
                            `;
                            const infowindow = new google.maps.InfoWindow({
                                content: restoMarket,
                            });

                            // Placement du marqueur du restaurant
                            var marker = new google.maps.Marker({
                                position: { lat: e?.lat, lng: e?.long },
                                icon: svgMarker,
                                map: map,
                            });

                            // Filtre
                            document.querySelector('#btn-filter').addEventListener('click', () => {
                                const notesMin = document.querySelectorAll('.rate-min');
                                const notesMax = document.querySelectorAll('.rate-max');
                                let noteMin;
                                let noteMax;
                                notesMin.forEach(nmin => {
                                    if(nmin.checked) {
                                        noteMin = nmin.value;
                                    }
                                });
                                notesMax.forEach(nmax => {
                                    if(nmax.checked) {
                                        noteMax = nmax.value;
                                    }
                                });
                                
                                // Retire le marqueur
                                ((moyRate < noteMin) || (moyRate > noteMax)) ? marker.setMap(null) : marker.setMap(map);
                            });

                            // Si clique sur le marqueur
                            marker.addListener("click", () => {

                                // Fermer le restaurant ouvert dans la colonne de gauche
                                const commentaires = document.querySelectorAll('.comments');
                                commentaires.forEach(com => {
                                    com.classList.contains('active') && com.classList.remove('active');
                                });
                                // Ouverture du restaurant cliqué sur la carte dans la colonne de gauche
                                comments.classList.add('active');

                                // Ouverture de la fenêtre d'information du restaurant
                                infowindow.open({
                                    anchor: marker,
                                    map,
                                    shouldFocus: false,
                                });

                                // Affichage de streetview donc split de la map en 2
                                const pano = document.querySelector("#pano");
                                const themap = document.querySelector("#map");
                                pano.style.display = "block";
                                themap.style.height = "50%";
                                const panorama = new google.maps.StreetViewPanorama(
                                    pano,
                                    {
                                    position: { lat: e?.lat, lng: e?.long },
                                    pov: {
                                        heading: 34,
                                        pitch: 10,
                                    },
                                    }
                                );
                                map.setStreetView(panorama);
                            });

                        liste.appendChild(li);
                    });
                })
        },
        () => {
            handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
        ? "Erreur: La géolocalisation ne fonctionne pas."
        : "Erreur: Votre navigateur ne supporte pas la géolocalisation."
    );
    infoWindow.open(map);
}