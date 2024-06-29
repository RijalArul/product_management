const express = require('express')
const cors = require('cors')
const app = express()
const { Product, Brand, Sequelize } = require('./models')
const { query } = require('express-validator')

const port = process.env.PORT || 3000

app.use(express.json())

// Error handler
function errorHandler (err, req, res, next) {
  if (err?.errors?.length > 0) {
    res.status(400).json({
      data: {},
      statusCode: 400,
      message: err.errors[0].message
    })
  } else if (err.message.includes('Bad Request')) {
    res.status(400).json({
      data: {},
      statusCode: 400,
      message: err.message
    })
  } else if (err.message === 'id tidak ada didalam database') {
    res.status(500).json({
      data: {},
      statusCode: 500,
      message: err.message
    })
  } else {
    res.status(500).json({
      data: {},
      statusCode: 500,
      message: 'Internal Server Error'
    })
  }
}

const queries = [
  query('page')
    .isNumeric({
      min: 1
    })
    .withMessage('Only allow with numeric.')
    .optional({
      nullable: true
    }),
  query('limit')
    .isNumeric({
      min: 1
    })
    .withMessage('Only allow with numeric.')
    .optional({
      nullable: true
    }),
  query('sort_rules')
    .isIn(['ASC', 'DESC'])
    .withMessage('ASC Or Desc for allowed it')
    .optional({
      nullable: true
    }),
  query('search').isString().optional({
    nullable: true
  })
]

// Success Response
function successResp (res, statusCode, message, data) {
  res.status(statusCode).json({
    message: `Successfully ${message}`,
    data: data
  })
}
// API Brand

app.post('/api/createPostMerk', async (req, res, next) => {
  try {
    const payload = req.body

    const newBrand = await Brand.create(payload)

    successResp(res, 201, 'Create Brand', newBrand)
  } catch (err) {
    next(err)
  }
})

app.get('/api/brands', async (req, res, next) => {
  try {
    let { page, limit, search, sort_by, attributes_search } = req.query
    let offset
    let paramQuerySQL = {
      limit: limit || 10
    }

    if (page !== '' && typeof page !== 'undefined') {
      if (limit !== '' && typeof limit !== 'undefined') {
        paramQuerySQL.limit = limit
      }

      if (page.number !== '' && typeof page.number !== 'undefined') {
        offset = page.number * limit - limit
        paramQuerySQL.offset = offset
      }
    } else {
      paramQuerySQL.limit = limit
      paramQuerySQL.offset = offset
    }

    if (attributes_search.length > 0) {
      let orConditions = []
      const attribteSearchSplit = attributes_search.split(',')
      attribteSearchSplit.forEach(attribute_split => {
        const orObject = {
          [attribute_split]: {
            [Sequelize.Op.iLike]: `%${search}%`
          }
        }

        orConditions.push(orObject)
      })

      paramQuerySQL = {
        ...paramQuerySQL,
        where: {
          [Sequelize.Op.or]: orConditions
        }
      }
    }

    if (sort_by.length > 0) {
      const sortBySplitArr = sort_by?.split(',')

      paramQuerySQL = {
        ...paramQuerySQL,
        order: [[`${sortBySplitArr[0]}`, `${sortBySplitArr[1]}`]]
      }
    }
    const brands = await Brand.findAll(paramQuerySQL)
    successResp(res, 200, 'Get Brands', brands)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

app.get('/api/brands/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const brands = await Brand.findByPk(id)

    if (!brands) {
      throw new Error('id tidak ada didalam database')
    }
    successResp(res, 200, 'Get Brand', brands)
  } catch (err) {
    next(err)
  }
})

app.put('/api/brands/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const payload = req.body

    const brands = await Brand.update(payload, {
      where: {
        id: id
      }
    })
    successResp(res, 200, 'Update Brand', brands)
  } catch (err) {
    next(err)
  }
})

app.delete('/api/brands/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const brands = await Brand.update(
      { deleted_at: new Date() },
      {
        where: {
          id: id
        }
      }
    )
    successResp(res, 200, 'Delete Brand', brands)
  } catch (err) {
    next(err)
  }
})

// API Product

app.post('/api/createPostProducts', async (req, res, next) => {
  try {
    let payload = req.body
    const newProduct = await Product.create(payload)
    successResp(res, 201, 'Create Product', newProduct)
  } catch (err) {
    next(err)
  }
})

app.get('/api/products', async (req, res, next) => {
  try {
    let { page, limit, search, sort_by, attributes_search } = req.query
    let offset
    let paramQuerySQL = {
      limit: 10
    }
    if (page !== '' && typeof page !== 'undefined') {
      if (limit !== '' && typeof limit !== 'undefined') {
        paramQuerySQL.limit = limit
      }

      if (page.number !== '' && typeof page.number !== 'undefined') {
        offset = page.number * limit - limit
        paramQuerySQL.offset = offset
      }
    } else {
      paramQuerySQL.limit = limit
      paramQuerySQL.offset = offset
    }

    if (attributes_search.length > 0) {
      let orConditions = []
      const attribteSearchSplit = attributes_search.split(',')
      attribteSearchSplit.forEach(attribute_split => {
        const orObject = {
          [attribute_split]: {
            [Sequelize.Op.iLike]: `%${search}%`
          }
        }

        orConditions.push(orObject)
      })

      paramQuerySQL = {
        ...paramQuerySQL,
        where: {
          [Sequelize.Op.or]: orConditions
        }
      }
    }

    if (sort_by.length > 0) {
      const sortBySplitArr = sort_by?.split(',')

      paramQuerySQL = {
        ...paramQuerySQL,
        order: [[`${sortBySplitArr[0]}`, `${sortBySplitArr[1]}`]]
      }
    }

    const products = await Product.findAll(paramQuerySQL)
    successResp(res, 200, 'Get Products', products)
  } catch (err) {
    next(err)
  }
})

app.get('/api/products/:id', async (req, res, next) => {
  try {
    const id = req.params.id

    const products = await Product.findByPk(id)
    if (!products) {
      throw new Error('id tidak ada didalam database')
    }
    successResp(res, 200, 'Get Product', products)
  } catch (err) {
    next(err)
  }
})

app.put('/api/products/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const payload = req.body
    const products = await Product.update(payload, {
      where: {
        id: id
      }
    })
    successResp(res, 200, 'Update Product', products)
  } catch (err) {
    next(err)
  }
})

app.delete('/api/products/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    const products = await Product.update(
      { deleted_at: new Date() },
      {
        where: {
          id: id
        }
      }
    )
    successResp(res, 200, 'Delete Product', products)
  } catch (err) {
    next(err)
  }
})

app.get('/api/summaryProducts', async (req, res, next) => {
  try {
    const { count: productsCount, rows: productsData } =
      await Product.findAndCountAll()
    successResp(res, 200, 'Get Product', productsCount)
  } catch (err) {
    next(err)
  }
})

app.use(errorHandler)

app.listen(port, () => {
  console.log(`App is listening on port ${port}`)
})
