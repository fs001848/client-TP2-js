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
            supprimerRestaurant(index) {
                this.restaurants.splice(index, 1);
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
            }
        }
    })
}