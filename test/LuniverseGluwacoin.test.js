// Load dependencies
const { expect } = require('chai');
const { accounts, privateKeys, contract, web3 } = require('@openzeppelin/test-environment');

// Import utilities from Test Helpers
const { BN, constants, expectEvent, expectRevert, time } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS, MAX_UINT256 } = constants;

// Load compiled artifacts
const LuniverseGluwacoin = contract.fromArtifact('LuniverseGluwacoinMock');

// Start test block
describe('LuniverseGluwacoin', function () {
    const [ deployer, other, another ] = accounts;
    const [ deployer_privateKey, other_privateKey, another_privateKey ] = privateKeys;

    const name = 'LuniverseGluwacoin';
    const symbol = 'LG';
    const decimals = new BN('18');

    const initialGluwaCount = new BN('1');

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

    it('newly added Gluwa can add non-Gluwa and make it Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });

        expect(await this.token.isGluwa(other)).to.be.equal(true);
        expect(await this.token.isGluwa(another)).to.be.equal(false);
        await this.token.addGluwa(another, { from : other });

        expect(await this.token.isGluwa(another)).to.be.equal(true);
    });

    it('newly added Gluwa cannot add Gluwa again', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });

        expect(await this.token.isGluwa(other)).to.be.equal(true);
        await expectRevert(
            this.token.addGluwa(deployer, { from : other }),
            'Roles: account already has role'
        );
    });

    it('newly added Gluwa cannot add newly added Gluwa again', async function () {
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

    it('newly added Gluwa can remove Gluwa and make it non-Gluwa', async function () {
        expect(await this.token.isGluwa(deployer)).to.be.equal(true);
        expect(await this.token.isGluwa(other)).to.be.equal(false);
        await this.token.addGluwa(other, { from : deployer });

        expect(await this.token.isGluwa(other)).to.be.equal(true);
        await this.token.removeGluwa(deployer, { from : other });

        expect(await this.token.isGluwa(deployer)).to.be.equal(false);
    });

    it('newly added Gluwa can remove newly added Gluwa and make it non-Gluwa', async function () {
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

    it('newly added Gluwa can renounce and become a non-Gluwa', async function () {
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

    it('newly added Luniverse can add non-Luniverse and make it Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });

        expect(await this.token.isLuniverse(other)).to.be.equal(true);
        expect(await this.token.isLuniverse(another)).to.be.equal(false);
        await this.token.addLuniverse(another, { from : other });

        expect(await this.token.isLuniverse(another)).to.be.equal(true);
    });

    it('newly added Luniverse cannot add Luniverse again', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });

        expect(await this.token.isLuniverse(other)).to.be.equal(true);
        await expectRevert(
            this.token.addLuniverse(deployer, { from : other }),
            'Roles: account already has role'
        );
    });

    it('newly added Luniverse cannot add newly added Luniverse again', async function () {
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

    it('newly added Luniverse can remove Luniverse and make it non-Luniverse', async function () {
        expect(await this.token.isLuniverse(deployer)).to.be.equal(true);
        expect(await this.token.isLuniverse(other)).to.be.equal(false);
        await this.token.addLuniverse(other, { from : deployer });

        expect(await this.token.isLuniverse(other)).to.be.equal(true);
        await this.token.removeLuniverse(deployer, { from : other });

        expect(await this.token.isLuniverse(deployer)).to.be.equal(false);
    });

    it('newly added Luniverse can remove newly added Luniverse and make it non-Luniverse', async function () {
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

    it('newly added Luniverse can renounce and become a non-Luniverse', async function () {
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