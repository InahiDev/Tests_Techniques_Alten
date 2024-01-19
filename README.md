Bienvenue dans le fichier README de la partie backend des Tests Techniques pour la société Alten développée par Gabriel Delaigue.


Une fois initialisé le dossier avec npm init, créez un fichier .env dans lequel vous stockerez les variables suivantes:

PORT = Le port sur lequel vous souhaitez faire tourner le serveur. Il était demandé qu'il soit sur le PORT n°3000.
DB_USERNAME = Le nom d'utilisateur de votre Systême gérant la base de données.
DB_PWD = Le mot de passe associé au nom d'utilisateur précédemment indiqué.
DB_HOST = Le serveur sur lequel tournera votre Base de Données
DB_DIALECT = 'mysql' afin de se servir de la base de données fournie dans le dossier Alten_Tests_Database
TOKEN_KEY = la clé de chiffrement du token jwt. Elle sera utilisée lors du chiffrement et lors du décodage du token envoyé lors de l'identification à l'API.

7 Endpoints ont été codés sur 2 routers séparés pour cette API.

La route /api/v1/user est dotée de 2 endpoints:

POST "/signup" .
Permet la création d'un "compte". A la création de celui-ci le rôle 'public' est attribué au compte. Une adresse mail valide est unique au travers de la table users.
La requête attendue doit comporter dans le body de celle-ci, 2 propriétés: { "email": "", "password": "" }.
Ces champs doivent être remplis avec une adresse correcte pour l'email ainsi qu'un password dont les règles sont explicitées dans le fichier /models/Password.js .

POST "/login" .
Permet l'identification à l'API. La réponse du serveur contient une propriété { "token": "" }. Placer cette valeur dans le header authorization sous la forme Bearer Token.
La requête attendue doit comporter dans le body de celle-ci, 2 propriétés: { "email": "", "password": "" }.

La route /api/v1/products est dotée de 5 endpoints:

GET "/" .
Permet la récupération de tous les produits de la base de données.

GET "/:id" .
Permet la récupération d'un seul produit identifié par son id.

POST "/" .
La création d'un produit dans la base de données.
La requête attendue doit posséder un header authorization remplie avec un token d'identification récupéré grâce au login et présenté comme expliqué ci-dessus.
Le corps de la requête doit comporter:
{
  "code": "", //9 caractères alphanumériques (minuscules et chiffres)
  "name": "",
  "description": "",
  "price": 0, // Un nombre positif (de 0 à 2147483647 inclus)
  "category": "", // Au choix parmis Accessories / Clothing / Electronics / Fitness
  "quantity": 0, // Même limitation que price
  "inventoryStatus": "" // 3 possibilités: OUTOFSTOCK / LOWSTOCK / INSTOCK
  "image": "" /* Facultatif: peut être un lien externe vers une image. Si la requête est en form-data, le champ "image" doit être rempli avec un file dont le mimetype est soit jpg/jpeg/png. */
  "rating": 0 // Un chiffre compris entre 0 et 5 inclus.
}
Ce même archétype de corps sera appliqué aux requêtes PATCH

PATCH "/:id" .
La modification d'un produit.
Endpoint également protégé, nécessite un rôle admin.
La même architecture de corps est demandée que pour une requête POST "/".

/DELETE "/:id" .
Destruction d'un produit et des fichiers potentiellement liés au produit.
Nécessite un rôle d'admin.

Un accès administrateur a été ajouté à la base de données. Tout nouveau compte est comme explicité au-dessus, gratifié d'un rôle public par défaut. L'endpoint nécessaire à la modification de rôle par un utilisateur (admin ou non) n'a pas été implémenté et doit donc être effectué par l'administrateur de la base de données.

En vous souhaitant une bonne journée et une bonne lecture!