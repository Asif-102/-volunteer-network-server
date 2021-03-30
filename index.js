const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wp8tr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const eventCollection = client.db(process.env.DB_NAME).collection("events");
    console.log('db connected');

    app.get('/events', (req, res) => {
        eventCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.post('/addEvent', (req, res) => {
        const newEvent = req.body;
        console.log('adding new event', newEvent);
        if (newEvent.imageURL !== null) {
            eventCollection.insertOne(newEvent)
                .then(result => {
                    console.log('insertec count ', result.insertedCount)
                    res.send(result.insertedCount > 0)
                })
        }else{
            res.send('uploaded failed')
        }
    })

    app.delete('/deleteEvent/:id', (req, res)=>{
        const id = ObjectID(req.params.id);
        console.log('delete this', id);
        eventCollection.findOneAndDelete({_id: id})
        .then(documents => res.send(!!documents.value))
    })

});

app.listen(port, () => {
    console.log(`Example app listening port at http://localhost:${port}`)
})