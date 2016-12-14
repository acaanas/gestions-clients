var express  = require('express'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    app = express(),
    expressValidator = require('express-validator'),
    connection  = require('express-myconnection'),
    session = require('express-session'),
    MySQLStore = require('express-mysql-session')(session),
    mysql = require('mysql'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    ConnectEnsureLogin = require('connect-ensure-login'),
    _ = require('lodash'),
    hoffman = require('hoffman'),
    moment = require('moment');

var cnx = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'gestionclients'
    });

var sessionStore = new MySQLStore({}, cnx);

cnx.connect();

/*Set dust template Engine*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'dust');
app.engine('dust', hoffman.__express());
 
// works with caching
app.set('view cache', true);
 
// optionally load all templates into dust cache on server start
hoffman.prime(app.settings.views, function(err) {
  if(err) {
      console.log('Views not loaded correctly')
  }
});

app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(expressValidator());
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: true,
    saveUninitialized: true
}));

app.use(

    connection(mysql,{
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'gestionclients',
        debug    : false 
    },'request')

);

/* configuration de passport */

passport.use('local-login',new LocalStrategy(
  function(username, password, done) {

        var sqlQuery = 'SELECT * FROM agent WHERE login="' + username + '" AND password="' + password + '"';

        var query = cnx.query(sqlQuery,function(err,rows){

            if(err){
                console.log(err);
                return console.log("Mysql error, check your query");
            }

            var user = rows[0];
            done(null, user);
         });
  }
));


/* gestion de la session avec le userId */
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {


        var sqlQuery = 'SELECT * FROM agent WHERE id="' + id + '"' ;


        cnx.query(sqlQuery,function(err,rows){

            if(err){
                console.log(err);
                return console.log("Mysql error, check your query");
            }

            var user = rows[0];
            done(null, user);

         });

});

app.use(passport.initialize());
app.use(passport.session());


var router = express.Router();

//gestion home
var home = router.route('/');

home.get(ConnectEnsureLogin.ensureLoggedIn(),
  function(req, res){
    console.log('requesting /');
    res.redirect('/search');
  });


//gestion login
var login = router.route('/login');


login.get(function(req, res){
    console.log('requesting /login');
    res.render('login');
});

login.post(passport.authenticate('local-login', { failureRedirect: '/login'}),
  function(req, res) {
    req.session.agentid = req.session.passport.user;
   req.session.save(function () { res.redirect('/search'); });
  });

//gestion recherche telephone

var search = router.route('/search');

search.get(ConnectEnsureLogin.ensureLoggedIn(),
  function(req, res){
    console.log('requesting /search');
    res.render('search');
  });

search.post(ConnectEnsureLogin.ensureLoggedIn(),
    function(req, res){
        req.session.telephone = parseInt(req.body.telephone);
        var sqlClientQuery = 'SELECT * FROM client WHERE telephone="' + req.body.telephone + '"' ;
        cnx.query(sqlClientQuery,function(err,rows){

            if(err){
                console.log(err);
                return console.log("Mysql error, check your query");
            }

            if(rows.length) {
                var specificClient = '/client/' + rows[0].id ;
                console.log('redirecting to specific client');
                res.redirect(specificClient);
            }
            else {
                console.log('redirecting to new client');
                res.redirect('/client/')
            }
        });
    }
  );

// gestion nouveau client

var client = router.route('/client');

client.get(ConnectEnsureLogin.ensureLoggedIn(),
    function(req, res){
        res.render('client', {client: {
            telephone: req.session.telephone
        }});
    }
);

client.post(ConnectEnsureLogin.ensureLoggedIn(),
    function(req, res){
        //validation
        req.assert('nom','nom est obligatoire').notEmpty();
        req.assert('prenom','prenom est obligatoire').notEmpty();
        req.assert('mail','email est obligatoire').notEmpty();
        req.assert('mail','Veuillez entrer un mail valide').isEmail();
        req.assert('telephone','telephone est obligatoire').notEmpty();
        req.assert('telephone','Veuillez entrer un telephone valide').isNumeric();
        req.assert('demande','le corps de la demande est obligatoire').notEmpty();
        req.assert('type','Choisir un type de demande est obligatoire').notEmpty();

        // la methode est sync car c'est une partie importante est du simple traitement
        var errors = req.validationErrors();
        if(errors){
            res.status(422).json(errors);
            return;
        }

        // traitement après validation
        var client = {
            telephone: req.body.telephone,
            nom:req.body.nom,
            prenom:req.body.prenom,
            mail:req.body.mail,
        };
        
        cnx.query('INSERT INTO client SET ?', client, function(err, rows){
           
           if(err){
                console.log(err);
                return console.log("Mysql error, check your query");
           }


          var demande = {
            datedemande: moment().format('YYYY-MM-DD HH:mm:ss'),
            type:req.body.type,
            demande:req.body.demande,
            agentid: req.session.agentid,
            clientid: rows.insertId
        };
          cnx.query('INSERT INTO demande SET ?', demande, function(err, rows){
           
           if(err){
                console.log(err);
                return console.log("Mysql error, check your query");
           }

          res.redirect('/search');

        });

        });
    }
);

