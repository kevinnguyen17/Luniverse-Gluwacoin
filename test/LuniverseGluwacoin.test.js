// Load dependencies
const { expect } = require('chai');
const { accounts, privateKeys, contract, web3 } = require('@openzeppelin/test-environment');

// Import utilities from Test Helpers
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS, MAX_UINT256 } = constants;

// Load compiled artifacts
const LuniverseGluwacoin = contract.fromArtifact('LuniverseGluwacoinMock');

var sign = require('./signature');

// Start test block
describe('LuniverseGluwacoin_Initialization', function () {
    const [ deployer, other, another, pegSender ] = accounts;
    const [ deployer_privateKey, other_privateKey, another_privateKey ] = privateKeys;

    const name = 'LuniverseGluwacoin';
    const symbol = 'LG';
    const decimals = new BN('18');

    beforeEach(async function () {
        // Deploy a new LuniverseGluwacoin contract for each test
        this.token = await LuniverseGluwacoin.new({ from : deployer });
    });

    it('token name is ' + name, async function () {
        expect(await this.token.name()).to.equal(name);
    });

    it('token symbol is ' + symbol, async function () {
        expect(await this.token.symbol()).to.equal(symbol);
    });

    it('token decimals are ' + decimals.toString(), async function () {
        expect(await this.token.decimals()).to.be.bignumber.equal(decimals);
    });

    it('initial totalSupply is 0', async function () {
        expect(await this.token.totalSupply()).to.be.bignumber.equal('0');
    });
});

describe('LuniverseGluwacoin_GluwaRole', function () {
    const [ deployer, other, another ] = accounts;

    beforeEach(async function () {
        // Deploy a new LuniverseGluwacoin contract for each test
        this.token = await LuniverseGluwacoin.new({ from : deployer });
    });

    /* GluwaRole related
    */
   it('deployer is a Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
    });

    it('non-deployer is not a Gluwa', async function () {
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        expect(await this.token.isGluwa(another)).to.be.equal(false);
    });

    // addGluwa related
    it('Gluwa can add non-Gluwa and make it Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });
        expect(await this.token.isGluwa(other)).to.be.equal(true);
    });

    it('Gluwa cannot add Gluwa again', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        await expectRevert(
            this.token.addGluwa(deployer, { from : deployer }),
            'Roles: account already has role'
        );
    });

    it('newly-added Gluwa can add non-Gluwa and make it Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });

        expect(await this.token.isGluwa(other)).to.be.equal(true);
        expect(await this.token.isGluwa(another)).to.be.equal(false);
        await this.token.addGluwa(another, { from : other });

        expect(await this.token.isGluwa(another)).to.be.equal(true);
    });

    it('newly-added Gluwa cannot add Gluwa again', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });

        expect(await this.token.isGluwa(other)).to.be.equal(true);
        await expectRevert(
            this.token.addGluwa(deployer, { from : other }),
            'Roles: account already has role'
        );
    });

    it('newly-added Gluwa cannot add newly-added Gluwa again', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        expect(await this.token.isGluwa(another)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });
        await this.token.addGluwa(another, { from : deployer });

        expect(await this.token.isGluwa(other)).to.be.equal(true);
        expect(await this.token.isGluwa(another)).to.be.equal(true);
        await expectRevert(
            this.token.addGluwa(another, { from : other }),
            'Roles: account already has role'
        );
    });

    it('non-Gluwa cannot add non-Gluwa', async function () {
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        expect(await this.token.isGluwa(another)).to.be.equal(false);
        await expectRevert(
            this.token.addGluwa(another, { from : other }),
            'GluwaRole: caller does not have the Gluwa role'
        );
    });

    it('non-Gluwa cannot add Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await expectRevert(
            this.token.addGluwa(deployer, { from : other }),
            'GluwaRole: caller does not have the Gluwa role'
        );
    });

    // removeGluwa related
    it('Gluwa can remove Gluwa and make it non-Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        await this.token.removeGluwa(deployer, { from : deployer });
        expect(await this.token.isGluwa(deployer)).to.be.equal(false);
    });

    it('newly-added Gluwa can remove Gluwa and make it non-Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });

        expect(await this.token.isGluwa(other)).to.be.equal(true);
        await this.token.removeGluwa(deployer, { from : other });

        expect(await this.token.isGluwa(deployer)).to.be.equal(false);
    });

    it('newly-added Gluwa can remove newly-added Gluwa and make it non-Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        expect(await this.token.isGluwa(another)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });
        await this.token.addGluwa(another, { from : deployer });

        expect(await this.token.isGluwa(other)).to.be.equal(true);
        expect(await this.token.isGluwa(another)).to.be.equal(true);
        await this.token.removeGluwa(another, { from : other });

        expect(await this.token.isGluwa(another)).to.be.equal(false);
    });

    it('non-Gluwa cannot remove Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await expectRevert(
            this.token.removeGluwa(deployer, { from : other }),
            'GluwaRole: caller does not have the Gluwa role'
        );
    });

    it('non-Gluwa cannot remove non-Gluwa', async function () {
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        expect(await this.token.isGluwa(another)).to.be.equal(false);
        await expectRevert(
            this.token.removeGluwa(another, { from : other }),
            'GluwaRole: caller does not have the Gluwa role'
        );
    });

    // renounceGluwa related
    it('Gluwa can renounce and become a non-Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        await this.token.renounceGluwa({ from : deployer });
        expect(await this.token.isGluwa(deployer)).to.be.equal(false);
    });

    it('newly-added Gluwa can renounce and become a non-Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });

        await this.token.renounceGluwa({ from : other });
        expect(await this.token.isGluwa(other)).to.be.equal(false);
    });

    it('non-Gluwa cannot renounce', async function () {
        await expectRevert(
            this.token.renounceGluwa({ from : other }),
            'Roles: account does not have role'
        );

    });
});

