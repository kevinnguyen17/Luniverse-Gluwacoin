//const { assertion } = require("@openzeppelin/test-helpers/src/expectRevert")

const CurrencyBoard = artifacts.require('CurrencyBoard')

contract('CurrencyBoard', accounts  => {
  const address = accounts[0];
    
  it("add the an admin", () =>
    CurrencyBoard.deployed()
      .then(instance => { return instance.addAdmin.call(address)})
      .then(instance => {
        assert.equal(
          instance.isAdmin.call(address),
          4,
          "first addresses are added successfully "
        );
      }));
  //let accounts = web3.eth.getAccounts();
 
  it("add the an member", () =>
  CurrencyBoard.deployed()
    .then(instance => { return instance.addAdmin.call(address)})
    .then(instance => {
      assert.equal(
        instance.isAdmin.call(address),
        4,
        "first addresses are added successfully "
      );
    }));
})



// describe('CurrencyBoard_Initialization', function () {
//   const [ deployer ] = accounts;

//   const name = 'LuniverseGluwacoin';
//   const symbol = 'LG';
//   const decimals = new BN('18');



//   it("add address", () => { 
//     let instance =  CurrencyBoard.deployed();  
//     let accounts = addressList;
//     console.log("acc length " + accounts.length);
//     //let instance =  CurrencyBoard.new();  
//     let arrayLength = instance.addMemberAddress(accounts);
//     console.log("result ");
//     //assert.equal(arrayLength.valueOf(),accounts.length);
//     expect(arrayLength).to.be.bignumber.equal(accounts.length);
//   });  
// });