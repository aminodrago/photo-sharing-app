var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI || "mongodb://localhost/taskdb?auto_reconnnect";
var db = null;

mongo.connect(mongoUri, {}, function(err, database) {
    if(!err) {
        db = database;
        console.log("Connected to 'taskdb' database");
        db.collection('tasks', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'tasks' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

// var Server = mongo.Server,
//     Db = mongo.Db,
//     BSON = mongo.BSONPure;

// var server = new Server('localhost', 27017, {auto_reconnect: true});
// db = new Db('taskdb', server, {safe: true});

// db.open(function(err, db) {
//     if(!err) {
//         console.log("Connected to 'taskdb' database");
//         db.collection('tasks', {safe:true}, function(err, collection) {
//             if (err) {
//                 console.log("The 'tasks' collection doesn't exist. Creating it with sample data...");
//                 populateDB();
//             }
//         });
//     }
// });

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving task: ' + id);
    db.collection('tasks', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('tasks', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addTask = function(req, res) {
    var task = req.body;
    console.log('Adding task: ' + JSON.stringify(task));
    db.collection('tasks', function(err, collection) {
        collection.insert(task, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.updateTask = function(req, res) {
    var id = req.params.id;
    var task = req.body;
    delete task._id;
    console.log('Updating task: ' + id);
    console.log(JSON.stringify(task));
    db.collection('tasks', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, task, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating task: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(task);
            }
        });
    });
};

exports.deleteTask = function(req, res) {
    var id = req.params.id;
    console.log('Deleting task: ' + id);
    db.collection('tasks', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var tasks = [
        {
            name: "Ready to presentation"
        }
    ];

    db.collection('tasks', function(err, collection) {
        collection.insert(tasks, {safe:true}, function(err, result) {});
    });

};
