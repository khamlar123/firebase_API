const functions = require("firebase-functions");
const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors({origin: true}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const db = admin.firestore();

app.get("/", (req, res) => {
    return res.status(200).json('halo');
});


app.post("/api/create", async (req, res) => {
    try{
        await db.collection('gps').doc(`/${Date.now()}/`).create({
            id: Date.now(),
            lat: req.body.lat,
            lng: req.body.lng,
            active: 1,
            createItem: Date.now(),
        });
        res.status(200).json(1);

    }catch(e){
        res.status(404).json(e);
    }
});

app.get("/api/get", async (req, res) => {
    try{
        const qty = db.collection('gps').doc(req.query.id);
        let gpsDetail = await qty.get();
        let resl =  gpsDetail.data();
        res.status(200).json(resl);   
    }catch(e){
        res.status(404).json(e);
    }
});

app.get("/api/getall", async (req, res) => {
    let resl = [];
    await  db.collection('gps').get().then((data) => {
        let docs = data.docs;
        docs.map((doc) => {
            const selectItems = {
                id: doc.data().id,
                lat: doc.data().lat,
                lng: doc.data().lng,
                createItem: doc.data().createItem,
            };
            resl.push(selectItems);
        })
        return resl;
    });

    res.status(200).json(resl);
});


app.put("/api/update/:id", async (req, res) => {

    try{
        const query = db.collection('gps').doc(req.params.id);
        await  query.update({
            lat: req.body.lat,
            lng: req.body.lng,
        });
        res.status(200).json(1);

    }catch(e){
        res.status(404).json(e);
    }
});

app.delete("/api/delete/:id", async(req, res) => {
    const query = db.collection('gps').doc(req.params.id);
    await query.delete();
    res.status(200).json(1);
});



exports.app = functions.https.onRequest(app);