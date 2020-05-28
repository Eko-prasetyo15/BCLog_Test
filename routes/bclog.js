var express = require('express');
var bodyParser = require('body-parser')
var router = express.Router();

module.exports = (pool) => {
  /* GET home page. */
  router.get('/', (req, res, next) => {
    // logic gpnaton //
    const limit = 3;
    const currentPage = parseInt(req.query.page) || 1;
    const offset = parseInt(currentPage - 1) * limit;

    // logic filter //
    let result = [];
    let sql = 'SELECT * from datauser';
    let input = req.query;

    if (input.check_id && input.searchid) {
      result.push(`id=${input.searchid}`);
    }
    if (input.check_string && input.searchString) {
      result.push(`string='${input.searchString}'`);
    }
    if (input.check_integer && input.searchInteger) {
      result.push(`integer=${input.searchInteger}`);
    }
    if (input.check_float && input.searchFloat) {
      result.push(`float='${input.searchFloat}'`)
    }
    if (input.startDate && input.endDate && input.check_date) {
      console.log('ini masuk');
      result.push(`date BETWEEN '${input.startDate}' AND '${input.endDate}'`);
    }
    if (input.check_boolean && input.boolean) {
      result.push(`boolean = '${input.boolean}'`);
    }
    if (result.length > 0) {
      sql += ` WHERE ${result.join(' AND ')}`
    }
    console.log(result)

    sql += ' order by id asc';
    console.log(sql);

    pool.query(sql, (err, data) => {
      if (err) return res.send(err);

      const totalRows = data.rows.length === undefined ? 0 : data.rows.length;
      const totalPage = Math.ceil(totalRows / limit)
      const url = req.url == '/' ? '/?page=1' : req.url;

      sql += ` limit ${limit} offset ${offset}`;
      
    pool.query(sql, (err, data) => {
      if (err) return res.send(err);
      let result = data.rows.map(item => {
        return item
      });
      res.status(200).json({
        result,
        query: req.query,
        offset,
        totalPage,
        currentPage,
        url
      })
    })
  })
})

  router.get('/:id', (req, res, next) => {
    pool.query('SELECT * from datauser where id = $1 ', [req.params.id], (err, data) => {
      if (err) return res.send(err);
      res.json(data.rows);
    });
  });

  router.post('/', (req, res, next) => {
    console.log(req.body)
    pool.query(`INSERT INTO datauser (name, addres, handphone) VALUES ($2, $3, $4)`,
      [req.body.name, req.body.addres, req.body.handphone], (err, data) => {
        if (err) return res.send(err);
        res.json(data);
      });
  });

  router.put('/:id', (req, res, next) => {
    pool.query(`UPDATE datauser SET name = $2 , addres = $3 , handphone = $4, WHERE id = $1`,
      [req.params.id, req.body.name, req.body.addres, req.body.handphone], (err, data) => {
        if (err) return res.send(err);
        res.json(data);
      });
  });

  router.delete('/:id', (req, res, next) => {
    console.log(req.params)
    pool.query('DELETE FROM datauser WHERE id = $1', [req.params.id], (err, data) => {
      // if(err) return res.send(err);
      if (err) return res.send(err)
      res.json(data);
    });
  });


  return router;
}