describe('LuniverseGluwacoin_LuniverseRole', function () {
    const [ deployer, other, another ] = accounts;

    beforeEach(async function () {
        // Deploy a new LuniverseGluwacoin contract for each test
        this.token = await LuniverseGluwacoin.new({ from : deployer });
    });

    /* LuniverseRole related
    */
   it('deployer is a Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
    });

    it('non-deployer is not a Luniverse', async function () {
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        expect(await this.token.isLuniverse(another)).to.be.equal(false);
    });

    // addLuniverse related
    it('Luniverse can add non-Luniverse and make it Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });
        expect(await this.token.isLuniverse(other)).to.be.equal(true);
    });

    it('Luniverse cannot add Luniverse again', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        await expectRevert(
            this.token.addLuniverse(deployer, { from : deployer }),
            'Roles: account already has role'
        );
    });

    it('newly-added Luniverse can add non-Luniverse and make it Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });

        expect(await this.token.isLuniverse(other)).to.be.equal(true);
        expect(await this.token.isLuniverse(another)).to.be.equal(false);
        await this.token.addLuniverse(another, { from : other });

        expect(await this.token.isLuniverse(another)).to.be.equal(true);
    });

    it('newly-added Luniverse cannot add Luniverse again', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });

        expect(await this.token.isLuniverse(other)).to.be.equal(true);
        await expectRevert(
            this.token.addLuniverse(deployer, { from : other }),
            'Roles: account already has role'
        );
    });

    it('newly-added Luniverse cannot add newly-added Luniverse again', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        expect(await this.token.isLuniverse(another)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });
        await this.token.addLuniverse(another, { from : deployer });

        expect(await this.token.isLuniverse(other)).to.be.equal(true);
        expect(await this.token.isLuniverse(another)).to.be.equal(true);
        await expectRevert(
            this.token.addLuniverse(another, { from : other }),
            'Roles: account already has role'
        );
    });

    it('non-Luniverse cannot add non-Luniverse', async function () {
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        expect(await this.token.isLuniverse(another)).to.be.equal(false);
        await expectRevert(
            this.token.addLuniverse(another, { from : other }),
            'LuniverseRole: caller does not have the Luniverse role'
        );
    });

    it('non-Luniverse cannot add Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await expectRevert(
            this.token.addLuniverse(deployer, { from : other }),
            'LuniverseRole: caller does not have the Luniverse role'
        );
    });

    // removeLuniverse related
    it('Luniverse can remove Luniverse and make it non-Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        await this.token.removeLuniverse(deployer, { from : deployer });
        expect(await this.token.isLuniverse(deployer)).to.be.equal(false);
    });

    it('newly-added Luniverse can remove Luniverse and make it non-Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });

        expect(await this.token.isLuniverse(other)).to.be.equal(true);
        await this.token.removeLuniverse(deployer, { from : other });

        expect(await this.token.isLuniverse(deployer)).to.be.equal(false);
    });

    it('newly-added Luniverse can remove newly-added Luniverse and make it non-Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        expect(await this.token.isLuniverse(another)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });
        await this.token.addLuniverse(another, { from : deployer });

        expect(await this.token.isLuniverse(other)).to.be.equal(true);
        expect(await this.token.isLuniverse(another)).to.be.equal(true);
        await this.token.removeLuniverse(another, { from : other });

        expect(await this.token.isLuniverse(another)).to.be.equal(false);
    });

    it('non-Luniverse cannot remove Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await expectRevert(
            this.token.removeLuniverse(deployer, { from : other }),
            'LuniverseRole: caller does not have the Luniverse role'
        );
    });

    it('non-Luniverse cannot remove non-Luniverse', async function () {
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        expect(await this.token.isLuniverse(another)).to.be.equal(false);
        await expectRevert(
            this.token.removeLuniverse(another, { from : other }),
            'LuniverseRole: caller does not have the Luniverse role'
        );
    });

    // renounceLuniverse related
    it('Luniverse can renounce and become a non-Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        await this.token.renounceLuniverse({ from : deployer });
        expect(await this.token.isLuniverse(deployer)).to.be.equal(false);
    });

    it('newly-added Luniverse can renounce and become a non-Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });

        await this.token.renounceLuniverse({ from : other });
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
    });

    it('non-Luniverse cannot renounce', async function () {
        await expectRevert(
            this.token.renounceLuniverse({ from : other }),
            'Roles: account does not have role'
        );
    });
});

