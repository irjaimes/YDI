
// 1. import sqlite3 package that was installed
const sqlite3 = require('sqlite3').verbose();
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
    const sql = `SELECT * FROM candidates`;
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
    const sql = `SELECT * FROM candidates 
                 WHERE id = ?`;
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