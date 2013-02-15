$(function() {
    var db = 'idb://pouchdb-uploads';
    var pouchdb;

    function createPouchDB() {
        Pouch(db, function(err, db) {
            if (err) throw err;

            pouchdb = db;
            window.pouchdb = db;
            console.log(db);
            loadUploads();
        });
    }
    createPouchDB();

    function loadUploads(){
        pouchdb.allDocs({include_docs: true}, function(err, res) {
            if (err) throw err;

            $('#uploads-list').empty();
            _.each(res.rows, function(val, key, list){
                pouchdb.get(val.doc._id, {attachments: true}, function(err, doc) {
                    if (err) throw err;

                    // flatten out _attachments to ease {{ mustache }} rendering
                    doc.attachments = _.map(
                        _.flatten(doc._attachments), function(val, key){
                        // decode base64-encoded contents in the
                        // "data" property of each attachment
                        val.data = atob(val.data);
                        return val;
                    });
                    // render {{ mustache }} tpl
                    var upload = Mustache.to_html(
                        $('#tpl-upload').html(),
                        doc
                    );
                    $('#uploads-list').append(upload);
                });
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
        var name = n.val();
        pouchdb.post({name: n.val()}, function(err, res){
            console.log(res);
            n.val('');
            var files = $("#upload-form :file[value!='']");
            if(files.length > 0) {
                _.each(files, function(val, key, list){
                    var file = $(val).val();
                    var ext = file.split('.').pop();
                    var attachment = res.id+'/'+key;
                    pouchdb.putAttachment(attachment, res.rev, name, $.mime(ext), function(err, res) {
                        console.log(res);
                    });
                });
            }
            if($('#new-upload-file').val() !== '')
            loadUploads();
        });
    });
});

