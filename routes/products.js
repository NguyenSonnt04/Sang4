var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let productModel = require('../schemas/products')

//R CUD
/* GET users listing. */
router.get('/', async function (req, res, next) {
  try {
    let queries = req.query;
    let titleQ = queries.title ? queries.title : '';
    
    // Parse sang Number để MongoDB so sánh đúng kiểu
    let min = queries.minprice ? Number(queries.minprice) : 0;
    let max = queries.maxprice ? Number(queries.maxprice) : Number.MAX_SAFE_INTEGER;

    console.log(queries);

    let filter = {
      isDeleted: false,
      title: new RegExp(titleQ, 'i'),
    };

    // Chỉ filter giá nếu có truyền query
    if (queries.minprice || queries.maxprice) {
      filter.price = { $gte: min, $lte: max };
    }

    let data = await productModel.find(filter).populate({
      path: 'category',
      select: 'name'
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.find({
      isDeleted: false,
      _id: id
    })
    if (result.length > 0) {
      res.send(result[0])
    } else {
      res.status(404).send("ID NOT FOUND")
    }
  } catch (error) {
    res.status(404).send(error.message)
  }

});

router.post('/', async function (req, res, next) {
  try {
    const { title, price, description, images, category } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Thiếu trường bắt buộc: title' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Thiếu trường bắt buộc: category' });
    }

    let newProduct = new productModel({
      title,
      slug: slugify(title, {
        replacement: '-',
        remove: undefined,
        lower: true,
        trim: true
      }),
      price,
      images,
      description,
      category
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
})
router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    // let result = await productModel.findById(id)
    // let keys = Object.keys(req.body);
    // for (const key of keys) {
    //     result[key] = req.body[key]
    //     result.updatedAt = new Date(Date.now())
    // }
    // await result.save()
    let result = await productModel.findByIdAndUpdate(
      id, req.body, {
      new: true
    })
    res.send(result)
  } catch (error) {
    res.status(404).send(error.message)
  }
})
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.findById(id)
    result.isDeleted = true;
    await result.save()
    res.send(result)
  } catch (error) {
    res.status(404).send(error.message)
  }
})



module.exports = router;
