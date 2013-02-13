$(function() {
    var db = 'idb://pouchdb-uploads';
    var pouchdb;

    function createPouchDB() {
        Pouch(db, function(err, db) {
            pouchdb = db;
            console.log(db);
            loadUploads();
        });
    }
    createPouchDB();

    function loadUploads(){
        pouchdb.allDocs({include_docs: true}, function(err, res) {
            _.each(res.rows, function(val, key, list){
                var upload = Mustache.to_html(
                    $('#tpl-upload').html(),
                    val.doc
                );
                $('#uploads-list').append(upload);
            });
        });
    }

    $('#btn-clear-db').click(function(e){
        Pouch.destroy(db, function(err, info) {
            console.log(info);
            $('#uploads-list').empty();
            createPouchDB();
        });
    });

    $('#upload-form').submit(function(e){
        e.preventDefault();
        var n = $('#new-upload-name');
        pouchdb.post({name: n.val()}, function(err, res){
            console.log(res);
            n.val('');
            loadUploads();
        });
    });
});