describe('LuniverseGluwacoin_Peggable', function () {
    const [ deployer, other, pegSender ] = accounts;

    const pegTxnHash = '0x2ff883f947eda8a14f54d1e372b8031bb47d721dede68c8934f49f818efe8620';
    const invalidPegTxnHash = 'dummy';
    const pegAmount = new BN('1000');

    beforeEach(async function () {
        // Deploy a new LuniverseGluwacoin contract for each test
        this.token = await LuniverseGluwacoin.new({ from : deployer });
    });
    /* Peggable related
    */
    // peg related
    it('Gluwa can peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        expect(await this.token.isPegged(pegTxnHash)).to.be.equal(true);
    });

    it('non-Gluwa or non-Luniverse cannot peg', async function () {
        await expectRevert(
            this.token.peg(pegTxnHash, pegAmount, pegSender, { from : other }),
            'Peggable: caller does not have the Gluwa role or the Luniverse role'
        );
    });

    it('cannot peg invalid pegTxnHash', async function () {
        await expectRevert(
            this.token.peg(invalidPegTxnHash, pegAmount, pegSender, { from : deployer }),
            'invalid bytes32 value'
        );
    });

    it('newly-added Gluwa can peg', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });
        expect(await this.token.isGluwa(other)).to.be.equal(true);
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : other });
        expect(await this.token.isPegged(pegTxnHash)).to.be.equal(true);
    });

    it('newly-added Luniverse can peg', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });
        expect(await this.token.isLuniverse(other)).to.be.equal(true);
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : other });
        expect(await this.token.isPegged(pegTxnHash)).to.be.equal(true);
    });

    // getPeg related
    it('Gluwa can get an existing peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });

        var peg = await this.token.getPeg(pegTxnHash, { from : deployer });
        expect(peg.amount).to.be.bignumber.equal(pegAmount);
        expect(peg.sender).to.be.bignumber.equal(pegSender);
        expect(!peg.gluwaApproved);
        expect(!peg.luniverseApproved);
        expect(!peg.processed);
    });

    it('other can get an existing peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        var peg = await this.token.getPeg(pegTxnHash, { from : other });

        expect(peg.amount).to.be.bignumber.equal(pegAmount);
        expect(peg.sender).to.be.bignumber.equal(pegSender);
        expect(!peg.gluwaApproved);
        expect(!peg.luniverseApproved);
        expect(!peg.processed);
    });

    it('cannot get a non-existing peg', async function () {
        await expectRevert(
            this.token.getPeg(pegTxnHash, { from : deployer }),
            'Peggable: the txnHash is not pegged'
        );
    });

    // gluwaApprove related
    it('Gluwa can gluwaApprove', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });

        var peg = await this.token.getPeg(pegTxnHash, { from : deployer });
        expect(peg.gluwaApproved);
    });

    it('Gluwa cannot gluwaApprove already gluwaApproved', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });

        var peg = await this.token.getPeg(pegTxnHash, { from : deployer });
        expect(peg.gluwaApproved);

        await expectRevert(
            this.token.gluwaApprove(pegTxnHash, { from : deployer }),
            'Peggable: the txnHash is already Gluwa Approved'
        );
    });

    it('Gluwa can gluwaApprove with peg from different address', async function () {
        await this.token.addGluwa(other, { from : deployer });
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        var peg = await this.token.gluwaApprove(pegTxnHash, { from : other });
        expect(peg.gluwaApproved);
    });

    it('Gluwa cannot gluwaApprove without peg', async function () {
        await expectRevert(
            this.token.gluwaApprove(pegTxnHash, { from : deployer }),
            'GluwaRole: caller does not have the Gluwa role'
        );
    });

    it('non-Gluwa cannot gluwaApprove', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await expectRevert(
            this.token.gluwaApprove(pegTxnHash, { from : other }),
            'GluwaRole: caller does not have the Gluwa role'
        );
    });

    it('Luniverse cannot gluwaApprove', async function () {
        await this.token.addLuniverse(other, { from : deployer });
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : other });
        await expectRevert(
            this.token.gluwaApprove(pegTxnHash, { from : other }),
            'GluwaRole: caller does not have the Gluwa role'
        );
    });

    // luniverseApprove related
    it('Luniverse can luniverseApprove', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        var peg = await this.token.getPeg(pegTxnHash, { from : deployer });
        expect(peg.luniverseApproved);
    });

    it('Luniverse can luniverseApprove with peg from different address', async function () {
        await this.token.addLuniverse(other, { from : deployer });
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        var peg = await this.token.luniverseApprove(pegTxnHash, { from : other });
        expect(peg.luniverseApproved);
    });

    it('Luniverse cannot luniverseApprove already luniverseApproved', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        var peg = await this.token.getPeg(pegTxnHash, { from : deployer });
        expect(peg.luniverseApproved);

        await expectRevert(
            this.token.luniverseApprove(pegTxnHash, { from : deployer }),
            'Peggable: the txnHash is already Luniverse Approved'
        );
    });

    it('Luniverse cannot luniverseApprove without peg', async function () {
        await this.token.addLuniverse(other, { from : deployer });
        await expectRevert(
            this.token.luniverseApprove(pegTxnHash, { from : other }),
            'GluwaRole: caller does not have the Gluwa role'
        );
    });

    it('non-Luniverse cannot luniverseApprove', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await expectRevert(
            this.token.luniverseApprove(pegTxnHash, { from : other }),
            'LuniverseRole: caller does not have the Luniverse role.'
        );
    });

    it('Gluwa cannot luniverseApprove', async function () {
        await this.token.addGluwa(other, { from : deployer });
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : other });
        await expectRevert(
            this.token.luniverseApprove(pegTxnHash, { from : other }),
            'LuniverseRole: caller does not have the Luniverse role.'
        );
    });
});

