'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Brand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Brand.hasMany(models.Product, {
        foreignKey: 'brand_id'
      })
    }
  }
  Brand.init(
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          args: /^(?=.*[0-9])(?=.*[ a-zA-Z])([ a-zA-Z0-9]+)$/,
          msg: 'just accepted character and number. Without other characters'
        }
      },
      description: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Brand'
    }
  )
  return Brand
}
