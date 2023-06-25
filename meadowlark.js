var express = require('express');
var app = express();
var fortune = require('./public/lib/fortune.js');

app.use(require('body-parser').json({ limit: '1mb' }));
//set up handlebars view engine
var handlebars = require('express-handlebars').create({defaultLayout:'main', healpers: {
    section: function(name,options){
        if(!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
    }
}});
app.engine('handlebars',handlebars.engine);
app.set('view engine', 'handlebars');

// if (app.thing === null){
//     console.log('bleat!');
// }
app.set('port', process.env.PORT || 3000); //'port' -> port

app.use(function(req,res,next){
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});


app.use(express.static(__dirname+'/public'));

app.get('/',function(req,res){
    // res.type('text/plain');
    // res.send('Meadowlark Travel');
    res.render('home');
});

//disabling express's default x-powered-by header
app.disable('x-powered-by');

// request headers... info frm browser to server...
app.get('/headers',function(req,res){
    res.set('Content-Type','text/plain');
    var s ='';
    for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
    res.send(s);
});

app.get('/about',function(req,res){
    res.render('about',{fortune:fortune.getFortune(), pageTestScript: '/qa/tests-about.js'});
});

app.get('/tours/hood-river',function(req,res){
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate',function(req,res){
    res.render('tours/request-group-rate');
});

//newsletter
app.get('/newsletter',function(req,res){
    res.render('newsletter',{csrf:'CSRF token goes here'});
});

// app.post('/process',function(req,res){
//     console.log('Form (from querystring): '+ req.query.form);
//     console.log('CSRF token (from hidden form field): '+ req.body._csrf);
//     console.log('Name (from visible form field): '+ req.body.name);
//     console.log('Email (from visible form field): '+ req.body.email);
//     res.redirect(303,'/thank-you');
// });

app.post('/process',function(req,res){
    if(req.xhr || req.accepts('json,html')==='json'){
        res.send({success:true});
    }else{
        res.redirect(303,'/thank-you');
    }
});

//custom 500 page
app.use(function(err,req,res,next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

//custom 404 page
app.use(function(req,res){
    res.status(404);
    res.render('404');

});

app.listen(app.get('port'),function(){
    console.log('Express started on http://localhost:'+ app.get('port')+'; press Ctrl+c to terminate');
});

function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}

app.use(function(req,res,next){
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weather = getWeatherData();
    next();
})