describe('LuniverseGluwacoin_Mint', function () {
    const [ deployer, other, pegSender ] = accounts;

    const pegTxnHash = '0x2ff883f947eda8a14f54d1e372b8031bb47d721dede68c8934f49f818efe8620';
    const notPegTxnHash = '0x2ff883f947eda8a14f54d1e372b8031bb47d721dede68c8934f49f818efe8621';
    const pegAmount = new BN('1000');

    beforeEach(async function () {
        // Deploy a new LuniverseGluwacoin contract for each test
        this.token = await LuniverseGluwacoin.new({ from : deployer });
    });

    // mint related
    it('Gluwa/Luniverse can mint', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.mint(pegTxnHash, { from : deployer });

        var peg = await this.token.getPeg(pegTxnHash, { from : deployer });
        expect(peg.processed);

        expect(await this.token.totalSupply()).to.be.bignumber.equal(pegAmount);
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal(pegAmount);
    });

    it('Gluwa/Luniverse mint emits a Transfer event', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        var receipt = await this.token.mint(pegTxnHash, { from : deployer });
        expectEvent(receipt, 'Transfer', { from: ZERO_ADDRESS, to: pegSender, value: pegAmount });
    });

    it('newly-added Gluwa can mint', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.addGluwa(other, { from : deployer });
        await this.token.mint(pegTxnHash, { from : other });

        var peg = await this.token.getPeg(pegTxnHash, { from : deployer });
        expect(peg.processed);

        expect(await this.token.totalSupply()).to.be.bignumber.equal(pegAmount);
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal(pegAmount);
    });

    it('newly-added Luniverse can mint', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.addLuniverse(other, { from : deployer });
        await this.token.mint(pegTxnHash, { from : other });

        var peg = await this.token.getPeg(pegTxnHash, { from : deployer });
        expect(peg.processed);

        expect(await this.token.totalSupply()).to.be.bignumber.equal(pegAmount);
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal(pegAmount);
    });

    it('Gluwa cannot mint already processed', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.mint(pegTxnHash, { from : deployer });

        await expectRevert(
            this.token.mint(pegTxnHash, { from : deployer }),
            'Peggable: the txnHash is already processed'
        );
    });

    it('Gluwa cannot mint with random 32bytes', async function () {
        await expectRevert(
            this.token.mint(notPegTxnHash, { from : deployer }),
            'Peggable: the txnHash is not Gluwa Approved'
        );
    });

    it('Gluwa cannot mint without gluwaApproved peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await expectRevert(
            this.token.mint(pegTxnHash, { from : deployer }),
            'Peggable: the txnHash is not Gluwa Approved'
        );
    });

    it('Gluwa cannot mint without luniverseApproved peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });

        await expectRevert(
            this.token.mint(pegTxnHash, { from : deployer }),
            'Peggable: the txnHash is not Luniverse Approved'
        );
    });

    it('newly-added Gluwa cannot mint already processed', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.mint(pegTxnHash, { from : deployer });

        await this.token.addGluwa(other, { from : deployer });
        await expectRevert(
            this.token.mint(pegTxnHash, { from : other }),
            'Peggable: the txnHash is already processed'
        );
    });

    it('newly-added Gluwa cannot mint not gluwaApproved peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.addGluwa(other, { from : deployer });
        await expectRevert(
            this.token.mint(pegTxnHash, { from : other }),
            'Peggable: the txnHash is not Gluwa Approved'
        );
    });

    it('newly-added Gluwa cannot mint not luniverseApproved peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });

        await this.token.addGluwa(other, { from : deployer });
        await expectRevert(
            this.token.mint(pegTxnHash, { from : other }),
            'Peggable: the txnHash is not Luniverse Approved'
        );
    });

    it('newly-added Luniverse cannot mint already processed', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.mint(pegTxnHash, { from : deployer });

        await this.token.addLuniverse(other, { from : deployer });
        await expectRevert(
            this.token.mint(pegTxnHash, { from : other }),
            'Peggable: the txnHash is already processed'
        );
    });

    it('newly-added Luniverse cannot mint not gluwaApproved peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.addLuniverse(other, { from : deployer });
        await expectRevert(
            this.token.mint(pegTxnHash, { from : other }),
            'Peggable: the txnHash is not Gluwa Approved'
        );
    });

    it('newly-added Luniverse cannot mint not luniverseApproved peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });

        await this.token.addLuniverse(other, { from : deployer });
        await expectRevert(
            this.token.mint(pegTxnHash, { from : other }),
            'Peggable: the txnHash is not Luniverse Approved'
        );
    });
});

