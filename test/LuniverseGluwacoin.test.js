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
describe('LuniverseGluwacoin', function () {
    const [ deployer, other, another, pegSender ] = accounts;
    const [ deployer_privateKey, other_privateKey, another_privateKey ] = privateKeys;

    const name = 'LuniverseGluwacoin';
    const symbol = 'LG';
    const decimals = new BN('18');

    const amount = new BN('5000');
    const fee = new BN('1');

    const pegTxnHash = '0x2ff883f947eda8a14f54d1e372b8031bb47d721dede68c8934f49f818efe8620';
    const pegAmount = new BN('1000');

    beforeEach(async function () {
        // Deploy a new LuniverseGluwacoin contract for each test
        this.token = await LuniverseGluwacoin.new({ from : deployer });
    });

    it('initial totalSupply is 0', async function () {
        expect(await this.token.totalSupply()).to.be.bignumber.equal('0');
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

    /* Peggable related
    */
    // peg related
    it('Gluwa can peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        expect(await this.token.isPegged(pegTxnHash)).to.be.equal(true);
    });

    it('newly-added Gluwa can peg', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });
        expect(await this.token.isGluwa(other)).to.be.equal(true);
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        expect(await this.token.isPegged(pegTxnHash)).to.be.equal(true);
    });

    it('newly-added Luniverse can peg', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });
        expect(await this.token.isLuniverse(other)).to.be.equal(true);
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        expect(await this.token.isPegged(pegTxnHash)).to.be.equal(true);
    });

    // getPeg related
    it('Gluwa can get an existing peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.getPeg(pegTxnHash, { from : deployer });
    });

    it('other can get an existing peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.getPeg(pegTxnHash, { from : other });
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
        expect(await this.token.isPegGluwaApproved(pegTxnHash)).to.be.equal(true);
    });

    it('Gluwa cannot gluwaApprove already gluwaApproved', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        expect(await this.token.isPegGluwaApproved(pegTxnHash)).to.be.equal(true);

        await expectRevert(
            this.token.gluwaApprove(pegTxnHash, { from : deployer }),
            'Peggable: the txnHash is already Gluwa Approved'
        );
    });

    it('non-Gluwa cannot gluwaApprove', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await expectRevert(
            this.token.gluwaApprove(pegTxnHash, { from : other }),
            'GluwaRole: caller does not have the Gluwa role'
        );
    });

    // luniverseApprove related
    it('Luniverse can luniverseApprove', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        expect(await this.token.isPegLuniverseApproved(pegTxnHash)).to.be.equal(true);
    });

    it('Luniverse cannot luniverseApprove already luniverseApproved', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });
        expect(await this.token.isPegLuniverseApproved(pegTxnHash)).to.be.equal(true);

        await expectRevert(
            this.token.luniverseApprove(pegTxnHash, { from : deployer }),
            'Peggable: the txnHash is already Luniverse Approved'
        );
    });

    it('non-Luniverse cannot luniverseApprove', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await expectRevert(
            this.token.luniverseApprove(pegTxnHash, { from : other }),
            'LuniverseRole: caller does not have the Luniverse role.'
        );
    });

    // mint related
    it('Gluwa can mint', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.mint(pegTxnHash, { from : deployer });

        expect(await this.token.isPegProccessed(pegTxnHash));
        expect(await this.token.totalSupply()).to.be.bignumber.equal(pegAmount);
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal(pegAmount);
    });

    it('newly-added Gluwa can mint', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.addGluwa(other, { from : deployer });
        await this.token.mint(pegTxnHash, { from : other });

        expect(await this.token.isPegProccessed(pegTxnHash));
        expect(await this.token.totalSupply()).to.be.bignumber.equal(pegAmount);
        expect(await this.token.balanceOf(pegSender)).to.be.bignumber.equal(pegAmount);
    });

    it('newly-added Luniverse can mint', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await this.token.addLuniverse(other, { from : deployer });
        await this.token.mint(pegTxnHash, { from : other });

        expect(await this.token.isPegProccessed(pegTxnHash));
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

    it('Gluwa cannot mint not gluwaApproved peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.luniverseApprove(pegTxnHash, { from : deployer });

        await expectRevert(
            this.token.mint(pegTxnHash, { from : deployer }),
            'Peggable: the txnHash is not Gluwa Approved'
        );
    });

    it('Gluwa cannot mint not luniverseApproved peg', async function () {
        await this.token.peg(pegTxnHash, pegAmount, pegSender, { from : deployer });
        await this.token.gluwaApprove(pegTxnHash, { from : deployer });

        await expectRevert(
            this.token.mint(pegTxnHash, { from : deployer }),
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