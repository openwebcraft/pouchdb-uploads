/**
 * Created with IntelliJ IDEA.
 * User: matthias
 * Date: 13.02.13
 * Time: 14:16
 * To change this template use File | Settings | File Templates.
 */
var pouchdb;
Pouch('idb://pouchdb-uploads', function(err, db) {
    pouchdb = db;
});