describe('LuniverseGluwacoin_Burn', function () {
    const [ deployer, other, another, pegSender ] = accounts;
    const [ deployer_privateKey, other_privateKey, another_privateKey ] = privateKeys;

    const amount = new BN('5000');
    const fee = new BN('1');

    const pegTxnHash = '0x2ff883f947eda8a14f54d1e372b8031bb47d721dede68c8934f49f818efe8620';
    const pegAmount = new BN('1000');

    beforeEach(async function () {
        // Deploy a new LuniverseGluwacoin contract for each test
        this.token = await LuniverseGluwacoin.new({ from : deployer });
    });
    /* Burnable related
    */
    // burn related
    it('can burn less than balance', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.mint(pegTxnHash, { from : deployer });
        expect(await this.token.totalSupply()).to.be.bignumber.equal(pegAmount);
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal(pegAmount);

        const burnAmount = new BN('100');

        await this.token.burn(burnAmount, { from : pegSender });
        expect(await this.token.totalSupply()).to.be.bignumber.equal(pegAmount.sub(burnAmount));
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal(pegAmount.sub(burnAmount));
    });

    it('can burn full balance', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.mint(pegTxnHash, { from : deployer });
        expect(await this.token.totalSupply()).to.be.bignumber.equal(pegAmount);
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal(pegAmount);

        await this.token.burn(pegAmount, { from : pegSender });
        expect(await this.token.totalSupply()).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal('0');
    });

    it('cannot burn more than balance', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.mint(pegTxnHash, { from : deployer });
        expect(await this.token.totalSupply()).to.be.bignumber.equal(pegAmount);
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal(pegAmount);

        const burnAmount = new BN('10000');

        await expectRevert(
            this.token.burn(burnAmount, { from : pegSender }),
            'Reservable: transfer amount exceeds unreserved balance'
        );
    });

    it('burn emits a Transfer event', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.mint(pegTxnHash, { from : deployer });
        expect(await this.token.totalSupply()).to.be.bignumber.equal(pegAmount);
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal(pegAmount);

        const burnAmount = new BN('100');
        const receipt = await this.token.burn(burnAmount, { from: pegSender });

        expectEvent(receipt, 'Transfer', { from: pegSender, to: ZERO_ADDRESS, value: burnAmount });
    });
});

