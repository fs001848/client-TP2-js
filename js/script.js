window.onload = init;

function init() {
    new Vue({
        el: "#app",
        data: {
            dialog: false,
            headers: [
                {
                    text: 'Restaurants (nom)',
                    align: 'left',
                    sortable: true,
                    value: 'name'
                },
                { text: 'Cuisine', value: 'cuisine', sortable:true },
                { text: 'Actions', value: 'name', sortable: false }
            ],
            restaurants: [{
                nom: 'café de Paris',
                cuisine: 'Française',
            },
                {
                    nom: 'Sun City Café',
                    cuisine: 'Américaine',
                }
            ],
            editedIndex: -1,
            editedItem: {
                name: '',
                cuisine: ''

            },
            defaultItem: {
                name: '',
                cuisine: ''
            },
            nbRestaurants: 0,
            nbPagesDeResultats:0,
            nom: '',
            cuisine: '',
            page: 0,
            pagesize: 10,
            nomRecherche: ""
        },
        computed: {
            formTitle () {
                return this.editedIndex === -1 ? 'Nouveau Restaurant' : 'Modifier Restaurant'
            }
        },

        watch: {
            dialog (val) {
                val || this.close()
            }
        },

        created () {
            this.getRestaurantsFromServer();
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
                                if (this.page > this.nbPagesDeResultats){
                                    this.page = 0;
                                }
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
            editRestaurant (item) {
                this.editedIndex = this.restaurants.indexOf(item)
                this.editedItem = Object.assign({}, item)
                this.dialog = true
            },
            deleteItem (item) {
                console.log(item._id + " " + item.name);
                let choix = confirm('Voulez vous vraiment supprimer le restaurant :\n'+item.name);
                if (choix) {
                    console.log("on supprime");
                    let url = "http://localhost:8080/api/restaurants/" + item._id;

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

            close () {
                this.dialog = false;
                setTimeout(() => {
                    this.editedItem = Object.assign({}, this.defaultItem);
                    this.editedIndex = -1;
                    this.getRestaurantsFromServer();
                }, 300)
            },

            save () {
                if (this.editedIndex > -1) {
                    let url = "http://localhost:8080/api/restaurants/" + this.editedItem._id;
                    let form = new FormData();
                    form.append("_id",this.editedItem._id);
                    form.append("nom",this.editedItem.name);
                    form.append("cuisine",this.editedItem.cuisine);
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
                } else {
                    console.log("EXIST : " +this.editedItem._id +" "+ this.editedItem.name+" "+this.editedItem.cuisine);

                    // On envoie une requête POST au serveur
                    let url = "http://localhost:8080/api/restaurants";
                    // On crée le formulaire
                    let form = new FormData();
                    form.append("nom",this.editedItem.name);
                    form.append("cuisine",this.editedItem.cuisine);

                    fetch(url, {
                        method:"POST",
                        body: form
                    })
                        .then((responseJSON) => {
                            responseJSON.json()
                                .then((responseJS) => {
                                    // Maintenant res est un vrai objet JavaScript
                                    console.log(responseJS.msg);
                                });
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                    }
                this.close();

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
                if (this.page < this.nbPagesDeResultats - 1) {
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