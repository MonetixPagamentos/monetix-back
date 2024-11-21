const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection');

const UserAdm = sequelize.define('user_adm', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, },
  name: { type: DataTypes.STRING, allowNull: false, },
  email: { type: DataTypes.STRING, allowNull: false, },
  password: { type: DataTypes.STRING, allowNull: true,}
   
}, {
  timestamps: true, // Isso gerencia createdAt e updatedAt automaticamente
  underscored: true,
  indexes: [   
    {   unique: true,
        fields: ['email'], 
    }
]
});

(async () => {
  try {
      // Sincroniza a tabela com o banco de dados
      await UserAdm.sync({ alter: true });
      console.log(`Tabela "${UserAdm.name}" sincronizada com sucesso, novas colunas foram adicionadas.`);
  } catch (error) {
      console.error(`Erro ao sincronizar a tabela "${UserAdm.name}":`, error);
  } 
})()

UserAdm.sync();

module.exports = UserAdm;