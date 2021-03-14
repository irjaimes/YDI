
// 1. import sqlite3 package that was installed
const sqlite3 = require('sqlite3').verbose();
// 15. import inputCheckmodule to validate data for POST api route
const inputCheck = require('./utils/inputCheck');
const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();


// 2. Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 6. Connect to database
const db = new sqlite3.Database('./db/election.db', err => {
    if (err) {
        return console.error(err.message);
    }

    console.log('Connected to the election database.');
});

// 7. Test connection to database (all method runs the SQL query and executes callback with all resulting rows that match query)
// db.all(`SELECT * FROM candidates`, (err, rows) => {
//     console.log(rows);
// });
// 11. UPDATE API Endpoint/route above to get ALL candidates like so...
// GET all candidates
app.get('/api/candidates', (req, res) => {
    // const sql = `SELECT * FROM candidates`;
    // 17. Update the api route variable above like so...
    const sql = `SELECT candidates.*, parties.name
                 AS party_name
                 FROM candidates
                 LEFT JOIN parties
                 ON candidates.party_id = parties.id`;
    const params = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: rows
        });
    });
});



// 8. GET a single candidate
// db.get(`SELECT * FROM candidates WHERE id = 1`, (err, row) => {
//     if(err) {
//       console.log(err);
//     }
//     console.log(row);
//   });
// 12. UPDATE API Endpoint/route above to get a SINGLE candidate like so...
// GET single candidate
app.get('/api/candidate/:id', (req, res) => {
    // const sql = `SELECT * FROM candidates 
    //              WHERE id = ?`;
    // 18. Update the api variable above like so...
    const sql = `SELECT candidates.*, parties.name 
                 AS party_name 
                 FROM candidates 
                 LEFT JOIN parties 
                 ON candidates.party_id = parties.id 
                 WHERE candidates.id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: row
        });
    });
});

// 22. PUT api route to update/change a candidate's data
app.put('/api/candidate/:id', (req, res) => {
    // Validate that party_id is provided before trying to update
    const errors = inputCheck(req.body, 'party_id');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: req.body,
            changes: this.changes
        });
    });
});


// 9. Delete a candidate (`?` represents a place holder, in this case `1`)
// db.run(`DELETE FROM candidates WHERE id = ?`, 1, function (err, result) {
//     if (err) {
//         console.log(err);
//     }
//     console.log(result, this, this.changes); // `this` refers to Statement obj
// });
// 13. UPDATE API Endpoint/route above to DELETE a candidate like so...
// DELETE a candidate
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }

        res.json({
            message: 'successfully deleted',
            changes: this.changes
        });
    });
});
// check this route works by impleting DELETE method with Insomnia, use GET to return the updated array of candidates


// 10. Create a candidate with hard coded values
// const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected) 
//               VALUES (?,?,?,?)`;
// const params = [1, 'Ronald', 'Firbank', 1];
// // ES5 function, not arrow function, to use this
// db.run(sql, params, function(err, result) {
//   if (err) {
//     console.log(err);
//   }
//   console.log(result, this.lastID);
// });
// UPDATE API Endpoint/route above and nest into POST route to Create a candidate like so...
// 14. POST endpoint to create candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    // 16. Call to database
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
              VALUES (?,?,?)`; // no id, because sqlite autogenerates it
    const params = [body.first_name, body.last_name, body.industry_connected];
    // ES5 function, not arrow function, to use `this`
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: body,
            id: this.lastID // whatever id was assigned
        });
    });

});
// Use insomnia to check POST logic, make sure to populate the body with a json obj that fulfills the params set
// Use GET and modify the url to check the candidates obj now has the new obj created
// After update sqlite queries to get the data needed before updating API variables



// 19. GET all parties
app.get('/api/parties', (req, res) => {
    const sql = `SELECT * FROM parties`;
    const params = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: rows
        });
    });
});

// 20. GET route to get parties by id
app.get('/api/party/:id', (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }

        res.json({
            message: 'success',
            data: row
        });
    });
});

// 21. DELETE route to delete party by id
app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ error: res.message });
            return;
        }

        res.json({ message: 'successfully deleted', changes: this.changes });
    });
});



// 5. CATCH ALL. Default response for any other request(Not Found)
app.use((req, res) => {
    res.status(404).end();
});

// 4. Test connection to server (overrides all others, therefore must be the last one)
// app.get('/', (req, res) => {
//     res.json({
//       message: 'Hello World'
//     });
//   });

// 3. Start server after DB connection
db.on('open', () => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});