describe('LuniverseGluwacoin_Reservable', function () {
    const [ deployer, other, another ] = accounts;
    const [ deployer_privateKey, other_privateKey, another_privateKey ] = privateKeys;

    const amount = new BN('5000');
    const fee = new BN('1');

    const pegTxnHash = '0x2ff883f947eda8a14f54d1e372b8031bb47d721dede68c8934f49f818efe8620';
    const pegAmount = new BN('1000');

    beforeEach(async function () {
        // Deploy a new LuniverseGluwacoin contract for each test
        this.token = await LuniverseGluwacoin.new({ from : deployer });
    });

    /* Reservable related
    */
    it('Gluwa can reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount);

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        expect(await this.token.reservedBalanceOf(other)).to.be.bignumber.equal(amount.toString());
    });

    it('Gluwa cannot reserve with outdated expiryBlockNum', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock;
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await expectRevert(
            this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer }),
            'Reservable: invalid block expiry number'
        );
    });

    it('Gluwa cannot reserve with zero address as the executor', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = ZERO_ADDRESS;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = amount.sub(fee);
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await expectRevert(
            this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer }),
            'Reservable: cannot execute from zero address'
        );
    });

    it('Gluwa cannot reserve if amount + fee > balance', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_fee = fee;
        var reserve_amount = amount.sub(reserve_fee).add(new BN('1'));
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await expectRevert(
            this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer }),
            'Reservable: insufficient unreserved balance'
        );
    });

    it('Gluwa cannot reserve if amount + fee + reserved > balance', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var send_amount2 = new BN('10');
        var send_amount = amount.sub(fee).sub(send_amount2);
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, send_amount, fee, nonce);

        await this.token.reserve(other, another, executor, send_amount, fee, nonce, expiryBlockNum, signature, { from: deployer });

        send_amount = send_amount2;

        signature = sign.sign(this.token.address, other, other_privateKey, another, send_amount, fee, nonce);

        await expectRevert(
            this.token.reserve(other, another, executor, send_amount, fee, nonce, expiryBlockNum, signature, { from: deployer }),
            'Reservable: insufficient unreserved balance'
        );
    });

    it('Gluwa cannot reserve if not amount + fee > 0', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = new BN('0');
        var reserve_fee = new BN('0');
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await expectRevert(
            this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer }),
            'Reservable: invalid reserve amount'
        );
    });

    it('getReservation works', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_fee = fee;
        var reserve_amount = amount.sub(reserve_fee);
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        var reserve = await this.token.getReservation(other, nonce);

        expect(reserve.amount).to.be.bignumber.equal(reserve_amount);
        expect(reserve.fee).to.be.bignumber.equal(reserve_fee);
        expect(reserve.recipient).to.equal(another);
        expect(reserve.executor).to.equal(executor);
        expect(reserve.expiryBlockNum).to.be.bignumber.equal(expiryBlockNum);
    });

    it('executor can execute', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await this.token.execute(other, nonce, { from: deployer });
    });

    it('sender can execute', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await this.token.execute(other, nonce, { from: other });
    });

    it('receiver cannot execute', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await expectRevert(
            this.token.execute(other, nonce, { from: another }),
            'Reservable: this address is not authorized to execute this reservation'
        );
    });

    it('cannot execute expired reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await time.advanceBlockTo(expiryBlockNum.add(new BN('1')));

        await expectRevert(
            this.token.execute(other, nonce, { from: deployer }),
            'Reservable: reservation has expired and cannot be executed'
        );
    });

    it('cannot execute executed reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await this.token.execute(other, nonce, { from: deployer });

        await expectRevert(
            this.token.execute(other, nonce, { from: deployer }),
            'Reservable: invalid reservation status to execute'
        );
    });

    it('cannot execute reclaimed reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await this.token.reclaim(other, nonce, { from: deployer });

        await expectRevert(
            this.token.execute(other, nonce, { from: deployer }),
            'Reservable: invalid reservation status to execute'
        );
    });

    it('executor can reclaim expired reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await time.advanceBlockTo(expiryBlockNum.add(new BN('1')));

        await this.token.reclaim(other, nonce, { from: deployer });
    });

    it('executor can reclaim unexpired reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await this.token.reclaim(other, nonce, { from: deployer });
    });

    it('sender can reclaim expired reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await time.advanceBlockTo(expiryBlockNum.add(new BN('1')));

        await this.token.reclaim(other, nonce, { from: other });
    });

    it('sender cannot reclaim unexpired reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await expectRevert(
            this.token.reclaim(other, nonce, { from: other }),
            'Reservable: reservation has not expired or you are not the executor and cannot be reclaimed'
        );
    });

    it('receiver cannot reclaim unexpired reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await expectRevert(
            this.token.reclaim(other, nonce, { from: another }),
            'Reservable: only the sender or the executor can reclaim the reservation back to the sender'
        );
    });

    it('receiver cannot reclaim expired reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        await time.advanceBlockTo(expiryBlockNum.add(new BN('1')));

        await expectRevert(
            this.token.reclaim(other, nonce, { from: another }),
            'Reservable: only the sender or the executor can reclaim the reservation back to the sender'
        );
    });

    it('reservedBalanceOf accurate after reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        expect(await this.token.reservedBalanceOf(other)).to.be.bignumber.equal('0');

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        expect(await this.token.reservedBalanceOf(other)).to.be.bignumber.equal(amount.toString());
    });

    it('unreservedBalanceOf accurate after reserve', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        expect(await this.token.unreservedBalanceOf(other)).to.be.bignumber.equal(await this.token.balanceOf(other));

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        expect(await this.token.unreservedBalanceOf(other)).to.be.bignumber.equal(amount.sub(await this.token.reservedBalanceOf(other)).toString());
    });

    it('reservedBalanceOf accurate after execute', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        expect(await this.token.reservedBalanceOf(other)).to.be.bignumber.equal('0');

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        expect(await this.token.reservedBalanceOf(other)).to.be.bignumber.equal(amount.toString());

        await this.token.execute(other, nonce, { from: deployer });

        expect(await this.token.reservedBalanceOf(other)).to.be.bignumber.equal('0');
    });

    it('unreservedBalanceOf accurate after execute', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount.toString());

        var executor = deployer;
        var reserve_amount = amount.sub(fee);
        var reserve_fee = fee;
        var latestBlock = await time.latestBlock();
        var expiryBlockNum = latestBlock.add(new BN('100'));
        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, reserve_amount, reserve_fee, nonce);

        expect(await this.token.unreservedBalanceOf(other)).to.be.bignumber.equal(await this.token.balanceOf(other));

        await this.token.reserve(other, another, executor, reserve_amount, reserve_fee, nonce, expiryBlockNum, signature, { from: deployer });

        expect(await this.token.unreservedBalanceOf(other)).to.be.bignumber.equal(amount.sub(await this.token.reservedBalanceOf(other)).toString());

        await this.token.execute(other, nonce, { from: deployer });

        expect(await this.token.unreservedBalanceOf(other)).to.be.bignumber.equal('0');
    });
});