//gestion mise à jour client existant

var uniqueClient = router.route('/client/:client_id');

uniqueClient.get(ConnectEnsureLogin.ensureLoggedIn(),
    function(req, res){
        var sqlAgentQuery = 'SELECT * FROM agent WHERE id="' + req.session.agentid + '"' ;
        cnx.query(sqlAgentQuery,function(err,rows){

            if(err){
                console.log(err);
                return console.log("Mysql error, check your query");
            }
                var sqlClientQuery = 'SELECT * FROM client WHERE telephone="' + req.session.telephone + '"' ;
                var sqlListeDemandesQuery = "",
                    client = {telephone: req.session.telephone},
                    listeDemandes = [],
                    agent= rows[0];
                
                cnx.query(sqlClientQuery,function(err,rows){

                    if(err){
                        console.log(err);
                        return console.log("Mysql error, check your query");
                    }

                    if(rows.length) {
                        client = rows[0];
                        sqlListeDemandesQuery = 'SELECT * FROM demande WHERE clientid="' + client.id + '"' ;
                        cnx.query(sqlListeDemandesQuery,function(err,rows){

                            if(err){
                                console.log(err);
                                return console.log("Mysql error, check your query");
                            }


                            if(rows.length) {
                                listeDemandes = rows;
                                _.forEach(listeDemandes, function(demande){
                                    demande.date = demande.datedemande.substring(0, demande.datedemande.indexOf(' '));
                                    demande.heure = demande.datedemande.substring(demande.datedemande.indexOf(' ') + 1);
                                    demande.agent = agent.nom + agent.prenom;
                                });
                            }
                                res.render('client', {client:client, listeDemandes:listeDemandes });
                            
                        });

                    }

                    });
            });
                    
  });


uniqueClient.put(ConnectEnsureLogin.ensureLoggedIn(),
    function(req, res){
        var client_id = req.params.client_id;
        var demande = {
            datedemande: moment().format('YYYY-MM-DD HH:mm:ss'),
            type:req.body.type,
            demande:req.body.demande,
            agentid: req.session.agentid,
            clientid: parseInt(client_id)
        };
        var client = {
            nom:req.body.nom,
            prenom:req.body.prenom,
            mail:req.body.mail,
        };
        

        //validation
        req.assert('nom','nom est obligatoire').notEmpty();
        req.assert('prenom','prenom est obligatoire').notEmpty();
        req.assert('mail','email est obligatoire').notEmpty();
        req.assert('mail','Veuillez entrer un mail valide').isEmail();
        req.assert('telephone','telephone est obligatoire').notEmpty();
        req.assert('telephone','Veuillez entrer un telephone valide').isNumeric();
        req.assert('demande','le corps de la demande est obligatoire').notEmpty();
        req.assert('type','Choisir un type de demande est obligatoire').notEmpty();

        // la methode est sync car c'est une partie importante est du simple traitement
        var errors = req.validationErrors();
        if(errors){
            res.status(422).json(errors);
            return;
        }
        
        
        cnx.query("UPDATE client set ? WHERE id = ? ", [client,client_id], function(err, rows){
        
           if(err){
                console.log(err);
                return console.log("Mysql error, check your query");
           }

          cnx.query("INSERT INTO demande set ? ", demande, function(err, rows){
            
           if(err){
                console.log(err);
                return console.log("Mysql error, check your query");
           }
          res.sendStatus(200);

        });

        });
    }
  );

//now we need to apply our router here
app.use('/', router);

//start Server
var server = app.listen(3000,function(){

   console.log("Listening to port %s",server.address().port);

});
