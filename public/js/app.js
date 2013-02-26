$(function() {
    var db = 'idb://pouchdb-uploads';
    var pouchdb;

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    function createPouchDB() {
        Pouch(db, function(err, db) {
            if (err) throw err;

            pouchdb = db;
            window.pouchdb = db;
            //if (console && console.log) console.log(db);
            loadUploads();
        });
    }
    createPouchDB();

    function loadUploads(){
        pouchdb.allDocs({include_docs: true}, function(err, res) {
            if (err) throw err;

            $('#uploads-list').empty();
            _.each(res.rows, function(val, key, list){
                pouchdb.get(
                    val.doc._id,
                    {attachments: true},
                    function(err, doc) {
                        if (err) throw err;

                        // TODO figure out how to directly use _attachments with {{ mustache }}
                        // flatten out _attachments to ease {{ mustache }} rendering
                        doc.attachments = _.flatten(doc._attachments);
                        // render {{ mustache }} tpl
                        var upload = Mustache.to_html(
                            $('#tpl-upload').html(),
                            doc
                        );
                        $('#uploads-list').append(upload);
                    }
                );
            });
        });
    }

    $('#btn-clear-db').click(function(e){
        Pouch.destroy(db, function(err, info) {
            //if (console && console.log) console.log(info);
            $('#uploads-list').empty();
            createPouchDB();
        });
    });

    $('#upload-file').change(function(e){
        var files = e.target.files; // FileList object
        var name = $('#upload-description').val();

        // Loop through the FileList and act on image files...
        for (var i = 0, f; f = files[i]; i++) {

            // Only process image files.
            if (!f.type.match('image.*')) {
                continue;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {

                    if (!name) {
                        name = theFile.name;
                    }

                    pouchdb.post({name: name}, function(err, res){
                        if (err) throw err;

                        var ext = theFile.name.split('.').pop();
                        var attachment = res.id+'/'+encodeURIComponent(theFile.name);
                        var data = e.target.result;
                        pouchdb.putAttachment(
                            attachment,
                            res.rev,
                            data,
                            $.mime(ext),
                            function(err, res) {
                                if (err) throw err;
                            }
                        );

                        loadUploads();
                        $('#upload-form')[0].reset();
                    });

                };
            })(f);

            // Read in the image file as a data URL.
            reader.readAsBinaryString(f);
        }

    });
});