describe('LuniverseGluwacoin_ETHless', function () {
    const [ deployer, other, another, pegSender ] = accounts;
    const [ deployer_privateKey, other_privateKey, another_privateKey ] = privateKeys;

    const amount = new BN('5000');
    const fee = new BN('1');

    const pegTxnHash = '0x2ff883f947eda8a14f54d1e372b8031bb47d721dede68c8934f49f818efe8620';
    const pegAmount = new BN('1000');

    beforeEach(async function () {
        // Deploy a new LuniverseGluwacoin contract for each test
        this.token = await LuniverseGluwacoin.new({ from : deployer });
    });
    /* ETHless related
    */
    it('can send transfer', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        await this.token.methods['transfer(address,uint256)'](other, pegAmount, { from: pegSender });
    });

    it('Gluwa can send ETHless transfer', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(amount);
        expect(await this.token.balanceOf(another)).to.be.bignumber.equal('0');

        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, amount.sub(fee), fee, nonce);

        await this.token.transfer(other, another, amount.sub(fee), fee, nonce, signature, { from: deployer });

        expect(await this.token.balanceOf(deployer)).to.be.bignumber.equal(fee);
        expect(await this.token.balanceOf(other)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(another)).to.be.bignumber.equal(amount.sub(fee));
    });

    it('Gluwa cannot send ETHless transfer with wrong signature', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        var nonce = Date.now();
        var wrongSignature = sign.sign(this.token.address, other, other_privateKey, another, amount, fee, nonce);

        await expectRevert(
            this.token.transfer(other, another, amount.sub(fee), fee, nonce, wrongSignature, { from: deployer }),
            'Validate: invalid signature'
        );
    });

    it('Gluwa cannot send ETHless transfer with used nonce', async function () {
        var mintAmount = amount.add(amount);
        await this.token.peg(pegTxnHash, mintAmount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.balanceOf(other)).to.be.bignumber.equal(mintAmount);
        expect(await this.token.balanceOf(another)).to.be.bignumber.equal('0');

        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, amount.sub(fee), fee, nonce);

        await this.token.transfer(other, another, amount.sub(fee), fee, nonce, signature, { from: deployer });
        await expectRevert(
            this.token.transfer(other, another, amount.sub(fee), fee, nonce, signature, { from: deployer }),
            'ETHless: the nonce has already been used for this address'
        );
    });

    it('non-Gluwa cannot send ETHless transfer', async function () {
        await this.token.peg(pegTxnHash, amount, other, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        await this.token.mint(pegTxnHash, { from : deployer });

        var nonce = Date.now();

        var signature = sign.sign(this.token.address, other, other_privateKey, another, amount.sub(fee), fee, nonce);

        await expectRevert(
            this.token.transfer(other, another, amount.sub(fee), fee, nonce, signature, { from: another }),
            'GluwaRole: caller does not have the Gluwa role'
        );
    });
});