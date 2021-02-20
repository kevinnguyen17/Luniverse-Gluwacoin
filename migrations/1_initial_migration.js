const Migrations = artifacts.require("Migrations");
var CurrencyBoard = artifacts.require("CurrencyBoard");
module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(CurrencyBoard);
};
