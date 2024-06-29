'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Product.belongsTo(models.Brand, {
        foreignKey: 'brand_id'
      })
    }
  }
  Product.init(
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          is: {
            args: /^(?=.*[0-9])(?=.*[ a-zA-Z])([ a-zA-Z0-9]+)$/,
            msg: 'just accepted character and number. Without other characters'
          }
        }
      },
      price: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
          max: Number.MAX_SAFE_INTEGER
        }
      },
      stock: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
          max: Number.MAX_SAFE_INTEGER
        }
      },
      description: DataTypes.STRING,
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Product'
    }
  )
  return Product
}
