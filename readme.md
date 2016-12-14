Ceci est un simple example d'une Rest api avec Dust.js + Express.js + Node.js

## Requirements

```Node.js, npm doivent être installer sur votre machine
   mysql aussi ! je recommende (wamp,lamp,xamp)  avec phpmyadmin pour visualiser et interagire facilement avec la base de données
```

## Installation

Dans la racine du dossier executér :
    npm install

## Configuration (database)
1. Lancez (wamp,xamp,...) ! Après que les services sont démarrés ouvrez phpmyadmin et créer une nouvelle base de données vide nommée 'gestionclients'
2. Importez le script sql que vous trouvez dans le dossier sous le nom 'db.sql'
3. Dans le ficher server.js à la ligne 18 (var cnx = mysql.createConnection) changez les paramètres de votre connexion à la BD
4. En laissant les services démarrés de (wamp, xamp,...), ouvrez l'invite de commandes (cmd) et naviguez au dossier de l'application puis executez la commande: node server.js
5. Visitez localhost:3000 et connecter vous soit par (acaanas/acaanas) ou (menara/menara)

	

