const express = require('express');
const router = express.Router();
const { response } = require('express');
const Query = require('../schema/Query');

router.post('/createquery', async(req,res)=>{
  const newquery = await Query.create({
  name: req.body.name,
  email: req.body.email,
  query: req.body.query,
  comment: req.body.comment
});
const id_new = newquery.id;
const success = true;
res.json({ success, id_new});
});

router.post('/getquery',async (req, res) => {

try {
const email = req.header('email');
const allquery = await Query.findById(email)
res.send(JSON.stringify(allquery))
} catch (error) {
console.error(error.message);
res.status(500).send("Internal Server Error");
}
});

router.post('/getallquery',async (req, res) => {

  try {
  const allquery = await Query.find()
  res.send(JSON.stringify(allquery))
  } catch (error) {
  console.error(error.message);
  res.status(500).send("Internal Server Error");
  }
  });

router.put('/updatequery/:id', async (req, res) => {
try {
const id = req.params.id;
const updatedQuery = await Query.findByIdAndUpdate(id, {
  name: req.body.name,
  email: req.body.email,
  query: req.body.query,
  comment: req.body.comment
}, { new: true }); // {new: true} returns the updated document

if (!updatedQuery) {
  return res.status(404).json({ success: false, message: 'Query not found' });
}

res.json({ success: true, updatedQuery });
} catch (error) {
console.error('Error updating query:', error);
res.status(500).json({ success: false, message: 'Internal server error' });
}
});

module.exports = router;