window.onload = init;

function init() {
    new Vue({
        el: "#app",
        data: {
            restaurants: [{
                nom: 'café de Paris',
                cuisine: 'Française'
            },
                {
                    nom: 'Sun City Café',
                    cuisine: 'Américaine'
                }
            ],
            nbRestaurants: 0,
            nbPagesDeResultats:0,
            nom: '',
            cuisine: '',
            page: 0,
            pagesize: 10,
            nomRecherche: ""
        },
        mounted() {
            console.log("AVANT AFFICHAGE");
            this.getRestaurantsFromServer();
        },
        methods: {
            getRestaurantsFromServer() {
                let url = "http://localhost:8080/api/restaurants?page=" +
                    this.page +
                    "&pagesize=" + this.pagesize +
                    "&name=" + this.nomRecherche;

                // ARROW FUNCTIONS PRESERVENT LE THIS !!!
                fetch(url)
                    .then((responseJSON) => {
                        responseJSON.json()
                            .then((responseJS) => {
                                // Maintenant res est un vrai objet JavaScript
                                console.log("restaurants récupérés");
                                this.restaurants = responseJS.data;
                                this.nbRestaurants = responseJS.count;
                                this.nbPagesDeResultats = Math.ceil(this.nbRestaurants/this.pagesize);
                            });
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
            debounceRecherche(){
                var run = () =>{
                    this.getRestaurantsFromServer();
                    console.log("wait 300ms");
                };
                var deb = _.debounce(run,300);
                deb();
            },
            supprimerRestaurant(id,nom) {
                let choix = confirm("Supprimer : " + nom + " ?");
                if (choix) {
                    console.log("on supprime");
                    let url = "http://localhost:8080/api/restaurants/" + id;

                    fetch(url, {
                        method: "DELETE",
                    })
                        .then((responseJSON) => {
                            responseJSON.json()
                                .then((res) =>{
                                    // Maintenant res est un vrai objet JavaScript
                                    console.log(res.msg);
                                    this.getRestaurantsFromServer();
                                });
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }
                else {
                    console.log("on ne supprime pas");
                }

            },

            editRestaurant(id, olderName, olderCuisine){
                let newName = prompt("Modifier le nom : ", olderName);
                if (newName == null || newName === "") {
                    console.error("modification nom impossible !");
                    newName = olderName;
                } else {
                    console.log("modification nom ok");
                }

                let newCuisine = prompt("Modifier la cuisine : ", olderCuisine);
                if (newCuisine == null || olderCuisine === "") {
                    console.error("modification cuisine impossible !");
                    newCuisine = olderCuisine;
                } else {
                    console.log("modification cuisine ok");
                }

                let choix = confirm("Validez-vous la modification : \n" +
                    "Nom : " + newName + "\n" + "Cuisine : " + newCuisine);
                if (choix) {

                    let url = "http://localhost:8080/api/restaurants/" + id;
                    let form = new FormData();
                    form.append("_id",id);
                    form.append("nom",newName);
                    form.append("cuisine",newCuisine);
                    fetch(url, {
                        method: "PUT",
                        body: form
                    })
                        .then((responseJSON) =>{
                            responseJSON.json()
                                .then((res) =>{
                                    afficheReponsePUT(res);
                                });
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                    console.log("on modifie");
                    this.getRestaurantsFromServer();

                }
                else {
                    console.log("on ne modifie pas");
                }

            },
            ajouterRestaurant(event) {
                // eviter le comportement par defaut
                event.preventDefault();

                // On recupère le formulaire
                let form = event.target;

                // On recupere les données du formulaire
                let dataFormulaire = new FormData(form);

                // On envoie une requête POST au serveur
                let url = "http://localhost:8080/api/restaurants";

                fetch(url, {
                    method:"POST",
                    body: dataFormulaire
                })
                    .then((responseJSON) => {
                        responseJSON.json()
                            .then((responseJS) => {
                                // Maintenant res est un vrai objet JavaScript
                                console.log(responseJS.msg);
                                this.getRestaurantsFromServer();
                            });
                    })
                    .catch(function (err) {
                        console.log(err);
                    });

                // On remet les champs du formulaire à zéro
                this.nom = "";
                this.cuisine = "";
            },
            getColor(index) {
                return (index % 2) ? 'lightBlue' : 'pink';
            },
            pagePrecedente() {
                if (this.page !== 0) {
                    this.page--;
                    this.getRestaurantsFromServer();
                }
            },
            pageSuivante() {
                if (this.page < this.nbPagesDeResultats) {
                    this.page++;
                    this.getRestaurantsFromServer();
                }
            },
            pageDebut(){
                if (this.page !== 0) {
                    this.page = 0;
                    this.getRestaurantsFromServer();
                }
            },
            pageFin() {
                if (this.page < this.nbPagesDeResultats) {
                    this.page = this.nbPagesDeResultats -1;
                    this.getRestaurantsFromServer();
                }
            }
        }
    })
}