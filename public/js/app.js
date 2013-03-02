$(function() {
    var db = 'idb://pouchdb-uploads',
        db_replications = 'idb://pouchdb-uploads-replications';
    var pouchdb = null,
        replicationsdb = null;
    var pushResps = {},
        pullResps = {};
    var replicationsCount = 0;

    // switch on debug messages
    Pouch.DEBUG = true;

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

    function createReplicationsDB() {
        Pouch(db_replications, function(err, db) {
            if (err) throw err;

            replicationsdb = db;
            window.replicationsdb = db;
            //if (console && console.log) console.log(db);
            loadReplications();
        });
    }
    createReplicationsDB();

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
                            _.extend(doc, {created_at_from_now: moment(doc.created_at).fromNow()})
                        );
                        $('#uploads-list').append(upload);
                    }
                );
            });
        });
    }

    function loadReplications(){
        replicationsdb.allDocs({include_docs: true}, function(err, res) {
            if (err) throw err;

            $('#replications-list').empty();
            _.each(res.rows, function(val, key, list){
                var replication = Mustache.to_html(
                    $('#tpl-replication').html(),
                    _.extend(val.doc, {created_at_from_now: moment(val.doc.created_at).fromNow()})
                );
                $('#replications-list').append(replication);
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

    $('#btn-clear-replications').click(function(e){
        Pouch.destroy(db_replications, function(err, info) {
            //if (console && console.log) console.log(info);
            $('#replications-list').empty();
            $('#sync-stats').empty();
            createReplicationsDB();
        });
    });

    $('#btn-sync-replications').click(function(e){
        replicationsdb.allDocs({include_docs: true}, function(err, res) {
            if (err) throw err;

            syncReplications(res.rows);
        });
    });

    function syncReplications(replications) {

        replicationsCount = replications.length;

        _.each(replications, function(val, key, list){
            var url = val.doc.url;

            /*
            Pouch.replicate(pouchdb, url, function(err, resp) {
                if (err) throw err;

                pushResps[url] = resp;
                renderSyncStats();
            });
            */

            pouchdb.replicate.to(url, {continuous: true}, function(err, resp) {
                if (err) throw err;

                pushResps[url] = resp;
                renderSyncStats();
            });
            pouchdb.replicate.from(url, {continuous: true}, function(err, resp) {
                if (err) throw err;

                pullResps[url] = resp;
                renderSyncStats();
            });

        });
    }

    function renderSyncStats() {

        var syncStats = Mustache.to_html(
            $('#tpl-sync-stats').html(),
            _.reduce([pullResps, pushResps], function(memo, resps) {
                memo.read += _.reduce(resps, function(sum, resp) {
                    return sum + resp.docs_read;
                }, 0);
                memo.written += _.reduce(resps, function(sum, resp) {
                    return sum + resp.docs_written;
                }, 0);

                return memo;
            }, {
                read: 0,
                written: 0,
                count: replicationsCount
            })
        );
        $('#sync-stats').empty().append(syncStats);
    }

    $('#btn-upload').click(function(e){
        e.preventDefault();
        var files = $('#upload-file')[0].files; // FileList object
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

                    pouchdb.post({name: name, created_at: new Date()}, function(err, res){
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

    $('#btn-replication').click(function(e){
        e.preventDefault();
        var replication = $('#new-replication'); // FileList object
        if (!replication.val()) return;

        replicationsdb.post({url: replication.val(), created_at: new Date()}, function(err, res){
            if (err) throw err;

            loadReplications();
            $('#replication-form')[0].reset();
        });

    });

    $('#btn-cancel-upload').click(function(e){
        $('#upload-form')[0].reset();
    });

    $('#btn-cancel-replication').click(function(e){
        $('#replication-form')[0].reset();
    });

});

