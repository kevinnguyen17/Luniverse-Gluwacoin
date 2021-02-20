//const { assertion } = require("@openzeppelin/test-helpers/src/expectRevert")

const CurrencyBoard = artifacts.require('CurrencyBoard')

contract('CurrencyBoard', accounts  => {
  const addressList = ["0x871263b05d6B932feF35325835b8e36a7d69a032","0xd9d097435E7CF8e663CcB26daB9C31A7F2B64ab4","0x980d8422F37e7F102100bd009153D913b10d2bD3"];
    
  it("add the first addresses", () =>
    CurrencyBoard.deployed()
      .then(instance => { return instance.addMemberAddress.call(addressList)})
      .then(balance => {
        assert.equal(
          balance.valueOf(),
          4,
          "first addresses are added successfully "
        );
      }));
  //let accounts = web3.eth.getAccounts();
 
  it("add address", () => 
    CurrencyBoard.deployed()
      .then(instance => { return instance.addMemberAddress.call(addressList) })
      .then(arrayLength => {       
        assert.equal(arrayLength.valueOf(),2000,"not match");
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